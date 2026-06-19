import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const transformProductToListing = (p) => {
  return {
    _id: p._id.toString(),
    sku: p.sku,
    name: p.name,
    title: p.name, // legacy fallback
    desc: p.desc || '',
    description: p.desc || '', // legacy fallback
    price: p.price,
    pricePerDay: p.price, // legacy fallback
    pricePerHour: Math.round(p.price / 10),
    securityDeposit: Math.round(p.price * 2),
    averageRating: p.rating ? p.rating.toFixed(1) : '0.0',
    numOfReviews: p.numOfReviews || 0,
    condition: 'Excellent',
    type: 'Rental',
    availability: p.quantity > 0 ? `In Stock (${p.quantity})` : 'Out of Stock',
    category: p.category,
    image: (p.images && p.images.length > 0)
      ? (typeof p.images[0] === 'object' && p.images[0].url ? p.images[0].url : String(p.images[0]))
      : '',
    images: (Array.isArray(p.images) && p.images.length > 0)
      ? p.images.map(img => (img && typeof img === 'object' && img.url) ? img.url : String(img))
      : [],
    specifications: p.specifications || [],
    location: {
      address: '9/330, Nethaji Street, Polichalur',
      city: 'Chennai',
      state: 'TN',
      zipcode: '600074'
    },
    owner: {
      _id: 'owner-admin',
      name: 'STAT Surgical',
      avatar: '',
      isAadharVerified: true
    },
    active: p.active,
    isActive: p.active, // legacy fallback
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
};

export const getListings = asyncHandler(async (req, res) => {
  const { category, keyword, sort, availability } = req.query;
  const filter = {};

  if (req.query.owner) {
    // Owner filter
  } else {
    filter.active = true;
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (availability) {
    if (availability === 'inStock') {
      filter.quantity = { $gt: 0 };
    } else if (availability === 'outOfStock') {
      filter.quantity = { $lte: 0 };
    }
  }

  if (keyword) {
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(keyword.trim());
    filter.$or = [
      { name: { $regex: escapedKeyword, $options: 'i' } },
      { desc: { $regex: escapedKeyword, $options: 'i' } },
      { sku: { $regex: escapedKeyword, $options: 'i' } },
      { brand: { $regex: escapedKeyword, $options: 'i' } },
      { category: { $regex: escapedKeyword, $options: 'i' } }
    ];
    if (isObjectId) {
      filter.$or.push({ _id: keyword.trim() });
    } else {
      filter.$or.push({
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: escapedKeyword,
            options: "i"
          }
        }
      });
    }
  }

  // Handle both simplified 'price' query params and legacy 'pricePerDay'
  const minPrice = req.query.minPrice || req.query['price[gte]'] || req.query['pricePerDay[gte]'];
  const maxPrice = req.query.maxPrice || req.query['price[lte]'] || req.query['pricePerDay[lte]'];
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort) {
    if (sort === 'priceAsc' || sort === 'price') sortOption = { price: 1 };
    else if (sort === 'priceDesc' || sort === '-price') sortOption = { price: -1 };
    else if (sort === '-pricePerDay') sortOption = { price: -1 };
    else if (sort === 'pricePerDay') sortOption = { price: 1 };
    else if (sort === '-averageRating') sortOption = { rating: -1 };
    else if (sort === 'averageRating') sortOption = { rating: 1 };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;

  const total = await Product.countDocuments(filter);
  res.setHeader('X-Total-Count', total.toString());
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');

  let query = Product.find(filter).sort(sortOption);
  if (limit > 0) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const products = await query;
  const listings = products.map(transformProductToListing);

  return res.status(200).json(new ApiResponse(200, listings, 'Listings fetched successfully'));
});

export const getListing = asyncHandler(async (req, res) => {
  let product;
  const idStr = req.params.id;

  // 1. Try finding by MongoDB ObjectId first
  if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(idStr);
  }

  // 2. Try finding by SKU (case-insensitive)
  if (!product) {
    product = await Product.findOne({ sku: { $regex: new RegExp(`^${idStr}$`, 'i') } });
  }

  // 3. Try finding by ID suffix (last characters, e.g. "2447c2" from "6a2017221b857d71cb2447c2")
  if (!product && idStr.length >= 4) {
    const allProducts = await Product.find({});
    product = allProducts.find(p => p._id.toString().toLowerCase().endsWith(idStr.toLowerCase()));
  }

  if (!product) {
    throw new ApiError(404, 'Listing not found');
  }
  return res.status(200).json(new ApiResponse(200, transformProductToListing(product), 'Listing fetched successfully'));
});

