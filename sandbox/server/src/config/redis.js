import Redis from "ioredis";
import { deletePod } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL);

const subscriber = new Redis(process.env.REDIS_URL);

export const createSandboxKey = async (sandboxId) => {
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: "active"
    }), "EX", 120)
};

subscriber.config("SET", "notify-keyspace-events", "Ex");

subscriber.subscribe("__keyevent@0__:expired");

subscriber.on("message", async (channel, key) => {
    console.log(`Key expired: ${key}`);

    const sandboxId = key.split(":")[ 1 ];

    try {
        await Promise.all([
            deletePod(sandboxId),
            deleteService(sandboxId)
        ]);
        console.log(`Successfully deleted sandbox: ${sandboxId}`);
    } catch (error) {
        console.error(`Error deleting sandbox ${sandboxId}:`, error.message);
    }
});

export default subscriber;