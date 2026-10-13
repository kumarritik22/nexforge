import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("Connected to Redis successfully.");
});

redis.on("error", (error) => {
    console.error("Redis connection error:", error);
});

export const refreshTTL = async (sandboxId) => {
    await redis.expire(`sandbox:${sandboxId}`, 20 * 60);
};