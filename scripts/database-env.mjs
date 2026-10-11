import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const file = readFileSync(resolve(projectRoot, ".env.local"), "utf8");
  const line = file.split(/\r?\n/).find(value => /^\s*(?:export\s+)?DATABASE_URL\s*=/.test(value));
  const value = line?.slice(line.indexOf("=") + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
  if (!value) throw new Error("DATABASE_URL is missing from .env.local.");
  return value;
}
