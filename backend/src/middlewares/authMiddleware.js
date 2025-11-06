import { verifyJWT } from '../utils/jwtUtils.js';
import logger from '../config/logger.js';

/**
 * Middleware to verify JWT token
 * Checks for token in:
 * 1. Cookie (httpOnly)
 * 2. Authorization header (Bearer token)
 */
export function authenticate(req, res, next) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    const payload = verifyJWT(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = payload;

    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed token.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Middleware to check if user has specific role(s)
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Authorization failed: User ${req.user.email} (${userRole}) attempted to access resource requiring ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export function optionalAuth(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const payload = verifyJWT(token, process.env.JWT_SECRET);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
}
