import axios from 'axios';
import logger from '../config/logger.js';

/**
 * Execute code against test cases
 * Uses the existing code execution endpoint
 */
export async function executeCodeWithTests(code, language, testCases) {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const executionResult = await executeCode(code, language, testCase.input);
      
      const testResult = {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: executionResult.output?.trim(),
        passed: executionResult.output?.trim() === testCase.expectedOutput?.trim(),
        error: executionResult.error,
        executionTime: executionResult.executionTime,
      };

      if (testResult.passed) {
        passed++;
      } else {
        failed++;
      }

      results.push(testResult);
    } catch (error) {
      logger.error('Test case execution error:', error);
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        passed: false,
        error: error.message || 'Execution failed',
      });
      failed++;
    }
  }

  return {
    results,
    passed,
    failed,
    total: testCases.length,
    allPassed: passed === testCases.length,
    score: (passed / testCases.length) * 100,
  };
}

/**
 * Execute single code snippet
 * Uses the internal code execution service
 */
async function executeCode(code, language, input = '') {
  try {
    // Use the local code execution endpoint
    const response = await axios.post('http://localhost:3000/api/code/run', {
      language,
      sourceCode: code,
      input: input || undefined,
    }, {
      timeout: 30000, // 30 second timeout for test execution
    });

    if (response.data.success) {
      const result = response.data.result;
      return {
        output: result.stdout || '',
        error: result.stderr || result.compile_output || null,
        executionTime: result.time || response.data.executionTime || null,
      };
    } else {
      return {
        output: '',
        error: response.data.error || response.data.message || 'Execution failed',
        executionTime: null,
      };
    }
  } catch (error) {
    if (error.response?.data) {
      return {
        output: '',
        error: error.response.data.error || error.response.data.message || 'Execution failed',
        executionTime: null,
      };
    }
    throw error;
  }
}

/**
 * Validate solution code against all test cases (public + hidden)
 * Used when instructor creates/updates assignment
 */
export async function validateSolutionCode(solutionCode, testCases, hiddenTestCases) {
  const allTests = [...testCases, ...(hiddenTestCases || [])];
  
  if (!solutionCode || !solutionCode.code) {
    return {
      valid: false,
      error: 'Solution code is required',
    };
  }

  if (allTests.length === 0) {
    return {
      valid: false,
      error: 'At least one test case is required',
    };
  }

  try {
    const result = await executeCodeWithTests(
      solutionCode.code,
      solutionCode.language,
      allTests
    );

    if (!result.allPassed) {
      return {
        valid: false,
        error: `Solution code failed ${result.failed} out of ${result.total} test cases`,
        results: result.results,
      };
    }

    return {
      valid: true,
      message: `Solution passed all ${result.total} test cases`,
      results: result.results,
    };
  } catch (error) {
    logger.error('Solution validation error:', error);
    return {
      valid: false,
      error: error.message || 'Failed to validate solution code',
    };
  }
}

/**
 * Run student code against visible test cases only
 * Used for "Run Tests" feature before submission
 */
export async function runPublicTests(code, language, testCases) {
  try {
    return await executeCodeWithTests(code, language, testCases);
  } catch (error) {
    logger.error('Public test execution error:', error);
    throw error;
  }
}

/**
 * Run student code against all test cases (public + hidden)
 * Used for final submission grading
 */
export async function runAllTests(code, language, testCases, hiddenTestCases) {
  const allTests = [...testCases, ...(hiddenTestCases || [])];
  
  try {
    return await executeCodeWithTests(code, language, allTests);
  } catch (error) {
    logger.error('Full test execution error:', error);
    throw error;
  }
}

export default {
  executeCodeWithTests,
  validateSolutionCode,
  runPublicTests,
  runAllTests,
};
