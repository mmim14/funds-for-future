# Funds for Future frontend

Next.js app source lives in src/app and src/components at the repository root. The design reference is [design-reference.png](design-reference.png).

Run from the repository root:

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Use npm run typecheck for TypeScript checks and npm run build for production compilation.

Student registration, sign-in, sign-out, and profile persistence are connected to TigerData. Fill out the student information, then create an account using the account panel. Profile edits require a signed-in session. See [database instructions](database.md).

Scholarship discovery and password recovery are not yet implemented. The campus photo loads from Unsplash and requires internet access.
