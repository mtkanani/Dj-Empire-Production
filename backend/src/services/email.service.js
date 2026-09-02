import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

const isGmail = /gmail\.com$/i.test(env.SMTP_HOST);

const transporter = nodemailer.createTransport(
  isGmail
    ? {
        service: 'gmail',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
        connectionTimeout: 25000,
        greetingTimeout: 25000,
        socketTimeout: 30000,
      }
    : {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        requireTLS: env.SMTP_PORT === 587,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
        connectionTimeout: 25000,
        greetingTimeout: 25000,
        socketTimeout: 30000,
      }
);

const mailFrom = env.EMAIL_FROM.includes(env.SMTP_USER)
  ? env.EMAIL_FROM
  : `"${env.APP_NAME}" <${env.SMTP_USER}>`;

function smtpUserMessage(error) {
  const msg = String(error?.message || 'Unknown mail error');
  if (/invalid login|535|534|username and password not accepted|badcredentials/i.test(msg)) {
    return 'Could not send email. Gmail rejected the login. On Render, set SMTP_USER to your Gmail and SMTP_PASS to a Google App Password (not your normal password).';
  }
  if (/timeout|etimedout|esocket|econnrefused|enotfound/i.test(msg)) {
    return 'Could not reach the mail server. If this is Render + Gmail, use Hostinger mailbox SMTP (smtp.hostinger.com, port 465) instead.';
  }
  return `Could not send email: ${msg}`;
}

function logDevOtp(label, toEmail, otpCode) {
  if (env.NODE_ENV !== 'development') return;
  console.log('\n==================================================');
  console.log(`🔑 [${label}] ${toEmail}`);
  console.log(`👉 6-DIGIT VERIFICATION CODE: ${otpCode}`);
  console.log('==================================================\n');
}

/**
 * Reusable Email Service using Nodemailer
 */
export class EmailService {
  static async verifySmtp() {
    try {
      await transporter.verify();
      logger.info(`📧 SMTP ready (${env.SMTP_HOST} as ${env.SMTP_USER})`);
    } catch (error) {
      logger.error(`📧 SMTP verify failed: ${error.message}`);
      logger.error(
        'OTP emails will fail until SMTP_USER / SMTP_PASS (App Password) are set on this server.'
      );
    }
  }

  /**
   * Send 6-Digit OTP Email for Verification or Password Reset
   */
  static async sendOtpEmail(toEmail, otpCode, purpose = 'Email Verification') {
    const subject = `${env.APP_NAME} - Your ${purpose} OTP Code`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4A90E2; text-align: center;">${env.APP_NAME}</h2>
        <h3 style="color: #333; text-align: center;">${purpose}</h3>
        <p style="color: #666; font-size: 15px;">Your one-time passcode (OTP) is:</p>
        <div style="background-color: #F4F6F8; text-align: center; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #1A252C; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #999; font-size: 13px;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #bbb; font-size: 11px; text-align: center;">Sent automatically by ${env.APP_NAME}.</p>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: mailFrom,
        to: toEmail,
        subject,
        html,
      });
      logger.info(`📧 Email sent to ${toEmail}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`❌ Email delivery failed to ${toEmail}: ${error.message}`);
      logDevOtp('DEV OTP CODE', toEmail, otpCode);
      throw new AppError(smtpUserMessage(error), HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
  }

  static async sendPasswordResetOtpEmail(toEmail, otpCode) {
    const subject = `${env.APP_NAME} - Password reset verification code`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; text-align: center; margin-top: 0;">${env.APP_NAME}</h2>
        <p style="color: #374151; font-size: 15px;">We received a request to reset your password. Use this verification code:</p>
        <div style="background: #F4F6F8; text-align: center; padding: 16px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #4b5563; font-size: 14px;">This code expires in <strong>10 minutes</strong>. If you did not request a password reset, you can ignore this email. Never share this code with anyone.</p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">Sent automatically by ${env.APP_NAME}. Do not reply with your password.</p>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: mailFrom,
        to: toEmail,
        subject,
        html,
      });
      logger.info(`📧 Password reset OTP emailed (message ${info.messageId})`);
      return info;
    } catch (error) {
      logger.error(`❌ Password reset email delivery failed: ${error.message}`);
      logDevOtp('DEV PASSWORD RESET OTP', toEmail, otpCode);
      throw new AppError(smtpUserMessage(error), HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
  }

  static async sendOrganizerApprovalEmail(toEmail, companyName) {
    const subject = `${env.APP_NAME} - Account Approved! 🎉`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #27AE60; text-align: center;">Congratulations, ${companyName}!</h2>
        <p style="color: #333; font-size: 16px;">Your Event Organizer account has been reviewed and approved by the Super Admin team.</p>
        <p style="color: #666; font-size: 15px;">You can now log into your account and start creating and publishing events on ${env.APP_NAME}.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/api-docs" style="background-color: #27AE60; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">Log In Now</a>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: mailFrom,
        to: toEmail,
        subject,
        html,
      });
    } catch (error) {
      logger.error(`❌ Failed to send approval email to ${toEmail}: ${error.message}`);
    }
  }

  static async sendBookingTicketEmail({ to, subject, html, attachments = [] }) {
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      html,
      attachments,
    });
    logger.info(`📧 Ticket email sent to ${to}: ${info.messageId}`);
    return info;
  }
}
