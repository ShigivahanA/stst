import BulkEnquiry from '../models/bulkEnquiry.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendBulkEnquiryEmail, sendBulkEnquiryReceiptEmail } from '../services/email.service.js';

export const createBulkEnquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, organization, productId, productName, quantity, requirements, budget, timeline } = req.body;

  let verifiedProductName = productName || 'General Enquiry';
  let product = null;

  if (productId) {
    product = await Product.findById(productId);
    if (product) {
      verifiedProductName = product.name;
    }
  }

  const bulkEnquiry = await BulkEnquiry.create({
    name,
    email,
    phone,
    organization,
    product: productId || null,
    productName: verifiedProductName,
    quantity,
    requirements,
    budget,
    timeline
  });

  // Send email to admin
  try {
    await sendBulkEnquiryEmail(
      name,
      email,
      phone,
      organization,
      verifiedProductName,
      quantity,
      requirements,
      budget,
      timeline
    );
  } catch (err) {
    console.error('Failed to notify admin via email:', err);
  }

  // Send acknowledgement email to enquirer
  try {
    await sendBulkEnquiryReceiptEmail(email, name, verifiedProductName, quantity);
  } catch (err) {
    console.error('Failed to send customer confirmation email:', err);
  }

  return res.status(201).json(new ApiResponse(201, bulkEnquiry, 'Bulk enquiry submitted successfully'));
});

export const getBulkEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) {
    filter.status = status;
  }

  const enquiries = await BulkEnquiry.find(filter).populate('product').sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, enquiries, 'Bulk enquiries fetched successfully'));
});

export const updateBulkEnquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const enquiry = await BulkEnquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('product');

  if (!enquiry) {
    throw new ApiError(404, 'Bulk enquiry not found');
  }

  return res.status(200).json(new ApiResponse(200, enquiry, 'Bulk enquiry status updated successfully'));
});

export const deleteBulkEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enquiry = await BulkEnquiry.findByIdAndDelete(id);

  if (!enquiry) {
    throw new ApiError(404, 'Bulk enquiry not found');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Bulk enquiry deleted successfully'));
});
