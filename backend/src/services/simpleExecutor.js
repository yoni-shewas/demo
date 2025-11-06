/**
 * Simple Local Code Executor
 * Lightweight code execution service for trusted LAN environments
 * No Judge0 required - uses local language interpreters/compilers
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import logger from '../config/logger.js';

const execAsync = promisify(exec);

// Temporary directory for code execution
const TEMP_DIR = path.join(process.cwd(), 'temp_code');

// Ensure temp directory exists
await fs.mkdir(TEMP_DIR, { recursive: true }).catch(() => {});

// Language configurations with local executors
const LANGUAGE_CONFIGS = {
  python: {
    id: 71,
    name: 'Python',
    extension: '.py',
    command: (file) => `python3 ${file}`,
    timeout: 5000,
  },
  javascript: {
    id: 63,
    name: 'JavaScript (Node.js)',
    extension: '.js',
    command: (file) => `node ${file}`,
    timeout: 5000,
  },
  cpp: {
    id: 54,
    name: 'C++ (GCC)',
    extension: '.cpp',
    compile: (file, output) => `g++ -o ${output} ${file} -std=c++17`,
    command: (output) => `./${output}`,
    timeout: 10000,
  },
  c: {
    id: 50,
    name: 'C (GCC)',
    extension: '.c',
    compile: (file, output) => `gcc -o ${output} ${file}`,
    command: (output) => `./${output}`,
    timeout: 10000,
  },
  java: {
    id: 62,
    name: 'Java',
    extension: '.java',
    compile: (file) => `javac ${file}`,
    command: (className) => `java ${className}`,
    timeout: 10000,
    requiresClassName: true,
  },
  bash: {
    id: 46,
    name: 'Bash',
    extension: '.sh',
    command: (file) => `bash ${file}`,
    timeout: 5000,
  },
  php: {
    id: 68,
    name: 'PHP',
    extension: '.php',
    command: (file) => `php ${file}`,
    timeout: 5000,
  },
  ruby: {
    id: 72,
    name: 'Ruby',
    extension: '.rb',
    command: (file) => `ruby ${file}`,
    timeout: 5000,
  },
  go: {
    id: 60,
    name: 'Go',
    extension: '.go',
    command: (file) => `go run ${file}`,
    timeout: 10000,
  },
  rust: {
    id: 73,
    name: 'Rust',
    extension: '.rs',
    compile: (file, output) => `rustc ${file} -o ${output}`,
    command: (output) => `./${output}`,
    timeout: 15000,
  },
};

// Map language IDs to language keys
const LANGUAGE_ID_MAP = Object.entries(LANGUAGE_CONFIGS).reduce((acc, [key, config]) => {
  acc[config.id] = key;
  return acc;
}, {});

/**
 * Execute code locally
 */
