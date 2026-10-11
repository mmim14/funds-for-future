import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map(), testGlobal = {}, testEnv = {};
let profile = { state: "California", education: "High school senior", collegeStart: "Fall 2027", major: "Computer science", gpa: "3.7", interests: ["Robotics"], firstGeneration: "Yes", preference: "Any scholarship", householdIncome: "Prefer not to say" };
const today = new Date().toISOString().slice(0, 10);
const item = { id: "catalog-id", title: "Test scholarship", provider: "Provider", url: "https://example.com", amount: 5000, amountMin: 1000, amountMax: 5000, date: null, category: "General", work: "Essay", description: "Test", criteria: "Minimum GPA 3.0", degreeLevels: null, majors: null, minGpa: 3, states: null, citizenship: null, schools: null, enrollment: null, financialNeed: null };
const catalog = [item, { ...item, id: "closed", date: "2000-01-01" }];
let calls = 0, payload, requestedStudent, providerStatus = 200, generated;
async function mockFetch(url, options) {
  calls++; payload = JSON.parse(options.body);
  assert.ok(url.startsWith("https://generativelanguage.googleapis.com/v1beta/models/"));
  assert.equal(options.headers["x-goog-api-key"], "test-key");
  return new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(generated ?? { matches: [{ id: item.id, score: 85, reason: "Relevant major; verify unspecified requirements.", status: "uncertain" }] }) }] } }] }), { status: providerStatus });
}
class TestResponse extends Response { static json(body, init) { return new TestResponse(JSON.stringify(body), init); } }
function load(relative) {
  const filename = resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} }; cache.set(filename, module);
  const nativeRequire = createRequire(filename);
  function customRequire(name) {
    if (name === "server-only") return {};
    if (name === "next/server") return { NextResponse: TestResponse };
    if (name === "@/lib/session") return { currentStudent: async request => request.cookies.get("fff_session") ? { id: request.cookies.get("fff_session").value } : null };
    if (name === "@/lib/db") return { getDb: () => ({ unsafe: async (_query, params) => { requestedStudent = params[0]; return [profile]; } }) };
    if (name === "@/lib/scholarship-store") return { loadScholarships: async () => catalog };
    if (name.startsWith("@/")) return load("src/" + name.slice(2) + ".ts");
    if (name.startsWith(".")) return load(resolve(dirname(filename), name + ".ts"));
    return nativeRequire(name);
  }
  new Function("require", "module", "exports", "process", "globalThis", "fetch", output)(customRequire, module, module.exports, { env: testEnv }, testGlobal, mockFetch);
  return module.exports;
}
function request(token, body = {}, origin = "http://localhost:3000") {
  const req = new Request("http://localhost:3000/api/scholarships/match", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
  req.nextUrl = new URL(req.url); req.cookies = { get: () => token ? { value: token } : undefined }; return req;
}
const core = load("src/lib/scholarship-matching.ts"), labels = load("src/lib/opportunities.ts");
assert.deepEqual(core.activeCandidates(catalog, today).map(x => x.id), [item.id]);
assert.equal(core.activeCandidates(Array.from({ length: 60 }, (_, index) => ({ ...item, id: String(index) })), today).length, 50);
assert.equal(labels.awardLabel({ ...item, amountMin: null, amountMax: null }), "Amount not listed");
assert.equal(labels.awardLabel(item), "$1,000 – $5,000");
const valid = { matches: [{ id: item.id, score: 90, reason: "Fit", status: "potential" }] };
for (const bad of [{ matches: [] }, { matches: [...valid.matches, ...valid.matches] }, { matches: [{ ...valid.matches[0], id: "invented" }] }, { matches: [{ ...valid.matches[0], score: 101 }] }, { matches: [{ ...valid.matches[0], status: "eligible" }] }]) assert.throws(() => core.validateMatches(bad, [item], profile));
assert.equal(core.validateMatches(valid, [item], { ...profile, gpa: "2.5" })[0].status, "unlikely");
const route = load("src/app/api/scholarships/match/route.ts");
assert.equal((await route.POST(request())).status, 401);
assert.equal((await route.POST(request("student", {}, "https://other.example"))).status, 400);
assert.equal((await route.POST(request("student"))).status, 503);
assert.equal(calls, 0);
testEnv.GEMINI_API_KEY = "test-key";
let response = await route.POST(request("student", { studentId: "other", profile: { gpa: "4.0" } }));
assert.equal(response.status, 200);
assert.equal(requestedStudent, "student");
let data = await response.json(); assert.equal(data.considered, 1); assert.equal(data.matches[0].score, 85);
const sent = JSON.parse(payload.contents[0].parts[0].text);
assert.equal(payload.generationConfig.responseMimeType, "application/json");
assert.ok(payload.generationConfig.responseJsonSchema);
assert.deepEqual(sent.profile, profile); assert.equal(sent.scholarships.length, 1);
assert.equal(sent.profile.email, undefined); assert.equal(sent.profile.firstName, undefined); assert.equal(sent.profile.studentId, undefined);
assert.equal((await route.POST(request("student"))).status, 200); assert.equal(calls, 1);
profile = { ...profile, gpa: "3.9" };
assert.equal((await route.POST(request("student"))).status, 429);
assert.equal((await route.POST(request("other-student"))).status, 200); assert.equal(calls, 2);
providerStatus = 429;
assert.equal((await route.POST(request("provider-error"))).status, 503);
providerStatus = 200; generated = { matches: [{ id: "invented", score: 99, reason: "Bad", status: "potential" }] };
assert.equal((await route.POST(request("invalid-output"))).status, 502);
console.log("PASS: catalog deadlines, limits, amount labels, authentication, origins, trusted profile lookup, missing key, Gemini payload, validation, GPA conflicts, caching, account isolation, throttling and upstream failures.");
