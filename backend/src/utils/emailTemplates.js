const wrapTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container-table {
        width: 100% !important;
        padding: 20px !important;
      }
      .content-td {
        padding: 30px 20px !important;
      }
      .header-td {
        padding-bottom: 20px !important;
      }
      .footer-td {
        padding-top: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F6; color: #F6F6F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F6F6F6; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table class="container-table" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background-color: #5C3E94; line-height: 4px; font-size: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td class="header-td" align="center" style="padding: 40px 40px 30px 40px; border-bottom: 1px solid #5C3E94;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="color: #5C3E94; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;">STAT</span>
                    <span style="color: #F6F6F6; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin-left: 5px;">SURGICAL</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 6px;">
                    <span style="font-size: 9px; color: #5C3E94; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 600; display: block;">
                      Verified Medical Supplies Portal
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content-td" style="padding: 40px; font-size: 15px; line-height: 1.6; color: #F6F6F6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer-td" align="center" style="padding: 30px 40px; background-color: #000000; border-top: 1px solid #5C3E94; font-size: 11px; color: #5C3E94; line-height: 1.6;">
              <p style="margin: 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Automated System Transmission. Do not reply.</p>
              <p style="margin: 6px 0 0 0; color: #F6F6F6;">&copy; ${new Date().getFullYear()} STAT Surgical Supplies. All rights reserved.</p>
              <p style="margin: 4px 0 0 0;">Chennai, Tamil Nadu, India</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getWelcomeTemplate = (name) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Welcome to STAT Surgical</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Your registration has been successfully processed. Your account is now fully authorized to access our digital procurement system and surgical supply catalogs.</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Browse advanced orthopedics, respiratory support systems, diagnostic devices, and clinical supplies on our platform.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/allproduct" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
            Access Supply Inventory
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 0; color: #5C3E94; font-size: 14px;">If you have any questions or require procurement support, please connect with our administrative team.</p>
  `;
  return wrapTemplate('Account Authorized', content);
};

export const getLoginTemplate = (name, time, ipAddress, userAgent) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Security Notification</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">A new login session has been established for your account. Please review the connection diagnostics below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #5C3E94;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Timestamp</span>
          <strong style="color: #F6F6F6; font-size: 14px;">${time}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #5C3E94;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">IP Address</span>
          <strong style="color: #F6F6F6; font-size: 14px; font-family: monospace;">${ipAddress}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">User Agent / Browser</span>
          <span style="color: #F6F6F6; font-size: 13px;">${userAgent}</span>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px; font-size: 13px; color: #F6F6F6; line-height: 1.5;">
          <strong style="color: #5C3E94;">Security Warning:</strong> If you did not authorize this access request, please reset your password immediately to secure your medical supplies profile.
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/forgot-password" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 12px 24px; text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; border-radius: 4px;">
            Reset Account Credentials
          </a>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Login Alert Protocol', content);
};

export const getForgotPasswordTemplate = (name, resetUrl) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Password Reset Request</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">A request to restore account access has been initiated. If you did not make this request, you can safely disregard this email; your credentials remain secure.</p>
    <p style="margin-top: 0; margin-bottom: 24px;">To establish new password credentials, click the activation button below. This recovery link is valid for <strong>1 hour</strong>.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; color: #5C3E94; word-break: break-all; border-top: 1px solid #5C3E94; padding-top: 16px; margin-bottom: 0;">
      If the button above does not work, copy and paste this URL into your browser address bar: <br />
      <span style="color: #F6F6F6; text-decoration: underline; font-family: monospace;">${resetUrl}</span>
    </p>
  `;
  return wrapTemplate('Access Restore Protocol', content);
};

export const getResetSuccessTemplate = (name) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Password Reset Successful</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">The security password key associated with your account has been successfully updated and re-encrypted.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; font-size: 13px; color: #F6F6F6; line-height: 1.5;">
          <strong style="color: #5C3E94;">Security Confirmation:</strong> Any previous active login sessions have been terminated. You can now access the system using your new password.
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/login" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
            Access Portal Login
          </a>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Security Key Updated', content);
};

export const getResetFailureTemplate = (name, errorReason) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Password Reset Failed</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">An unsuccessful attempt to restore account credentials has been recorded.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #5C3E94;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Failure Reason</span>
          <strong style="color: #F6F6F6; font-size: 14px;">${errorReason}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Attempt Time</span>
          <span style="color: #F6F6F6; font-size: 14px;">${new Date().toLocaleString()}</span>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 24px;">If you would like to request a new recovery link, please click the button below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/forgot-password" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.10em; font-size: 12px; border-radius: 4px;">
            Request Recovery Link
          </a>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Security Failure Alert', content);
};

