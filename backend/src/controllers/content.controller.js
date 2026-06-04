import Content from '../models/content.model.js';
import Stat from '../models/stat.model.js';
import Review from '../models/review.model.js';
import Page from '../models/page.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { DEFAULT_PAGES } from '../constants/defaultPages.js';

// Retrieve published CMS content, optionally filtering by content type
export const getPublicContent = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = { isPublished: true };

  if (type) {
    filter.type = type;
  }

  const content = await Content.find(filter).sort('-createdAt');

  return res.status(200).json(
    new ApiResponse(200, content, 'Content fetched successfully')
  );
});

// Public: Get active hero stats for landing page
export const getPublicStats = asyncHandler(async (req, res) => {
  const stats = await Stat.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, stats, 'Stats fetched'));
});

// Public: Get active testimonial reviews for landing page
export const getPublicReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isActive: true }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched'));
});

// Public: Get policy/info page by slug
const VALID_SLUGS = ['privacy', 'shipping', 'terms', 'returns', 'faq'];
const SLUG_TITLES = {
  privacy: 'Privacy Policy',
  shipping: 'Shipping Policy',
  terms: 'Terms & Conditions',
  returns: 'Returns & Refunds',
  faq: 'FAQ',
};

export const getPublicPage = asyncHandler(async (req, res) => {
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
      page = { pageSlug: slug, pageTitle: SLUG_TITLES[slug], sections: [] };
    }
  } else {
    // Sort sections by order
    page.sections.sort((a, b) => a.order - b.order);
  }

  return res.status(200).json(
    new ApiResponse(200, page, 'Page content fetched successfully')
  );
});
