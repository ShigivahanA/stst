import Session from '../models/session.model.js';
import AnalyticsEvent from '../models/analytics.model.js';
import Order from '../models/order.model.js';

export const trackSessionStart = async (sessionData) => {
  const { sessionId, user, ipAddress, userAgent, referrer, utmSource, utmMedium, utmCampaign, deviceType } = sessionData;

  const session = await Session.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        user,
        ipAddress,
        userAgent,
        referrer: referrer || 'direct',
        utmSource: utmSource || '',
        utmMedium: utmMedium || '',
        utmCampaign: utmCampaign || '',
        deviceType: deviceType || 'desktop',
        lastActiveAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return session;
};

export const recordHeartbeat = async ({ sessionId, path, durationSeconds, user }) => {
  let session = await Session.findOne({ sessionId });
  
  if (!session) {
    // Session doesn't exist, create simple session placeholder
    session = await Session.create({
      sessionId,
      user: user || null,
      pagesVisited: [{ path, durationSeconds }],
      durationSeconds,
      lastActiveAt: new Date(),
    });
  } else {
    // Update user on session if authenticated and not already set
    if (user && (!session.user || session.user.toString() !== user.toString())) {
      session.user = user;
    }
    
    // Check if page path already visited
    const pageIndex = session.pagesVisited.findIndex((p) => p.path === path);
    if (pageIndex !== -1) {
      session.pagesVisited[pageIndex].durationSeconds += durationSeconds;
    } else {
      session.pagesVisited.push({ path, durationSeconds });
    }

    session.calculateTotalDuration();
    await session.save();
  }

  // Update all events in this session to have the user ID
  if (user) {
    await AnalyticsEvent.updateMany(
      { sessionId, user: { $ne: user } },
      { $set: { user } }
    );
  }

  // Log a page view event if it hasn't been tracked recently
  await AnalyticsEvent.findOneAndUpdate(
    { sessionId, eventName: 'page_view', 'properties.path': path },
    {
      $setOnInsert: {
        sessionId,
        user: user || null,
        eventName: 'page_view',
        properties: { path },
        referrer: session.referrer,
        utmSource: session.utmSource,
        utmMedium: session.utmMedium,
        utmCampaign: session.utmCampaign,
      },
    },
    { upsert: true }
  );

  return session;
};

export const trackEvent = async (eventData) => {
  const { sessionId, eventName, properties, referrer, utmSource, utmMedium, utmCampaign, user } = eventData;

  const event = await AnalyticsEvent.create({
    sessionId,
    user: user || null,
    eventName,
    properties,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
  });

  const sessionUpdate = { lastActiveAt: new Date() };
  if (user) {
    sessionUpdate.user = user;
    
    // Retroactively update other events in this session
    await AnalyticsEvent.updateMany(
      { sessionId, user: { $ne: user } },
      { $set: { user } }
    );
  }

  await Session.updateOne(
    { sessionId },
    { $set: sessionUpdate }
  );

  return event;
};

