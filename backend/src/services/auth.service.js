import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import { hashForLookup } from '../utils/encryption.js';

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const emailLookup = hashForLookup(email);
  const existingUser = await User.findOne({ emailHash: emailLookup });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    emailHash: emailLookup,
    password,
    role,
  });

  return user;
};

export const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ emailHash: hashForLookup(email) });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return user;
};

export const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

export const refreshAccessToken = async (oldRefreshToken) => {
  try {
    const decodedToken = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123'
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Check if refresh token exists in user's refresh tokens list
    const tokenIndex = user.refreshTokens.indexOf(oldRefreshToken);
    if (tokenIndex === -1) {
      // Refresh token is not in list (potential reuse/theft!)
      // Clear all refresh tokens for security
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      throw new ApiError(401, 'Refresh token has been reused or is invalid. Logged out.');
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Replace old refresh token with the new one (token rotation)
    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
};

export const logoutUser = async (refreshToken) => {
  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123'
    );

    const user = await User.findById(decodedToken?._id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await user.save({ validateBeforeSave: false });
    }
  } catch (error) {
    // If token is expired/invalid, we just proceed (best effort logout)
  }
};
