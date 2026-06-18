import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Content from '../models/content.model.js';
import Stat from '../models/stat.model.js';
import Review from '../models/review.model.js';
import Badge from '../models/badge.model.js';
import Page from '../models/page.model.js';
import Session from '../models/session.model.js';
import AnalyticsEvent from '../models/analytics.model.js';
import ApiResponse from '../utils/ApiResponse.js';

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuspensionEmail, sendShippingUpdateEmail } from '../services/email.service.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { DEFAULT_PAGES } from '../constants/defaultPages.js';


// Stats: count users, products and mock pending listings
export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
  const totalProducts = await Product.countDocuments();
  
  // Find top 3 products that are low in stock (quantity <= lowstockthreshold)
  const lowStockProducts = await Product.find({
    $expr: { $lte: ["$quantity", "$lowstockthreshold"] }
  })
  .sort({ quantity: 1 })
  .limit(3)
  .select('name quantity sku lowstockthreshold');

  // Calculate total revenue, cost, and profit
  const financialResult = await Order.aggregate([
    { 
      $match: { 
        orderStatus: { $in: ['pending', 'processing', 'completed'] } 
      } 
    },
    { 
      $group: { 
        _id: null, 
        totalRevenue: { $sum: "$totalAmount" }, 
        totalCost: { $sum: "$totalCost" } 
      } 
    }
  ]);

  const revenue = financialResult[0]?.totalRevenue || 0;
  const cost = financialResult[0]?.totalCost || 0;
  const profit = revenue - cost;

  const totalOrders = await Order.countDocuments();
  const pendingOrdersCount = await Order.countDocuments({ orderStatus: 'pending' });

  // Get monthly stats for charts (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyResult = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        orderStatus: { $in: ['pending', 'processing', 'completed'] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        profit: { $sum: { $subtract: ["$totalAmount", "$totalCost"] } },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in any missing months to make a nice continuous series
  const monthlyStats = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const yearMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const found = monthlyResult.find(m => m._id === yearMonthStr);
    
    monthlyStats.push({
      month: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
      revenue: found ? found.revenue : 0,
      profit: found ? found.profit : 0,
      orders: found ? found.orders : 0
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { 
        totalUsers, 
        totalProducts, 
        lowStockProducts, 
        revenue, 
        profit, 
        totalOrders, 
        pendingOrdersCount,
        monthlyStats
      },
      'Stats fetched successfully'
    )
  );
});

// Pending listings: return empty array since approval is simplified
export const getPendingListings = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, [], 'Pending listings fetched successfully')
  );
});

