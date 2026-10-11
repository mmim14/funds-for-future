# Student registration database

The existing TigerData PostgreSQL database stores both scholarships and student information. DATABASE_URL is read only on the server from the root .env.local.

## Setup

Run from the repository root:

```powershell
npm ci
npm run db:setup
npm run dev
```

The student tables have already been created in the connected database. The setup command is safe to repeat and does not change scholarship records.

## Register a student

1. Open http://localhost:3000.
2. Fill in student information, including first and last name.
3. Click Create account in the account panel.
4. Enter an email and a password of 8–128 characters, then submit Create account.
5. Registration saves the account, profile, and login session in one transaction.
6. Refresh or open Student profile to check that saved information loads from the database.
7. Edit fields and click Save student information to update the signed-in student's profile.

Signing in loads an existing student's saved information. Signing out invalidates the current session.

## Tables

| Table | Contents |
|---|---|
| student_accounts | Unique normalized email, student UUID, salted scrypt password hash |
| student_profiles | Names, state, education, major, GPA, interests, and funding preferences; one profile per student |
| student_sessions | SHA-256 session token hash, student UUID, and expiry |

The schema is in database/students.sql. Student profiles and sessions reference their account with foreign keys. Passwords and raw session tokens are not stored in the database. Credentials are never returned in API responses. Production cookies are Secure, HttpOnly, and SameSite=Lax; sessions expire after seven days.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create an account and profile, then sign in |
| POST | /api/auth/login | Sign in with email and password |
| POST | /api/auth/logout | Delete the current session and clear its cookie |
| GET | /api/student/profile | Read the signed-in student's information |
| PUT | /api/student/profile | Update the signed-in student's information |

Registration accepts JSON with email, password, and a profile object. Profile properties match the form: firstName, lastName, state, education, collegeStart, major, gpa, interests, firstGeneration, preference, tuition, householdIncome. Profile access is bound to the session; a client-supplied student ID cannot select another student.

## Verification

```powershell
npm run typecheck
npm run test:registration
npm run build
```

The integration test invokes the actual route handlers through lightweight Next.js response adapters against the configured database. It creates uniquely named synthetic students and removes them in a finally block. It covers registration, duplicate emails, password hashing, login, invalid GPA, unauthorized access, isolation between students, logout, and expired sessions. It does not replace browser testing or a production build.

This prototype does not yet include email verification, password recovery, or authentication rate limits. Scholarship discovery is still awaiting integration.
