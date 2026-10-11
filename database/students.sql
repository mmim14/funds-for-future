-- Run once against the existing TigerData database. No scholarship data is changed.
BEGIN;
CREATE TABLE IF NOT EXISTS public.student_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.student_profiles (
  student_id UUID PRIMARY KEY REFERENCES public.student_accounts(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL CHECK (length(btrim(first_name)) BETWEEN 1 AND 100),
  last_name TEXT NOT NULL CHECK (length(btrim(last_name)) BETWEEN 1 AND 100),
  state TEXT,
  education TEXT,
  college_start TEXT,
  major TEXT,
  gpa NUMERIC(3,2) CHECK (gpa BETWEEN 0 AND 4),
  interests TEXT[] NOT NULL DEFAULT '{}',
  first_generation TEXT,
  scholarship_preference TEXT,
  tuition NUMERIC(12,2) CHECK (tuition >= 0),
  household_income TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.student_sessions (
  token_hash TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_accounts(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS student_sessions_expiry_idx ON public.student_sessions(expires_at);
COMMIT;
