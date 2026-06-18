import Coupon from '../models/coupon.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// User validation endpoint
export const validateCouponCode = asyncHandler(async (req, res) => {
  const { code, cartSubtotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

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

  if (cartSubtotal < coupon.minCartAmount) {
    throw new ApiError(400, `Minimum order amount of ₹${coupon.minCartAmount.toLocaleString()} is required for this coupon`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round(cartSubtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'flat') {
    discountAmount = coupon.discountValue;
  }

  // Cap discount at the subtotal
  discountAmount = Math.min(discountAmount, cartSubtotal);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minCartAmount: coupon.minCartAmount,
        discountAmount,
        finalAmount: cartSubtotal - discountAmount,
      },
      'Coupon validated successfully'
    )
  );
});

// Admin Coupon CRUD
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, coupons, 'Coupons fetched successfully'));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minCartAmount, maxDiscountAmount, validUntil, isActive, usageLimit } = req.body;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(400, 'A coupon with this code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minCartAmount,
    maxDiscountAmount,
    validUntil,
    isActive,
    usageLimit,
  });

  return res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minCartAmount, maxDiscountAmount, validUntil, isActive, usageLimit } = req.body;

  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  if (code && code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new ApiError(400, 'A coupon with this code already exists');
    }
    coupon.code = code.toUpperCase();
  }

  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (minCartAmount !== undefined) coupon.minCartAmount = minCartAmount;
  if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
  if (validUntil !== undefined) coupon.validUntil = validUntil;
  if (isActive !== undefined) coupon.isActive = isActive;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;

  const updatedCoupon = await coupon.save();
  return res.status(200).json(new ApiResponse(200, updatedCoupon, 'Coupon updated successfully'));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  return res.status(200).json(new ApiResponse(200, {}, 'Coupon deleted successfully'));
});
