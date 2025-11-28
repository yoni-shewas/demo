/**
 * Test Case Validator
 * Validates student code against test cases before submission
 */

/**
 * Runs a test case against the student's code
 * Note: This is a simple validation - for production, use sandboxed execution
 */
export function validateTestCases(code, testCases, language = 'javascript') {
  if (!testCases || testCases.length === 0) {
    return { passed: true, results: [], message: 'No test cases to validate' };
  }

  const results = [];
  let allPassed = true;

  for (const testCase of testCases) {
    try {
      // This is a simplified test runner
      // In production, you'd want to run this in a sandboxed environment
      const result = runTest(code, testCase, language);
      results.push(result);
      if (!result.passed) {
        allPassed = false;
      }
    } catch (error) {
      results.push({
        passed: false,
        testCase: testCase.description || 'Unnamed test',
        error: error.message,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error'
      });
      allPassed = false;
    }
  }

  return {
    passed: allPassed,
    results,
    message: allPassed 
      ? `All ${testCases.length} test cases passed!` 
      : `${results.filter(r => r.passed).length}/${testCases.length} test cases passed`
  };
}

/**
 * Run a single test case
 */
function runTest(code, testCase, language) {
  // WARNING: eval is dangerous and should not be used in production
  // This is a simplified example for demonstration
  
  if (language === 'javascript') {
    try {
      // Extract function name from code
      const functionMatch = code.match(/function\s+(\w+)/);
      const functionName = functionMatch ? functionMatch[1] : null;

      if (!functionName) {
        throw new Error('Could not find function in code');
      }

      // Create a safe(r) execution context
      // In production, use Web Workers or iframe sandboxing
      const func = new Function(`
        ${code}
        return ${functionName}(${testCase.input});
      `);

      const actual = func();
      const expected = eval(testCase.expected);
      const passed = String(actual) === String(expected);

      return {
        passed,
        testCase: testCase.description || 'Unnamed test',
        input: testCase.input,
        expected: String(expected),
        actual: String(actual)
      };
    } catch (error) {
      return {
        passed: false,
        testCase: testCase.description || 'Unnamed test',
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error: ' + error.message,
        error: error.message
      };
    }
  }

  // For Python and other languages, you'd need a backend API call
  throw new Error(`Language ${language} not supported for client-side validation`);
}

/**
 * Format test results for display
 */
export function formatTestResults(results) {
  if (!results || results.length === 0) {
    return 'No test results available';
  }

  return results.map((result, index) => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    
    return {
      index: index + 1,
      status,
      color,
      description: result.testCase,
      input: result.input,
      expected: result.expected,
      actual: result.actual,
      error: result.error
    };
  });
}
