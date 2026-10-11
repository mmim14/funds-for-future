# Database scholarships and Gemini matching

The Scholarship tab and college-finances tracker load PostgreSQL records through GET /api/scholarships. Amount ranges, unknown awards and missing deadlines are preserved. Provider links accept only HTTP(S) URLs. The catalog is not changed by browsing or matching.

## Enable Gemini

Add these server-only settings to the existing root .env.local. Keep DATABASE_URL as it is.

GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-3.8-flash

Get a key at https://aistudio.google.com/apikey. Restart the development server after adding settings. Never prefix the key with NEXT_PUBLIC_ or commit .env.local. Gemini usage is billed or quota-limited under your Google project.

Sign in, save your student profile, open Scholarship, then click Match with Gemini. The catalog and bookmarks remain usable when Gemini is unavailable; failed matching never displays invented results.

## Matching behavior

POST /api/scholarships/match reads the student from the authenticated cookie and loads their profile from PostgreSQL. Client-supplied student IDs and profile data are ignored. Only education, major, GPA, interests, state, expected college start, first-generation status, scholarship preference and household-income category are sent to Google, along with catalog eligibility requirements. Names, email addresses, passwords, session tokens and the database URL are excluded.

The server considers up to 50 open or undated scholarships, in deadline order. Closed scholarships are available in Browse all and Saved, but are excluded from matching. The response reports the number considered and total open so the cap is visible. Current-date comparison uses UTC.

Gemini returns structured JSON. IDs, scores, status, completeness and explanation lengths are checked before results reach the browser. Scores indicate estimated fit, not eligibility or award probability. Missing citizenship, school, enrollment or other requirements must be treated as unknown. A known GPA below the catalog minimum overrides AI recommendations. Recommended shows results with fit >= 60 that are not marked unlikely; uncertain matches show Needs verification.

Results are cached in server memory for ten minutes by student, profile, model and catalog contents. New requests are limited to one per student per minute and five concurrent requests per process. For multiple production instances, replace these memory limits/cache with a shared store. API calls time out after 45 seconds. The default model is configurable; consult Google's model documentation for model availability in your project.

Bookmarks, self-reported statuses and budgets still stay on this device, scoped to the student ID. The finance tracker uses the catalog's maximum listed award as a planning estimate and counts unknown amounts as zero.

## Verification

npm run typecheck
npm run test:scholarships

The offline test checks authentication requirements, origin checking, trusted profile lookup, missing configuration, prompt minimization, expired-catalog exclusion, result validation, GPA conflicts, caching, per-user throttling and upstream failures using a mock Gemini response. A real Gemini call requires your key and is not part of the offline test.

Official API reference: https://ai.google.dev/gemini-api/docs/generate-content/structured-output
