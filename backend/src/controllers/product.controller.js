import * as productService from '../services/product.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, product, 'Product created successfully'));
});

export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, category, search } = req.query;
  const filter = { active: true }; // Only return active products to public by default
  const options = {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
    category,
    search,
  };

  const data = await productService.queryProducts(filter, options);
  return res
    .status(200)
    .json(new ApiResponse(200, data, 'Products fetched successfully'));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product fetched successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProductById(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProductById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Product deleted successfully'));
});

export const getStockEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await productService.evaluateInventoryStock();
  return res
    .status(200)
    .json(new ApiResponse(200, evaluation, 'Stock evaluation generated successfully'));
});
