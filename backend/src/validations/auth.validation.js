import Joi from 'joi';

const register = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('customer', 'admin').default('customer'),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required(),
  }),
};

const logout = {
  cookies: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }).unknown(true),
};

export default {
  register,
  login,
  logout,
};
