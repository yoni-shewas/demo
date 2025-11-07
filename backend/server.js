import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import logger from './src/config/logger.js';
import morganMiddleware from './src/middlewares/loggerMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import instructorRoutes from './src/routes/instructorRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import codeRoutes from './src/routes/codeRoutes.js';
import { helmetConfig, corsConfig, generalLimiter, authLimiter, codeExecutionLimiter } from './src/config/security.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(generalLimiter);

// Logging middleware
app.use(morganMiddleware);

// Response logger for errors (4XX and 5XX)
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      logger.error(`${res.statusCode} ${req.method} ${req.path}`, {
        status: res.statusCode,
        method: req.method,
        path: req.path,
        ip: req.ip,
        user: req.user?.email,
        response: typeof data === 'string' ? data.substring(0, 500) : JSON.stringify(data).substring(0, 500)
      });
    }
    originalSend.call(this, data);
  };
  next();
});

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/code', codeExecutionLimiter, codeRoutes);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    logger.debug('Health check: Database connected');
    res.json({ 
      ok: true,
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (e) {
    logger.error('Health check failed:', e);
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

let server;

async function start() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    server = app.listen(PORT, () => {
      logger.info('========================================');
      logger.info(`Server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Rate limiting: ${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'}`);
      if (process.env.LOAD_TEST === 'true') {
        logger.warn('LOAD_TEST mode: Authentication bypassed for /api/code routes');
      }
      logger.info('========================================');
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  logger.info(`${signal} received: Starting graceful shutdown...`);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
  try {
    // Close database connections
    await prisma.$disconnect();
    logger.info('Database connections closed');
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

start();
