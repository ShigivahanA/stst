import Joi from 'joi';

const register = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])'))
      .messages({
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      }),
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
