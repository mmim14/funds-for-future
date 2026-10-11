import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { parseCredentials } from "@/lib/student-validation";
import { insertSession, newSession, setSessionCookie } from "@/lib/session";
import { apiError, readInput } from "@/lib/api";
export const runtime = "nodejs";
let dummyHash: Promise<string> | undefined;
export async function POST(request: NextRequest) {
  try {
    const { email, password } = parseCredentials(await readInput(request));
    const [student] = await getDb()<{ id: string; email: string; password_hash: string }[]>`
      SELECT id, email, password_hash FROM public.student_accounts WHERE email = ${email}
    `;
    dummyHash ??= hashPassword("dummy-password-for-timing");
    const valid = await verifyPassword(password, student?.password_hash ?? await dummyHash);
    if (!student || !valid) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    const session = newSession();
    await getDb().begin(sql => insertSession(sql, student.id, session));
    const response = NextResponse.json({ student: { id: student.id, email: student.email } });
    setSessionCookie(response, session.token);
    return response;
  } catch (error) { return apiError(error); }
}
