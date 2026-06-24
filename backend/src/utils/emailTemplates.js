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
<body style="margin: 0; padding: 0; background-color: #fffcf2; color: #252422; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffcf2; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table class="container-table" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #ccc5b9; border-top: 4px solid #eb5e28; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header -->
          <tr>
            <td class="header-td" align="center" style="padding: 40px 40px 30px 40px; border-bottom: 1px solid #ccc5b9;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="color: #eb5e28; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;">STAT</span>
                    <span style="color: #252422; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin-left: 5px;">SURGICAL</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 6px;">
                    <span style="font-size: 9px; color: #403d39; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 600; display: block;">
                      Verified Medical Supplies Portal
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content-td" style="padding: 40px; font-size: 15px; line-height: 1.6; color: #252422;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer-td" align="center" style="padding: 30px 40px; background-color: #fffcf2; border-top: 1px solid #ccc5b9; font-size: 11px; color: #403d39; line-height: 1.6;">
              <p style="margin: 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Automated System Transmission. Do not reply.</p>
              <p style="margin: 6px 0 0 0; color: #252422;">&copy; ${new Date().getFullYear()} STAT Surgical Supplies. All rights reserved.</p>
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
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Welcome to STAT Surgical</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Your registration has been successfully processed. Your account is now fully authorized to access our digital procurement system and surgical supply catalogs.</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Browse advanced orthopedics, respiratory support systems, diagnostic devices, and clinical supplies on our platform.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/allproduct" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
            Access Supply Inventory
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 0; color: #403d39; font-size: 14px;">If you have any questions or require procurement support, please connect with our administrative team.</p>
  `;
  return wrapTemplate('Account Authorized', content);
};

export const getLoginTemplate = (name, time, ipAddress, userAgent) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Security Notification</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">A new login session has been established for your account. Please review the connection diagnostics below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Timestamp</span>
          <strong style="color: #252422; font-size: 14px;">${time}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">IP Address</span>
          <strong style="color: #252422; font-size: 14px; font-family: monospace;">${ipAddress}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">User Agent / Browser</span>
          <span style="color: #252422; font-size: 13px;">${userAgent}</span>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #eb5e28; border-radius: 6px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px; font-size: 13px; color: #252422; line-height: 1.5;">
          <strong style="color: #eb5e28;">Security Warning:</strong> If you did not authorize this access request, please reset your password immediately to secure your medical supplies profile.
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/forgot-password" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; border-radius: 4px;">
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
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Password Reset Request</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">A request to restore account access has been initiated. If you did not make this request, you can safely disregard this email; your credentials remain secure.</p>
    <p style="margin-top: 0; margin-bottom: 24px;">To establish new password credentials, click the activation button below. This recovery link is valid for <strong>1 hour</strong>.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; color: #403d39; word-break: break-all; border-top: 1px solid #ccc5b9; padding-top: 16px; margin-bottom: 0;">
      If the button above does not work, copy and paste this URL into your browser address bar: <br />
      <span style="color: #eb5e28; text-decoration: underline; font-family: monospace;">${resetUrl}</span>
    </p>
  `;
  return wrapTemplate('Access Restore Protocol', content);
};

