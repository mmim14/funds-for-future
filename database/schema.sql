-- Run in the SQL editor connected to your TigerData service.
-- CSV fields appear in their original order; generated columns come last.
CREATE TABLE public.scholarships (
    name TEXT NOT NULL CHECK (btrim(name) <> ''),
    provider TEXT NOT NULL CHECK (btrim(provider) <> ''),
    url TEXT NOT NULL CHECK (btrim(url) <> ''),
    amount_min NUMERIC(12, 2) CHECK (amount_min >= 0),
    amount_max NUMERIC(12, 2) CHECK (amount_max >= 0),
    deadline DATE,
    degree_levels TEXT,
    eligible_majors TEXT,
    min_gpa NUMERIC(4, 2) CHECK (min_gpa >= 0),
    eligibility_text TEXT,
    application_requirements TEXT,
    residency_states TEXT,
    citizenship_requirements TEXT,
    eligible_schools TEXT,
    enrollment_status TEXT,
    financial_need_required BOOLEAN,
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT scholarship_amount_order CHECK (amount_min <= amount_max),
    CONSTRAINT scholarship_import_key UNIQUE (provider, name, url)
);

COMMENT ON TABLE public.scholarships IS
    'Hackathon scholarship catalog. All monetary amounts are USD. Blank eligibility fields mean unknown.';

COMMENT ON COLUMN public.scholarships.degree_levels IS
    'Semicolon-separated values; split and normalize in application matching logic.';

COMMENT ON COLUMN public.scholarships.financial_need_required IS
    'TRUE = required, FALSE = not required, NULL = unknown.';
