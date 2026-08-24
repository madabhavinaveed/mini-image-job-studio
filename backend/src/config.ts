import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing ${name}. Copy backend/.env.example to backend/.env`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/occibo"),
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? "http://localhost:4000").replace(/\/$/, ""),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