export const getDashboardStats = async () => {
  // 1. Session Duration statistics
  const durationStats = await Session.aggregate([
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageDuration: { $avg: '$durationSeconds' },
        maxDuration: { $max: '$durationSeconds' },
      },
    },
  ]);

  const sessionSummary = durationStats[0] || {
    totalSessions: 0,
    averageDuration: 0,
    maxDuration: 0,
  };

  // 2. Conversion count & revenue
  const salesStats = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalCost: { $sum: '$totalCost' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const salesSummary = salesStats[0] || {
    totalRevenue: 0,
    totalCost: 0,
    totalOrders: 0,
  };

  // 3. Conversion by UTM Source & Referrer
  const conversionBySource = await Session.aggregate([
    {
      $group: {
        _id: {
          utmSource: '$utmSource',
          referrer: '$referrer',
        },
        sessionsCount: { $sum: 1 },
        conversionsCount: {
          $sum: { $cond: [{ $eq: ['$conversionRecorded', true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        source: '$_id.utmSource',
        referrer: '$_id.referrer',
        sessionsCount: 1,
        conversionsCount: 1,
        conversionRate: {
          $cond: [
            { $gt: ['$sessionsCount', 0] },
            { $multiply: [{ $divide: ['$conversionsCount', '$sessionsCount'] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { conversionsCount: -1 } },
  ]);

  // 4. Funnel Drop-off statistics
  const pageViewsCount = await AnalyticsEvent.countDocuments({ eventName: 'page_view' });
  const addToCartsCount = await AnalyticsEvent.countDocuments({ eventName: 'add_to_cart' });
  const initiateCheckoutsCount = await AnalyticsEvent.countDocuments({ eventName: 'initiate_checkout' });
  const purchasesCount = await AnalyticsEvent.countDocuments({ eventName: 'conversion_purchase' });

  // Group by session to see user flow counts
  const funnelBySession = await AnalyticsEvent.aggregate([
    {
      $group: {
        _id: '$sessionId',
        hasPageView: { $max: { $cond: [{ $eq: ['$eventName', 'page_view'] }, 1, 0] } },
        hasAddToCart: { $max: { $cond: [{ $eq: ['$eventName', 'add_to_cart'] }, 1, 0] } },
        hasCheckout: { $max: { $cond: [{ $eq: ['$eventName', 'initiate_checkout'] }, 1, 0] } },
        hasPurchase: { $max: { $cond: [{ $eq: ['$eventName', 'conversion_purchase'] }, 1, 0] } },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        sessionsWithPageView: { $sum: '$hasPageView' },
        sessionsWithAddToCart: { $sum: '$hasAddToCart' },
        sessionsWithCheckout: { $sum: '$hasCheckout' },
        sessionsWithPurchase: { $sum: '$hasPurchase' },
      },
    },
  ]);

  const funnelSummary = funnelBySession[0] || {
    totalSessions: 0,
    sessionsWithPageView: 0,
    sessionsWithAddToCart: 0,
    sessionsWithCheckout: 0,
    sessionsWithPurchase: 0,
  };

  // 5. Popular pages by time spent
  const popularPages = await Session.aggregate([
    { $unwind: '$pagesVisited' },
    {
      $group: {
        _id: '$pagesVisited.path',
        visitsCount: { $sum: 1 },
        totalDuration: { $sum: '$pagesVisited.durationSeconds' },
        averageDuration: { $avg: '$pagesVisited.durationSeconds' },
      },
    },
    { $sort: { totalDuration: -1 } },
    { $limit: 10 },
  ]);

  // 6. Traffic Trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailySessions = await Session.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trendMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trendMap[dateStr] = 0;
  }

  dailySessions.forEach(item => {
    if (trendMap[item._id] !== undefined) {
      trendMap[item._id] = item.count;
    }
  });

  const trafficTrend = Object.keys(trendMap).map(date => ({
    date,
    count: trendMap[date]
  }));

  // 7. Device Type breakdown
  const deviceBreakdown = await Session.aggregate([
    {
      $group: {
        _id: '$deviceType',
        count: { $sum: 1 },
      },
    },
  ]);

  const deviceMap = { desktop: 0, mobile: 0, tablet: 0 };
  deviceBreakdown.forEach(item => {
    const type = item._id || 'desktop';
    deviceMap[type] = item.count;
  });
  const formattedDevice = Object.keys(deviceMap).map(type => ({
    device: type,
    count: deviceMap[type]
  }));

  return {
    trafficTrend,
    deviceBreakdown: formattedDevice,
    sessions: {
      total: sessionSummary.totalSessions,
      averageDurationSeconds: Math.round(sessionSummary.averageDuration),
      maxDurationSeconds: sessionSummary.maxDuration,
    },
    sales: {
      ordersCount: salesSummary.totalOrders,
      revenue: Number(salesSummary.totalRevenue.toFixed(2)),
      costOfGoodsSold: Number(salesSummary.totalCost.toFixed(2)),
      netProfit: Number((salesSummary.totalRevenue - salesSummary.totalCost).toFixed(2)),
    },
    conversionBySource,
    funnel: {
      rawEvents: {
        pageViews: pageViewsCount,
        addToCarts: addToCartsCount,
        initiateCheckouts: initiateCheckoutsCount,
        purchases: purchasesCount,
      },
      uniqueSessionFunnel: {
        sessions: funnelSummary.totalSessions,
        pageViewCount: funnelSummary.sessionsWithPageView,
        addToCartCount: funnelSummary.sessionsWithAddToCart,
        checkoutCount: funnelSummary.sessionsWithCheckout,
        purchaseCount: funnelSummary.sessionsWithPurchase,
      },
    },
    popularPages,
  };
};
