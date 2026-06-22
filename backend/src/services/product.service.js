import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';

export const createProduct = async (productBody) => {
  const existingProduct = await Product.findOne({ sku: productBody.sku });
  if (existingProduct) {
    throw new ApiError(400, `Product with SKU ${productBody.sku} already exists`);
  }

  // Calculate final tax-inclusive price
  const tax = productBody.tax !== undefined ? productBody.tax : 0;
  let sellingPrice = productBody.sellingPrice !== undefined ? productBody.sellingPrice : (productBody.price || 1);
  sellingPrice = Math.max(1, Math.ceil(sellingPrice));

  let mrp = productBody.mrp !== undefined ? productBody.mrp : sellingPrice;
  mrp = Math.max(1, Math.ceil(mrp));

  productBody.sellingPrice = sellingPrice;
  productBody.mrp = mrp;
  productBody.price = Math.max(1, Math.ceil(sellingPrice * (1 + tax / 100)));

  return await Product.create(productBody);
};

export const queryProducts = async (filter, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', category, search } = options;
  
  const query = { ...filter };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { desc: { $regex: search, $options: 'i' } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const totalResults = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limit);
  const skip = (page - 1) * limit;

  const results = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate('badges');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

export const updateProductById = async (id, updateBody) => {
  const product = await getProductById(id);
  
  if (updateBody.sku && updateBody.sku !== product.sku) {
    const existingSku = await Product.findOne({ sku: updateBody.sku });
    if (existingSku) {
      throw new ApiError(400, `Product with SKU ${updateBody.sku} already exists`);
    }
  }

  if (updateBody.sellingPrice !== undefined) {
    updateBody.sellingPrice = Math.max(1, Math.ceil(updateBody.sellingPrice));
  }
  if (updateBody.mrp !== undefined) {
    updateBody.mrp = Math.max(1, Math.ceil(updateBody.mrp));
  }

  // Update final price if sellingPrice or tax is updated
  const tax = updateBody.tax !== undefined ? updateBody.tax : (product.tax || 0);
  const sellingPrice = updateBody.sellingPrice !== undefined ? updateBody.sellingPrice : (product.sellingPrice || product.price || 1);
  updateBody.price = Math.max(1, Math.ceil(sellingPrice * (1 + tax / 100)));

  Object.assign(product, updateBody);
  await product.save();
  return product;
};

export const deleteProductById = async (id) => {
  const product = await getProductById(id);
  await product.deleteOne();
  return product;
};

export const evaluateInventoryStock = async () => {
  const aggregation = await Product.aggregate([
    {
      $group: {
        _id: null,
        uniqueProductsCount: { $sum: 1 },
        totalStockQuantity: { $sum: '$quantity' },
        totalStockCostValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        totalStockRetailValue: { $sum: { $multiply: ['$quantity', '$price'] } },
      },
    },
  ]);

  const metrics = aggregation[0] || {
    uniqueProductsCount: 0,
    totalStockQuantity: 0,
    totalStockCostValue: 0,
    totalStockRetailValue: 0,
  };

  const potentialProfit = metrics.totalStockRetailValue - metrics.totalStockCostValue;

  // Find low stock items
  const lowStockItems = await Product.find({
    $expr: {
      $and: [
        { $gt: ['$quantity', 0] },
        { $lte: ['$quantity', '$lowstockthreshold'] },
      ],
    },
  }).select('sku name quantity lowstockthreshold category');

  // Find out of stock items
  const outOfStockItems = await Product.find({ quantity: 0 }).select('sku name category');

  return {
    summary: {
      uniqueProductsCount: metrics.uniqueProductsCount,
      totalPhysicalQuantity: metrics.totalStockQuantity,
      totalCostValue: Number(metrics.totalStockCostValue.toFixed(2)),
      totalRetailValue: Number(metrics.totalStockRetailValue.toFixed(2)),
      potentialProfit: Number(potentialProfit.toFixed(2)),
      lowStockAlertCount: lowStockItems.length,
      outOfStockAlertCount: outOfStockItems.length,
    },
    alerts: {
      lowStock: lowStockItems,
      outOfStock: outOfStockItems,
    },
  };
};
