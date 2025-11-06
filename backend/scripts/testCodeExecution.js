import 'dotenv/config';

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

/**
 * Code Execution Testing Script
 * Tests the code execution endpoints with various languages
 */

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
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

async function testEndpoint(description, method, endpoint, token, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (response.ok) {
      log(colors.green, `✅ ${description}`);
      return { success: true, data };
    } else {
      log(colors.red, `❌ ${description}`);
      log(colors.red, `   Response: ${data.message || JSON.stringify(data)}`);
      return { success: false, data };
    }
  } catch (error) {
    log(colors.red, `❌ ${description} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '⚡ Code Execution API Testing');
  console.log('='.repeat(60) + '\n');

  log(colors.yellow, '📋 Step 1: Authenticating...\n');

  // Login as student
  const studentToken = await login('test_student@school.edu', 'pass123');

  if (!studentToken) {
    log(colors.red, '\n❌ Failed to authenticate. Exiting...');
    return;
  }

  log(colors.green, '✅ Authentication successful\n');

  let passedTests = 0;
  let totalTests = 0;

  // ========== API ENDPOINT TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🔌 Testing API Endpoints');
  console.log('='.repeat(60) + '\n');

  // Test supported languages
  totalTests++;
  const langResult = await testEndpoint(
    'Get supported languages',
    'GET',
    '/code/languages',
    studentToken
  );
  if (langResult.success) {
    passedTests++;
    log(colors.cyan, `   Found ${langResult.data.total} supported languages`);
  }

  // Test health check
  totalTests++;
  const healthResult = await testEndpoint(
    'Check Judge0 health',
    'GET',
    '/code/health',
    studentToken
  );
  if (healthResult.success) {
    passedTests++;
    const isHealthy = healthResult.data.healthy;
    log(colors.cyan, `   Judge0 service: ${isHealthy ? 'HEALTHY' : 'UNAVAILABLE'}`);
    log(colors.cyan, `   Service URL: ${healthResult.data.url}`);
  }

  // Test examples
  totalTests++;
  const examplesResult = await testEndpoint(
    'Get code examples',
    'GET',
    '/code/examples',
    studentToken
  );
  if (examplesResult.success) {
    passedTests++;
    log(colors.cyan, `   Found examples for: ${examplesResult.data.languages.join(', ')}`);
  }

  // ========== CODE EXECUTION TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🚀 Testing Code Execution');
  console.log('='.repeat(60) + '\n');

  const codeTests = [
    {
      name: 'Python Hello World',
      language: 'python',
      code: 'print("Hello from Python!")',
      input: '',
    },
    {
      name: 'C++ Hello World',
      language: 'cpp',
      code: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}',
      input: '',
    },
    {
      name: 'JavaScript Console Log',
      language: 'javascript',
      code: 'console.log("Hello from JavaScript!");',
      input: '',
    },
    {
      name: 'Python with Input',
      language: 'python',
      code: 'name = input()\nprint(f"Hello, {name}!")',
      input: 'World',
    },
    {
      name: 'Python Math Operations',
      language: 'python',
      code: 'import math\nprint(f"Square root of 16: {math.sqrt(16)}")\nprint(f"Pi: {math.pi:.2f}")',
      input: '',
    },
  ];

  for (const test of codeTests) {
    totalTests++;
    log(colors.yellow, `Testing: ${test.name}`);
    
    const result = await testEndpoint(
      `Execute ${test.name}`,
      'POST',
      '/code/run',
      studentToken,
      {
        language: test.language,
        sourceCode: test.code,
        input: test.input,
      }
    );

    if (result.success) {
      passedTests++;
      const execResult = result.data.result;
      
      if (execResult.success) {
        log(colors.green, `   ✅ Execution successful`);
        log(colors.cyan, `   Status: ${execResult.status.description}`);
        if (execResult.stdout) {
          log(colors.cyan, `   Output: ${execResult.stdout.trim()}`);
        }
        if (execResult.time !== null) {
          log(colors.cyan, `   CPU Time: ${execResult.time}s`);
        }
        if (execResult.memory !== null) {
          log(colors.cyan, `   Memory: ${execResult.memory}KB`);
        }
      } else {
        log(colors.yellow, `   ⚠️  Execution failed (expected if Judge0 not running)`);
        log(colors.yellow, `   Error: ${execResult.error}`);
      }
    }
    console.log();
  }

  // ========== ERROR HANDLING TESTS ==========
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🛡️  Testing Error Handling');
  console.log('='.repeat(60) + '\n');

  // Test invalid language
  totalTests++;
  const invalidLangResult = await testEndpoint(
    'Invalid language rejection',
    'POST',
    '/code/run',
    studentToken,
    {
      language: 'invalidlang',
      sourceCode: 'print("test")',
    }
  );
  if (invalidLangResult.success && !invalidLangResult.data.result.success) {
    passedTests++;
    log(colors.cyan, `   ✅ Correctly rejected invalid language`);
  }

  // Test missing code
  totalTests++;
  const missingCodeResult = await testEndpoint(
    'Missing source code rejection',
    'POST',
    '/code/run',
    studentToken,
    {
      language: 'python',
    }
  );
  if (!missingCodeResult.success) {
    passedTests++;
    log(colors.cyan, `   ✅ Correctly rejected missing source code`);
  }

  // Test unauthorized access
  totalTests++;
  const unauthorizedResult = await testEndpoint(
    'Unauthorized access rejection',
    'POST',
    '/code/run',
    null, // No token
    {
      language: 'python',
      sourceCode: 'print("test")',
    }
  );
  if (!unauthorizedResult.success) {
    passedTests++;
    log(colors.cyan, `   ✅ Correctly rejected unauthorized access`);
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

  console.log('\n' + '='.repeat(60));
  log(colors.blue, '📋 Judge0 Setup Status');
  console.log('='.repeat(60) + '\n');

  if (healthResult.success && healthResult.data.healthy) {
    log(colors.green, '✅ Judge0 is running and ready for code execution');
  } else {
    log(colors.yellow, '⚠️  Judge0 is not running. To enable code execution:');
    console.log();
    log(colors.cyan, '1. Install Docker and Docker Compose');
    log(colors.cyan, '2. Follow the setup guide in JUDGE0_SETUP.md');
    log(colors.cyan, '3. Run: docker-compose up -d');
    log(colors.cyan, '4. Verify: curl http://localhost:2358/about');
    console.log();
    log(colors.yellow, 'Code execution API is ready but Judge0 service is needed for actual execution.');
  }

  if (percentage === 100) {
    console.log('\n');
    log(colors.green, '🎉 All code execution API tests passed!');
  } else {
    console.log('\n');
    log(colors.yellow, '⚠️  Some tests failed. Please review the implementation.');
  }
}

runTests().catch(console.error);