// Update status for either an order or product
export const updateListingStatus = asyncHandler(async (req, res) => {
  const { status, orderStatus, shippingStatus } = req.body;

  // 1. Try finding and updating an Order
  const order = await Order.findById(req.params.id).populate('user');
  if (order) {
    let shippingChanged = false;

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (shippingStatus && order.shippingStatus !== shippingStatus) {
      order.shippingStatus = shippingStatus;
      shippingChanged = true;

      const statusDescriptions = {
        pending: 'Order confirmed. Undergoing sterilization and quality verification.',
        shipped: 'Order sterilized, packaged and handed over to courier partner.',
        in_transit: 'Order in transit through regional courier facility.',
        out_for_delivery: 'Order out for delivery with local surgical delivery agent.',
        delivered: 'Order delivered successfully to shipping address.',
        failed: 'Delivery attempt failed.'
      };

      order.shippingHistory.push({
        status: shippingStatus,
        description: statusDescriptions[shippingStatus] || `Order status updated to ${shippingStatus}`,
        timestamp: new Date()
      });

      if (shippingStatus === 'delivered') {
        order.orderStatus = 'completed';
      }
    }

    // Support legacy "approved" / "rejected" logic from confirm buttons
    if (status) {
      const targetOrderStatus = status === 'approved' ? 'processing' : 'cancelled';
      if (order.orderStatus !== targetOrderStatus) {
        order.orderStatus = targetOrderStatus;
      }
      
      const targetShippingStatus = status === 'approved' ? 'shipped' : 'failed';
      if (order.shippingStatus !== targetShippingStatus) {
        order.shippingStatus = targetShippingStatus;
        shippingChanged = true;

        order.shippingHistory.push({
          status: targetShippingStatus,
          description: status === 'approved' 
            ? 'Order sterilized, packaged and handed over to courier partner.' 
            : 'Order rejected and cancelled by admin.',
          timestamp: new Date()
        });
      }
    }

    await order.save();

    // Send shipping update email if shipping status was changed
    if (shippingChanged && order.user && order.user.email) {
      try {
        const latestHistory = order.shippingHistory[order.shippingHistory.length - 1];
        const description = latestHistory ? latestHistory.description : `Order shipping status updated to ${order.shippingStatus}`;
        await sendShippingUpdateEmail(
          order.user.email,
          order.user.name,
          order._id.toString(),
          order.shippingStatus,
          description
        );
      } catch (err) {
        console.error(`Error sending manual shipping update email: ${err.message}`);
      }
    }

    return res.status(200).json(
      new ApiResponse(200, order, 'Order status updated successfully')
    );
  }

  // 2. Otherwise, update Product active status
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { active: status === 'approved' },
    { new: true }
  );
  if (product) {
    return res.status(200).json(
      new ApiResponse(200, product, 'Product status updated successfully')
    );
  }

  throw new ApiError(404, 'Record not found');
});

// Bookings/Ledger: Map e-commerce orders into bookings entries
export const getBookings = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user')
    .populate('items.product')
    .sort('-createdAt');

  const bookings = orders.map((order) => {
    const firstItem = order.items[0];
    const product = firstItem?.product;

    return {
      _id: order._id.toString(),
      listing: {
        _id: product?._id?.toString() || 'unknown',
        title: product?.name || 'STAT Surgical Tool',
      },
      renter: {
        _id: order.user?._id?.toString() || 'guest',
        name: order.user?.name || 'Guest User',
        avatar: order.user?.avatar || '',
      },
      owner: {
        _id: 'owner-admin',
        name: 'STAT Surgical Supplies',
        avatar: '',
        isAadharVerified: true,
      },
      startDate: order.createdAt,
      endDate: new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000),
      totalPrice: order.totalAmount,
      status: order.orderStatus === 'completed' || order.orderStatus === 'processing' ? 'confirmed' :
              order.orderStatus === 'pending' ? 'pending' : 'cancelled',
      orderStatus: order.orderStatus,
      shippingStatus: order.shippingStatus,
      paymentStatus: order.paymentStatus,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, bookings, 'Ledger bookings fetched successfully')
  );
});

// User registry management
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).select('-password -refreshTokens -addresses -cart -wishlist');
  return res.status(200).json(
    new ApiResponse(200, users, 'Users fetched successfully')
  );
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, name, email } = req.body;
  if (!name || !email) {
    throw new ApiError(400, 'Name and email are required');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, name, email },
    { new: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, user, 'User updated successfully')
  );
});

