import { Role, UserStatus, OtpPurpose, ApprovalStatus } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { OtpRepository } from '../repositories/otp.repository.js';
import { TokenRepository } from '../repositories/token.repository.js';
import { OrganizerRepository } from '../repositories/organizer.repository.js';
import { HashUtil } from '../utils/hash.util.js';
import { OtpUtil, OTP_CONSTANTS } from '../utils/otp.util.js';
import { JwtConfig } from '../config/jwt.js';
import { EmailService } from './email.service.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { formatStoredPhone } from '../utils/phone.util.js';
import { duplicateKeyMessage, isPrismaUniqueError, normalizeLoginIdentifier } from '../utils/authIdentifier.util.js';
import crypto from 'crypto';

/**
 * Public Authentication Business Service
 */
export class AuthService {
  /**
   * Customer Registration Service
   * @param {Object} dto - Customer registration input
   */
  static async registerCustomer(dto) {
    const existingUser = await UserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT);
    }

    const storedPhone = formatStoredPhone(dto.phone);
    const phoneOwner = await UserRepository.findByPhone(storedPhone);
    if (phoneOwner) {
      throw new AppError('An account with this mobile number already exists.', HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await HashUtil.hashPassword(dto.password);

    let user;
    try {
      user = await UserRepository.createUser({
        email: dto.email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: storedPhone,
        role: Role.CUSTOMER,
        status: UserStatus.PENDING_EMAIL_VERIFICATION,
      });
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new AppError(duplicateKeyMessage(error), HTTP_STATUS.CONFLICT);
      }
      throw error;
    }

    // Generate & send OTP
    await this.generateAndSendOtp(user.id, user.email, OtpPurpose.EMAIL_VERIFICATION);

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'Registration successful. Please check your email for the 6-digit verification code.',
    };
  }

  /**
   * Event Organizer Registration Service
   * @param {Object} dto - Organizer registration input
   */
  static async registerOrganizer(dto) {
    const existingUser = await UserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT);
    }

    const storedPhone = formatStoredPhone(dto.phone);
    const phoneOwner = await UserRepository.findByPhone(storedPhone);
    if (phoneOwner) {
      throw new AppError('An account with this mobile number already exists.', HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await HashUtil.hashPassword(dto.password);

    let user;
    try {
      user = await UserRepository.createUser({
        email: dto.email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: storedPhone,
        role: Role.EVENT_ORGANIZER,
        status: UserStatus.PENDING_EMAIL_VERIFICATION,
      });
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new AppError(duplicateKeyMessage(error), HTTP_STATUS.CONFLICT);
      }
      throw error;
    }

    await OrganizerRepository.createProfile({
      userId: user.id,
      companyName: dto.companyName,
      businessRegistrationNumber: dto.businessRegistrationNumber || null,
      phone: storedPhone,
      website: dto.website || null,
      address: dto.address || null,
      approvalStatus: ApprovalStatus.PENDING,
    });

    // Generate & send OTP
    await this.generateAndSendOtp(user.id, user.email, OtpPurpose.EMAIL_VERIFICATION);

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'Organizer registration successful. Please verify your email to submit for admin approval.',
    };
  }

  /**
   * Send / Resend OTP Code
   * @param {string} email
   * @param {string} purpose
   */
  static async sendOtp(email, purpose) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found with this email address', HTTP_STATUS.NOT_FOUND);
    }

    const existingOtp = await OtpRepository.findLatestOtp(user.id, purpose);

    if (existingOtp && existingOtp.resendCount >= OTP_CONSTANTS.MAX_RESEND_LIMIT) {
      throw new AppError(
        `Maximum OTP resend limit (${OTP_CONSTANTS.MAX_RESEND_LIMIT}) reached. Please try again later.`,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    const plainOtp = OtpUtil.generateOtp();
    const hashedOtp = await HashUtil.hashOtp(plainOtp);
    const expiresAt = OtpUtil.getOtpExpiration();

    if (existingOtp) {
      await OtpRepository.updateResendOtp(existingOtp.id, hashedOtp, expiresAt);
    } else {
      await OtpRepository.createOtp({
        userId: user.id,
        hashedOtp,
        purpose,
        expiresAt,
        resendCount: 1,
      });
    }

    await EmailService.sendOtpEmail(user.email, plainOtp, purpose);

    return { message: 'OTP sent successfully to your email.' };
  }

  /**
   * Generate & send fresh OTP helper
   */
  static async generateAndSendOtp(userId, email, purpose) {
    await OtpRepository.invalidatePreviousOtps(userId, purpose);

    const plainOtp = OtpUtil.generateOtp();
    const hashedOtp = await HashUtil.hashOtp(plainOtp);
    const expiresAt = OtpUtil.getOtpExpiration();

    await OtpRepository.createOtp({
      userId,
      hashedOtp,
      purpose,
      expiresAt,
      resendCount: 1,
    });

    await EmailService.sendOtpEmail(email, plainOtp, purpose);
  }

  /**
   * Verify OTP Code Service
   * @param {string} email
   * @param {string} plainOtp
   * @param {string} purpose
   */
  static async verifyOtp(email, plainOtp, purpose) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found with this email address', HTTP_STATUS.NOT_FOUND);
    }

    const otpRecord = await OtpRepository.findLatestOtp(user.id, purpose);
    if (!otpRecord) {
      throw new AppError('No active OTP request found for this email', HTTP_STATUS.BAD_REQUEST);
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new AppError('OTP code has expired. Please request a new one', HTTP_STATUS.BAD_REQUEST);
    }

    // Check max attempts
    if (otpRecord.verifyAttempts >= OTP_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
      throw new AppError(
        `Maximum verification attempts (${OTP_CONSTANTS.MAX_VERIFY_ATTEMPTS}) exceeded. Please request a new OTP.`,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    // Verify hashed OTP match
    const isMatch = await HashUtil.compareOtp(plainOtp, otpRecord.hashedOtp);
    if (!isMatch) {
      await OtpRepository.incrementAttempts(otpRecord.id);
      throw new AppError('Invalid OTP verification code', HTTP_STATUS.BAD_REQUEST);
    }

    // Mark OTP as used
    await OtpRepository.markUsed(otpRecord.id);

    // Apply User Status Lifecycle updates
    if (purpose === OtpPurpose.EMAIL_VERIFICATION) {
      if (user.role === Role.CUSTOMER) {
        // Customer email verified -> ACTIVE
        await UserRepository.updateStatus(user.id, UserStatus.ACTIVE);
      } else if (user.role === Role.EVENT_ORGANIZER) {
        // Organizer email verified -> PENDING_APPROVAL by Super Admin
        await UserRepository.updateStatus(user.id, UserStatus.PENDING_APPROVAL);
      }
    }

    const updatedUser = await UserRepository.findById(user.id);

    return {
      verified: true,
      userStatus: updatedUser.status,
      message:
        user.role === Role.EVENT_ORGANIZER
          ? 'Email verified successfully. Your organizer account is now pending approval by Super Admin.'
          : 'Email verified successfully. You can now log into your account.',
    };
  }

  /**
   * User Login Service (Customer & Organizer) — email or mobile + password
   */
  static async login(identifier, password, deviceInfo = null) {
    const GENERIC_AUTH_ERROR = 'Invalid email/mobile number or password.';
    const parsed = normalizeLoginIdentifier(identifier);

    let user = null;
    if (parsed.kind === 'email') {
      user = await UserRepository.findByEmail(parsed.value);
    } else if (parsed.kind === 'phone' && parsed.value) {
      user = await UserRepository.findByPhone(parsed.value);
    }

    if (!user) {
      throw new AppError(GENERIC_AUTH_ERROR, HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.role === Role.SUPER_ADMIN) {
      throw new AppError('Super Admin must log in via Admin Portal endpoint [/api/v1/admin/login]', HTTP_STATUS.FORBIDDEN);
    }

    const isPasswordValid = await HashUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(GENERIC_AUTH_ERROR, HTTP_STATUS.UNAUTHORIZED);
    }

    // Enforce Business Rules on User Status
    if (user.status === UserStatus.PENDING_EMAIL_VERIFICATION) {
      throw new AppError('Please verify your email address before logging in', HTTP_STATUS.FORBIDDEN);
    }

    if (user.status === UserStatus.PENDING_APPROVAL) {
      throw new AppError('Your Event Organizer account is pending review and approval by Super Admin', HTTP_STATUS.FORBIDDEN);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Please contact support', HTTP_STATUS.FORBIDDEN);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Account is not in active state', HTTP_STATUS.FORBIDDEN);
    }

    // Generate JWT Tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = JwtConfig.signAccessToken(tokenPayload);
    const refreshToken = JwtConfig.signRefreshToken({ userId: user.id });

    // Store Refresh Token in DB
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await TokenRepository.createToken({
      userId: user.id,
      token: refreshToken,
      deviceInfo,
      expiresAt: refreshExpiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        organizerProfile: user.organizerProfile || null,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Refresh Access Token Service (Rotation Enabled)
   * @param {string} refreshTokenStr
   */
  static async refreshToken(refreshTokenStr) {
    let decoded;
    try {
      decoded = JwtConfig.verifyRefreshToken(refreshTokenStr);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const storedToken = await TokenRepository.findByToken(refreshTokenStr);
    if (!storedToken || storedToken.isRevoked) {
      throw new AppError('Refresh token has been revoked or is invalid', HTTP_STATUS.UNAUTHORIZED);
    }

    if (new Date() > new Date(storedToken.expiresAt)) {
      throw new AppError('Refresh token has expired', HTTP_STATUS.UNAUTHORIZED);
    }

    // Revoke current refresh token (Rotation)
    await TokenRepository.revokeToken(refreshTokenStr);

    const user = storedToken.user;
    if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
      throw new AppError('User account is inactive or no longer exists', HTTP_STATUS.UNAUTHORIZED);
    }

    // Issue fresh Access & Refresh Tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const newAccessToken = JwtConfig.signAccessToken(tokenPayload);
    const newRefreshToken = JwtConfig.signRefreshToken({ userId: user.id });

    const newRefreshExpiresAt = new Date();
    newRefreshExpiresAt.setDate(newRefreshExpiresAt.getDate() + 7);

    await TokenRepository.createToken({
      userId: user.id,
      token: newRefreshToken,
      deviceInfo: storedToken.deviceInfo,
      expiresAt: newRefreshExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * User Logout Service
   * @param {string} refreshTokenStr
   */
  static async logout(refreshTokenStr) {
    if (refreshTokenStr) {
      try {
        await TokenRepository.revokeToken(refreshTokenStr);
      } catch (error) {
        // Silent catch for invalid/missing token
      }
    }
    return { message: 'Logged out successfully.' };
  }

  static GENERIC_RESET_MESSAGE =
    'If an account exists for this information, a verification code has been sent to the registered email.';

  static async findUserByIdentifier(rawIdentifier) {
    const parsed = normalizeLoginIdentifier(rawIdentifier);
    if (parsed.kind === 'email') {
      return UserRepository.findByEmail(parsed.value);
    }
    if (parsed.kind === 'phone' && parsed.value) {
      return UserRepository.findByPhone(parsed.value);
    }
    return null;
  }

  static async issuePasswordResetOtp(user) {
    await OtpRepository.invalidatePreviousOtps(user.id, OtpPurpose.FORGOT_PASSWORD);

    const requestId = crypto.randomUUID();
    const plainOtp = OtpUtil.generateOtp();
    const hashedOtp = await HashUtil.hashOtp(plainOtp);
    const expiresAt = OtpUtil.getOtpExpiration();

    await OtpRepository.createOtp({
      userId: user.id,
      hashedOtp,
      purpose: OtpPurpose.FORGOT_PASSWORD,
      expiresAt,
      resendCount: 1,
      requestId,
      lastSentAt: new Date(),
    });

    await EmailService.sendPasswordResetOtpEmail(user.email, plainOtp);
    return requestId;
  }

  /**
   * Forgot Password — identifier can be email or mobile. OTP always goes to DB email.
   */
  static async forgotPassword(identifier) {
    const dummyRequestId = crypto.randomUUID();
    const user = await this.findUserByIdentifier(identifier);

    if (!user || user.isDeleted) {
      return { message: this.GENERIC_RESET_MESSAGE, requestId: dummyRequestId, cooldownSeconds: OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS };
    }

    const latest = await OtpRepository.findLatestOtp(user.id, OtpPurpose.FORGOT_PASSWORD);
    if (latest?.lastSentAt) {
      const elapsed = (Date.now() - new Date(latest.lastSentAt).getTime()) / 1000;
      if (elapsed < OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS) {
        return {
          message: this.GENERIC_RESET_MESSAGE,
          requestId: latest.requestId || dummyRequestId,
          cooldownSeconds: Math.ceil(OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS - elapsed),
        };
      }
    }

    const requestId = await this.issuePasswordResetOtp(user);
    return {
      message: this.GENERIC_RESET_MESSAGE,
      requestId,
      cooldownSeconds: OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS,
    };
  }

  static async resendResetOtp(requestId) {
    const generic = {
      message: this.GENERIC_RESET_MESSAGE,
      cooldownSeconds: OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS,
    };

    const otpRecord = await OtpRepository.findByRequestId(requestId);
    if (!otpRecord || otpRecord.purpose !== OtpPurpose.FORGOT_PASSWORD || otpRecord.resetCompletedAt) {
      return generic;
    }

    if (otpRecord.lastSentAt) {
      const elapsed = (Date.now() - new Date(otpRecord.lastSentAt).getTime()) / 1000;
      if (elapsed < OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS) {
        throw new AppError(
          `Please wait ${Math.ceil(OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS - elapsed)} seconds before requesting another code.`,
          HTTP_STATUS.TOO_MANY_REQUESTS
        );
      }
    }

    if (otpRecord.resendCount >= OTP_CONSTANTS.MAX_RESEND_LIMIT) {
      throw new AppError('Maximum OTP resend limit reached. Please try again later.', HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    const user = await UserRepository.findById(otpRecord.userId);
    if (!user) return generic;

    const plainOtp = OtpUtil.generateOtp();
    const hashedOtp = await HashUtil.hashOtp(plainOtp);
    const expiresAt = OtpUtil.getOtpExpiration();
    await OtpRepository.updateResendOtp(otpRecord.id, hashedOtp, expiresAt);
    await EmailService.sendPasswordResetOtpEmail(user.email, plainOtp);

    return generic;
  }

  static async verifyResetOtp(requestId, plainOtp) {
    const invalidMessage = 'Invalid or expired verification code.';
    const otpRecord = await OtpRepository.findByRequestId(requestId);

    if (!otpRecord || otpRecord.purpose !== OtpPurpose.FORGOT_PASSWORD || otpRecord.resetCompletedAt) {
      throw new AppError(invalidMessage, HTTP_STATUS.BAD_REQUEST);
    }

    if (otpRecord.verifiedAt && otpRecord.hashedResetToken) {
      throw new AppError('This verification code has already been used. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new AppError('OTP has expired. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    if (otpRecord.verifyAttempts >= OTP_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
      await OtpRepository.markUsed(otpRecord.id);
      throw new AppError('Too many invalid attempts. Please request a new OTP.', HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    const isMatch = await HashUtil.compareOtp(plainOtp, otpRecord.hashedOtp);
    if (!isMatch) {
      const updated = await OtpRepository.incrementAttempts(otpRecord.id);
      if (updated.verifyAttempts >= OTP_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
        await OtpRepository.markUsed(otpRecord.id);
        throw new AppError('Too many invalid attempts. Please request a new OTP.', HTTP_STATUS.TOO_MANY_REQUESTS);
      }
      throw new AppError(invalidMessage, HTTP_STATUS.BAD_REQUEST);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = HashUtil.hashToken(resetToken);
    const resetTokenExpiresAt = OtpUtil.getOtpExpiration(OTP_CONSTANTS.RESET_TOKEN_MINUTES);
    await OtpRepository.markVerified(otpRecord.id, hashedResetToken, resetTokenExpiresAt);

    return {
      resetToken,
      expiresInMinutes: OTP_CONSTANTS.RESET_TOKEN_MINUTES,
      message: 'OTP verified. You can now create a new password.',
    };
  }

  /**
   * Reset password using short-lived reset token, or legacy email+otp payload.
   */
  static async resetPassword(payload) {
    if (payload.resetToken) {
      return this.resetPasswordWithToken(payload.resetToken, payload.newPassword, payload.confirmPassword);
    }
    return this.resetPasswordLegacy(payload.email, payload.otp, payload.newPassword);
  }

  static async resetPasswordWithToken(resetToken, newPassword, confirmPassword) {
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      throw new AppError('Password confirmation does not match', HTTP_STATUS.BAD_REQUEST);
    }
    if (!newPassword || String(newPassword).length < 8) {
      throw new AppError('New password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST);
    }

    const hashedResetToken = HashUtil.hashToken(resetToken);
    const otpRecord = await OtpRepository.findByResetTokenHash(hashedResetToken);
    if (!otpRecord || !otpRecord.verifiedAt) {
      throw new AppError('Invalid or expired reset token.', HTTP_STATUS.BAD_REQUEST);
    }
    if (otpRecord.resetCompletedAt) {
      throw new AppError('This reset token has already been used.', HTTP_STATUS.BAD_REQUEST);
    }
    if (!otpRecord.resetTokenExpiresAt || new Date() > new Date(otpRecord.resetTokenExpiresAt)) {
      throw new AppError('Reset token has expired. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    const newHashedPassword = await HashUtil.hashPassword(newPassword);
    await UserRepository.updatePassword(otpRecord.userId, newHashedPassword);
    await OtpRepository.markResetCompleted(otpRecord.id);
    await OtpRepository.invalidatePreviousOtps(otpRecord.userId, OtpPurpose.FORGOT_PASSWORD);
    await TokenRepository.revokeAllUserTokens(otpRecord.userId);

    return { message: 'Password reset successfully.' };
  }

  static async resetPasswordLegacy(email, plainOtp, newPassword) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found with this email address', HTTP_STATUS.NOT_FOUND);
    }

    const otpRecord = await OtpRepository.findLatestOtp(user.id, OtpPurpose.FORGOT_PASSWORD);
    if (!otpRecord) {
      throw new AppError('No active password reset request found', HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new AppError('Password reset OTP code has expired', HTTP_STATUS.BAD_REQUEST);
    }

    const isMatch = await HashUtil.compareOtp(plainOtp, otpRecord.hashedOtp);
    if (!isMatch) {
      await OtpRepository.incrementAttempts(otpRecord.id);
      throw new AppError('Invalid OTP reset code', HTTP_STATUS.BAD_REQUEST);
    }

    await OtpRepository.markUsed(otpRecord.id);

    // Hash new password & update User record
    const newHashedPassword = await HashUtil.hashPassword(newPassword);
    await UserRepository.updatePassword(user.id, newHashedPassword);

    // Revoke all existing refresh tokens for security
    await TokenRepository.revokeAllUserTokens(user.id);

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }
}
