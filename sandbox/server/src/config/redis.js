import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

const subscriber = new Redis(process.env.REDIS_URL);

export const createSandboxKey = async (sandboxId) => {
    await redis.set(`sandbox: ${sandboxId}`, JSON.stringify({
        status: "active"
    }), "EX", 120)
};

subscriber.config("SET", "notify-keyspace-events", "EX");

subscriber.subscribe("_keyevent@o_:expired");

subscriber.on("message", (channel, key) => {
    console.log(`Key expired: ${key}`)
});

export default subscriber;