export const banUser = asyncHandler(async (req, res) => {
  const { isBanned, banUntil, banReason } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned, banUntil, banReason },
    { new: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (isBanned) {
    let durationStr = 'Temporary Suspension';
    if (banUntil) {
      const untilDate = new Date(banUntil);
      const diffMs = untilDate.getTime() - Date.now();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 3650) {
        durationStr = 'Permanent';
      } else {
        durationStr = `${diffDays} Days (Until ${untilDate.toLocaleDateString()})`;
      }
    } else {
      durationStr = 'Indefinite';
    }

    sendSuspensionEmail(user.email, user.name, durationStr, banReason)
      .catch(err => console.error('Failed to send suspension email:', err));
  }

  return res.status(200).json(
    new ApiResponse(200, user, 'User ban status updated successfully')
  );
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens')
    .populate('wishlist')
    .populate('cart.product');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const userId = req.params.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Session summary stats
  const sessionStats = await Session.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$durationSeconds' },
        avgDuration: { $avg: '$durationSeconds' },
        conversionsCount: {
          $sum: { $cond: [{ $eq: ['$conversionRecorded', true] }, 1, 0] },
        },
      },
    },
  ]);

  const sessionSummary = sessionStats[0] || {
    totalSessions: 0,
    totalDuration: 0,
    avgDuration: 0,
    conversionsCount: 0,
  };

  // 2. Event breakdown
  const eventBreakdown = await AnalyticsEvent.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: '$eventName',
        count: { $sum: 1 },
      },
    },
  ]);

  const eventCounts = {
    pageViews: 0,
    addToCarts: 0,
    initiateCheckouts: 0,
    purchases: 0,
  };

  eventBreakdown.forEach((evt) => {
    if (evt._id === 'page_view') eventCounts.pageViews = evt.count;
    else if (evt._id === 'add_to_cart') eventCounts.addToCarts = evt.count;
    else if (evt._id === 'initiate_checkout') eventCounts.initiateCheckouts = evt.count;
    else if (evt._id === 'conversion_purchase') eventCounts.purchases = evt.count;
  });

  // 3. Most visited pages
  const popularPages = await Session.aggregate([
    { $match: { user: userObjectId } },
    { $unwind: '$pagesVisited' },
    {
      $group: {
        _id: '$pagesVisited.path',
        visitsCount: { $sum: 1 },
        totalDuration: { $sum: '$pagesVisited.durationSeconds' },
      },
    },
    { $sort: { totalDuration: -1 } },
    { $limit: 5 },
  ]);

  // 4. Recent sessions
  const recentSessions = await Session.find({ user: userObjectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('sessionId createdAt durationSeconds pagesVisited deviceType referrer utmSource conversionRecorded');

  // 5. User orders history
  const orders = await Order.find({ user: userObjectId })
    .populate('items.product')
    .sort({ createdAt: -1 });

  const userResponse = user.toObject();
  userResponse.orders = orders;
  userResponse.analytics = {
    summary: {
      totalSessions: sessionSummary.totalSessions,
      totalDurationSeconds: Math.round(sessionSummary.totalDuration),
      averageDurationSeconds: Math.round(sessionSummary.avgDuration),
      conversionsCount: sessionSummary.conversionsCount,
    },
    events: eventCounts,
    popularPages,
    recentSessions,
  };

  return res.status(200).json(
    new ApiResponse(200, userResponse, 'User details and analytics fetched successfully')
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json(
    new ApiResponse(200, {}, 'User deleted successfully')
  );
});


// Admin CMS Content CRUD
export const getAdminContent = asyncHandler(async (req, res) => {
  const content = await Content.find().sort('-createdAt');
  return res.status(200).json(
    new ApiResponse(200, content, 'CMS Content fetched successfully')
  );
});

export const createAdminContent = asyncHandler(async (req, res) => {
  const { type, title, subtitle, content, image, author, isPublished } = req.body;
  if (!type || !title || !content) {
    throw new ApiError(400, 'Type, Title, and Content are required');
  }

  const newContent = await Content.create({
    type,
    title,
    subtitle,
    content,
    image,
    author,
    isPublished,
  });

  return res.status(201).json(
    new ApiResponse(201, newContent, 'CMS Content created successfully')
  );
});

export const updateAdminContent = asyncHandler(async (req, res) => {
  const updatedContent = await Content.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedContent) {
    throw new ApiError(404, 'CMS Content not found');
  }

  return res.status(200).json(
    new ApiResponse(200, updatedContent, 'CMS Content updated successfully')
  );
});

