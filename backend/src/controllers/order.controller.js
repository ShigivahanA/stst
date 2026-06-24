import * as orderService from '../services/order.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const checkout = asyncHandler(async (req, res) => {
  const { items, sessionId, conversionSource, couponCode, addressId, deliveryOption } = req.body;
  const userId = req.user?._id; // If guest, userId is undefined

  const data = await orderService.createCheckoutOrder({
    userId,
    items,
    sessionId,
    conversionSource,
    couponCode,
    addressId,
    deliveryOption,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, data, 'Checkout session created. Ready for payment.'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, isSimulated } = req.body;

  const order = await orderService.verifyRazorpayPayment({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    isSimulated: !!isSimulated,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Payment verified and order processed successfully'));
});



export const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = (req.rawBody || req.body).toString('utf-8');

  const result = await orderService.handleRazorpayWebhook(signature, rawBody);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Webhook verified and processed'));
});

export const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const history = await orderService.getOrderHistory(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, history, 'Order history fetched successfully'));
});

export const getOrderDetail = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const user = req.user;

  const order = await orderService.getOrderDetail(orderId, user);
  return res
    .status(200)
    .json(new ApiResponse(200, order, 'Order details fetched successfully'));
});

export const checkChennaiLocation = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  const userId = req.user?._id;

  const isChennai = await orderService.checkAddressChennai({ userId, addressId });

  return res
    .status(200)
    .json(new ApiResponse(200, { isChennai }, 'Address location checked successfully'));
});

export const savePickupSlot = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { date, time } = req.body;
  const userId = req.user._id;

  const order = await orderService.savePickupSlot({
    orderId,
    userId,
    date,
    time
  });

  return res.status(200).json(new ApiResponse(200, order, 'Pickup slot confirmed successfully'));
});

export const verifyPickupCode = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { verificationPin } = req.body;

  const order = await orderService.verifyPickupCode({
    orderId,
    verificationPin
  });

  return res.status(200).json(new ApiResponse(200, order, 'Order verified and collected successfully'));
});

export const sendManualPickupEmail = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  const order = await orderService.sendManualPickupEmail({
    orderId
  });

  return res.status(200).json(new ApiResponse(200, order, 'Pickup slot invitation email sent successfully'));
});
