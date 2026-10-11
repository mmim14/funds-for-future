import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { apiError, readInput } from "@/lib/api";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await readInput(request);
    const token = request.cookies.get("fff_session")?.value;
    if (token) {
      const hash = createHash("sha256").update(token).digest("hex");
      await getDb()`DELETE FROM public.student_sessions WHERE token_hash = ${hash}`;
    }
    const response = NextResponse.json({ message: "Signed out." });
    response.cookies.set("fff_session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch (error) { return apiError(error); }
}
