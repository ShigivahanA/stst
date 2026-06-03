import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import * as templates from '../utils/emailTemplates.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'shigivahan@gmail.com',
    pass: process.env.EMAIL_PASS || 'ttrw ypgy jvuy ztjf',
  },
});

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
