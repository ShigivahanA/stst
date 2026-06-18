import Content from '../models/content.model.js';
import Stat from '../models/stat.model.js';
import Review from '../models/review.model.js';
import Page from '../models/page.model.js';
import Badge from '../models/badge.model.js';
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

// Public: Get active quality badges for product details page
export const getPublicBadges = asyncHandler(async (req, res) => {
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

  // Find the visibility config
  const configBadge = badges.find(b => b.title === '__BADGES_VISIBILITY__');
  const sectionVisible = configBadge ? configBadge.description !== 'hidden' : true;

  // Filter out the configuration record and inactive badges
  const publicBadges = badges.filter(
    b => b.title !== '__BADGES_VISIBILITY__' && b.isActive
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sectionVisible,
        badges: publicBadges,
      },
      'Badges fetched successfully'
    )
  );
});