export const getResetSuccessTemplate = (name) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Password Reset Successful</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">The security password key associated with your account has been successfully updated and re-encrypted.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; font-size: 13px; color: #252422; line-height: 1.5;">
          <strong style="color: #eb5e28;">Security Confirmation:</strong> Any previous active login sessions have been terminated. You can now access the system using your new password.
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/login" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
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
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Password Reset Failed</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">An unsuccessful attempt to restore account credentials has been recorded.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Failure Reason</span>
          <strong style="color: #252422; font-size: 14px;">${errorReason}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Attempt Time</span>
          <span style="color: #252422; font-size: 14px;">${new Date().toLocaleString()}</span>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 24px;">If you would like to request a new recovery link, please click the button below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/forgot-password" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.10em; font-size: 12px; border-radius: 4px;">
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
      <tr style="border-bottom: 1px solid #ccc5b9;">
        <td style="padding: 12px 0; color: #252422;">
          <span style="font-weight: 700; font-size: 14px; display: block;">${pName}</span>
          <span style="font-size: 11px; color: #eb5e28; font-family: monospace;">SKU: ${pSku}</span>
        </td>
        <td align="center" style="padding: 12px 0; color: #252422; font-size: 14px;">${item.quantity}</td>
        <td align="right" style="padding: 12px 0; color: #252422; font-size: 14px; font-weight: 600;">₹${item.priceAtPurchase.toLocaleString()}</td>
      </tr>
    `;
  });

  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Order Confirmed</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Thank you for your purchase. We are pleased to confirm that payment has been verified, and your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> is now processing for delivery.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #eb5e28; text-transform: uppercase; color: #eb5e28; font-size: 11px; font-weight: 700;">
          <th align="left" style="padding-bottom: 8px;">Item Description</th>
          <th align="center" style="padding-bottom: 8px; width: 60px;">Qty</th>
          <th align="right" style="padding-bottom: 8px; width: 100px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding-top: 16px; font-weight: 700; text-transform: uppercase; color: #403d39; font-size: 12px;">Total Paid:</td>
          <td align="right" style="padding-top: 16px; font-size: 18px; font-weight: 800; color: #eb5e28;">₹${totalAmount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="color: #403d39;">
          <strong>Order Reference:</strong> <span style="font-family: monospace; color: #252422;">${orderId}</span> <br />
          <strong>Status:</strong> <span style="color: #eb5e28; font-weight: 600;">Processing Dispatch</span>
        </td>
      </tr>
    </table>
    
    <p style="margin-bottom: 0;">An email containing parcel tracking details will be dispatched as soon as the logistics hub processes your items.</p>
  `;
  return wrapTemplate('Purchase Receipt Invoice', content);

};

