import "server-only";
import { getDb } from "./db";
import type { Opportunity } from "./opportunities";
function amount(value: unknown): number | null { return value == null ? null : Number(value); }
function safeUrl(value: string): string | null {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export async function loadScholarships(): Promise<Opportunity[]> {
  const rows = await getDb().unsafe("SELECT id, name, provider, url, amount_min, amount_max, to_char(deadline, 'YYYY-MM-DD') AS deadline, degree_levels, eligible_majors, min_gpa, eligibility_text, application_requirements, residency_states, citizenship_requirements, eligible_schools, enrollment_status, financial_need_required FROM public.scholarships ORDER BY deadline ASC NULLS LAST, name, id");
  return rows.map(row => {
    const min = amount(row.amount_min), max = amount(row.amount_max);
    const criteria = [row.eligibility_text, row.degree_levels && "Degree levels: " + row.degree_levels,
      row.eligible_majors && "Majors: " + row.eligible_majors,
      row.min_gpa != null && "Minimum GPA: " + row.min_gpa,
      row.residency_states && "Residency: " + row.residency_states,
      row.citizenship_requirements && "Citizenship: " + row.citizenship_requirements,
      row.eligible_schools && "Schools: " + row.eligible_schools,
      row.enrollment_status && "Enrollment: " + row.enrollment_status,
      row.financial_need_required === true && "Financial need required"].filter(Boolean).join(". ");
    return { id: row.id, title: row.name, provider: row.provider, url: safeUrl(row.url),
      amount: max ?? min, amountMin: min, amountMax: max, date: row.deadline,
      category: row.eligible_majors && row.eligible_majors.toLowerCase() !== "not specified" ? row.eligible_majors : "General",
      work: row.application_requirements || "Check provider for application requirements",
      description: row.eligibility_text || "Review the provider's current scholarship details.",
      criteria: criteria || "Eligibility not listed; check with the provider.", degreeLevels: row.degree_levels,
      majors: row.eligible_majors, minGpa: amount(row.min_gpa), states: row.residency_states,
      citizenship: row.citizenship_requirements, schools: row.eligible_schools,
      enrollment: row.enrollment_status, financialNeed: row.financial_need_required };
  });
}