export async function executeCode(languageId, sourceCode, stdin = '') {
  const startTime = Date.now();
  const languageKey = LANGUAGE_ID_MAP[languageId];
  
  if (!languageKey) {
    throw new Error(`Unsupported language ID: ${languageId}`);
  }

  const config = LANGUAGE_CONFIGS[languageKey];
  const executionId = crypto.randomUUID();
  const workDir = path.join(TEMP_DIR, executionId);

  try {
    // Create working directory
    await fs.mkdir(workDir, { recursive: true });

    // Determine filename
    let filename, className;
    if (config.requiresClassName) {
      // Extract class name from Java code
      const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
      className = classMatch ? classMatch[1] : 'Main';
      filename = `${className}${config.extension}`;
    } else {
      filename = `code${config.extension}`;
    }

    const sourceFile = path.join(workDir, filename);
    const outputFile = path.join(workDir, 'output');

    // Write source code to file
    await fs.writeFile(sourceFile, sourceCode);

    // Write stdin to file if provided
    const stdinFile = path.join(workDir, 'input.txt');
    if (stdin) {
      await fs.writeFile(stdinFile, stdin);
    }

    let stdout = '';
    let stderr = '';
    let compileOutput = '';
    let status = 'Accepted';
    let exitCode = 0;

    // Compile if needed
    if (config.compile) {
      logger.debug(`Compiling ${config.name} code...`);
      try {
        const compileCmd = config.compile(filename, 'output');  // Use relative paths
        const { stdout: cOut, stderr: cErr } = await execAsync(compileCmd, {
          cwd: workDir,
          timeout: config.timeout,
          maxBuffer: 1024 * 1024, // 1MB
        });
        compileOutput = cOut + cErr;
        logger.debug(`Compilation successful`);
      } catch (error) {
        logger.error(`Compilation failed: ${error.message}`);
        return {
          success: false,
          status: 'Compilation Error',
          stdout: null,
          stderr: error.stderr || error.message,
          compileOutput: error.stdout || '',
          time: Date.now() - startTime,
          memory: null,
        };
      }
    }

    // Execute code
    logger.debug(`Executing ${config.name} code...`);
    try {
      const executeCmd = config.compile 
        ? config.command('output')  // Use relative path for compiled binaries
        : config.command(config.requiresClassName ? className : filename);  // Use filename not full path

      const inputRedirect = stdin ? ` < input.txt` : '';  // Use relative path for input too
      const fullCmd = `cd ${workDir} && ${executeCmd}${inputRedirect}`;

      const { stdout: execOut, stderr: execErr } = await execAsync(fullCmd, {
        timeout: config.timeout,
        maxBuffer: 1024 * 1024, // 1MB
        shell: '/bin/bash',
      });

      stdout = execOut;
      stderr = execErr;
      
      logger.debug(`Execution successful`);
    } catch (error) {
      exitCode = error.code || 1;
      stdout = error.stdout || '';
      stderr = error.stderr || error.message;

      if (error.killed && error.signal === 'SIGTERM') {
        status = 'Time Limit Exceeded';
      } else {
        status = 'Runtime Error';
      }

      logger.warn(`Execution failed with status: ${status}`);
    }

    const executionTime = Date.now() - startTime;

    return {
      success: status === 'Accepted',
      status,
      stdout: stdout || null,
      stderr: stderr || null,
      compileOutput: compileOutput || null,
      time: executionTime,
      memory: null, // Memory tracking not available in simple mode
      exitCode,
    };

  } catch (error) {
    logger.error(`Code execution error: ${error.message}`);
    throw error;
  } finally {
    // Cleanup: Delete working directory
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (cleanupError) {
      logger.warn(`Failed to cleanup directory ${workDir}: ${cleanupError.message}`);
    }
  }
}

/**
 * Get list of supported languages
 */
export function getSupportedLanguages() {
  return Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => ({
    id: config.id,
    name: config.name,
    key,
  }));
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(languageId) {
  return languageId in LANGUAGE_ID_MAP;
}

/**
 * Get language config by ID
 */
export function getLanguageConfig(languageId) {
  const languageKey = LANGUAGE_ID_MAP[languageId];
  return languageKey ? LANGUAGE_CONFIGS[languageKey] : null;
}

/**
 * Health check - verify required executors are available
 */
export async function healthCheck() {
  const checks = {
    python: 'python3 --version',
    node: 'node --version',
    gcc: 'gcc --version',
    'g++': 'g++ --version',
  };

  const results = {};

  for (const [name, command] of Object.entries(checks)) {
    try {
      await execAsync(command, { timeout: 2000 });
      results[name] = 'available';
    } catch (error) {
      results[name] = 'not available';
    }
  }

  return {
    healthy: results.python === 'available' || results.node === 'available',
    executors: results,
    tempDir: TEMP_DIR,
  };
}

export default {
  executeCode,
  getSupportedLanguages,
  isLanguageSupported,
  getLanguageConfig,
  healthCheck,
};
