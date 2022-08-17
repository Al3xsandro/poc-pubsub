import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URI || '', {
    maxRetriesPerRequest: null
});

redisConnection.on('connect', () => {
    console.info('[INFO] Redis connected');
});

redisConnection.on('close', () => {
    console.info('[INFO] Redis connection timeout');
});

export { redisConnection };