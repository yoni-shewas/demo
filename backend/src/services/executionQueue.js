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

  async enqueue(task, metadata = {}) {
    const queuedAt = Date.now();
    
    return new Promise((resolve, reject) => {
      this.queue.push({ task, metadata, queuedAt, resolve, reject });
      this.stats.queued = this.queue.length;
      this.processQueue();
    });
  }

  async processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const queueItem = this.queue.shift();
      this.stats.queued = this.queue.length;
      
      this.running++;
      this.stats.currentlyRunning = this.running;

      const waitTime = Date.now() - queueItem.queuedAt;
      
      if (this.stats.totalProcessed > 0) {
        this.stats.avgWaitTime = 
          (this.stats.avgWaitTime * this.stats.totalProcessed + waitTime) / 
          (this.stats.totalProcessed + 1);
      } else {
        this.stats.avgWaitTime = waitTime;
      }

      this.executeTask(queueItem);
    }
  }

  async executeTask(queueItem) {
    const startTime = Date.now();

    try {
      const result = await queueItem.task();
      const executionTime = Date.now() - startTime;

      this.stats.totalProcessed++;
      this.stats.completed++;
      
      if (this.stats.totalProcessed > 0) {
        this.stats.avgExecutionTime = 
          (this.stats.avgExecutionTime * (this.stats.totalProcessed - 1) + executionTime) / 
          this.stats.totalProcessed;
      } else {
        this.stats.avgExecutionTime = executionTime;
      }

      queueItem.resolve(result);
    } catch (error) {
      this.stats.totalProcessed++;
      this.stats.failed++;
      logger.error(`Task failed: ${error.message}`);
      queueItem.reject(error);
    } finally {
      this.running--;
      this.stats.currentlyRunning = this.running;
      this.processQueue();
    }
  }

  getStats() {
    return {
      ...this.stats,
      maxConcurrent: this.maxConcurrent,
      utilizationPercent: (this.running / this.maxConcurrent) * 100,
    };
  }

  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      available: this.maxConcurrent - this.running,
    };
  }

  clear() {
    const cleared = this.queue.length;
    this.queue.forEach(item => item.reject(new Error('Queue cleared')));
    this.queue = [];
    this.stats.queued = 0;
    logger.warn(`Queue cleared: ${cleared} tasks`);
    return cleared;
  }

  async drain() {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

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
  }
}

const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 100;
const executionQueue = new ExecutionQueue(maxConcurrent);

logger.info(`Queue initialized: max ${maxConcurrent} concurrent`);

export default executionQueue;
