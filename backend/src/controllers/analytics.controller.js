import * as analyticsService from '../services/analytics.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const initSession = asyncHandler(async (req, res) => {
  if (req.user?.role === 'admin') {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Session bypassed for admin'));
  }

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  const sessionData = {
    ...req.body,
    user: req.user?._id || null, // Attach user if authenticated
    ipAddress,
    userAgent,
  };

  const session = await analyticsService.trackSessionStart(sessionData);
  return res
    .status(200)
    .json(new ApiResponse(200, session, 'Session tracked successfully'));
});

export const sendHeartbeat = asyncHandler(async (req, res) => {
  if (req.user?.role === 'admin') {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Heartbeat bypassed for admin'));
  }

  const { sessionId, path, durationSeconds } = req.body;
  const user = req.user?._id || null;
  const session = await analyticsService.recordHeartbeat({ sessionId, path, durationSeconds, user });
  return res
    .status(200)
    .json(new ApiResponse(200, session, 'Heartbeat logged successfully'));
});

export const logEvent = asyncHandler(async (req, res) => {
  if (req.user?.role === 'admin') {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Event bypassed for admin'));
  }

  const eventData = {
    ...req.body,
    user: req.user?._id || null,
  };
  const event = await analyticsService.trackEvent(eventData);
  return res
    .status(201)
    .json(new ApiResponse(201, event, 'Analytics event logged successfully'));
});

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Dashboard statistics fetched successfully'));
});