export const deleteAdminContent = asyncHandler(async (req, res) => {
  const deleted = await Content.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw new ApiError(404, 'CMS Content not found');
  }

  return res.status(200).json(
    new ApiResponse(200, {}, 'CMS Content deleted successfully')
  );
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  const { image } = req.body;
  if (!image) {
    throw new ApiError(400, 'Image base64 data is required');
  }

  const result = await uploadToCloudinary(image, 'products');

  return res.status(200).json(
    new ApiResponse(200, {
      url: result.secure_url,
      publicId: result.public_id
    }, 'Product image uploaded successfully')
  );
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    throw new ApiError(400, 'Image publicId is required');
  }

  await deleteFromCloudinary(publicId);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Product image deleted successfully')
  );
});

// ─── Hero Stats CRUD ───────────────────────────────────────────────────────────

export const getAdminContentStats = asyncHandler(async (req, res) => {
  const stats = await Stat.find().sort({ order: 1, createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, stats, 'Stats fetched'));
});

export const createAdminStat = asyncHandler(async (req, res) => {
  const { value, label, description, order } = req.body;
  if (!value || !label) throw new ApiError(400, 'Value and label are required');
  const stat = await Stat.create({ value, label, description: description || '', order: order || 0 });
  return res.status(201).json(new ApiResponse(201, stat, 'Stat created'));
});

export const updateAdminStat = asyncHandler(async (req, res) => {
  const stat = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!stat) throw new ApiError(404, 'Stat not found');
  return res.status(200).json(new ApiResponse(200, stat, 'Stat updated'));
});

export const deleteAdminStat = asyncHandler(async (req, res) => {
  const stat = await Stat.findByIdAndDelete(req.params.id);
  if (!stat) throw new ApiError(404, 'Stat not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Stat deleted'));
});

// ─── Testimonial Reviews CRUD ──────────────────────────────────────────────────

export const getAdminReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

export const createAdminReview = asyncHandler(async (req, res) => {
  const { text, userName, userRole, userLocation } = req.body;
  if (!text || !userName) throw new ApiError(400, 'Review text and user name are required');
  const review = await Review.create({ text, userName, userRole: userRole || 'Verified Customer', userLocation: userLocation || 'Tamil Nadu' });
  return res.status(201).json(new ApiResponse(201, review, 'Review created'));
});

export const updateAdminReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!review) throw new ApiError(404, 'Review not found');
  return res.status(200).json(new ApiResponse(200, review, 'Review updated'));
});

export const deleteAdminReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Review deleted'));
});

// ─── Policy Pages CRUD ──────────────────────────────────────────────────────

const VALID_SLUGS = ['privacy', 'shipping', 'terms', 'returns', 'faq'];
const SLUG_TITLES = {
  privacy: 'Privacy Policy',
  shipping: 'Shipping Policy',
  terms: 'Terms & Conditions',
  returns: 'Returns & Refunds',
  faq: 'FAQ',
};

export const getAdminPage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!VALID_SLUGS.includes(slug)) throw new ApiError(400, 'Invalid page slug');
  let page = await Page.findOne({ pageSlug: slug });
  if (!page) {
    const defaultData = DEFAULT_PAGES[slug];
    if (defaultData) {
      page = await Page.create({
        pageSlug: slug,
        pageTitle: defaultData.pageTitle,
        sections: defaultData.sections,
      });
    } else {
      page = await Page.create({
        pageSlug: slug,
        pageTitle: SLUG_TITLES[slug],
        sections: [],
      });
    }
  }
  return res.status(200).json(new ApiResponse(200, page, 'Page fetched'));
});

export const addAdminSection = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!VALID_SLUGS.includes(slug)) throw new ApiError(400, 'Invalid page slug');
  const { heading, body } = req.body;
  if (!heading || !body) throw new ApiError(400, 'Heading and body are required');

  let page = await Page.findOne({ pageSlug: slug });
  if (!page) {
    page = await Page.create({
      pageSlug: slug,
      pageTitle: SLUG_TITLES[slug],
      sections: [],
    });
  }
  const order = page.sections.length;
  page.sections.push({ heading: heading.trim(), body: body.trim(), order });
  await page.save();
  return res.status(201).json(new ApiResponse(201, page, 'Section added'));
});

