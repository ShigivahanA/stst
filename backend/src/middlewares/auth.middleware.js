import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request. Access token is missing.');
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'access_secret_123'
    );

    const user = await User.findById(decodedToken?._id).select('-password -refreshTokens');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token. User not found.');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Access Token');
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role: ${req.user?.role || 'Guest'} is not authorized to access this resource`
      );
    }
    next();
  };
};

export const restrictAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    throw new ApiError(403, 'Administrators are not allowed to perform this customer action.');
  }
  next();
};

export const verifyOptionalJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'access_secret_123'
      );

      const user = await User.findById(decodedToken?._id).select('-password -refreshTokens');

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore verification errors for optional authentication
  }
  next();
});

