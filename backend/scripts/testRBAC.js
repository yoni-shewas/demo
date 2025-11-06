import 'dotenv/config';

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

/**
 * RBAC Testing Script
 * Tests role-based access control for Admin, Instructor, and Student roles
 */

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEndpoint(description, method, endpoint, token, expectedStatus) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const success = response.status === expectedStatus;

    if (success) {
      log(colors.green, `✅ ${description}`);
      log(colors.blue, `   Expected: ${expectedStatus}, Got: ${response.status}`);
    } else {
      log(colors.red, `❌ ${description}`);
      log(colors.red, `   Expected: ${expectedStatus}, Got: ${response.status}`);
      const data = await response.json();
      console.log('   Response:', data);
    }

    return success;
  } catch (error) {
    log(colors.red, `❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    log(colors.red, `Login failed for ${email}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🔒 RBAC (Role-Based Access Control) Testing');
  console.log('='.repeat(60) + '\n');

  log(colors.yellow, '📋 Step 1: Authenticating users...\n');

  // Login as different roles
  const adminToken = await login('admin@school.edu', 'admin123');
  const instructorToken = await login('test_instructor@school.edu', 'password123');
  const studentToken = await login('test_student@school.edu', 'pass123');

  if (!adminToken || !instructorToken || !studentToken) {
    log(colors.red, '\n❌ Failed to authenticate all users. Exiting...');
    log(colors.yellow, '\n💡 Make sure users exist in database and server is running.');
    return;
  }

  log(colors.green, '✅ All users authenticated successfully\n');

  let passedTests = 0;
  let totalTests = 0;

  // ========== ADMIN TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '👮 Testing ADMIN Role');
  console.log('='.repeat(60) + '\n');

  totalTests++;
  if (await testEndpoint('Admin can access /api/admin/users', 'GET', '/admin/users', adminToken, 200)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Admin CANNOT access /api/instructor/profile', 'GET', '/instructor/profile', adminToken, 403)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Admin CANNOT access /api/student/profile', 'GET', '/student/profile', adminToken, 403)) {
    passedTests++;
  }

  // ========== INSTRUCTOR TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '👨‍🏫 Testing INSTRUCTOR Role');
  console.log('='.repeat(60) + '\n');

  totalTests++;
  if (await testEndpoint('Instructor can access /api/instructor/profile', 'GET', '/instructor/profile', instructorToken, 200)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Instructor can access /api/instructor/assignments', 'GET', '/instructor/assignments', instructorToken, 200)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Instructor CANNOT access /api/admin/users', 'GET', '/admin/users', instructorToken, 403)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Instructor CANNOT access /api/student/submissions', 'GET', '/student/submissions', instructorToken, 403)) {
    passedTests++;
  }

  // ========== STUDENT TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🎓 Testing STUDENT Role');
  console.log('='.repeat(60) + '\n');

  totalTests++;
  if (await testEndpoint('Student can access /api/student/profile', 'GET', '/student/profile', studentToken, 200)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Student can access /api/student/assignments', 'GET', '/student/assignments', studentToken, 200)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Student can access /api/student/submissions', 'GET', '/student/submissions', studentToken, 200)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Student CANNOT access /api/admin/users', 'GET', '/admin/users', studentToken, 403)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('Student CANNOT access /api/instructor/assignments', 'GET', '/instructor/assignments', studentToken, 403)) {
    passedTests++;
  }

  // ========== NO AUTH TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🚫 Testing Unauthenticated Access');
  console.log('='.repeat(60) + '\n');

  totalTests++;
  if (await testEndpoint('No token CANNOT access /api/admin/users', 'GET', '/admin/users', null, 401)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('No token CANNOT access /api/instructor/profile', 'GET', '/instructor/profile', null, 401)) {
    passedTests++;
  }

  totalTests++;
  if (await testEndpoint('No token CANNOT access /api/student/profile', 'GET', '/student/profile', null, 401)) {
    passedTests++;
  }

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '📊 Test Summary');
  console.log('='.repeat(60) + '\n');

  const percentage = Math.round((passedTests / totalTests) * 100);
  log(colors.blue, `Total Tests: ${totalTests}`);
  log(colors.green, `Passed: ${passedTests}`);
  log(colors.red, `Failed: ${totalTests - passedTests}`);
  log(percentage === 100 ? colors.green : colors.yellow, `Success Rate: ${percentage}%`);

  if (percentage === 100) {
    console.log('\n');
    log(colors.green, '🎉 All RBAC tests passed! Role-based access control is working correctly.');
  } else {
    console.log('\n');
    log(colors.yellow, '⚠️  Some tests failed. Please review the RBAC implementation.');
  }

  console.log('\n');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log(colors.red, '\n❌ Server is not running!');
    log(colors.yellow, `💡 Start the server first: npm run dev`);
    log(colors.yellow, `   Server should be running on: http://localhost:${process.env.PORT || 3000}\n`);
    process.exit(1);
  }

  await runTests();
})();
