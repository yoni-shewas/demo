import { runCode, getSupportedLanguages, checkJudge0Health, getJudge0Info } from '../services/codeRunner.js';
import logger from '../config/logger.js';
import { PrismaClient } from '@prisma/client';
import executionQueue from '../services/executionQueue.js';

const prisma = new PrismaClient();

/**
 * Execute code using Judge0
 * POST /api/code/run
 */
export async function executeCode(req, res) {
  try {
    const userId = req.user.userId;
    const { language, sourceCode, input, options = {} } = req.body;

    // Validation
    if (!language || !sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Language and source code are required',
      });
    }

    // Log execution request
    logger.info(`Code execution request from user ${req.user.email}`, {
      language,
      codeLength: sourceCode.length,
      hasInput: !!input,
      queueStatus: executionQueue.getStatus(),
    });

    // Execute code through queue (max 100 concurrent, rest queued)
    const result = await executionQueue.enqueue(
      () => runCode(language, sourceCode, input, options),
      { language, userId, email: req.user.email }
    );

    // Log execution result
    if (result.success) {
      logger.info(`Code execution successful for user ${req.user.email}`, {
        language,
        status: result.status.description,
        executionTime: result.execution_time,
        hasOutput: !!result.stdout,
      });
    } else {
      logger.warn(`Code execution failed for user ${req.user.email}`, {
        language,
        error: result.error,
      });
    }

    // Optionally store execution history in database
    try {
      await prisma.codeExecutionEngine.upsert({
        where: {
          name_language_version: {
            name: 'Judge0',
            language: language,
            version: '1.0',
          },
        },
        update: {},
        create: {
          name: 'Judge0',
          language: language,
          version: '1.0',
        },
      });
    } catch (dbError) {
      // Non-critical error, just log it
      logger.warn('Failed to update execution engine record:', dbError.message);
    }

    // Add queue info to response headers
    const queueStats = executionQueue.getStats();
    res.set({
      'X-Queue-Running': queueStats.currentlyRunning.toString(),
      'X-Queue-Queued': queueStats.queued.toString(),
      'X-Queue-Capacity': queueStats.maxConcurrent.toString(),
    });

    res.status(200).json({
      success: result.success,
      result: result,
      queueInfo: {
        running: queueStats.currentlyRunning,
        queued: queueStats.queued,
        capacity: queueStats.maxConcurrent,
      },
    });
  } catch (error) {
    logger.error('Code execution controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during code execution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get supported programming languages
 * GET /api/code/languages
 */
export async function getSupportedLanguagesList(req, res) {
  try {
    const languages = getSupportedLanguages();
    
    // Format for better readability
    const formattedLanguages = Object.entries(languages).map(([name, id]) => ({
      name,
      id,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
    }));

    res.status(200).json({
      success: true,
      languages: formattedLanguages,
      total: formattedLanguages.length,
    });
  } catch (error) {
    logger.error('Error getting supported languages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported languages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Check Judge0 service health
 * GET /api/code/health
 */
export async function checkServiceHealth(req, res) {
  try {
    const isHealthy = await checkJudge0Health();
    
    let serviceInfo = null;
    if (isHealthy) {
      try {
        serviceInfo = await getJudge0Info();
      } catch (infoError) {
        logger.warn('Could not get Judge0 service info:', infoError.message);
      }
    }

    res.status(200).json({
      success: true,
      healthy: isHealthy,
      service: 'Judge0',
      url: process.env.JUDGE0_URL || 'http://localhost:2358',
      info: serviceInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error checking service health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check service health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get code execution examples
 * GET /api/code/examples
 */
export async function getCodeExamples(req, res) {
  try {
    const examples = {
      python: {
        language: 'python',
        name: 'Python Hello World',
        code: `# Python Hello World Example
print("Hello, World!")

# Simple calculation
a = 5
b = 3
result = a + b
print(f"The sum of {a} and {b} is {result}")

# Input example (uncomment to test with input)
# name = input("Enter your name: ")
# print(f"Hello, {name}!")`,
        input: '',
        description: 'Basic Python program with output and optional input',
      },
      cpp: {
        language: 'cpp',
        name: 'C++ Hello World',
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Simple calculation
    int a = 5, b = 3;
    int result = a + b;
    cout << "The sum of " << a << " and " << b << " is " << result << endl;
    
    // Input example (uncomment to test with input)
    // string name;
    // cout << "Enter your name: ";
    // getline(cin, name);
    // cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,
        input: '',
        description: 'Basic C++ program with output and optional input',
      },
      java: {
        language: 'java',
        name: 'Java Hello World',
        code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Simple calculation
        int a = 5, b = 3;
        int result = a + b;
        System.out.println("The sum of " + a + " and " + b + " is " + result);
        
        // Input example would require Scanner and input
    }
}`,
        input: '',
        description: 'Basic Java program with output',
      },
      javascript: {
        language: 'javascript',
        name: 'JavaScript Hello World',
        code: `// JavaScript Hello World Example
console.log("Hello, World!");

// Simple calculation
const a = 5;
const b = 3;
const result = a + b;
console.log(\`The sum of \${a} and \${b} is \${result}\`);

// Function example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
    console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
        input: '',
        description: 'JavaScript program with functions and loops',
      },
    };

    res.status(200).json({
      success: true,
      examples,
      languages: Object.keys(examples),
    });
  } catch (error) {
    logger.error('Error getting code examples:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get code examples',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get execution queue statistics
 * GET /api/code/queue-stats
 */
export async function getQueueStats(req, res) {
  try {
    const stats = executionQueue.getStats();
    const status = executionQueue.getStatus();

    res.status(200).json({
      success: true,
      queue: {
        status,
        statistics: stats,
        health: {
          utilizationPercent: stats.utilizationPercent,
          isHealthy: stats.utilizationPercent < 90,
          message: stats.utilizationPercent > 90 
            ? 'High load - consider increasing capacity' 
            : 'System running normally',
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
