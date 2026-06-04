import * as orderService from '../services/order.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const checkout = asyncHandler(async (req, res) => {
  const { items, sessionId, conversionSource } = req.body;
  const userId = req.user?._id; // If guest, userId is undefined

  const data = await orderService.createCheckoutOrder({
    userId,
    items,
    sessionId,
    conversionSource,
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
