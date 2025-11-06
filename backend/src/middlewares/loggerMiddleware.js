import morgan from 'morgan';
import logger from '../config/logger.js';

/**
 * Morgan HTTP request logging middleware
 * Logs all HTTP requests with detailed information
 */

// Custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '0';
  }
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(2);
});

// Development format - detailed and colorized
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format - includes more details for analysis
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

// Create Morgan middleware based on environment
const morganMiddleware = process.env.NODE_ENV === 'production'
  ? morgan(prodFormat, {
      stream: logger.stream,
      skip: (req, res) => res.statusCode < 400, // Only log errors in production
    })
  : morgan(devFormat, {
      stream: logger.stream,
    });

export default morganMiddleware;
