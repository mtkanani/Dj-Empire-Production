import dns from 'node:dns';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

dns.setDefaultResultOrder('ipv4first');

// ─── Transport Selection ────────────────────────────────────────────────────
// On Render (and most cloud platforms), outbound SMTP ports 25/465/587 are
// blocked to prevent spam. Resend uses HTTPS (port 443) instead — always open.
//
//   RESEND_API_KEY set  →  use Resend HTTP API  (production / cloud)
//   RESEND_API_KEY not set →  use Nodemailer SMTP (local dev)

const USE_RESEND = Boolean(env.RESEND_API_KEY);

let resendClient = null;
let smtpTransporter = null;

if (USE_RESEND) {
  resendClient = new Resend(env.RESEND_API_KEY);
  logger.info('📧 Email transport: Resend HTTP API (SMTP port blocks bypassed)');
} else {
  const smtpPort = Number(env.SMTP_PORT || 587);
  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    family: 4,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 25000,
    greetingTimeout: 25000,
    socketTimeout: 30000,
  });
  logger.info(`📧 Email transport: Nodemailer SMTP (${env.SMTP_HOST}:${smtpPort})`);
}

// ─── Internal send helper ───────────────────────────────────────────────────
async function sendAppMail({ to, subject, html, text, replyTo, attachments }) {
  if (USE_RESEND) {
    const payload = {
      from: env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    };
    if (replyTo) payload.reply_to = replyTo;
    if (attachments?.length) {
      // Resend expects { filename, content (Buffer|string) }
      payload.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));
    }
    const { data, error } = await resendClient.emails.send(payload);
    if (error) throw new Error(error.message || JSON.stringify(error));
    return { messageId: data?.id };
  }

  // SMTP fallback
  return smtpTransporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    replyTo,
    subject,
    html,
    text,
    attachments,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function smtpUserMessage(error) {
  const msg = String(error?.message || 'Unknown mail error');
  if (/invalid login|535|534|550|username and password not accepted|badcredentials|authentication failed/i.test(msg)) {
    return 'Could not send email. SMTP login failed. Check SMTP_USER (full mailbox email) and SMTP_PASS (Hostinger mailbox password).';
  }
  if (/timeout|etimedout|esocket|econnrefused|enotfound|enetunreach/i.test(msg)) {
    return 'Could not reach the mail server. Confirm SMTP_HOST=smtp.hostinger.com and SMTP_PORT=465.';
  }
  return `Could not send email: ${msg}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function logDevOtp(label, toEmail, otpCode) {
  if (env.NODE_ENV !== 'development') return;
  console.log('\n==================================================');
  console.log(`🔑 [${label}] ${toEmail}`);
  console.log(`👉 6-DIGIT VERIFICATION CODE: ${otpCode}`);
  console.log('==================================================\n');
}

// ─── Email Service ──────────────────────────────────────────────────────────
/**
 * Reusable Email Service
 * Uses Resend (HTTP API) when RESEND_API_KEY is set, SMTP otherwise.
 */
export class EmailService {
  static async verifySmtp() {
    if (USE_RESEND) {
      // Resend has no "verify" concept — just log that it's ready.
      console.log('✅ Resend email client ready (HTTP API — no SMTP port needed)');
      logger.info(`📧 Resend ready (EMAIL_FROM: ${env.EMAIL_FROM})`);
      return;
    }
    try {
      await smtpTransporter.verify();
      console.log('✅ SMTP connection successful');
      logger.info(`📧 SMTP ready (${env.SMTP_HOST}:${env.SMTP_PORT} as ${env.SMTP_USER})`);
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      logger.error(`📧 SMTP verify failed: ${error.message}`);
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
      const info = await sendAppMail({ to: toEmail, subject, html });
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
      const info = await sendAppMail({ to: toEmail, subject, html });
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
      </div>
    `;

    try {
      await sendAppMail({ to: toEmail, subject, html });
    } catch (error) {
      logger.error(`❌ Failed to send approval email to ${toEmail}: ${error.message}`);
    }
  }

  static async sendContactFormEmail({ name, email, phone, message }) {
    const subject = `New Contact Form Submission from ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">New Contact Form Submission</h2>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 10px 0;"><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
          <p style="margin: 10px 0;"><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </div>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This message was sent from the D J EMPIRE PRODUCTION contact form.
        </p>
      </div>
    `;

    try {
      const info = await sendAppMail({
        to: env.SMTP_USER || env.EMAIL_FROM,
        replyTo: email,
        subject,
        html,
      });
      logger.info(`📧 Contact form emailed: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`❌ Contact form email failed: ${error.message}`);
      throw new AppError(smtpUserMessage(error), HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
  }

  static async sendBookingTicketEmail({ to, subject, html, attachments = [] }) {
    const info = await sendAppMail({ to, subject, html, attachments });
    logger.info(`📧 Ticket email sent to ${to}: ${info.messageId}`);
    return info;
  }
}
