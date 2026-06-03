import User from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Edit user's name
export const updateDetails = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, 'Name is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.name = name;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Name updated successfully'));
});

// Add a new address with a tag (limit of 4)
export const addAddress = asyncHandler(async (req, res) => {
  const { tag, doorNumber, secondLine, landmark, city, state, pincode } = req.body;
  if (!tag || !doorNumber || !city || !state || !pincode) {
    throw new ApiError(400, 'Tag, Door number, City, State and Pincode are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.addresses.length >= 4) {
    throw new ApiError(400, 'Address list limit reached (maximum 4)');
  }

  user.addresses.push({ tag, doorNumber, secondLine, landmark, city, state, pincode });
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Address added successfully'));
});

// Delete an address by its ID
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) {
    throw new ApiError(400, 'Address ID is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const initialLength = user.addresses.length;
  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);

  if (user.addresses.length === initialLength) {
    throw new ApiError(404, 'Address not found');
  }

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Address deleted successfully'));
});

// Change user password flow
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new passwords are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

// Toggle 2FA switch
export const toggle2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save({ validateBeforeSave: false });

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, `2FA is now ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`));
});

// Update a saved address
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { tag, doorNumber, secondLine, landmark, city, state, pincode } = req.body;
  
  if (!tag || !doorNumber || !city || !state || !pincode) {
    throw new ApiError(400, 'Tag, Door number, City, State and Pincode are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  address.tag = tag;
  address.doorNumber = doorNumber;
  address.secondLine = secondLine || '';
  address.landmark = landmark || '';
  address.city = city;
  address.state = state;
  address.pincode = pincode;

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Address updated successfully'));
});

// Upload avatar profile picture
export const uploadAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    throw new ApiError(400, 'Avatar is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.avatarPublicId) {
    try {
      await deleteFromCloudinary(user.avatarPublicId);
    } catch (err) {
      // Continue even if deletion of old avatar fails
    }
  }

  const result = await uploadToCloudinary(avatar, 'avatars');
  user.avatar = result.secure_url;
  user.avatarPublicId = result.public_id;
  await user.save({ validateBeforeSave: false });

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Profile picture uploaded successfully'));
});

// Delete avatar profile picture
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  user.avatar = '';
  user.avatarPublicId = '';
  await user.save({ validateBeforeSave: false });

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Profile picture deleted successfully'));
});

// Toggle wishlist (add/remove a product)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const index = user.wishlist.findIndex(
    (id) => id.toString() === productId
  );

  let message;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    message = 'Removed from wishlist';
  } else {
    user.wishlist.push(productId);
    message = 'Added to wishlist';
  }

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user.wishlist, message));
});

// Get user's wishlist with populated product details
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name sku desc price quantity category image active',
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Filter out any products that may have been deleted
  const activeItems = user.wishlist.filter((item) => item !== null);

  return res
    .status(200)
    .json(new ApiResponse(200, activeItems, 'Wishlist fetched successfully'));
});

