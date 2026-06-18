import User from '../models/user.model.js';
import { sendAbandonedCartEmail } from './email.service.js';
import { releaseExpiredOrdersStock } from './order.service.js';
import logger from '../config/logger.js';

export const checkAbandonedCarts = async () => {
  try {
    logger.info('Cart abandonment scheduler check started...');
    
    // Clean up expired checkouts and return stock
    await releaseExpiredOrdersStock();

    // Look for users who have items in their cart
    const minutesThreshold = process.env.NODE_ENV === 'production' ? 15 : 1; // 1 minute in dev for easy testing
    const timeThreshold = new Date(Date.now() - minutesThreshold * 60 * 1000);

    // Find users with non-empty carts
    const users = await User.find({
      'cart.0': { $exists: true }
    }).populate('cart.product');

    for (const user of users) {
      // Find the oldest item addedAt date in the cart
      const oldestItem = user.cart.reduce((oldest, item) => {
        return (!oldest || item.addedAt < oldest) ? item.addedAt : oldest;
      }, null);

      if (!oldestItem || oldestItem > timeThreshold) {
        // Oldest item is not old enough yet
        continue;
      }

      // Find the most recently added item addedAt date
      const newestItemAddedAt = user.cart.reduce((newest, item) => {
        return (!newest || item.addedAt > newest) ? item.addedAt : newest;
      }, null);

      // Send the email if they have never received one,
      // or if they received one but then added more items to the cart (newestItemAddedAt > lastCartEmailSentAt)
      const shouldSend = !user.lastCartEmailSentAt || (newestItemAddedAt && newestItemAddedAt > user.lastCartEmailSentAt);

      if (shouldSend) {
        logger.info(`Sending abandoned cart reminder to ${user.email} (${user.name})`);
        
        // Filter out cart items where product details could not be populated (integrity check)
        const activeCartItems = user.cart.filter(item => item.product);

        if (activeCartItems.length === 0) continue;

        await sendAbandonedCartEmail(user.email, user.name, activeCartItems);
        
        user.lastCartEmailSentAt = new Date();
        await user.save({ validateBeforeSave: false });
      }
    }
  } catch (error) {
    logger.error(`Error in abandoned cart scheduler: ${error.message}`);
  }
};

export const startCartScheduler = () => {
  if (process.env.VERCEL === '1') {
    logger.info('Serverless deployment detected. Bypassing native interval timer. Hook the /cron endpoint.');
    return;
  }
  const intervalTime = process.env.NODE_ENV === 'production' ? 5 * 60 * 1000 : 1 * 60 * 1000; // 5 min in prod, 1 min in dev
  setInterval(checkAbandonedCarts, intervalTime);
  logger.info(`Abandoned cart scheduler service initialized (Interval: ${intervalTime / 1000}s)`);
};
