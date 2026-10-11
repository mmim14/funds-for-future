import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";
import { databaseUrl, projectRoot } from "./database-env.mjs";
let sql;
try {
  sql = postgres(databaseUrl(), { max: 1, connect_timeout: 10 });
  await sql.unsafe(await readFile(resolve(projectRoot, "database/students.sql"), "utf8"));
  console.log("Student account, profile, and session tables are ready.");
} catch (error) {
  console.error("Student database setup failed:", error.code || "Check DATABASE_URL and database access.");
  process.exitCode = 1;
} finally {
  if (sql) await sql.end();
}
