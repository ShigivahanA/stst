import Joi from 'joi';

export const createBooking = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    phone: Joi.string().required().trim(),
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('').optional(),
    productName: Joi.string().allow('').optional().trim(),
    date: Joi.date().required(),
    timeSlot: Joi.string().required().trim(),
    notes: Joi.string().allow('').optional().trim(),
    demoType: Joi.string().valid('in-store', 'virtual').default('in-store'),
    videoLink: Joi.string().allow('').optional().trim(),
  })
};

export const getBookings = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').optional(),
    date: Joi.date().optional(),
  })
};

export const updateBookingStatus = {
  params: Joi.object().keys({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').required(),
  })
};

export const deleteBooking = {
  params: Joi.object().keys({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  })
};
