import Joi from 'joi';

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const checkout = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object().keys({
          productId: Joi.string().custom(objectId).required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    sessionId: Joi.string().required(),
    conversionSource: Joi.string().allow('').default('direct'),
  }),
};

export default {
  checkout,
};
