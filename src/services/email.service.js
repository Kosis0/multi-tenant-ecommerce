const { transporter, isConfigured, fromEmail } = require('../config/email');

/**
 * Sends an email via Nodemailer or mocks if SMTP credentials are missing.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body content
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!isConfigured) {
      console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      return { success: true, message: 'Mock email sent (configure SMTP in .env for live delivery)' };
    }

    const info = await transporter.sendMail({
      from: `"Mercato Platform" <${fromEmail}>`,
      to,
      subject,
      html
    });

    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Formats and dispatches order confirmation email.
 */
const sendOrderConfirmationEmail = async (customerEmail, order, items, totalAmount) => {
  if (!customerEmail) return;

  const orderShortId = (order.id || '').toString().slice(0, 8).toUpperCase();
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2>Thank you for your order!</h2>
      <p>We've received your order <strong>#${orderShortId}</strong> and are processing it.</p>
      <p><strong>Total Amount:</strong> ₦${Number(totalAmount).toLocaleString()}</p>
      <h3>Order Items:</h3>
      <ul>
        ${items
          .map(
            (item) =>
              `<li>Product #${item.product_id} (x${item.quantity}) - ₦${Number(
                item.calculated_unit_price || item.unit_price || 0
              ).toLocaleString()}</li>`
          )
          .join('')}
      </ul>
      <p>You can check the status of your order by logging into your account.</p>
    </div>
  `;

  return sendEmail(customerEmail, `Order Confirmation #${orderShortId}`, emailHtml);
};

/**
 * Formats and dispatches order status update email.
 */
const sendOrderStatusUpdateEmail = async (customerEmail, orderId, status) => {
  if (!customerEmail) return;

  const orderShortId = (orderId || '').toString().slice(0, 8).toUpperCase();
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2>Your order has been ${status}!</h2>
      <p>Great news! Your order <strong>#${orderShortId}</strong> is now marked as <strong>${status}</strong>.</p>
      <p>You can check the detailed status of your order by logging into your account.</p>
    </div>
  `;

  return sendEmail(customerEmail, `Order ${status.toUpperCase()} #${orderShortId}`, emailHtml);
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
