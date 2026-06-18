import Booking from '../models/booking.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendBookingConfirmationEmail, sendBookingAdminNotificationEmail } from '../services/email.service.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { name, email, phone, productId, productName, date, timeSlot, notes, demoType } = req.body;

  let verifiedProductName = productName || 'General Trial';
  let product = null;

  if (productId) {
    product = await Product.findById(productId);
    if (product) {
      verifiedProductName = product.name;
    }
  }

  let videoLink = '';
  if (demoType === 'virtual') {
    const code = Math.random().toString(36).substring(2, 5) + '-' + 
                 Math.random().toString(36).substring(2, 6) + '-' + 
                 Math.random().toString(36).substring(2, 5);
    videoLink = `https://meet.google.com/${code.toLowerCase()}`;
  }

  const booking = await Booking.create({
    name,
    email,
    phone,
    product: productId || null,
    productName: verifiedProductName,
    date,
    timeSlot,
    notes,
    demoType: demoType || 'in-store',
    videoLink
  });

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Send email notification to Admin
  try {
    await sendBookingAdminNotificationEmail({
      name,
      email,
      phone,
      productName: verifiedProductName,
      date: formattedDate,
      timeSlot,
      notes,
      demoType: booking.demoType,
      videoLink: booking.videoLink
    });
  } catch (err) {
    console.error('Failed to notify admin about booking via email:', err);
  }

  // Send acknowledgement email to Client
  try {
    await sendBookingConfirmationEmail(email, {
      name,
      productName: verifiedProductName,
      date: formattedDate,
      timeSlot,
      demoType: booking.demoType,
      videoLink: booking.videoLink
    });
  } catch (err) {
    console.error('Failed to notify customer about booking confirmation via email:', err);
  }

  return res.status(201).json(new ApiResponse(201, booking, 'Demo trial appointment booked successfully'));
});

export const getBookings = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }
  if (date) {
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }

  const bookings = await Booking.find(filter)
    .populate('product')
    .sort({ date: 1, timeSlot: 1 });

  return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('product');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, booking, 'Booking status updated successfully'));
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findByIdAndDelete(id);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Booking deleted successfully'));
});
