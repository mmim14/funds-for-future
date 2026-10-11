import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import ts from "typescript";
import postgres from "postgres";
import { databaseUrl, projectRoot } from "./database-env.mjs";

const root = projectRoot;
const connectionString = databaseUrl();
const cache = new Map();
const testGlobal = {};
// Exercise the actual route handlers with small Next.js response/cookie adapters.
class TestResponse extends Response {
  cookieValues = new Map();
  cookies = { set: (name, value, options) => this.cookieValues.set(name, { value, options }) };
  static json(body, init) { return new TestResponse(JSON.stringify(body), init); }
}
function load(relative) {
  const filename = resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  cache.set(filename, mod);
  const nativeRequire = createRequire(filename);
  function customRequire(name) {
    if (name === "server-only") return {};
    if (name === "postgres") return postgres;
    if (name === "next/server") return { NextResponse: TestResponse };
    if (name.startsWith("@/")) return load("src/" + name.slice(2) + ".ts");
    if (name.startsWith(".")) return load(resolve(dirname(filename), name + ".ts"));
    return nativeRequire(name);
  }
  new Function("require", "module", "exports", "process", "globalThis", output)(customRequire, mod, mod.exports, { env: { DATABASE_URL: connectionString, NODE_ENV: "test" } }, testGlobal);
  return mod.exports;
}
function request(method, body, token, origin = "http://localhost:3000") {
  const req = new Request("http://localhost:3000/api/test", { method, headers: { "Content-Type": "application/json", Origin: origin }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  req.nextUrl = new URL(req.url);
  req.cookies = { get: name => name === "fff_session" && token ? { value: token } : undefined };
  return req;
}
const sql = postgres(connectionString, { max: 1, connect_timeout: 10 });
const email = "integration-" + randomUUID() + "@example.invalid";
const credentials = { email, password: "integration-password-123", profile: { firstName: "Integration", lastName: "Test", gpa: "3.7", major: "Computer science", interests: ["Robotics"], tuition: "25000" } };
const otherEmail = "integration-" + randomUUID() + "@example.invalid";
let studentId;
try {
  const register = load("src/app/api/auth/register/route.ts");
  const login = load("src/app/api/auth/login/route.ts");
  const profile = load("src/app/api/student/profile/route.ts");
  const logout = load("src/app/api/auth/logout/route.ts");
  assert.equal((await profile.GET(request("GET"))).status, 401);
  assert.equal((await profile.PUT(request("PUT", credentials.profile))).status, 401);
  assert.equal((await register.POST(request("POST", { ...credentials, email: "invalid" }))).status, 400);
  assert.equal((await register.POST(request("POST", credentials, undefined, "https://other.example"))).status, 400);
  const created = await register.POST(request("POST", credentials));
  assert.equal(created.status, 201);
  const result = await created.json(); studentId = result.student.id;
  assert.equal(result.student.email, email);
  assert.equal(result.student.password_hash, undefined);
  const cookie = created.cookieValues.get("fff_session");
  assert.equal(cookie.options.httpOnly, true);
  const [stored] = await sql`SELECT password_hash FROM public.student_accounts WHERE id = ${studentId}`;
  assert.notEqual(stored.password_hash, credentials.password);
  assert.match(stored.password_hash, /^scrypt:/);
  assert.equal((await register.POST(request("POST", credentials))).status, 409);
  assert.equal((await login.POST(request("POST", { email, password: "incorrect-password" }))).status, 401);
  assert.equal((await login.POST(request("POST", credentials))).status, 200);
  const loaded = await profile.GET(request("GET", undefined, cookie.value));
  assert.equal(loaded.status, 200);
  assert.equal((await loaded.json()).profile.firstName, "Integration");
  assert.equal((await profile.PUT(request("PUT", { ...credentials.profile, firstName: "Updated", gpa: "4.1" }, cookie.value))).status, 400);
  assert.equal((await profile.PUT(request("PUT", { ...credentials.profile, firstName: "Updated" }, cookie.value))).status, 200);
  assert.equal((await (await profile.GET(request("GET", undefined, cookie.value))).json()).profile.firstName, "Updated");
  assert.equal((await profile.GET(request("GET", undefined, "a".repeat(64)))).status, 401);
  const other = await register.POST(request("POST", { ...credentials, email: otherEmail, profile: { ...credentials.profile, firstName: "Other" } }));
  assert.equal(other.status, 201);
  const otherToken = other.cookieValues.get("fff_session").value;
  assert.equal((await (await profile.GET(request("GET", undefined, otherToken))).json()).profile.firstName, "Other");
  assert.equal((await profile.PUT(request("PUT", { ...credentials.profile, firstName: "StillOther", studentId }, otherToken))).status, 200);
  assert.equal((await (await profile.GET(request("GET", undefined, cookie.value))).json()).profile.firstName, "Updated");
  assert.equal((await logout.POST(request("POST", {}, otherToken))).status, 200);
  assert.equal((await profile.GET(request("GET", undefined, otherToken))).status, 401);
  await sql`UPDATE public.student_sessions SET expires_at = now() - interval '1 second' WHERE student_id = ${studentId}`;
  assert.equal((await profile.GET(request("GET", undefined, cookie.value))).status, 401);
  console.log("PASS: registration, duplicate email, password hashing, login, profile updates, session ownership, expiry, logout, and validation.");
} finally {
  // Delete only this run's synthetic account; foreign keys remove its profile and sessions.
  await sql`DELETE FROM public.student_accounts WHERE email IN (${email}, ${otherEmail})`;
  await sql.end();
  if (testGlobal.database) await testGlobal.database.end();
}
