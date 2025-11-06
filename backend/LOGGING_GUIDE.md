# Logging Guide

## Overview

The application uses **Winston** for application logs and **Morgan** for HTTP request logs. Logs are written to both files and console (in development mode).

## Log Files Location

```
backend/logs/
├── combined.log  - All log levels (info, warn, error, debug)
├── error.log     - Only errors
```

## Log Levels

1. **error** - Error events that might still allow the application to continue
2. **warn** - Warning messages about potential issues
3. **info** - General informational messages
4. **debug** - Detailed debugging information (dev mode only)

## Configuration

### Environment-Based Logging

**Development Mode:**
- ✅ Console output: All levels (debug, info, warn, error)
- ✅ File output: All levels
- ✅ HTTP requests: All requests logged
- ✅ Colorized console output

**Production Mode:**
- ✅ Console output: Only warn & error
- ✅ File output: All levels
- ✅ HTTP requests: Only errors (status >= 400)
- ✅ JSON format for log analysis

### Log File Settings

- **Max file size**: 5MB
- **Max files**: 5 (rotates automatically)
- **Format**: JSON (for easy parsing)
- **Timestamps**: YYYY-MM-DD HH:mm:ss

## Log Examples

### Server Startup
```json
{"level":"info","message":"Database connected successfully","timestamp":"2025-11-06 09:24:18"}
{"level":"info","message":"Server started on port 3000","timestamp":"2025-11-06 09:24:18"}
{"level":"info","message":"Environment: development","timestamp":"2025-11-06 09:24:18"}
```

### HTTP Requests (Morgan)
```json
{"level":"info","message":"GET /health 200 12.771 ms - 28","timestamp":"2025-11-06 09:24:47"}
{"level":"info","message":"POST /api/auth/login 200 110.207 ms - 456","timestamp":"2025-11-06 09:25:27"}
```

### Authentication Events
```json
// Successful login
{"level":"debug","message":"Login attempt for email: admin@school.edu","timestamp":"2025-11-06 09:25:27"}
{"level":"info","message":"User logged in successfully: admin@school.edu (ADMIN)","timestamp":"2025-11-06 09:25:27"}

// Failed login
{"level":"debug","message":"Login attempt for email: wrong@email.com","timestamp":"2025-11-06 09:25:30"}
{"level":"warn","message":"Login failed: User not found - wrong@email.com","timestamp":"2025-11-06 09:25:30"}
```

### Admin Operations
```json
{"level":"info","message":"Admin created user: student@school.edu (STUDENT)","timestamp":"..."}
{"level":"info","message":"CSV import started: students.csv (2048 bytes)","timestamp":"..."}
{"level":"info","message":"CSV import completed: 45/50 successful","timestamp":"..."}
{"level":"info","message":"Admin deleted user: olduser@school.edu (STUDENT)","timestamp":"..."}
```

### Authorization Failures
```json
{"level":"warn","message":"Authorization failed: User student@school.edu (STUDENT) attempted to access resource requiring ADMIN","timestamp":"..."}
```

### Errors
```json
{"level":"error","message":"Login error:","stack":"Error: ...","timestamp":"..."}
{"level":"error","message":"Uncaught Exception:","stack":"...","timestamp":"..."}
```

## Viewing Logs

### Real-time Console (Development)
```bash
yarn dev
# Logs appear in console with colors
```

### Tail Log Files
```bash
# Watch all logs
tail -f logs/combined.log

# Watch errors only
tail -f logs/error.log

# Last 50 lines
tail -50 logs/combined.log

# Follow with grep filter
tail -f logs/combined.log | grep "error"
```

### Search Logs
```bash
# Find all login attempts
grep "Login attempt" logs/combined.log

# Find all errors
grep '"level":"error"' logs/combined.log

# Find specific user activity
grep "admin@school.edu" logs/combined.log

# Find CSV imports
grep "CSV import" logs/combined.log
```

### Parse JSON Logs
```bash
# Using jq to pretty print
cat logs/combined.log | jq '.'

# Filter by level
cat logs/combined.log | jq 'select(.level=="error")'

# Filter by timestamp
cat logs/combined.log | jq 'select(.timestamp | startswith("2025-11-06"))'

# Extract specific fields
cat logs/combined.log | jq '{time: .timestamp, level: .level, msg: .message}'
```

## What Gets Logged

### ✅ Authentication
- Login attempts (with email)
- Login success (email + role)
- Login failures (reason)
- Token verification failures
- Authorization denials

### ✅ Admin Operations
- User creation
- User deletion
- CSV/JSON imports (start, completion, results)
- Data exports

### ✅ HTTP Requests
- All requests in development
- Error requests (4xx, 5xx) in production
- Method, path, status, response time

### ✅ System Events
- Server startup
- Database connection
- Graceful shutdown
- Uncaught exceptions
- Unhandled promise rejections

### ✅ Database Operations
- Connection success/failure
- Health checks

## Using Logger in Code

### Import Logger
```javascript
import logger from '../config/logger.js';
```

