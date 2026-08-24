import "dotenv/config";
import path from "node:path";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  sqlitePath: path.resolve(process.env.SQLITE_PATH ?? "data/occibo.sqlite"),
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  imageApiKey: process.env.IMAGE_API_KEY?.trim() || undefined,
  imageApiUrl: process.env.IMAGE_API_URL?.trim() || undefined,
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? "http://localhost:4000").replace(/\/$/, ""),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
