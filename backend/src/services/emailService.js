import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
  if (transporter) return transporter;

  // Use environment variables for email configuration
  // Supports Gmail, SendGrid, or any SMTP server
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

/**
 * Send custom request samples email to user
 * @param {string} userEmail - User's email address
 * @param {object} requestData - Custom request data
 * @param {string[]} sampleImageUrls - Array of sample image URLs
 * @returns {Promise<boolean>} - Success status
 */
export async function sendSamplesEmail(userEmail, requestData, sampleImageUrls = []) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email service not configured. SMTP credentials missing.');
      return false;
    }

    const emailTransporter = getTransporter();
    const requestId = requestData.id;
    const templateName = requestData.templateName || 'Template';
    const modifications = requestData.modifications || {};

    // Build modifications text
    const modsList = Object.entries(modifications)
      .filter(([key, value]) => value && value !== '')
      .map(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `<li><strong>${label}:</strong> ${value}</li>`;
      })
      .join('');

    // Build sample images HTML
    const sampleImagesHtml = sampleImageUrls.length > 0
      ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Your Custom Samples:</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${sampleImageUrls.map(url => `
              <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <img src="${url}" alt="Sample" style="width: 100%; height: auto; display: block;" />
              </div>
            `).join('')}
          </div>
        </div>
      `
      : '<p>Sample images will be available soon.</p>';

    // Create email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .modifications { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Custom Furniture Samples Are Ready!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We've created custom samples for your <strong>${templateName}</strong> request based on your specifications.</p>
            
            ${modsList ? `
              <div class="modifications">
                <h3 style="margin-top: 0; color: #2c3e50;">Your Customization Requirements:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  ${modsList}
                </ul>
              </div>
            ` : ''}
            
            ${sampleImagesHtml}
            
            <p style="margin-top: 30px;">
              <strong>Next Steps:</strong>
            </p>
            <ol>
              <li>Review the samples above</li>
              <li>Click the button below to view them on our platform</li>
              <li>Select your preferred sample or request adjustments</li>
              <li>Proceed to checkout when ready</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/custom-requests/${requestId}" class="button">
                View & Select Sample
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you'd like to request adjustments, you can do so directly on the platform after viewing the samples.
            </p>
          </div>
          <div class="footer">
            <p>Thank you for choosing Jeeda!</p>
            <p>If you have any questions, please reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Jeeda" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Your Custom ${templateName} Samples Are Ready!`,
      html: htmlContent,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Sample email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending samples email:', error);
    return false;
  }
}

/**
 * Send notification email when custom request is created
 * @param {string} userEmail - User's email address
 * @param {object} requestData - Custom request data
 * @returns {Promise<boolean>} - Success status
 */
export async function sendRequestConfirmationEmail(userEmail, requestData) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email service not configured. SMTP credentials missing.');
      return false;
    }

    const emailTransporter = getTransporter();
    const templateName = requestData.templateName || 'Template';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Custom Request Received!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for your custom furniture request for <strong>${templateName}</strong>.</p>
            <p>Our team has received your request and will create custom samples based on your specifications.</p>
            <p>We'll send you an email with the samples within 2-3 business days.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you have any questions, please don't hesitate to contact us.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Jeeda" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Custom Request Received - ${templateName}`,
      html: htmlContent,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

