/**
 * Code Execution Queue System
 * Manages concurrent code execution with configurable limits
 * Ensures system stability under heavy load
 */

import logger from '../config/logger.js';

class ExecutionQueue {
  constructor(maxConcurrent = 100) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
    this.stats = {
      totalProcessed: 0,
      currentlyRunning: 0,
      queued: 0,
      completed: 0,
      failed: 0,
      avgWaitTime: 0,
      avgExecutionTime: 0,
    };
  }

  /**
   * Add a task to the queue
   * @param {Function} task - Async function to execute
   * @param {Object} metadata - Task metadata for logging
   * @returns {Promise} Promise that resolves when task completes
   */
  async enqueue(task, metadata = {}) {
    const queuedAt = Date.now();
    
    return new Promise((resolve, reject) => {
      const queueItem = {
        task,
        metadata,
        queuedAt,
        resolve,
        reject,
      };

      this.queue.push(queueItem);
      this.stats.queued = this.queue.length;

      logger.debug(`Task queued: ${metadata.language || 'unknown'} | Queue size: ${this.queue.length}, Running: ${this.running}`);

      this.processQueue();
    });
  }

  /**
   * Process queued tasks respecting concurrency limits
   */
  async processQueue() {
    // Check if we can process more tasks
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const queueItem = this.queue.shift();
      this.stats.queued = this.queue.length;
      
      this.running++;
      this.stats.currentlyRunning = this.running;

      const waitTime = Date.now() - queueItem.queuedAt;
      
      // Update average wait time
      if (this.stats.totalProcessed > 0) {
        this.stats.avgWaitTime = 
          (this.stats.avgWaitTime * this.stats.totalProcessed + waitTime) / 
          (this.stats.totalProcessed + 1);
      } else {
        this.stats.avgWaitTime = waitTime;
      }

      logger.debug(`Executing task: ${queueItem.metadata.language || 'unknown'} | Wait time: ${waitTime}ms | Running: ${this.running}`);

      // Execute the task
      this.executeTask(queueItem);
    }
  }

  /**
   * Execute a single task
   */
  async executeTask(queueItem) {
    const startTime = Date.now();

    try {
      const result = await queueItem.task();
      const executionTime = Date.now() - startTime;

      // Update stats
      this.stats.totalProcessed++;
      this.stats.completed++;
      
      if (this.stats.totalProcessed > 0) {
        this.stats.avgExecutionTime = 
          (this.stats.avgExecutionTime * (this.stats.totalProcessed - 1) + executionTime) / 
          this.stats.totalProcessed;
      } else {
        this.stats.avgExecutionTime = executionTime;
      }

      logger.debug(`Task completed: ${queueItem.metadata.language || 'unknown'} | Execution: ${executionTime}ms`);

      queueItem.resolve(result);
    } catch (error) {
      this.stats.totalProcessed++;
      this.stats.failed++;

      logger.error(`Task failed: ${queueItem.metadata.language || 'unknown'} | Error: ${error.message}`);

      queueItem.reject(error);
    } finally {
      this.running--;
      this.stats.currentlyRunning = this.running;

      // Process next item in queue
      this.processQueue();
    }
  }

  /**
   * Get current queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      maxConcurrent: this.maxConcurrent,
      utilizationPercent: (this.running / this.maxConcurrent) * 100,
    };
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      available: this.maxConcurrent - this.running,
    };
  }

  /**
   * Clear the queue (emergency stop)
   */
  clear() {
    const cleared = this.queue.length;
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.stats.queued = 0;
    logger.warn(`Queue cleared: ${cleared} pending tasks cancelled`);
    return cleared;
  }

  /**
   * Wait for all running tasks to complete
   */
  async drain() {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    logger.info('Queue drained: all tasks completed');
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalProcessed: 0,
      currentlyRunning: this.running,
      queued: this.queue.length,
      completed: 0,
      failed: 0,
      avgWaitTime: 0,
      avgExecutionTime: 0,
    };
    logger.info('Queue statistics reset');
  }
}

// Create singleton instance
const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 100;
const executionQueue = new ExecutionQueue(maxConcurrent);

logger.info(`Execution queue initialized: max ${maxConcurrent} concurrent executions`);

export default executionQueue;
