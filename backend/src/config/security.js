import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import logger from './logger.js';

// Helmet Configuration
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

// CORS Configuration
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

// Rate limiting - production only
const isProduction = process.env.NODE_ENV === 'production';

const createLimiter = (config) => {
  if (!isProduction) {
    return (req, res, next) => next();
  }
  return rateLimit({
    ...config,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded: ${req.ip} on ${req.path}`);
    res.status(429).json({ success: false, message: 'Too many requests' });
  },
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts' },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many login attempts' });
  },
});

export const codeExecutionLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many code executions' },
  handler: (req, res) => {
    logger.warn(`Code execution rate limit: ${req.ip}, User: ${req.user?.email}`);
    res.status(429).json({ success: false, message: 'Too many code executions' });
  },
});

export const uploadLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many uploads' },
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many uploads' });
  },
});

export const modifyLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many modification requests' },
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
