import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import logger from './logger.js';

/**
 * Security Configuration for LAN Deployment
 * Includes Helmet, Rate Limiting, and CORS
 */

// Helmet Configuration - Security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// CORS Configuration - Allow LAN access
export const corsConfig = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, allow LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const isLAN = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(origin);
    
    if (allowedOrigins.includes(origin) || isLAN) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutes
});

// Rate Limiting Configuration
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

// Stricter rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes.',
    });
  },
});

// Rate limit for code execution (prevent abuse)
export const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 code executions per minute
  message: {
    success: false,
    message: 'Too many code execution requests, please slow down.',
  },
  handler: (req, res) => {
    logger.warn(`Code execution rate limit exceeded for IP: ${req.ip}, User: ${req.user?.email}`);
    res.status(429).json({
      success: false,
      message: 'Too many code execution requests, please wait before trying again.',
    });
  },
});

// Rate limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 uploads per 5 minutes
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
  },
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many file uploads, please wait before uploading again.',
    });
  },
});

// Rate limit for API endpoints that modify data
export const modifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 modifications per 5 minutes
  message: {
    success: false,
    message: 'Too many modification requests, please slow down.',
  },
});

export default {
  helmetConfig,
  corsConfig,
  generalLimiter,
  authLimiter,
  codeExecutionLimiter,
  uploadLimiter,
  modifyLimiter,
};
