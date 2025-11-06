import logger from '../config/logger.js';
import * as simpleExecutor from './simpleExecutor.js';

// Execution mode: 'simple' or 'judge0'
const EXECUTION_MODE = process.env.CODE_EXECUTION_MODE || 'simple';

// Judge0 API Configuration
const JUDGE0_BASE_URL = process.env.JUDGE0_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || null;

// Language IDs for Judge0 (commonly used ones)
export const SUPPORTED_LANGUAGES = {
  // C/C++
  c: 50,           // C (GCC 9.2.0)
  cpp: 54,         // C++ (GCC 9.2.0)
  'c++': 54,
  
  // Python
  python: 71,      // Python (3.8.1)
  python3: 71,
  py: 71,
  
  // Java
  java: 62,        // Java (OpenJDK 13.0.1)
  
  // JavaScript
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  js: 63,
  node: 63,
  
  // Other popular languages
  php: 68,         // PHP (7.4.1)
  ruby: 72,        // Ruby (2.7.0)
  go: 60,          // Go (1.13.5)
  rust: 73,        // Rust (1.40.0)
  kotlin: 78,      // Kotlin (1.3.70)
  swift: 83,       // Swift (5.2.3)
  csharp: 51,      // C# (Mono 6.6.0.161)
  'c#': 51,
};

/**
 * Get language ID for Judge0
 * @param {string} language - Language name or extension
 * @returns {number|null} Judge0 language ID
 */
export function getLanguageId(language) {
  if (!language) return null;
  
  const normalizedLang = language.toLowerCase().trim();
  return SUPPORTED_LANGUAGES[normalizedLang] || null;
}

/**
 * Get supported languages list
 * @returns {Object} Object with language names and IDs
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Submit code to Judge0 for execution
 * @param {number} languageId - Judge0 language ID
 * @param {string} sourceCode - Source code to execute
 * @param {string} stdin - Input for the program (optional)
 * @param {number} timeLimit - Time limit in seconds (default: 5)
 * @param {number} memoryLimit - Memory limit in KB (default: 128000)
 * @returns {Promise<string>} Submission token
 */
async function submitCode(languageId, sourceCode, stdin = '', timeLimit = 5, memoryLimit = 128000) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (JUDGE0_API_KEY) {
      headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
    }

    const payload = {
      language_id: languageId,
      source_code: sourceCode,
      stdin: stdin || '',
      cpu_time_limit: timeLimit,
      memory_limit: memoryLimit,
    };

    logger.debug('Submitting code to Judge0:', {
      languageId,
      codeLength: sourceCode.length,
      hasInput: !!stdin,
    });

    const response = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 submission failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    logger.debug('Code submitted to Judge0:', { token: result.token });
    
    return result.token;
  } catch (error) {
    logger.error('Error submitting code to Judge0:', error);
    throw new Error(`Failed to submit code: ${error.message}`);
  }
}

/**
 * Get submission result from Judge0
 * @param {string} token - Submission token
 * @returns {Promise<Object>} Submission result
 */
async function getSubmissionResult(token) {
  try {
    const headers = {};
    
    // Add API key if provided
    if (JUDGE0_API_KEY) {
      headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
    }

    const response = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 get result failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    logger.error('Error getting submission result from Judge0:', error);
    throw new Error(`Failed to get result: ${error.message}`);
  }
}

/**
 * Poll for submission result until completion
 * @param {string} token - Submission token
 * @param {number} maxAttempts - Maximum polling attempts (default: 30)
 * @param {number} interval - Polling interval in ms (default: 1000)
 * @returns {Promise<Object>} Final submission result
 */
async function pollForResult(token, maxAttempts = 30, interval = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await getSubmissionResult(token);
      
      // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, etc.
      if (result.status.id <= 2) {
        // Still processing
        logger.debug(`Polling attempt ${attempt}/${maxAttempts}, status: ${result.status.description}`);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
          continue;
        } else {
          throw new Error('Code execution timeout - taking too long to complete');
        }
      }
      
      // Execution completed
      logger.debug('Code execution completed:', {
        token,
        status: result.status.description,
        time: result.time,
        memory: result.memory,
      });
      
      return result;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      logger.warn(`Polling attempt ${attempt} failed, retrying:`, error.message);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error('Maximum polling attempts reached');
}

