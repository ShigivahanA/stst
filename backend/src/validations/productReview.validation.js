import Joi from 'joi';

const createReview = {
  body: Joi.object().keys({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number.',
      'number.min': 'Rating must be at least 1 star.',
      'number.max': 'Rating cannot exceed 5 stars.',
      'any.required': 'Rating is required.',
    }),
    text: Joi.string().max(500).required().trim().messages({
      'string.empty': 'Review text cannot be empty.',
      'string.max': 'Review text cannot exceed 500 characters.',
      'any.required': 'Review text is required.',
    }),
    images: Joi.array().items(Joi.string()).optional(),
    improvementReason: Joi.string().max(500).allow('').optional().trim().messages({
      'string.max': 'Improvement reason cannot exceed 500 characters.',
    }),
  }),
};

export default {
  createReview,
};
