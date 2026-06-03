import Joi from 'joi';
import ApiError from '../utils/ApiError.js';

const validate = (schema) => (req, res, next) => {
  const validKeys = ['body', 'query', 'params'];
  
  // Pick only keys defined in schema
  const object = {};
  validKeys.forEach((key) => {
    if (schema[key]) {
      object[key] = req[key];
    }
  });

  const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return next(new ApiError(400, errorMessage));
  }

  // Assign validated values back to request (this strips unvalidated properties)
  validKeys.forEach((key) => {
    if (schema[key]) {
      req[key] = value[key];
    }
  });

  return next();
};

export default validate;
