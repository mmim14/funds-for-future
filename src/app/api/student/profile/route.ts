import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { currentStudent } from "@/lib/session";
import { parseProfile } from "@/lib/student-validation";
import { storeProfile } from "@/lib/student-store";
import { apiError, readInput } from "@/lib/api";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const student = await currentStudent(request);
    if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const [profile] = await getDb()`SELECT first_name AS "firstName", last_name AS "lastName", state, education,
      college_start AS "collegeStart", major, gpa, interests, first_generation AS "firstGeneration",
      scholarship_preference AS preference, tuition, household_income AS "householdIncome"
      FROM public.student_profiles WHERE student_id = ${student.id}`;
    return NextResponse.json({ student, profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export async function PUT(request: NextRequest) {
  try {
    const student = await currentStudent(request);
    if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const profile = parseProfile(await readInput(request));
    await storeProfile(getDb(), student.id, profile);
    return NextResponse.json({ message: "Student information saved to your account." });
  } catch (error) { return apiError(error); }
}
