import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

export default redisClient;