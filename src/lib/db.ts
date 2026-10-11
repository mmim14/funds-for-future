import "server-only";
import postgres from "postgres";

const globalDb = globalThis as unknown as { database?: ReturnType<typeof postgres> };

export function getDb() {
  if (globalDb.database) return globalDb.database;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing from .env.local");
  // The URL controls TLS, including sslmode=require for TigerData.
  globalDb.database = postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: { statement_timeout: 10000 },
  });
  return globalDb.database;
}