export const getOrderSuccessPickupTemplate = (name, orderId, items, totalAmount, frontendUrl) => {
  let itemsHtml = '';
  items.forEach(item => {
    const pName = item.product?.name || 'Medical Supplies';
    const pSku = item.product?.sku || 'N/A';
    itemsHtml += `
      <tr style="border-bottom: 1px solid #ccc5b9;">
        <td style="padding: 12px 0; color: #252422;">
          <span style="font-weight: 700; font-size: 14px; display: block;">${pName}</span>
          <span style="font-size: 11px; color: #eb5e28; font-family: monospace;">SKU: ${pSku}</span>
        </td>
        <td align="center" style="padding: 12px 0; color: #252422; font-size: 14px;">${item.quantity}</td>
        <td align="right" style="padding: 12px 0; color: #252422; font-size: 14px; font-weight: 600;">₹${item.priceAtPurchase.toLocaleString()}</td>
      </tr>
    `;
  });

  const slotLink = `${frontendUrl || 'http://localhost:5173'}/pickup-slot/${orderId}`;

  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">In-Store Pickup Order Confirmed</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Thank you for your purchase. We are pleased to confirm that payment has been verified. Your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> is now being prepared for collection at our store.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #eb5e28; text-transform: uppercase; color: #eb5e28; font-size: 11px; font-weight: 700;">
          <th align="left" style="padding-bottom: 8px;">Item Description</th>
          <th align="center" style="padding-bottom: 8px; width: 60px;">Qty</th>
          <th align="right" style="padding-bottom: 8px; width: 100px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding-top: 16px; font-weight: 700; text-transform: uppercase; color: #403d39; font-size: 12px;">Total Paid:</td>
          <td align="right" style="padding-top: 16px; font-size: 18px; font-weight: 800; color: #eb5e28;">₹${totalAmount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
      <tr>
        <td align="center" style="background-color: #fffcf2; border: 1px dashed #eb5e28; border-radius: 8px; padding: 24px 16px;">
          <span style="font-size: 11px; color: #403d39; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; display: block; margin-bottom: 10px;">Select Your Collection Slot</span>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #252422; line-height: 1.4;">Please select your preferred date and time slot to collect your order:</p>
          <a href="${slotLink}" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(235,94,40,0.2);">
            Schedule Pickup Slot
          </a>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="color: #403d39; line-height: 1.5;">
          <strong>Store Address:</strong> No 85, Nalla Thambi Road, Pammal, Chennai - 600 075 <br />
          <strong>Collection Timings:</strong> Monday - Saturday: 9:00 AM - 8:00 PM <br />
          <strong>Important:</strong> Present your digital pass or the 6-digit Verification PIN at the counter to verify collection.
        </td>
      </tr>
    </table>
    
    <p style="margin-bottom: 0;">You will receive another update when your package is ready at the counter.</p>
  `;
  return wrapTemplate('In-Store Collection Invoice', content);
};


export const getOrderFailureTemplate = (name, orderId, totalAmount) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Payment Unsuccessful</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">We were unable to complete the payment authorization signature for your order session: <strong>#${orderId.slice(-6).toUpperCase()}</strong>.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Order Session ID</span>
          <span style="color: #252422; font-family: monospace;">${orderId}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #403d39; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Amount Requested</span>
          <strong style="color: #eb5e28; font-size: 16px;">₹${totalAmount.toLocaleString()}</strong>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #eb5e28; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #403d39;">
      <tr>
        <td>
          <strong style="color: #eb5e28;">Important Note:</strong> If funds were deducted from your banking application, Razorpay will trigger an automatic credit reversal to your original source account within <strong>3-5 business days</strong>.
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 24px;">To re-attempt checkout or rebuild your medical supply list, please proceed using the button below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/allproduct" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.10em; font-size: 12px; border-radius: 4px;">
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
      <tr style="border-bottom: 1px solid #ccc5b9;">
        <td style="padding: 12px 0; color: #252422;">
          <span style="font-weight: 700; font-size: 14px; display: block;">${pName}</span>
        </td>
        <td align="center" style="padding: 12px 0; color: #252422; font-size: 14px;">${item.quantity}</td>
        <td align="right" style="padding: 12px 0; color: #eb5e28; font-size: 14px; font-weight: 600;">₹${pPrice.toLocaleString()}</td>
      </tr>
    `;
  });

  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Items Waiting in Cart</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">We noticed that you have pending items waiting in your digital cart. Your selection is currently saved and reserved under your profile details:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #eb5e28; text-transform: uppercase; color: #eb5e28; font-size: 11px; font-weight: 700;">
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
          <a href="http://localhost:5173/wishlist" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.10em; font-size: 12px; border-radius: 4px;">
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
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Two-Factor Security Verification</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">A login attempt was initiated for your profile. Please use the following single-use verification code to authorize this session access request:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td align="center" style="padding: 30px 20px;">
          <span style="font-family: monospace; font-size: 40px; font-weight: 900; letter-spacing: 0.3em; color: #eb5e28; padding-left: 0.3em;">${otp}</span>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #403d39;">
      <tr>
        <td>
          <strong style="color: #252422;">Security Advisory:</strong> This code is only valid for <strong>5 minutes</strong>. If you did not request this login attempt, please reset your password immediately.
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Security Code Verification', content);
};

