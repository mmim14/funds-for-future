export class ValidationError extends Error {}

function text(body: Record<string, unknown>, key: string, required = false, max = 100): string {
  const value = body[key];
  if (value == null && !required) return "";
  if (typeof value !== "string") throw new ValidationError(key + " must be text.");
  const result = value.trim();
  if ((required && !result) || result.length > max) throw new ValidationError("Check " + key + ".");
  return result;
}
function number(body: Record<string, unknown>, key: string, max: number): number | null {
  const raw = body[key];
  if (raw == null || raw === "") return null;
  if (typeof raw !== "number" && typeof raw !== "string") throw new ValidationError("Check " + key + ".");
  if (typeof raw === "string" && !raw.trim()) return null;
  const result = Number(raw);
  if (!Number.isFinite(result) || result < 0 || result > max) throw new ValidationError("Check " + key + ".");
  return result;
}
export function parseBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError("Invalid request.");
  return value as Record<string, unknown>;
}
export function parseCredentials(value: unknown) {
  const body = parseBody(value);
  const email = text(body, "email", true, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("Enter a valid email address.");
  const password = body.password;
  if (typeof password !== "string" || password.length < 8 || password.length > 128) throw new ValidationError("Use a password between 8 and 128 characters.");
  return { email, password };
}
export function parseProfile(value: unknown) {
  const body = parseBody(value);
  const interests = body.interests ?? [];
  if (!Array.isArray(interests) || interests.length > 20 || interests.some(x => typeof x !== "string" || x.length > 100)) throw new ValidationError("Use up to 20 interests, each under 100 characters.");
  return {
    first_name: text(body, "firstName", true), last_name: text(body, "lastName", true),
    state: text(body, "state"), education: text(body, "education"), college_start: text(body, "collegeStart"),
    major: text(body, "major"), gpa: number(body, "gpa", 4), interests: interests.map(x => x.trim()).filter(Boolean),
    first_generation: text(body, "firstGeneration"), scholarship_preference: text(body, "preference"),
    tuition: number(body, "tuition", 9999999999.99), household_income: text(body, "householdIncome"),
  };
}
