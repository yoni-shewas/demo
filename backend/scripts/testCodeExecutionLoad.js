#!/usr/bin/env node

/**
 * Code Execution Load Test
 * Tests concurrent execution with 100+ requests
 * Measures: parallelism, min/max/avg times, throughput
 */

// Node.js 18+ has built-in fetch, no import needed

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const NUM_REQUESTS = parseInt(process.env.NUM_REQUESTS) || 100;
const CONCURRENCY = parseInt(process.env.CONCURRENCY) || 10; // Batch size

// Realistic Python code examples
const PYTHON_SAMPLES = [
  {
    name: 'Fibonacci Calculator',
    code: `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

for i in range(1, 15):
    print(f"F({i}) = {fibonacci(i)}")`,
  },
  {
    name: 'Prime Number Finder',
    code: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

primes = [n for n in range(2, 100) if is_prime(n)]
print(f"Found {len(primes)} primes: {primes}")`,
  },
  {
    name: 'String Processing',
    code: `text = "The quick brown fox jumps over the lazy dog"
words = text.split()

# Word analysis
print(f"Total words: {len(words)}")
print(f"Longest word: {max(words, key=len)}")
print(f"Shortest word: {min(words, key=len)}")

# Character frequency
chars = {}
for char in text.lower():
    if char.isalpha():
        chars[char] = chars.get(char, 0) + 1

print(f"\\nCharacter frequencies:")
for char, count in sorted(chars.items()):
    print(f"  {char}: {count}")`,
  },
  {
    name: 'List Sorting & Operations',
    code: `import random

# Generate random numbers
numbers = [random.randint(1, 100) for _ in range(20)]
print(f"Original: {numbers}")

# Various operations
print(f"Sorted: {sorted(numbers)}")
print(f"Reversed: {sorted(numbers, reverse=True)}")
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers) / len(numbers):.2f}")
print(f"Min: {min(numbers)}, Max: {max(numbers)}")`,
  },
  {
    name: 'Dictionary Operations',
    code: `students = {
    "Alice": [85, 90, 92],
    "Bob": [78, 82, 88],
    "Charlie": [92, 95, 98],
    "Diana": [88, 86, 90]
}

print("Student Grade Report:")
print("-" * 40)

for student, grades in students.items():
    avg = sum(grades) / len(grades)
    print(f"{student}: {grades} -> Avg: {avg:.2f}")

