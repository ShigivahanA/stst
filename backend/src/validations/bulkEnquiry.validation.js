import Joi from 'joi';

export const createBulkEnquiry = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    phone: Joi.string().required().trim(),
    organization: Joi.string().allow('').optional().trim(),
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('').optional(),
    productName: Joi.string().allow('').optional().trim(),
    quantity: Joi.number().integer().min(1).required(),
    requirements: Joi.string().required().trim(),
    budget: Joi.string().allow('').optional().trim(),
    timeline: Joi.string().allow('').optional().trim(),
  })
};

export const getBulkEnquiries = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'contacted', 'resolved', 'cancelled').optional(),
  })
};

export const updateBulkEnquiryStatus = {
  params: Joi.object().keys({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'contacted', 'resolved', 'cancelled').required(),
  })
};

export const deleteBulkEnquiry = {
  params: Joi.object().keys({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  })
};
