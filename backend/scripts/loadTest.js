#!/usr/bin/env node

/**
 * Load Testing Script for CodeLan LMS
 * Tests system performance under concurrent load
 * Tests authentication, RBAC, code execution, and error handling
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 10;
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER) || 20;
const DELAY_BETWEEN_REQUESTS = parseInt(process.env.DELAY_BETWEEN_REQUESTS) || 100; // ms

// Test credentials
const USERS = {
  admin: { email: 'admin@school.edu', password: 'admin123' },
  instructor: { email: 'teacher1@school.edu', password: 'ohF4&62VBaA$' },
  student: { email: 'student@test.com', password: 'test123' },
};

// Statistics
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  authErrors: 0,
  serverErrors: 0,
  rateLimitErrors: 0,
  totalResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  startTime: null,
  endTime: null,
};

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Make authenticated request
async function makeRequest(method, endpoint, data, token) {
  const startTime = Date.now();
  stats.totalRequests++;

  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      ...(data && { data }),
      timeout: 10000,
    };

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    stats.successfulRequests++;
    stats.totalResponseTime += responseTime;
    stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
    stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);

    return { success: true, data: response.data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    stats.failedRequests++;

    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) stats.authErrors++;
      else if (status === 429) stats.rateLimitErrors++;
      else if (status >= 500) stats.serverErrors++;
    }

    return { success: false, error: error.message, responseTime };
  }
}

// Login and get token
async function login(email, password) {
  const result = await makeRequest('POST', '/auth/login', { email, password });
  return result.success ? result.data.token : null;
}

// Simulate user session
async function simulateUser(userId, userType) {
  log(`[User ${userId}] Starting ${userType} session...`, 'cyan');

  const credentials = USERS[userType];
  const token = await login(credentials.email, credentials.password);

  if (!token) {
    log(`[User ${userId}] Login failed`, 'red');
    return;
  }

  log(`[User ${userId}] Logged in successfully`, 'green');

  // Simulate various actions based on user type
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    await sleep(DELAY_BETWEEN_REQUESTS);

    if (userType === 'admin') {
      // Admin actions
      await makeRequest('GET', '/admin/users', null, token);
    } else if (userType === 'instructor') {
      // Instructor actions
      const actions = [
        () => makeRequest('GET', '/instructor/profile', null, token),
        () => makeRequest('GET', '/instructor/sections', null, token),
        () => makeRequest('GET', '/instructor/lessons', null, token),
        () => makeRequest('GET', '/instructor/assignments', null, token),
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      await action();
    } else if (userType === 'student') {
      // Student actions
      const actions = [
        () => makeRequest('GET', '/student/profile', null, token),
        () => makeRequest('GET', '/student/lessons', null, token),
        () => makeRequest('GET', '/student/assignments', null, token),
        () => makeRequest('GET', '/student/submissions', null, token),
        () => makeRequest('POST', '/code/run', {
          language: 'python',
          sourceCode: 'print("Load test")',
        }, token),
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      await action();
    }
  }

  log(`[User ${userId}] Session completed`, 'green');
}

// Run load test
async function runLoadTest() {
  log('\n========================================', 'blue');
  log('   CodeLan LMS Load Testing', 'blue');
  log('========================================', 'blue');
  log(`\nConfiguration:`, 'yellow');
  log(`  Concurrent Users: ${CONCURRENT_USERS}`);
  log(`  Requests per User: ${REQUESTS_PER_USER}`);
  log(`  Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  log(`  Delay between requests: ${DELAY_BETWEEN_REQUESTS}ms`);
  log(`  API Base URL: ${API_BASE_URL}\n`);

  // Check if server is running
  try {
    await axios.get(API_BASE_URL.replace('/api', '/health'));
    log('✅ Server is reachable\n', 'green');
  } catch (error) {
    log('❌ Server is not reachable. Please start the server first.\n', 'red');
    process.exit(1);
  }

  stats.startTime = Date.now();

  log('Starting load test...\n', 'cyan');

  // Create concurrent user sessions
  const userPromises = [];
  const userTypes = ['admin', 'instructor', 'student'];

  for (let i = 0; i < CONCURRENT_USERS; i++) {
    const userType = userTypes[i % userTypes.length];
    userPromises.push(simulateUser(i + 1, userType));
  }

  // Wait for all users to complete
  await Promise.all(userPromises);

  stats.endTime = Date.now();

  // Print results
  printResults();
}

function printResults() {
  const duration = (stats.endTime - stats.startTime) / 1000;
  const avgResponseTime = stats.totalResponseTime / stats.successfulRequests || 0;
  const requestsPerSecond = stats.totalRequests / duration;
  const successRate = (stats.successfulRequests / stats.totalRequests * 100).toFixed(2);

  log('\n========================================', 'blue');
  log('   Load Test Results', 'blue');
  log('========================================', 'blue');

  log('\n📊 Request Statistics:', 'yellow');
  log(`  Total Requests: ${stats.totalRequests}`);
  log(`  Successful: ${stats.successfulRequests}`, 'green');
  log(`  Failed: ${stats.failedRequests}`, stats.failedRequests > 0 ? 'red' : 'reset');
  log(`  Success Rate: ${successRate}%`, successRate >= 95 ? 'green' : 'yellow');

  log('\n⏱️  Response Times:', 'yellow');
  log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
  log(`  Minimum: ${stats.minResponseTime}ms`);
  log(`  Maximum: ${stats.maxResponseTime}ms`);

  log('\n🚀 Performance:', 'yellow');
  log(`  Duration: ${duration.toFixed(2)}s`);
  log(`  Requests/Second: ${requestsPerSecond.toFixed(2)}`);

  log('\n❌ Errors:', 'yellow');
  log(`  Auth Errors (401/403): ${stats.authErrors}`, stats.authErrors > 0 ? 'red' : 'reset');
  log(`  Rate Limit (429): ${stats.rateLimitErrors}`, stats.rateLimitErrors > 0 ? 'yellow' : 'reset');
  log(`  Server Errors (5xx): ${stats.serverErrors}`, stats.serverErrors > 0 ? 'red' : 'reset');

  log('\n🎯 Performance Assessment:', 'yellow');
  if (successRate >= 99 && avgResponseTime < 500) {
    log('  ✅ EXCELLENT - System performing optimally', 'green');
  } else if (successRate >= 95 && avgResponseTime < 1000) {
    log('  ✅ GOOD - System performing well', 'green');
  } else if (successRate >= 90) {
    log('  ⚠️  ACCEPTABLE - Some performance issues detected', 'yellow');
  } else {
    log('  ❌ POOR - Significant performance problems', 'red');
  }

  if (stats.rateLimitErrors > 0) {
    log('\n  ℹ️  Rate limiting is working as expected', 'cyan');
  }

  log('\n========================================\n', 'blue');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the test
runLoadTest().catch((error) => {
  log(`\n❌ Load test failed: ${error.message}`, 'red');
  process.exit(1);
});
