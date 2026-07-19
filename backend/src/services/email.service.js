import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import * as templates from '../utils/emailTemplates.js';

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

let transporter;

if (!user || !pass) {
  logger.warn('EMAIL_USER or EMAIL_PASS environment variables are missing. Using mock email transporter.');
  transporter = {
    sendMail: async (mailOptions) => {
      logger.info(`[MOCK EMAIL SENT] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
      return { messageId: `mock-id-${Date.now()}` };
    }
  };
} else {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_SECURE !== 'false', // Default to true unless explicitly 'false'
    auth: { user, pass },
  });
}

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"STAT Surgical" <${process.env.EMAIL_USER || 'shigivahan@gmail.com'}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (to, name) => {
  const html = templates.getWelcomeTemplate(name);
  return await sendEmail(to, 'Welcome to STAT Surgical Supplies', html);
};

export const sendLoginEmail = async (to, name, time, ipAddress, userAgent) => {
  const html = templates.getLoginTemplate(name, time, ipAddress, userAgent);
  return await sendEmail(to, 'Security Alert: New Account Login', html);
};

export const sendForgotPasswordEmail = async (to, name, resetUrl) => {
  const html = templates.getForgotPasswordTemplate(name, resetUrl);
  return await sendEmail(to, 'Restore Account Access Protocol', html);
};

export const sendResetSuccessEmail = async (to, name) => {
  const html = templates.getResetSuccessTemplate(name);
  return await sendEmail(to, 'Security Protocol: Password Updated', html);
};

export const sendResetFailureEmail = async (to, name, reason) => {
  const html = templates.getResetFailureTemplate(name, reason);
  return await sendEmail(to, 'Security Alert: Reset Failure', html);
};

export const sendOrderSuccessEmail = async (to, name, orderId, items, totalAmount) => {
  const html = templates.getOrderSuccessTemplate(name, orderId, items, totalAmount);
  return await sendEmail(to, `Order Confirmation - Invoice #${orderId.slice(-6).toUpperCase()}`, html);
};

export const sendOrderSuccessPickupEmail = async (to, name, orderId, items, totalAmount) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.statsurgicals.com';
  const html = templates.getOrderSuccessPickupTemplate(name, orderId, items, totalAmount, frontendUrl);
  return await sendEmail(to, `Order Confirmation - In-Store Pickup Invoice #${orderId.slice(-6).toUpperCase()}`, html);
};

export const sendOrderFailureEmail = async (to, name, orderId, totalAmount) => {
  const html = templates.getOrderFailureTemplate(name, orderId, totalAmount);
  return await sendEmail(to, `Order Payment Issue - Request #${orderId.slice(-6).toUpperCase()}`, html);
};

export const sendAbandonedCartEmail = async (to, name, cartItems) => {
  const html = templates.getAbandonedCartTemplate(name, cartItems);
  return await sendEmail(to, 'Preservation Notice: Items remaining in Cart', html);
};

export const sendTwoFactorOtpEmail = async (to, name, otp) => {
  const html = templates.getTwoFactorOtpTemplate(name, otp);
  return await sendEmail(to, 'Security Protocol: Two-Factor Verification Code', html);
};

export const sendSuspensionEmail = async (to, name, duration, reason) => {
  const html = templates.getSuspensionTemplate(name, duration, reason);
  return await sendEmail(to, 'Security Alert: Account Access Suspended', html);
};

export const sendShippingUpdateEmail = async (to, name, orderId, shippingStatus, description) => {
  const html = templates.getShippingUpdateTemplate(name, orderId, shippingStatus, description);
  return await sendEmail(to, `Shipping Update: Order #${orderId.slice(-8).toUpperCase()} is now ${shippingStatus.toUpperCase()}`, html);
};

export const sendBulkEnquiryEmail = async (name, email, phone, organization, productName, quantity, requirements, budget, timeline) => {
  const html = templates.getBulkEnquiryTemplate(name, email, phone, organization, productName, quantity, requirements, budget, timeline);
  const adminEmail = process.env.ADMIN_EMAIL || 'statsurgicalsupplies@gmail.com';
  return await sendEmail(adminEmail, `New Bulk Order Enquiry - ${productName || 'General'}`, html);
};

export const sendBulkEnquiryReceiptEmail = async (to, name, productName, quantity) => {
  const html = templates.getBulkEnquiryReceiptTemplate(name, productName, quantity);
  return await sendEmail(to, 'Acknowledgement: Bulk Procurement Request Received', html);
};

export const sendBookingAdminNotificationEmail = async ({ name, email, phone, productName, date, timeSlot, notes, demoType, videoLink }) => {
  const html = templates.getBookingAdminTemplate(name, email, phone, productName, date, timeSlot, notes, demoType, videoLink);
  const adminEmail = process.env.ADMIN_EMAIL || 'statsurgicalsupplies@gmail.com';
  return await sendEmail(adminEmail, `New Trial Booking - ${name} (${productName})`, html);
};

export const sendBookingConfirmationEmail = async (to, { name, productName, date, timeSlot, demoType, videoLink }) => {
  const html = templates.getBookingCustomerTemplate(name, productName, date, timeSlot, demoType, videoLink);
  return await sendEmail(to, 'Demo Appointment Confirmation - STAT Surgical', html);
};

export const sendAdminPickupNotificationEmail = async (orderId, customerName, totalAmount, items) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'statsurgicalsupplies@gmail.com';
  const html = templates.getAdminPickupNotificationTemplate(orderId, customerName, totalAmount, items);
  return await sendEmail(adminEmail, `[PICKUP ORDER] New In-Store Pickup Order #${orderId.slice(-8).toUpperCase()}`, html);
};

export const sendPickupSlotInvitationEmail = async (to, name, orderId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.statsurgicals.com';
  const html = templates.getPickupSlotInvitationTemplate(name, orderId, frontendUrl);
  return await sendEmail(to, `Action Required: Select Pickup Slot for Order #${orderId.slice(-8).toUpperCase()}`, html);
};


