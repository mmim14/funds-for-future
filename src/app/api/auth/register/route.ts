import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { parseBody, parseCredentials, parseProfile } from "@/lib/student-validation";
import { storeProfile } from "@/lib/student-store";
import { insertSession, newSession, setSessionCookie } from "@/lib/session";
import { apiError, readInput } from "@/lib/api";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const input = parseBody(await readInput(request));
    const { email, password } = parseCredentials(input);
    const profile = parseProfile(input.profile);
    const passwordHash = await hashPassword(password);
    const session = newSession();
    const student = await getDb().begin(async sql => {
      const [account] = await sql<{ id: string; email: string }[]>`
        INSERT INTO public.student_accounts (email, password_hash) VALUES (${email}, ${passwordHash}) RETURNING id, email
      `;
      await storeProfile(sql, account.id, profile);
      await insertSession(sql, account.id, session);
      return account;
    });
    const response = NextResponse.json({ student, message: "Account created and student information saved." }, { status: 201 });
    setSessionCookie(response, session.token);
    return response;
  } catch (error) { return apiError(error); }
}