export const getSuspensionTemplate = (name, duration, reason) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Account Suspended</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">We write to inform you that your access privileges to the STAT Surgical Supplies portal have been suspended by system administration.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #eb5e28; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #eb5e28;">
          <span style="color: #eb5e28; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Suspension Period</span>
          <strong style="color: #252422; font-size: 14px;">${duration}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px;">
          <span style="color: #eb5e28; text-transform: uppercase; font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Reason for Action</span>
          <span style="color: #252422; font-size: 13px; line-height: 1.5;">${reason || 'Violation of procurement guidelines or terms of service.'}</span>
        </td>
      </tr>
    </table>
    
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px; font-size: 13px; color: #252422; line-height: 1.5;">
          <strong style="color: #eb5e28;">Notice:</strong> During this suspension period, you will not be able to log in, place orders, or access surgical supply catalogs.
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 0; color: #eb5e28; font-size: 14px;">If you believe this suspension is in error or wish to appeal the decision, please contact administrative support.</p>
  `;
  return wrapTemplate('Account Suspension Protocol', content);
};

export const getShippingUpdateTemplate = (name, orderId, shippingStatus, description) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Shipping Update: ${shippingStatus.toUpperCase()}</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 16px;">Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has a new tracking update:</p>
    
    <div style="background-color: #fffcf2; border: 1px solid #ccc5b9; padding: 20px; margin-bottom: 24px; font-family: monospace; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; color: #eb5e28; font-size: 14px;">STATUS: ${shippingStatus.toUpperCase()}</p>
      <p style="margin: 8px 0 0 0; color: #252422; font-size: 12px; line-height: 1.5;">${description}</p>
      <p style="margin: 8px 0 0 0; color: #403d39; font-size: 10px;">Timestamp: ${new Date().toLocaleString()}</p>
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="http://localhost:5173/orders/${orderId}" style="display: inline-block; background-color: #eb5e28; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 30px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; border-radius: 4px;">
            Track Order Details
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 0; margin-bottom: 0; color: #403d39; font-size: 14px;">If you have any questions or require procurement support, please connect with our administrative team.</p>
  `;
  return wrapTemplate(`Order Status Update - ${orderId.slice(-8).toUpperCase()}`, content);
};

export const getBulkEnquiryTemplate = (name, email, phone, organization, productName, quantity, requirements, budget, timeline) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">New Bulk Order Enquiry</h2>
    <p style="margin-top: 0; margin-bottom: 20px;">A new bulk order enquiry has been received from the website. Details are listed below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Customer Name: <strong style="color: #252422; font-size: 14px;">${name}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Email Address: <strong style="color: #252422; font-size: 14px; font-family: monospace;">${email}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Phone Number: <strong style="color: #252422; font-size: 14px; font-family: monospace;">${phone}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Organization: <strong style="color: #252422; font-size: 14px;">${organization || 'N/A'}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Product of Interest: <strong style="color: #252422; font-size: 14px;">${productName || 'General Enquiry'}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Quantity Needed: <strong style="color: #252422; font-size: 14px;">${quantity}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Estimated Budget: <strong style="color: #252422; font-size: 14px;">${budget || 'N/A'}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Expected Timeline: <strong style="color: #252422; font-size: 14px;">${timeline || 'N/A'}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; color: #403d39;">
          Additional Requirements: <br/>
          <span style="color: #252422; font-size: 13px; line-height: 1.5; display: block; margin-top: 6px;">${requirements}</span>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Bulk Enquiry Received', content);
};