export const updateAdminSection = asyncHandler(async (req, res) => {
  const { slug, sectionId } = req.params;
  if (!VALID_SLUGS.includes(slug)) throw new ApiError(400, 'Invalid page slug');
  const { heading, body, order } = req.body;

  const page = await Page.findOne({ pageSlug: slug });
  if (!page) throw new ApiError(404, 'Page not found');

  const section = page.sections.id(sectionId);
  if (!section) throw new ApiError(404, 'Section not found');

  if (heading !== undefined) section.heading = heading.trim();
  if (body !== undefined) section.body = body.trim();
  if (order !== undefined) section.order = order;

  await page.save();
  return res.status(200).json(new ApiResponse(200, page, 'Section updated'));
});

export const deleteAdminSection = asyncHandler(async (req, res) => {
  const { slug, sectionId } = req.params;
  if (!VALID_SLUGS.includes(slug)) throw new ApiError(400, 'Invalid page slug');

  const page = await Page.findOne({ pageSlug: slug });
  if (!page) throw new ApiError(404, 'Page not found');

  page.sections = page.sections.filter(s => s._id.toString() !== sectionId);
  // Reindex order
  page.sections.forEach((s, i) => { s.order = i; });
  await page.save();
  return res.status(200).json(new ApiResponse(200, page, 'Section deleted'));
});

export const reorderAdminSections = asyncHandler(async (req, res) => {
  // req.body.sections = array of { _id, order }
  const { slug } = req.params;
  if (!VALID_SLUGS.includes(slug)) throw new ApiError(400, 'Invalid page slug');
  const { sections: orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) throw new ApiError(400, 'sections must be an array of { _id, order }');

  const page = await Page.findOne({ pageSlug: slug });
  if (!page) throw new ApiError(404, 'Page not found');

  orderedIds.forEach(({ _id, order }) => {
    const sec = page.sections.id(_id);
    if (sec) sec.order = order;
  });
  page.sections.sort((a, b) => a.order - b.order);
  await page.save();
  return res.status(200).json(new ApiResponse(200, page, 'Sections reordered'));
});

// ─── Quality Badges CRUD ───────────────────────────────────────────────────────

export const getAdminBadges = asyncHandler(async (req, res) => {
  let badges = await Badge.find().sort({ order: 1, createdAt: 1 });
  if (badges.length === 0) {
    const DEFAULT_BADGES = [
      { icon: 'ShieldCheck', title: 'ISO 13485', description: 'QUALITY CERTIFIED', order: 1, isActive: true },
      { icon: 'Award', title: 'CE Standard', description: 'EU COMPLIANT', order: 2, isActive: true },
      { icon: 'Info', title: 'FDA / CDSCO', description: 'REGISTERED DEV', order: 3, isActive: true },
      { icon: 'Check', title: 'EO Sterile', description: '100% DECONTAMINATED', order: 4, isActive: true },
      { icon: 'ShieldCheck', title: 'ISO 9001', description: 'PROCESS CERTIFIED', order: 5, isActive: true },
      { icon: 'Award', title: 'GMP Certified', description: 'GOOD MFG PRACTICE', order: 6, isActive: true },
    ];
    badges = await Badge.insertMany(DEFAULT_BADGES);
  }
  return res.status(200).json(new ApiResponse(200, badges, 'Badges fetched'));
});

export const createAdminBadge = asyncHandler(async (req, res) => {
  const { icon, title, description, order } = req.body;
  if (!title || !description) throw new ApiError(400, 'Title and description are required');
  const badge = await Badge.create({
    icon: icon || 'ShieldCheck',
    title,
    description,
    order: order || 0,
    isActive: true
  });
  return res.status(201).json(new ApiResponse(201, badge, 'Badge created'));
});

export const updateAdminBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!badge) throw new ApiError(404, 'Badge not found');
  return res.status(200).json(new ApiResponse(200, badge, 'Badge updated'));
});

export const deleteAdminBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findByIdAndDelete(req.params.id);
  if (!badge) throw new ApiError(404, 'Badge not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Badge deleted'));
});

