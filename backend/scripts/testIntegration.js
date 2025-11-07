#!/usr/bin/env node

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testLogin() {
  console.log('\nTest 1: Authentication');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@school.edu',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('  ✓ Login successful');
    return data.token;
  } catch (error) {
    console.log('  ✗ Login failed:', error.message);
    throw error;
  }
}

async function testCodeExecution(token) {
  console.log('\nTest 2: Code Execution');
  try {
    const response = await fetch(`${BASE_URL}/api/code/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        language: 'python',
        sourceCode: 'print("Hello, World!")'
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Execution failed: ' + JSON.stringify(data));
    }

    console.log('  ✓ Code execution successful');
    console.log(`  ✓ Execution time: ${data.result.execution_time}ms`);
    console.log(`  ✓ Queue info: ${data.queueInfo.running} running, ${data.queueInfo.queued} queued`);
    return data;
  } catch (error) {
    console.log('  ✗ Code execution failed:', error.message);
    throw error;
  }
}

async function testQueueStats(token) {
  console.log('\nTest 3: Queue Statistics');
  try {
    const response = await fetch(`${BASE_URL}/api/code/queue-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to get queue stats');
    }

    console.log('  ✓ Queue stats retrieved');
    console.log(`  ✓ Max capacity: ${data.queue.status.maxConcurrent}`);
    console.log(`  ✓ Available slots: ${data.queue.status.available}`);
    console.log(`  ✓ Health: ${data.queue.health.message}`);
    return data;
  } catch (error) {
    console.log('  ✗ Queue stats failed:', error.message);
    throw error;
  }
}

async function testLanguagesList(token) {
  console.log('\nTest 4: Supported Languages');
  try {
    const response = await fetch(`${BASE_URL}/api/code/languages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to get languages');
    }

    console.log('  ✓ Languages retrieved');
    console.log(`  ✓ Total languages: ${data.total}`);
    return data;
  } catch (error) {
    console.log('  ✗ Languages list failed:', error.message);
    throw error;
  }
}

async function testHealth() {
  console.log('\nTest 5: Service Health');
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error('Service unhealthy');
    }

    console.log('  ✓ Service healthy');
    console.log(`  ✓ Database: ${data.db}`);
    console.log(`  ✓ Environment: ${data.environment}`);
    return data;
  } catch (error) {
    console.log('  ✗ Health check failed:', error.message);
    throw error;
  }
}

async function runIntegrationTests() {
  console.log('\n=== Integration Tests ===');
  console.log(`Target: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  try {
    await testHealth();
    passed++;
  } catch (error) {
    failed++;
  }

  let token;
  try {
    token = await testLogin();
    passed++;
  } catch (error) {
    failed++;
    console.log('\n✗ Cannot continue without authentication');
    process.exit(1);
  }

  try {
    await testCodeExecution(token);
    passed++;
  } catch (error) {
    failed++;
  }

  try {
    await testQueueStats(token);
    passed++;
  } catch (error) {
    failed++;
  }

  try {
    await testLanguagesList(token);
    passed++;
  } catch (error) {
    failed++;
  }

  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}/5`);
  console.log(`Failed: ${failed}/5`);

  if (failed === 0) {
    console.log('\n✓ All tests passed\n');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed\n');
    process.exit(1);
  }
}

runIntegrationTests().catch(error => {
  console.error('\nTest suite failed:', error.message);
  process.exit(1);
});
