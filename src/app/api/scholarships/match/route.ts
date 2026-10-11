import { NextResponse, type NextRequest } from "next/server";
import { currentStudent } from "@/lib/session";
import { getDb } from "@/lib/db";
import { readInput } from "@/lib/api";
import { ValidationError } from "@/lib/student-validation";
import { loadScholarships } from "@/lib/scholarship-store";
import { activeCandidates, type MatchingProfile } from "@/lib/scholarship-matching";
import { matchWithGemini, MatchingError } from "@/lib/gemini-scholarships";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await readInput(request);
    const student = await currentStudent(request);
    if (!student) return NextResponse.json({ error: "Sign in to match scholarships." }, { status: 401 });
    const rows = await getDb().unsafe<MatchingProfile[]>(
      'SELECT state, education, college_start AS "collegeStart", major, gpa, interests, first_generation AS "firstGeneration", scholarship_preference AS preference, household_income AS "householdIncome" FROM public.student_profiles WHERE student_id = $1', [student.id]);
    if (!rows[0]) return NextResponse.json({ error: "Save your student profile before requesting matches." }, { status: 400 });
    const today = new Date().toISOString().slice(0, 10);
    const catalog = await loadScholarships();
    const candidates = activeCandidates(catalog, today);
    const matches = await matchWithGemini(student.id, rows[0], candidates, today);
    return NextResponse.json({ matches, considered: candidates.length, totalOpen: catalog.filter(item => !item.date || item.date >= today).length }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof MatchingError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Unable to load your profile or scholarship catalog. Please try again." }, { status: 503 });
  }
}
