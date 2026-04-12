class RetryHandler {
    static async withRetry(fn, options = {}) {
        const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (!this.isRetryable(error)) {
                    throw error;
                }

                if (i < maxRetries - 1) {
                    const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
                    await this.sleep(delay);
                }
            }
        }

        throw lastError;
    }

    static isRetryable(error) {
        if (!error.response) return true;
        const status = error.response.status;
        return status >= 500 || status === 429 || status === 408;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    async acquire() {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.windowMs);

        if (this.requests.length >= this.maxRequests) {
            const oldest = this.requests[0];
            const waitTime = this.windowMs - (now - oldest);
            await RetryHandler.sleep(waitTime);
            return this.acquire();
        }

        this.requests.push(now);
    }
}

class OfflineQueue {
    constructor() {
        this.queue = this.loadQueue();
    }

    loadQueue() {
        try {
            return JSON.parse(localStorage.getItem('api_offline_queue') || '[]');
        } catch {
            return [];
        }
    }

    saveQueue() {
        localStorage.setItem('api_offline_queue', JSON.stringify(this.queue));
    }

    add(request) {
        this.queue.push({ ...request, timestamp: Date.now() });
        this.saveQueue();
    }

    async process(apiInstance) {
        const failed = [];
        
        for (const request of this.queue) {
            try {
                await apiInstance.api.request({
                    url: request.url,
                    method: request.method,
                    data: request.data,
                    params: request.params
                });
            } catch {
                failed.push(request);
            }
        }

        this.queue = failed;
        this.saveQueue();
    }

    get length() {
        return this.queue.length;
    }
}

class RequestCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = parseInt(process.env.REACT_APP_CACHE_MAX_SIZE || '100', 10);
        this.duration = parseInt(process.env.REACT_APP_CACHE_DURATION || '30000', 10);
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        if (Date.now() - entry.timestamp > this.duration) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    set(key, data) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    invalidate(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    invalidatePrefix(prefix) {
        for (const key of this.cache.keys()) {
            if (key.includes(prefix)) {
                this.cache.delete(key);
            }
        }
    }
}

export { RetryHandler, RateLimiter, OfflineQueue, RequestCache };