export const getOrderSuccessTemplate = (name, orderId, items, totalAmount) => {
  let itemsHtml = '';
  items.forEach(item => {
    const pName = item.product?.name || 'Medical Supplies';
    const pSku = item.product?.sku || 'N/A';
    itemsHtml += `
      <tr style="border-bottom: 1px solid #5C3E94;">
        <td style="padding: 12px 0; color: #F6F6F6;">
          <span style="font-weight: 700; font-size: 14px; display: block;">${pName}</span>
          <span style="font-size: 11px; color: #5C3E94; font-family: monospace;">SKU: ${pSku}</span>
        </td>
        <td align="center" style="padding: 12px 0; color: #F6F6F6; font-size: 14px;">${item.quantity}</td>
        <td align="right" style="padding: 12px 0; color: #F6F6F6; font-size: 14px; font-weight: 600;">₹${item.priceAtPurchase.toLocaleString()}</td>
      </tr>
    `;
  });

  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Order Confirmed</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Thank you for your purchase. We are pleased to confirm that payment has been verified, and your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> is now processing for delivery.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #5C3E94; text-transform: uppercase; color: #5C3E94; font-size: 11px; font-weight: 700;">
          <th align="left" style="padding-bottom: 8px;">Item Description</th>
          <th align="center" style="padding-bottom: 8px; width: 60px;">Qty</th>
          <th align="right" style="padding-bottom: 8px; width: 100px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding-top: 16px; font-weight: 700; text-transform: uppercase; color: #5C3E94; font-size: 12px;">Total Paid:</td>
          <td align="right" style="padding-top: 16px; font-size: 18px; font-weight: 800; color: #F6F6F6;">₹${totalAmount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="color: #5C3E94;">
          <strong>Order Reference:</strong> <span style="font-family: monospace; color: #F6F6F6;">${orderId}</span> <br />
          <strong>Status:</strong> <span style="color: #F6F6F6; font-weight: 600;">Processing Dispatch</span>
        </td>
      </tr>
    </table>
    
    <p style="margin-bottom: 0;">An email containing parcel tracking details will be dispatched as soon as the logistics hub processes your items.</p>
  `;
  return wrapTemplate('Purchase Receipt Invoice', content);
};

export const getOrderFailureTemplate = (name, orderId, totalAmount) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Payment Unsuccessful</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">We were unable to complete the payment authorization signature for your order session: <strong>#${orderId.slice(-6).toUpperCase()}</strong>.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #5C3E94;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Order Session ID</span>
          <span style="color: #F6F6F6; font-family: monospace;">${orderId}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #5C3E94; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Amount Requested</span>
          <strong style="color: #F6F6F6; font-size: 16px;">₹${totalAmount.toLocaleString()}</strong>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #5C3E94;">
      <tr>
        <td>
          <strong style="color: #F6F6F6;">Important Note:</strong> If funds were deducted from your banking application, Razorpay will trigger an automatic credit reversal to your original source account within <strong>3-5 business days</strong>.
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 24px;">To re-attempt checkout or rebuild your medical supply list, please proceed using the button below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/allproduct" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.10em; font-size: 12px; border-radius: 4px;">
            Rebuild Cart & Retry
          </a>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Transaction Failure Alert', content);
};

export const getAbandonedCartTemplate = (name, cartItems) => {
  let itemsHtml = '';
  cartItems.forEach(item => {
    const pName = item.product?.name || 'Medical Supplies';
    const pPrice = item.product?.price || 199;
    itemsHtml += `
      <tr style="border-bottom: 1px solid #5C3E94;">
        <td style="padding: 12px 0; color: #F6F6F6;">
          <span style="font-weight: 700; font-size: 14px; display: block;">${pName}</span>
        </td>
        <td align="center" style="padding: 12px 0; color: #F6F6F6; font-size: 14px;">${item.quantity}</td>
        <td align="right" style="padding: 12px 0; color: #F6F6F6; font-size: 14px; font-weight: 600;">₹${pPrice.toLocaleString()}</td>
      </tr>
    `;
  });

  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Items Waiting in Cart</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">We noticed that you have pending items waiting in your digital cart. Your selection is currently saved and reserved under your profile details:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #5C3E94; text-transform: uppercase; color: #5C3E94; font-size: 11px; font-weight: 700;">
          <th align="left" style="padding-bottom: 8px;">Item Description</th>
          <th align="center" style="padding-bottom: 8px; width: 60px;">Qty</th>
          <th align="right" style="padding-bottom: 8px; width: 100px;">Unit Rate</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 24px;">To finalize this booking request and ensure rapid logistics processing, please navigate to your dashboard and complete checkout:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/wishlist" style="display: inline-block; background-color: #5C3E94; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.10em; font-size: 12px; border-radius: 4px;">
            Complete Checkout
          </a>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Cart Preservation Notice', content);
};

export const getTwoFactorOtpTemplate = (name, otp) => {
  const content = `
    <h2 style="color: #5C3E94; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Two-Factor Security Verification</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">A login attempt was initiated for your profile. Please use the following single-use verification code to authorize this session access request:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td align="center" style="padding: 30px 20px;">
          <span style="font-family: monospace; font-size: 40px; font-weight: 900; letter-spacing: 0.3em; color: #5C3E94; padding-left: 0.3em;">${otp}</span>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #000000; border: 1px solid #5C3E94; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #5C3E94;">
      <tr>
        <td>
          <strong style="color: #F6F6F6;">Security Advisory:</strong> This code is only valid for <strong>5 minutes</strong>. If you did not request this login attempt, please reset your password immediately.
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Security Code Verification', content);
};
