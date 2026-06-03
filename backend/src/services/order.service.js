import crypto from 'crypto';
import mongoose from 'mongoose';
import razorpay from '../config/razorpay.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Session from '../models/session.model.js';
import AnalyticsEvent from '../models/analytics.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { sendOrderSuccessEmail, sendOrderFailureEmail } from './email.service.js';

export const createCheckoutOrder = async ({ userId, items, sessionId, conversionSource }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    let totalCost = 0;
    const orderItems = [];

    // Verify stock and calculate totals
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }

      if (!product.active) {
        throw new ApiError(400, `Product ${product.name} is no longer available`);
      }

      if (product.quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product: ${product.name}. Available: ${product.quantity}`);
      }

      const priceAtPurchase = product.price;
      const costAtPurchase = product.price * 0.7; // Estimated cost price since costPrice was removed from schema

      totalAmount += priceAtPurchase * item.quantity;
      totalCost += costAtPurchase * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase,
        costAtPurchase,
      });
    }

    // Create Razorpay order
    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(totalAmount * 100);
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
          totalAmount,
          totalCost,
          razorpayOrderId: razorpayOrder.id,
          conversionSource: conversionSource || 'direct',
          orderStatus: 'pending',
          paymentStatus: 'pending',
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
            totalAmount,
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
      return order;
    }

    // Update order payments logs
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save({ session });

    // Decrement inventory stock atomically using $inc and check quantity
    for (const item of order.items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          quantity: { $gte: item.quantity }, // Ensure we don't sell below 0 (double safety)
        },
        {
          $inc: { quantity: -item.quantity },
        }
      ).session(session);

      if (result.matchedCount === 0) {
        // High concurrency stock depleted before payment verification
        logger.error(`Stock depletion error for product ID: ${item.product} in Order: ${order._id}`);
        throw new ApiError(
          400,
          `Oversold items detected. Stock depleted during transaction. Contact support for Order SKU.`
        );
      }
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

    return order;
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
  return await Order.find({ user: userId }).populate('items.product', 'name sku price').sort('-createdAt');
};
