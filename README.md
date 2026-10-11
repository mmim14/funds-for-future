# Funds for Future

A Next.js application for student profiles and scholarship discovery.

## Local development

Run all commands from the repository root. Use Node.js 20.9 or newer and npm.

```powershell
npm ci
# Only if .env.local does not already exist:
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Your existing .env.local has been moved to the root; keep its DATABASE_URL private.

```powershell
npm run typecheck
npm run build
npm start
```

The development server writes to .next-dev; production builds write to .next.

## Repository layout

```text
src/
  app/               Next.js routes, layouts, and global styles
  components/        Reusable React components
database/            PostgreSQL schema and scholarship import SQL
data/                Scholarship datasets
scripts/             Data preparation scripts
assets/              Project planning assets
docs/                Project plan, overview, and design reference
.env.example         Safe environment template
.env.local           Local credentials (ignored by Git)
package.json         App dependencies and commands
next.config.mjs      Next.js configuration
tsconfig.json        TypeScript configuration
```

Imports beginning with @/ resolve to src/.

## Current functionality

Registration, sign-in, sign-out, and student profile storage use TigerData PostgreSQL. Registration saves accounts and profiles together; profiles load and update through authenticated sessions. Passwords are stored as salted scrypt hashes. The Scholarship tab loads the PostgreSQL catalog and offers Gemini profile matching. See [scholarship setup](docs/scholarships.md). Bookmarks, budget, and tracking are stored on this device under your student ID. Password recovery is not implemented yet. See [database setup and testing](docs/database.md).

Database setup files are in database/schema.sql and database/import_scholarships.sql. Data tooling remains in scripts/ with Python dependencies in requirements.txt. See [project plan](docs/plan.md) and [frontend notes](docs/frontend.md).
