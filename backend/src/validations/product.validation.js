import Joi from 'joi';

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const createProduct = {
  body: Joi.object().keys({
    sku: Joi.string().required().trim().uppercase(),
    name: Joi.string().required().trim(),
    brand: Joi.string().allow('').optional().trim(),
    desc: Joi.string().allow('').trim(),
    price: Joi.number().required().min(0),
    mrp: Joi.number().min(0).default(0),
    sellingPrice: Joi.number().min(0).default(0),
    tax: Joi.number().min(0).default(0),
    quantity: Joi.number().integer().min(0).default(0),
    category: Joi.string().required().trim(),
    lowstockthreshold: Joi.number().integer().min(0).default(10),
    active: Joi.boolean().default(true),
    featured: Joi.boolean().default(false),
    image: Joi.string().allow(''),
    images: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        publicId: Joi.string().required(),
      })
    ).max(6).default([]),
    specifications: Joi.array().items(
      Joi.object().keys({
        type: Joi.string().valid('key_value', 'title_para', 'image', 'video', 'custom').required(),
        label: Joi.string().allow('').trim(),
        value: Joi.string().allow('').trim(),
        extra: Joi.any()
      })
    ).default([]),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    sku: Joi.string().trim().uppercase(),
    name: Joi.string().trim(),
    brand: Joi.string().allow('').optional().trim(),
    desc: Joi.string().allow('').trim(),
    price: Joi.number().min(0),
    mrp: Joi.number().min(0),
    sellingPrice: Joi.number().min(0),
    tax: Joi.number().min(0),
    quantity: Joi.number().integer().min(0),
    category: Joi.string().trim(),
    lowstockthreshold: Joi.number().integer().min(0),
    active: Joi.boolean(),
    featured: Joi.boolean(),
    image: Joi.string().allow(''),
    images: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        publicId: Joi.string().required(),
      })
    ).max(6),
    specifications: Joi.array().items(
      Joi.object().keys({
        type: Joi.string().valid('key_value', 'title_para', 'image', 'video', 'custom').required(),
        label: Joi.string().allow('').trim(),
        value: Joi.string().allow('').trim(),
        extra: Joi.any()
      })
    ),
  }).min(1),
};

const getProduct = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

export default {
  createProduct,
  updateProduct,
  getProduct,
};
