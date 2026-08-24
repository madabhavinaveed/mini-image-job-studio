import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { config } from "./config.js";

mkdirSync(path.dirname(config.sqlitePath), { recursive: true });

export const db = createClient({
  url: pathToFileURL(config.sqlitePath).href,
});

export async function connectDb(): Promise<void> {
  const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  await db.executeMultiple(schema);
}

export async function closeDb(): Promise<void> {
  db.close();
}
