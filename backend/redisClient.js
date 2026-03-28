const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();

// Error handling (IMPORTANT)
pubClient.on("error", (err) => {
  console.error("Redis Pub Error:", err.message);
});

subClient.on("error", (err) => {
  console.error("Redis Sub Error:", err.message);
});

pubClient.on("connect", () => {
  console.log("Redis Pub Connected");
});

subClient.on("connect", () => {
  console.log("Redis Sub Connected");
});

module.exports = { pubClient, subClient };
