import { NextResponse, type NextRequest } from "next/server";
import { ValidationError } from "./student-validation";

export async function readInput(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) throw new ValidationError("Invalid request origin.");
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ValidationError("Send JSON data.");
  const body = await request.text();
  if (body.length > 16000) throw new ValidationError("Request is too large.");
  try { return JSON.parse(body) as unknown; } catch { throw new ValidationError("Invalid JSON data."); }
}
export function apiError(error: unknown) {
  if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
  if (typeof error === "object" && error && "code" in error && error.code === "23505") {
    return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
  }
  // Never return database messages or credentials to the browser.
  console.error("Student API failed", typeof error === "object" && error && "code" in error ? error.code : "internal_error");
  return NextResponse.json({ error: "Unable to save your information. Please try again." }, { status: 503 });
}