# Find top student
top = max(students.items(), key=lambda x: sum(x[1]) / len(x[1]))
print(f"\\nTop Student: {top[0]} with {sum(top[1]) / len(top[1]):.2f}")`,
  },
];

// Statistics calculation
function calculateStats(times) {
  if (times.length === 0) return null;

  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
    p90: sorted[Math.floor(sorted.length * 0.90)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

// No login needed in TEST_MODE - authentication is bypassed

// Execute a single code request (no auth needed in TEST_MODE)
async function executeCode(language, sourceCode, requestId) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/code/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, sourceCode }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      return {
        requestId,
        success: false,
        error: `HTTP ${response.status}`,
        duration,
      };
    }

    const data = await response.json();
    
    return {
      requestId,
      success: data.success,
      status: data.result?.status?.description || 'Unknown',
      duration,
      executionTime: data.result?.execution_time || 0,
      mode: data.result?.mode || 'unknown',
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      requestId,
      success: false,
      error: error.message,
      duration: endTime - startTime,
    };
  }
}

// Run batch of requests with limited concurrency
async function runBatch(requests, batchSize) {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(({ id, language, code }) => 
        executeCode(language, code, id)
      )
    );
    results.push(...batchResults);
    
    // Progress indicator
    process.stdout.write(`\r⏳ Progress: ${Math.min(i + batchSize, requests.length)}/${requests.length} requests`);
  }
  
  console.log(); // New line after progress
  return results;
}

// Main test function
async function runLoadTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    Code Execution Load Test - Concurrent Performance        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Test Configuration:`);
  console.log(`   - Total Requests: ${NUM_REQUESTS}`);
  console.log(`   - Concurrency (batch size): ${CONCURRENCY}`);
  console.log(`   - Target: ${BASE_URL}`);
  console.log(`   - Language: Python (realistic examples)`);
  console.log(`   - Mode: TEST_MODE (bypass auth & rate limits)\n`);

  // Prepare requests (distribute samples evenly)
  console.log('📝 Preparing test requests...');
  const requests = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const sample = PYTHON_SAMPLES[i % PYTHON_SAMPLES.length];
    requests.push({
      id: i + 1,
      language: 'python',
      code: sample.code,
      sampleName: sample.name,
    });
  }
  console.log(`✅ Generated ${NUM_REQUESTS} requests\n`);

  // Run load test
  console.log('🚀 Starting load test with execution queue (max 100 concurrent)...\n');
  const overallStart = Date.now();
  
  const results = await runBatch(requests, CONCURRENCY);
  
  const overallEnd = Date.now();
  const totalDuration = overallEnd - overallStart;

  console.log('\n✅ Load test completed!\n');

  // Analyze results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const totalTimes = results.map(r => r.duration);
  const executionTimes = successful.map(r => r.executionTime);
  
  const stats = calculateStats(totalTimes);
  const execStats = calculateStats(executionTimes);

  // Print results
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                       TEST RESULTS                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('📈 Overall Performance:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`   Total Requests:        ${NUM_REQUESTS}`);
  console.log(`   Successful:            ${successful.length} (${(successful.length/NUM_REQUESTS*100).toFixed(1)}%)`);
  console.log(`   Failed:                ${failed.length} (${(failed.length/NUM_REQUESTS*100).toFixed(1)}%)`);
  console.log(`   Total Test Duration:   ${(totalDuration/1000).toFixed(2)}s`);
  console.log(`   Throughput:            ${(NUM_REQUESTS / (totalDuration/1000)).toFixed(2)} req/s`);
  console.log(`   Concurrency Level:     ${CONCURRENCY} parallel requests`);
  console.log();

  console.log('⏱️  Request Time Statistics (End-to-End):');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`   Fastest Request:       ${stats.min}ms`);
  console.log(`   Slowest Request:       ${stats.max}ms`);
  console.log(`   Average Time:          ${stats.avg.toFixed(2)}ms`);
  console.log(`   Median (P50):          ${stats.median}ms`);
  console.log(`   75th Percentile:       ${stats.p75}ms`);
  console.log(`   90th Percentile:       ${stats.p90}ms`);
  console.log(`   95th Percentile:       ${stats.p95}ms`);
  console.log(`   99th Percentile:       ${stats.p99}ms`);
  console.log();

  console.log('🔧 Code Execution Time (Server-side only):');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`   Fastest Execution:     ${execStats.min}ms`);
  console.log(`   Slowest Execution:     ${execStats.max}ms`);
  console.log(`   Average Execution:     ${execStats.avg.toFixed(2)}ms`);
  console.log(`   Median Execution:      ${execStats.median}ms`);
  console.log();

  console.log('🎯 Parallelism Analysis:');
  console.log('─────────────────────────────────────────────────────────');
  const theoreticalSerial = successful.reduce((sum, r) => sum + r.executionTime, 0);
  const parallelSpeedup = theoreticalSerial / totalDuration;
  const parallelEfficiency = (parallelSpeedup / CONCURRENCY) * 100;
  
  console.log(`   Serial Time (theoretical): ${(theoreticalSerial/1000).toFixed(2)}s`);
  console.log(`   Parallel Time (actual):    ${(totalDuration/1000).toFixed(2)}s`);
  console.log(`   Speedup Factor:            ${parallelSpeedup.toFixed(2)}x`);
  console.log(`   Parallel Efficiency:       ${parallelEfficiency.toFixed(1)}%`);
  console.log(`   Effective Parallelism:     ~${Math.floor(parallelSpeedup)} concurrent tasks`);
  console.log();

  // Sample breakdown by type
  console.log('📊 Performance by Code Sample:');
  console.log('─────────────────────────────────────────────────────────');
  
  const sampleGroups = {};
  requests.forEach((req, idx) => {
    if (!sampleGroups[req.sampleName]) {
      sampleGroups[req.sampleName] = [];
    }
    if (results[idx].success) {
      sampleGroups[req.sampleName].push(results[idx].executionTime);
    }
  });

  Object.entries(sampleGroups).forEach(([name, times]) => {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`   ${name.padEnd(30)} ${avg.toFixed(2)}ms avg (${times.length} runs)`);
  });
  console.log();

  // Error details if any
  if (failed.length > 0) {
    console.log('❌ Failed Requests:');
    console.log('─────────────────────────────────────────────────────────');
    const errorGroups = {};
    failed.forEach(f => {
      const key = f.error || f.status || 'Unknown';
      errorGroups[key] = (errorGroups[key] || 0) + 1;
    });
    Object.entries(errorGroups).forEach(([error, count]) => {
      console.log(`   ${error}: ${count} occurrences`);
    });
    console.log();
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST COMPLETE                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Summary recommendations
  console.log('💡 Key Insights:\n');
  
  if (stats.max > 5000) {
    console.log('   ⚠️  Some requests took longer than 5s - consider optimization');
  } else if (stats.max < 1000) {
    console.log('   ✅ All requests completed quickly (<1s) - excellent performance!');
  } else {
    console.log('   ✅ Response times are reasonable for production use');
  }

  if (parallelSpeedup > CONCURRENCY * 0.7) {
    console.log('   ✅ Good parallelism - system handles concurrent load well');
  } else {
    console.log('   ⚠️  Limited parallelism - may have bottlenecks');
  }

  if (failed.length === 0) {
    console.log('   ✅ Perfect success rate - no errors under load!');
  } else if (failed.length < NUM_REQUESTS * 0.01) {
    console.log('   ⚠️  <1% error rate - acceptable but monitor for issues');
  } else {
    console.log('   ❌ High error rate - investigate system capacity');
  }

  console.log();
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run the test
runLoadTest().catch(error => {
  console.error('\n❌ Load test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
