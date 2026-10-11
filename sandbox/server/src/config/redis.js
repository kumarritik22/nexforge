import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

const subscriber = new Redis(process.env.REDIS_URL);

export const createSandboxKey = async (sandboxId) => {
    await redis.set(`sandbox: ${sandboxId}`, JSON.stringify({
        status: "active"
    }), "EX", 120)
};