### Log Levels

```javascript
// Debug - detailed info for developers
logger.debug('Processing user data', { userId, action });

// Info - general informational messages
logger.info('User created successfully', { email, role });

// Warn - warning messages
logger.warn('Login failed: invalid password', { email });

// Error - error events
logger.error('Failed to connect to database', error);
```

### With Metadata
```javascript
logger.info('CSV import completed', {
  successful: 45,
  failed: 5,
  total: 50,
  filename: 'students.csv'
});
```

### With Error Stack
```javascript
try {
  // code
} catch (error) {
  logger.error('Operation failed:', error);
  // Automatically includes stack trace
}
```

## Log Rotation

Winston automatically rotates log files when they reach 5MB:
- Old files: `combined.log.1`, `combined.log.2`, etc.
- Maximum 5 files kept
- Oldest files deleted automatically

## Security Considerations

### ❌ DO NOT LOG:
- Passwords (plain or hashed)
- JWT tokens (full)
- Credit card numbers
- Personal identification numbers
- API keys/secrets

### ✅ SAFE TO LOG:
- Email addresses
- Usernames
- User roles
- Request paths
- HTTP status codes
- Error messages (sanitized)
- Timestamps
- Operation outcomes

## Monitoring & Analysis

### Production Monitoring

1. **Log Aggregation**
   - Consider using ELK Stack, Splunk, or CloudWatch
   - Ship logs to centralized service

2. **Alerts**
   - Set up alerts for error spikes
   - Monitor failed login attempts
   - Track unauthorized access attempts

3. **Metrics**
   - Request latency (from Morgan logs)
   - Error rates by endpoint
   - Authentication success/failure rates

### Log Analysis Queries

```bash
# Count errors in last hour
cat logs/combined.log | jq -r '. | select(.level=="error")' | wc -l

# Failed login attempts
grep '"Login failed"' logs/combined.log | wc -l

# Average response time (requires processing)
grep "ms -" logs/combined.log | awk '{print $(NF-2)}' | awk '{sum+=$1; count++} END {print sum/count}'
```

## Troubleshooting

### Logs Not Appearing

1. **Check logs directory exists**
   ```bash
   ls -la logs/
   ```

2. **Check file permissions**
   ```bash
   ls -l logs/*.log
   ```

3. **Verify LOG_LEVEL environment variable**
   ```bash
   echo $LOG_LEVEL
   ```

4. **Check server startup logs**
   ```bash
   yarn dev
   ```

### Too Many Logs

1. **Increase LOG_LEVEL in production**
   ```bash
   # .env
   LOG_LEVEL=warn
   ```

2. **Reduce Morgan logging**
   - Already configured to log only errors in production

3. **Clean old logs**
   ```bash
   rm logs/*.log.*
   ```

### Log Files Too Large

- Winston auto-rotates at 5MB
- Adjust in `src/config/logger.js`:
  ```javascript
  maxsize: 2097152, // 2MB
  maxFiles: 3,
  ```

## Best Practices

1. **Use appropriate log levels**
   - debug: Troubleshooting details
   - info: Normal operations
   - warn: Potential issues
   - error: Actual problems

2. **Include context**
   ```javascript
   logger.info('User action', { userId, action, resource });
   ```

3. **Don't log in loops**
   ```javascript
   // ❌ Bad
   users.forEach(user => logger.debug('Processing', user));
   
   // ✅ Good
   logger.info('Processing users batch', { count: users.length });
   ```

4. **Log at boundaries**
   - API endpoints (entry/exit)
   - External service calls
   - Database operations
   - Authentication events

5. **Sanitize sensitive data**
   ```javascript
   // ❌ Bad
   logger.info('Login', { password });
   
   // ✅ Good
   logger.info('Login attempt', { email });
   ```

## Environment Variables

```env
# Optional: Set log level (debug, info, warn, error)
LOG_LEVEL=info

# NODE_ENV determines console verbosity
NODE_ENV=development  # All logs to console
NODE_ENV=production   # Only warn/error to console
```

## Log File Locations

```
backend/
├── logs/
│   ├── combined.log      # All logs
│   ├── error.log         # Errors only
│   ├── combined.log.1    # Rotated (older)
│   ├── combined.log.2    # Rotated (older)
│   └── ...
```

## Integration with Monitoring Tools

### ELK Stack Example
```bash
# Install Filebeat to ship logs
# Configure filebeat.yml:
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /path/to/backend/logs/*.log
    json.keys_under_root: true
```

### Logstash Example
```ruby
input {
  file {
    path => "/path/to/backend/logs/combined.log"
    codec => "json"
  }
}
```

## Summary

✅ **Winston** handles application logs
✅ **Morgan** handles HTTP request logs  
✅ **File logging** for persistence  
✅ **Console logging** for development  
✅ **Auto-rotation** prevents disk fill  
✅ **JSON format** for easy parsing  
✅ **Environment-based** configuration  
✅ **Security-conscious** (no sensitive data)  

Logs are your best friend for debugging, monitoring, and auditing!
