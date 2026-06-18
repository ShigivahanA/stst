import Joi from 'joi';

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const createCoupon = {
  body: Joi.object().keys({
    code: Joi.string().required().trim().uppercase(),
    discountType: Joi.string().valid('percentage', 'flat').default('percentage'),
    discountValue: Joi.number().required().min(0),
    minCartAmount: Joi.number().min(0).default(0),
    maxDiscountAmount: Joi.number().min(0).allow(null),
    validUntil: Joi.date().required(),
    isActive: Joi.boolean().default(true),
    usageLimit: Joi.number().integer().min(1).allow(null),
  }),
};

const updateCoupon = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    code: Joi.string().trim().uppercase(),
    discountType: Joi.string().valid('percentage', 'flat'),
    discountValue: Joi.number().min(0),
    minCartAmount: Joi.number().min(0),
    maxDiscountAmount: Joi.number().min(0).allow(null),
    validUntil: Joi.date(),
    isActive: Joi.boolean(),
    usageLimit: Joi.number().integer().min(1).allow(null),
  }).min(1),
};

const validateCoupon = {
  body: Joi.object().keys({
    code: Joi.string().required().trim().uppercase(),
    cartSubtotal: Joi.number().required().min(0),
  }),
};

export default {
  createCoupon,
  updateCoupon,
  validateCoupon,
};
