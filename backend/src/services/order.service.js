import crypto from 'crypto';
import mongoose from 'mongoose';
import razorpay from '../config/razorpay.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Session from '../models/session.model.js';
import AnalyticsEvent from '../models/analytics.model.js';
import User from '../models/user.model.js';
import Coupon from '../models/coupon.model.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { sendOrderSuccessEmail, sendOrderFailureEmail, sendShippingUpdateEmail } from './email.service.js';

export const createCheckoutOrder = async ({ userId, items, sessionId, conversionSource, couponCode, addressId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    let totalCost = 0;
    const orderItems = [];

    // Find User and their addresses
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const matchedAddress = user.addresses.find(
      (addr) => addr._id.toString() === addressId
    );
    if (!matchedAddress) {
      throw new ApiError(404, 'Selected shipping address not found');
    }

    const shippingAddress = {
      tag: matchedAddress.tag,
      doorNumber: matchedAddress.doorNumber,
      secondLine: matchedAddress.secondLine,
      landmark: matchedAddress.landmark,
      city: matchedAddress.city,
      state: matchedAddress.state,
      pincode: matchedAddress.pincode,
    };

    // Verify stock, reserve inventory, and calculate totals
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }

      if (!product.active) {
        throw new ApiError(400, `Product ${product.name} is no longer available`);
      }

      // Atomically reserve/decrement stock
      const stockUpdateResult = await Product.updateOne(
        {
          _id: product._id,
          quantity: { $gte: item.quantity },
        },
        {
          $inc: { quantity: -item.quantity },
        }
      ).session(session);

      if (stockUpdateResult.matchedCount === 0) {
        throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
      }

      const priceAtPurchase = product.price;
      const costAtPurchase = product.price * 0.7; // Estimated cost price since costPrice was removed from schema

      subtotal += priceAtPurchase * item.quantity;
      totalCost += costAtPurchase * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase,
        costAtPurchase,
      });
    }

    // Process coupon code if passed
    let discountAmount = 0;
    let couponAppliedId = null;
    let finalCouponCode = '';

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
      if (!coupon || !coupon.isActive) {
        throw new ApiError(404, 'Invalid coupon code');
      }

      const currentDate = new Date();
      if (currentDate > new Date(coupon.validUntil)) {
        throw new ApiError(400, 'Coupon code has expired');
      }

      if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        throw new ApiError(400, 'Coupon usage limit has been reached');
      }

      if (subtotal < coupon.minCartAmount) {
        throw new ApiError(400, `Minimum order amount of ₹${coupon.minCartAmount.toLocaleString()} is required for this coupon`);
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
        if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'flat') {
        discountAmount = coupon.discountValue;
      }

      // Cap discount at the subtotal
      discountAmount = Math.min(discountAmount, subtotal);
      couponAppliedId = coupon._id;
      finalCouponCode = coupon.code;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const serviceFee = Math.round(discountedSubtotal * 0.05); // 5% GST/Service fee
    const shippingFee = discountedSubtotal > 5000 || discountedSubtotal === 0 ? 0 : 150;
    const finalTotalAmount = discountedSubtotal + serviceFee + shippingFee;

    // Create Razorpay order
    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(finalTotalAmount * 100);
    const razorpayOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);
    if (!razorpayOrder) {
      throw new ApiError(500, 'Failed to create payment order with Razorpay');
    }

    // Create Order in DB (status pending)
    const order = await Order.create(
      [
        {
          user: userId,
          sessionId,
          items: orderItems,
          totalAmount: finalTotalAmount,
          totalCost,
          couponApplied: couponAppliedId,
          couponCode: finalCouponCode,
          discountAmount,
          razorpayOrderId: razorpayOrder.id,
          conversionSource: conversionSource || 'direct',
          orderStatus: 'pending',
          paymentStatus: 'pending',
          shippingAddress,
        },
      ],
      { session }
    );

    // Track "initiate_checkout" in analytics
    await AnalyticsEvent.create(
      [
        {
          sessionId,
          user: userId,
          eventName: 'initiate_checkout',
          properties: {
            razorpayOrderId: razorpayOrder.id,
            totalAmount: finalTotalAmount,
            itemsCount: items.length,
          },
          referrer: 'checkout',
          utmSource: conversionSource,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      order: order[0],
      razorpayOrder,
      razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const verifyRazorpayPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  isSimulated = false,
}) => {
  // Verify signature
  if (process.env.NODE_ENV === 'development' && isSimulated) {
    logger.info(`Bypassing Razorpay signature verification for simulated payment of Order: ${razorpayOrderId}`);
  } else {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret';
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new ApiError(400, 'Invalid payment signature. Transaction suspected of tampering.');
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ razorpayOrderId }).session(session);
    if (!order) {
      throw new ApiError(404, 'Order matching this payment not found');
    }

    if (order.paymentStatus === 'paid') {
      // Payment already processed, idempotent return
      await session.commitTransaction();
      session.endSession();
      return await Order.findById(order._id).populate('items.product').populate('user', 'name email');
    }

    // Update order payments logs
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    order.shippingStatus = 'pending';
    order.shippingTrackingNumber = '';
    order.shippingHistory = [
      {
        status: 'pending',
        description: 'Order paid successfully. Undergoing sterilization and quality verification.',
        timestamp: new Date(),
      }
    ];
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save({ session });

    // Increment coupon usage count if applied
    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode },
        { $inc: { usageCount: 1 } }
      ).session(session);
    }

    // Mark session as converted and log conversion event
    if (order.sessionId) {
      await Session.updateOne(
        { sessionId: order.sessionId },
        { $set: { conversionRecorded: true } }
      ).session(session);

      await AnalyticsEvent.create(
        [
          {
            sessionId: order.sessionId,
            user: order.user,
            eventName: 'conversion_purchase',
            properties: {
              orderId: order._id,
              totalAmount: order.totalAmount,
            },
            referrer: 'payment_callback',
          },
        ],
        { session }
      );
    }

    // Clear user's cart in DB upon successful order completion
    if (order.user) {
      const user = await User.findById(order.user).session(session);
      if (user) {
        user.cart = [];
        await user.save({ session, validateBeforeSave: false });
      }
    }

    await session.commitTransaction();
    session.endSession();


    // Send order confirmation email asynchronously
    if (order.user) {
      User.findById(order.user)
        .then(async (user) => {
          if (user) {
            // Populate product details in order
            const populatedOrder = await Order.findById(order._id).populate('items.product');
            sendOrderSuccessEmail(
              user.email,
              user.name,
              order.razorpayOrderId || order._id.toString(),
              populatedOrder.items,
              order.totalAmount
            );
          }
        })
        .catch((err) => {
          logger.error(`Error sending checkout success email: ${err.message}`);
        });
    }

    return await Order.findById(order._id).populate('items.product').populate('user', 'name email');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const handleRazorpayWebhook = async (signature, rawBody) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_123';
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;
  
  logger.info(`Razorpay Webhook received: ${event}`);

  if (event === 'payment.captured' || event === 'order.paid') {
    const razorpayOrderId = payload.payload.payment.entity.order_id;
    const razorpayPaymentId = payload.payload.payment.entity.id;
    const razorpaySignature = signature; // In webhooks signature is for webhook raw body, but we update order status
    
    // Process order update
    try {
      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        await verifyRazorpayPayment({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: expectedSignature, // verify internally or use mock to handle webhook payment status
        });
      }
    } catch (err) {
      logger.error(`Failed to process webhook order payment: ${err.message}`);
    }
  } else if (event === 'payment.failed') {
    const razorpayOrderId = payload.payload.payment.entity.order_id;
    const order = await Order.findOne({ razorpayOrderId });
    if (order) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();

      // Send payment failure email
      if (order.user) {
        try {
          const user = await User.findById(order.user);
          if (user) {
            sendOrderFailureEmail(
              user.email,
              user.name,
              order.razorpayOrderId || order._id.toString(),
              order.totalAmount
            );
          }
        } catch (err) {
          logger.error(`Error sending checkout failure email: ${err.message}`);
        }
      }
    }
  }

  return { success: true };
};

export const getOrderHistory = async (userId) => {
  return await Order.find({
    user: userId,
    $or: [
      { paymentStatus: 'paid' },
      { orderStatus: { $ne: 'pending' } }
    ]
  }).populate('items.product', 'name sku price').sort('-createdAt');
};

export const getOrderDetail = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email role addresses')
    .populate('items.product');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Authorize: admins can read any order, users can only read their own
  if (user.role !== 'admin' && order.user?._id?.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to view this order');
  }

  return order;
};




export const releaseExpiredOrdersStock = async () => {
  // Find all orders that have been pending and unpaid for more than 20 minutes
  const expirationThreshold = new Date(Date.now() - 20 * 60 * 1000);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const expiredOrders = await Order.find({
      orderStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: expirationThreshold }
    }).session(session);
    
    if (expiredOrders.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return;
    }
    
    logger.info(`Found ${expiredOrders.length} expired pending orders. Releasing stock...`);
    
    for (const order of expiredOrders) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: item.quantity } }
        ).session(session);
        logger.info(`Released stock for product: ${item.product} (Qty: ${item.quantity}) from Order: ${order._id}`);
      }
      
      order.orderStatus = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Error in releaseExpiredOrdersStock: ${error.message}`);
  }
};

