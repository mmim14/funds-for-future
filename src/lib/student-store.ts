import "server-only";
import type postgres from "postgres";
import type { parseProfile } from "./student-validation";

export async function storeProfile(sql: postgres.Sql | postgres.TransactionSql, studentId: string, p: ReturnType<typeof parseProfile>) {
  await sql`
    INSERT INTO public.student_profiles (student_id, first_name, last_name, state, education, college_start,
      major, gpa, interests, first_generation, scholarship_preference, tuition, household_income)
    VALUES (${studentId}, ${p.first_name}, ${p.last_name}, ${p.state}, ${p.education}, ${p.college_start},
      ${p.major}, ${p.gpa}, ${sql.array(p.interests)}, ${p.first_generation}, ${p.scholarship_preference}, ${p.tuition}, ${p.household_income})
    ON CONFLICT (student_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
      state = EXCLUDED.state, education = EXCLUDED.education, college_start = EXCLUDED.college_start,
      major = EXCLUDED.major, gpa = EXCLUDED.gpa, interests = EXCLUDED.interests,
      first_generation = EXCLUDED.first_generation, scholarship_preference = EXCLUDED.scholarship_preference,
      tuition = EXCLUDED.tuition, household_income = EXCLUDED.household_income, updated_at = now()
  `;
}
