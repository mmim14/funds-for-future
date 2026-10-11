import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type postgres from "postgres";
import type { NextRequest, NextResponse } from "next/server";
import { getDb } from "./db";

const COOKIE = "fff_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export function newSession() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: createHash("sha256").update(token).digest("hex"), expires: new Date(Date.now() + SESSION_SECONDS * 1000) };
}
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS });
}
export async function currentStudent(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  const rows = await getDb()<{ id: string; email: string }[]>`
    SELECT a.id, a.email FROM public.student_sessions s
    JOIN public.student_accounts a ON a.id = s.student_id
    WHERE s.token_hash = ${hash} AND s.expires_at > now()
  `;
  return rows[0] ?? null;
}
export async function insertSession(sql: postgres.TransactionSql, studentId: string, session: ReturnType<typeof newSession>) {
  await sql`INSERT INTO public.student_sessions (token_hash, student_id, expires_at)
    VALUES (${session.hash}, ${studentId}, ${session.expires})`;
}
