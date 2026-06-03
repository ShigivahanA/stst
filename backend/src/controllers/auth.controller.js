import crypto from 'crypto';
import * as authService from '../services/auth.service.js';
import User from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { hashForLookup } from '../utils/encryption.js';
import { 
  sendWelcomeEmail, 
  sendLoginEmail, 
  sendForgotPasswordEmail, 
  sendResetSuccessEmail, 
  sendResetFailureEmail,
  sendTwoFactorOtpEmail
} from '../services/email.service.js';

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.VERCEL === true;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token expiry
  };
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  const { accessToken, refreshToken } = await authService.generateAccessAndRefreshTokens(user._id);

  // Send Welcome Email in background
  sendWelcomeEmail(user.email, user.name);

  // Exclude password from output
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(201)
    .cookie('refreshToken', refreshToken, getCookieOptions())
    .json(new ApiResponse(201, { user: userResponse, accessToken }, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  if (user.twoFactorEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorOtp = otp;
    user.twoFactorOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save({ validateBeforeSave: false });

    // Send 2FA email in background
    sendTwoFactorOtpEmail(user.email, user.name, otp);

    return res
      .status(200)
      .json(new ApiResponse(200, { twoFactorRequired: true, userId: user._id }, 'Two-factor authentication code sent to email'));
  }

  const { accessToken, refreshToken } = await authService.generateAccessAndRefreshTokens(user._id);

  // Send Login Email in background
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
  const ua = req.headers['user-agent'] || 'Unknown Browser';
  sendLoginEmail(user.email, user.name, time, ip, ua);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, getCookieOptions())
    .json(new ApiResponse(200, { user: userResponse, accessToken }, 'Login successful'));
});

export const verify2FA = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    throw new ApiError(400, 'User ID and OTP are required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (
    !user.twoFactorOtp ||
    user.twoFactorOtp !== otp ||
    !user.twoFactorOtpExpiry ||
    user.twoFactorOtpExpiry < Date.now()
  ) {
    throw new ApiError(400, 'Invalid or expired verification code');
  }

  user.twoFactorOtp = undefined;
  user.twoFactorOtpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await authService.generateAccessAndRefreshTokens(user._id);

  // Send Login Email in background
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
  const ua = req.headers['user-agent'] || 'Unknown Browser';
  sendLoginEmail(user.email, user.name, time, ip, ua);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, getCookieOptions())
    .json(new ApiResponse(200, { user: userResponse, accessToken }, 'Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (refreshToken) {
    try {
      await authService.logoutUser(refreshToken);
    } catch (err) {
      // Ignore database errors during logout to guarantee successful session clearance
    }
  }

  return res
    .status(200)
    .clearCookie('refreshToken', getCookieOptions())
    .json(new ApiResponse(200, {}, 'Logged out successfully'));
});

export const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError(401, 'Refresh token is missing');
  }

  const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken);

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, getCookieOptions())
    .json(new ApiResponse(200, { accessToken }, 'Access token refreshed successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Current user profile retrieved'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ emailHash: hashForLookup(email) });

  if (!user) {
    return res.status(200).json(new ApiResponse(200, {}, 'If an account matches this email, a recovery link has been sent.'));
  }

  // Generate 32-byte hex token and set 1-hour expiry
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.forgotPasswordToken = resetToken;
  user.forgotPasswordExpiry = Date.now() + 3600000; // 1 hour from now
  await user.save({ validateBeforeSave: false });

  // Send password reset link
  const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;
  sendForgotPasswordEmail(user.email, user.name, resetUrl);

  return res.status(200).json(new ApiResponse(200, {}, 'Recovery link dispatched successfully.'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    const attemptedUser = await User.findOne({ forgotPasswordToken: token });
    if (attemptedUser) {
      sendResetFailureEmail(attemptedUser.email, attemptedUser.name, 'Token has expired or is invalid.');
    }
    throw new ApiError(400, 'Password reset token is invalid or has expired.');
  }

  user.password = password;
  user.forgotPasswordToken = '';
  user.forgotPasswordExpiry = undefined;
  await user.save();

  // Generate session tokens so the user is auto-logged in
  const { accessToken, refreshToken } = await authService.generateAccessAndRefreshTokens(user._id);

  // Send reset confirmation email
  sendResetSuccessEmail(user.email, user.name);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, getCookieOptions())
    .json(new ApiResponse(200, { user: userResponse, accessToken }, 'Password reset completed successfully.'));
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const existingIndex = user.cart.findIndex(item => item.product.toString() === productId);
  if (existingIndex > -1) {
    if (Number(quantity) <= 0) {
      user.cart.splice(existingIndex, 1);
    } else {
      user.cart[existingIndex].quantity = Number(quantity);
      user.cart[existingIndex].addedAt = new Date();
    }
  } else if (Number(quantity) > 0) {
    user.cart.push({
      product: productId,
      quantity: Number(quantity),
      addedAt: new Date(),
    });
  }

  user.lastCartEmailSentAt = undefined; // Reset email tracker for abandoned cart reminders
  await user.save({ validateBeforeSave: false });

  const populatedUser = await User.findById(userId).populate('cart.product');
  return res.status(200).json(new ApiResponse(200, populatedUser.cart, 'Item added to cart successfully'));
});

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate('cart.product');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(200, user.cart, 'Cart fetched successfully'));
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  user.cart = [];
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, [], 'Cart cleared successfully'));
});