/**
 * Run code using configured execution engine (simple or Judge0)
 * @param {string} language - Programming language
 * @param {string} sourceCode - Source code to execute
 * @param {string} input - Input for the program (optional)
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Execution result
 */
export async function runCode(language, sourceCode, input = '', options = {}) {
  try {
    // Validate inputs
    if (!language || !sourceCode) {
      throw new Error('Language and source code are required');
    }

    // Get language ID
    const languageId = getLanguageId(language);
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`);
    }

    // Validate code length (prevent abuse)
    if (sourceCode.length > 50000) {
      throw new Error('Source code too long (max 50,000 characters)');
    }

    // Validate input length
    if (input && input.length > 10000) {
      throw new Error('Input too long (max 10,000 characters)');
    }

    // Use simple executor or Judge0 based on configuration
    if (EXECUTION_MODE === 'simple') {
      logger.info(`Executing code using Simple Executor (${language})`);
      return await runCodeSimple(language, languageId, sourceCode, input, options);
    } else {
      logger.info(`Executing code using Judge0 (${language})`);
      return await runCodeJudge0(language, languageId, sourceCode, input, options);
    }
  } catch (error) {
    logger.error('Code execution failed:', error);
    
    return {
      success: false,
      error: error.message,
      status: {
        id: -1,
        description: 'Execution Error',
      },
      stdout: '',
      stderr: error.message,
      compile_output: '',
      time: null,
      memory: null,
      execution_time: null,
      language: language,
      language_id: getLanguageId(language),
      token: null,
    };
  }
}

/**
 * Run code using Simple Executor (local execution)
 */
async function runCodeSimple(language, languageId, sourceCode, input, options) {
  const startTime = Date.now();
  
  const result = await simpleExecutor.executeCode(languageId, sourceCode, input);
  const executionTime = Date.now() - startTime;

  // Format response to match Judge0 format
  const response = {
    success: result.success,
    status: {
      id: result.success ? 3 : -1,
      description: result.status,
    },
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    compile_output: result.compileOutput || '',
    time: result.time ? result.time / 1000 : null, // Convert to seconds
    memory: result.memory,
    execution_time: executionTime,
    language: language,
    language_id: languageId,
    token: null,
    mode: 'simple',
  };

  logger.info('Code execution completed (simple):', {
    language,
    status: result.status,
    executionTime: `${executionTime}ms`,
    hasOutput: !!result.stdout,
    hasErrors: !!result.stderr,
  });

  return response;
}

/**
 * Run code using Judge0 (remote execution)
 */
async function runCodeJudge0(language, languageId, sourceCode, input, options) {
  const startTime = Date.now();
    
  // Submit code for execution
  const token = await submitCode(
    languageId,
    sourceCode,
    input,
    options.timeLimit || 5,
    options.memoryLimit || 128000
  );

  // Poll for result
  const result = await pollForResult(token, options.maxAttempts || 30, options.pollInterval || 1000);
  
  const executionTime = Date.now() - startTime;

  // Format response
  const response = {
    success: true,
    status: {
      id: result.status.id,
      description: result.status.description,
    },
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    compile_output: result.compile_output || '',
    time: result.time, // CPU time in seconds
    memory: result.memory, // Memory in KB
    execution_time: executionTime, // Total time including network
    language: language,
    language_id: languageId,
    token: token,
    mode: 'judge0',
  };

  // Log execution details
  logger.info('Code execution completed (Judge0):', {
    language,
    status: result.status.description,
    executionTime: `${executionTime}ms`,
    cpuTime: `${result.time}s`,
    memory: `${result.memory}KB`,
    hasOutput: !!result.stdout,
    hasErrors: !!result.stderr,
  });

  return response;
}

/**
 * Check if Judge0 service is available
 * @returns {Promise<boolean>} Service availability
 */
export async function checkJudge0Health() {
  try {
    const response = await fetch(`${JUDGE0_BASE_URL}/about`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      const info = await response.json();
      logger.info('Judge0 service is available:', info);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.warn('Judge0 service health check failed:', error.message);
    return false;
  }
}

/**
 * Get Judge0 service information
 * @returns {Promise<Object>} Service information
 */
export async function getJudge0Info() {
  try {
    const response = await fetch(`${JUDGE0_BASE_URL}/about`);
    
    if (response.ok) {
      return await response.json();
    }
    
    throw new Error(`Failed to get Judge0 info: ${response.status}`);
  } catch (error) {
    logger.error('Error getting Judge0 info:', error);
    throw error;
  }
}
