import "server-only";
import { createHash } from "node:crypto";
import type { Opportunity, ScholarshipMatch } from "./opportunities";
import { matchingInstructions, matchingPrompt, matchingSchema, validateMatches, type MatchingProfile } from "./scholarship-matching";
export class MatchingError extends Error { constructor(message: string, public status: number) { super(message); } }
const state = globalThis as unknown as { scholarshipMatching?: { cache: Map<string, { expires: number; matches: ScholarshipMatch[] }>; requests: Map<string, number>; inFlight: Set<string> } };
const store = state.scholarshipMatching ??= { cache: new Map(), requests: new Map(), inFlight: new Set() };
export async function matchWithGemini(studentId: string, profile: MatchingProfile, catalog: Opportunity[], today: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new MatchingError("Gemini matching is not configured yet. You can still browse and save scholarships.", 503);
  if (!catalog.length) return [];
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  if (!/^[a-zA-Z0-9.-]+$/.test(model)) throw new MatchingError("Gemini model configuration is invalid.", 503);
  const prompt = matchingPrompt(profile, catalog, today);
  const cacheKey = studentId + ":" + createHash("sha256").update(model + prompt).digest("hex");
  const now = Date.now();
  for (const [id, entry] of store.cache) if (entry.expires <= now) store.cache.delete(id);
  for (const [id, time] of store.requests) if (now - time > 60000) store.requests.delete(id);
  const cached = store.cache.get(cacheKey);
  if (cached) return cached.matches;
  if (store.inFlight.has(studentId) || now - (store.requests.get(studentId) ?? 0) < 60000) throw new MatchingError("Please wait a minute before requesting new matches.", 429);
  if (store.inFlight.size >= 5) throw new MatchingError("Matching is busy. Please try again shortly.", 429);
  if (store.requests.size >= 1000) throw new MatchingError("Matching is busy. Please try again shortly.", 429);
  store.requests.set(studentId, now); store.inFlight.add(studentId);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, signal: AbortSignal.timeout(45000),
      body: JSON.stringify({ systemInstruction: { parts: [{ text: matchingInstructions }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 12000, responseMimeType: "application/json", responseJsonSchema: matchingSchema } })
    });
    if (!response.ok) throw new MatchingError(response.status === 429 ? "Gemini's request limit was reached. Try again later." : "Gemini matching is unavailable. Check the server's API key and model configuration.", 503);
    const result = await response.json();
    const candidate = result.candidates?.[0];
    if (candidate?.finishReason !== "STOP") throw new MatchingError("Gemini could not finish matching. Please try again.", 502);
    const text = candidate.content?.parts?.filter((part: { thought?: boolean }) => !part.thought).map((part: { text?: string }) => part.text || "").join("");
    const matches = validateMatches(JSON.parse(text || ""), catalog, profile);
    if (store.cache.size >= 100) store.cache.delete(store.cache.keys().next().value!);
    store.cache.set(cacheKey, { expires: now + 10 * 60000, matches });
    return matches;
  } catch (error) {
    if (error instanceof MatchingError) throw error;
    throw new MatchingError("Gemini returned an invalid response or timed out. Please try again.", 502);
  } finally { store.inFlight.delete(studentId); }
}
