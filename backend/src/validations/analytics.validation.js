import Joi from 'joi';

const trackEvent = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    eventName: Joi.string()
      .valid('page_view', 'add_to_cart', 'initiate_checkout', 'conversion_purchase')
      .required(),
    properties: Joi.object().default({}),
    referrer: Joi.string().allow('').default('direct'),
    utmSource: Joi.string().allow(''),
    utmMedium: Joi.string().allow(''),
    utmCampaign: Joi.string().allow(''),
  }),
};

const heartbeat = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    path: Joi.string().required(),
    durationSeconds: Joi.number().integer().min(1).max(60).required(), // duration increment of 1-60s
  }),
};

export default {
  trackEvent,
  heartbeat,
};
