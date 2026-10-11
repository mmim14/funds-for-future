# Fund For Future frontend

Next.js implementation of the reference in `../image.png`.

Run from this directory:

```powershell
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run build` for production compilation.

Student profile submissions save locally on this device. Demo sign-in and account creation open `/scholarships` for a saved profile, or `/student-profile` to complete a new profile. Saving a profile opens the scholarship dashboard. Search, category filters, sorting, bookmarks and detail dialogs work locally. Recommendations count matching sample eligibility criteria; the percentages are not award probabilities. Scholarships are illustrative, with no live applications. Authentication and password reset still require a backend. Passwords are never stored or submitted. The campus photo loads from Unsplash and requires internet access.

The Next page button on /scholarships opens /college-finances. This page tracks bookmarked scholarships with Saved, Applied, Awarded and Not selected statuses, and saves an editable annual college budget locally. Only Awarded scholarships count toward confirmed funding; Saved and Applied scholarships appear as pending. Grants default to zero until entered by the student. Removing a bookmark also removes it from the tracker and funding totals.