export const getBulkEnquiryReceiptTemplate = (name, productName, quantity) => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Bulk Enquiry Received</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 24px;">We have received your bulk order enquiry for <strong>${productName || 'our products'}</strong> (Quantity: ${quantity}). Our administrative team will review your request and get in touch with you shortly.</p>
    <p style="margin-top: 0; margin-bottom: 24px;">Thank you for choosing STAT Surgical Supplies.</p>
  `;
  return wrapTemplate('Bulk Enquiry Confirmation', content);
};

export const getBookingAdminTemplate = (name, email, phone, productName, date, timeSlot, notes, demoType = 'in-store', videoLink = '') => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">New Trial Booking Appointment</h2>
    <p style="margin-top: 0; margin-bottom: 20px;">A ${demoType === 'virtual' ? 'virtual video consultation' : 'in-store demo'} appointment has been scheduled. Customer information and diagnostics are shown below:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Client Name: <strong style="color: #252422; font-size: 14px;">${name}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Email Address: <strong style="color: #252422; font-size: 14px; font-family: monospace;">${email}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Phone Number: <strong style="color: #252422; font-size: 14px; font-family: monospace;">${phone}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Equipment: <strong style="color: #252422; font-size: 14px;">${productName}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Demo Format: <strong style="color: #252422; font-size: 14px; text-transform: uppercase;">${demoType === 'virtual' ? 'Virtual Video Consultation' : 'In-Store Demo'}</strong>
        </td>
      </tr>
      ${demoType === 'virtual' && videoLink ? `
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Video Meeting URL: <a href="${videoLink}" style="color: #eb5e28; font-size: 14px; font-family: monospace; font-weight: bold;">${videoLink}</a>
        </td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Scheduled Date: <strong style="color: #eb5e28; font-size: 14px;">${date}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Scheduled Time Slot: <strong style="color: #eb5e28; font-size: 14px;">${timeSlot}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; color: #403d39;">
          Notes / Remarks: <br/>
          <span style="color: #252422; font-size: 13px; line-height: 1.5; display: block; margin-top: 6px;">${notes || 'None'}</span>
        </td>
      </tr>
    </table>
  `;
  return wrapTemplate('Trial Demo Appointment Request', content);
};

export const getBookingCustomerTemplate = (name, productName, date, timeSlot, demoType = 'in-store', videoLink = '') => {
  const content = `
    <h2 style="color: #eb5e28; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em;">Trial Appointment Scheduled</h2>
    <p style="margin-top: 0; margin-bottom: 16px;">Dear ${name},</p>
    <p style="margin-top: 0; margin-bottom: 20px;">We have reserved a ${demoType === 'virtual' ? 'virtual video consultation' : 'in-store demo'} appointment for you. Your details are as follows:</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Target Equipment: <strong style="color: #252422; font-size: 14px;">${productName}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Demo Format: <strong style="color: #252422; font-size: 14px; text-transform: uppercase;">${demoType === 'virtual' ? 'Virtual Video Consultation' : 'In-Store Demo'}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #ccc5b9; color: #403d39;">
          Appointment Date: <strong style="color: #eb5e28; font-size: 14px;">${date}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px; color: #403d39;">
          Appointment Time: <strong style="color: #eb5e28; font-size: 14px;">${timeSlot}</strong>
        </td>
      </tr>
    </table>
    
    ${demoType === 'virtual' && videoLink ? `
    <table border="0" cellpadding="14" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="color: #403d39; line-height: 1.6;">
          <strong>Video Meeting URL:</strong> <br/>
          <a href="${videoLink}" style="color: #eb5e28; font-weight: bold; font-size: 14px; text-decoration: none;">Join Live Video Consultation &rarr;</a><br/><br/>
          <strong>Access Code:</strong> <span style="font-family: monospace; font-size: 14px; color: #252422; font-weight: bold;">${videoLink.split('/').pop()}</span> <br/><br/>
          <span style="font-size: 11px; color: #403d39; opacity: 0.8; display: block;">Please click the link at your selected time slot to join our clinical expert. Ensure you have a webcam or mobile video enabled.</span>
        </td>
      </tr>
    </table>
    ` : `
    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fffcf2; border: 1px solid #ccc5b9; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="color: #403d39;">
          <strong>Location:</strong> No 85, Nalla Thambi Road, Pammal, Chennai - 600075. <br/>
          <strong>Store Contact:</strong> +91 86086 78828
        </td>
      </tr>
    </table>
    `}
    
    <p style="margin-top: 0; margin-bottom: 0; color: #403d39; font-size: 14px;">Our representative will reach out shortly to finalize the demo setup. If you need to cancel or reschedule, please contact our support team.</p>
  `;
  return wrapTemplate('Demo Trial Appointment Scheduled', content);
};

