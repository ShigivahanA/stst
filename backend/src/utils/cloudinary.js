import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

/**
 * Uploads a base64 image string to Cloudinary
 * @param {string} base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<object>} Cloudinary response object containing url and public_id
 */
export const uploadToCloudinary = async (base64Image, folder = 'avatars') => {
  try {
    let formattedImage = base64Image;
    if (!base64Image.startsWith('data:image')) {
      formattedImage = `data:image/png;base64,${base64Image}`;
    }

    const response = await cloudinary.uploader.upload(formattedImage, {
      folder,
      resource_type: 'image',
    });
    return response;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Deletes an image from Cloudinary by its public ID
 * @param {string} publicId - The public ID of the resource to delete
 * @returns {Promise<object>} Cloudinary destroy response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};
