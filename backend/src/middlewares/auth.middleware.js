import { JwtConfig } from '../config/jwt.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UserStatus, Role } from '@prisma/client';

/**
 * 1. Strict Authentication Middleware
 * Extracts Bearer JWT token from Authorization header.
 * Throws 401 Unauthorized if missing/invalid token.
 * Throws 403 Forbidden if user is suspended.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Missing or malformed Bearer token', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = JwtConfig.verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired', HTTP_STATUS.UNAUTHORIZED);
    }
    throw new AppError('Invalid access token', HTTP_STATUS.UNAUTHORIZED);
  }

  // Check if token belongs to a Scanner Staff Account
  if (decoded.scannerAccountId) {
    const scanner = await prisma.scannerAccount.findUnique({
      where: { id: decoded.scannerAccountId },
    });

    if (!scanner || !scanner.isActive) {
      throw new AppError('Scanner staff account associated with this token is inactive or deleted', HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = {
      scannerAccountId: scanner.id,
      eventId: scanner.eventId,
      organizerId: scanner.organizerId,
      email: scanner.scannerEmail,
      role: 'SCANNER_STAFF',
      assignedSectionIds: scanner.assignedSectionIds,
      assignedGateIds: scanner.assignedGateIds,
    };

    return next();
  }

  // Query database to ensure user account exists and is not soft-deleted
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.isDeleted) {
    throw new AppError('User account associated with this token no longer exists', HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError('Your account has been suspended. Access denied', HTTP_STATUS.FORBIDDEN);
  }

  // Attach authenticated user details to request object
  req.user = {
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  next();
});

/**
 * 2. Role-Based Authorization Guard Middleware
 * Restricts route access to specific User Roles (SUPER_ADMIN, EVENT_ORGANIZER, CUSTOMER).
 * Throws 401 Unauthorized if not logged in.
 * Throws 403 Forbidden if user role is not authorized.
 * @param {...string} allowedRoles - List of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden. You do not have permission to access this resource. Required role(s): [${allowedRoles.join(', ')}]`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};

/**
 * 3. Optional Authentication Middleware
 * Extracts Bearer token if present, attaching req.user if valid.
 * Does NOT throw errors if token is missing or invalid (treats user as guest).
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = null;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JwtConfig.verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user && !user.isDeleted && user.status !== UserStatus.SUSPENDED) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    }
  } catch (error) {
    // Silent catch for optional auth - req.user remains null
  }

  next();
});

// Convenient Role Shortcut Middleware Helpers
export const requireSuperAdmin = authorize(Role.SUPER_ADMIN);
export const requireOrganizer = authorize(Role.EVENT_ORGANIZER);
export const requireCustomer = authorize(Role.CUSTOMER);