export const createListing = asyncHandler(async (req, res) => {
  const { sku, name, desc, price, quantity, category, lowstockthreshold, active, image, title, description, pricePerDay, images, specifications } = req.body;
  const productImages = (images && images.length > 0)
    ? images
    : (image ? [{ url: image, publicId: 'legacy' }] : []);
  const newProduct = await Product.create({
    sku: sku || 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    name: name || title || 'Unnamed Product',
    desc: desc || description || '',
    category: category || 'Diagnostic Tools',
    price: price !== undefined ? price : (pricePerDay || 100),
    quantity: quantity !== undefined ? quantity : 5,
    lowstockthreshold: lowstockthreshold !== undefined ? lowstockthreshold : 10,
    active: active !== undefined ? active : true,
    images: productImages,
    specifications: specifications || {}
  });
  return res.status(201).json(new ApiResponse(201, transformProductToListing(newProduct), 'Listing created successfully'));
});

export const updateListing = asyncHandler(async (req, res) => {
  const { sku, name, desc, price, quantity, category, lowstockthreshold, active, image, isActive, title, description, pricePerDay, images, specifications } = req.body;
  const updateData = {};
  if (sku !== undefined) updateData.sku = sku;
  if (name !== undefined) updateData.name = name;
  if (title !== undefined && name === undefined) updateData.name = title;
  if (desc !== undefined) updateData.desc = desc;
  if (description !== undefined && desc === undefined) updateData.desc = description;
  if (price !== undefined) updateData.price = price;
  if (pricePerDay !== undefined && price === undefined) updateData.price = pricePerDay;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (category !== undefined) updateData.category = category;
  if (lowstockthreshold !== undefined) updateData.lowstockthreshold = lowstockthreshold;
  if (active !== undefined) updateData.active = active;
  if (isActive !== undefined && active === undefined) updateData.active = isActive;
  if (images !== undefined) {
    updateData.images = images;
  } else if (image !== undefined) {
    updateData.images = [{ url: image, publicId: 'legacy' }];
  }
  if (specifications !== undefined) {
    updateData.specifications = specifications;
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!updatedProduct) {
    throw new ApiError(404, 'Listing not found');
  }
  return res.status(200).json(new ApiResponse(200, transformProductToListing(updatedProduct), 'Listing updated successfully'));
});

export const deleteListing = asyncHandler(async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw new ApiError(404, 'Listing not found');
  }
  return res.status(200).json(new ApiResponse(200, {}, 'Listing deleted successfully'));
});

export const getListingCategories = asyncHandler(async (req, res) => {
  const counts = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    }
  ]);
  
  const defaults = ['Rehabilitation', 'Respiratory', 'Diagnostic Tools', 'Elder Care', 'Wound Care'];
  const resultsMap = {};
  defaults.forEach(cat => {
    resultsMap[cat] = 0;
  });
  counts.forEach(item => {
    if (item._id) {
      resultsMap[item._id] = item.count;
    }
  });
  const data = Object.keys(resultsMap).map(key => ({
    _id: key,
    count: resultsMap[key]
  }));

  return res.status(200).json(new ApiResponse(200, data, 'Category counts fetched successfully'));
});

export const getListingStats = asyncHandler(async (req, res) => {
  const listingsCount = await Product.countDocuments({ active: true });
  const usersCount = await User.countDocuments();
  return res.status(200).json(new ApiResponse(200, {
    users: usersCount || 150,
    listings: listingsCount || 42
  }, 'Listing stats fetched successfully'));
});

export const getLandingReviews = asyncHandler(async (req, res) => {
  const reviews = [
    {
      _id: 'review-1',
      text: "Outstanding service and top-grade quality. Their customer service team helped us source specific surgical instruments that were out of stock elsewhere. Highly recommended!",
      user: {
        name: 'Dr. Ramesh Kumar',
        role: 'Senior Orthopedic Surgeon',
        onboardingData: { location: 'Chennai' }
      }
    },
    {
      _id: 'review-2',
      text: "STAT Surgical Supplies is our trusted vendor for all ICU consumables. Prompt delivery and excellent pricing. Reliable logistics across Tamil Nadu.",
      user: {
        name: 'Mrs. Priya Raghavan',
        role: 'Hospital Purchase Manager',
        onboardingData: { location: 'Coimbatore' }
      }
    },
    {
      _id: 'review-3',
      text: "Excellent range of diagnostic tools at competitive prices. STAT Surgical Supplies has everything a modern clinic needs. The team goes above and beyond to fulfill our requirements.",
      user: {
        name: 'Dr. Anitha Balan',
        role: 'Clinic Director',
        onboardingData: { location: 'Pammal' }
      }
    }
  ];
  return res.status(200).json(new ApiResponse(200, reviews, 'Landing reviews fetched successfully'));
});
