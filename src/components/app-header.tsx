"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export default function AppHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      window.location.assign("/");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign out."); setBusy(false); }
  }
  return <header><div className="header-inner"><Link href="/" className="brand"><span className="brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z M6 11v6c4 3 8 3 12 0v-6 M21 9v7"/></svg></span>Fund For Future</Link><div className="dashboard-actions"><nav className="app-navigation" aria-label="Main navigation">{[{ href: "/student-profile", label: "Student profile" }, { href: "/scholarships", label: "Scholarship" }].map(item => <Link key={item.href} className="profile-link" href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>{signedIn ? <button className="text-button" disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out ↪"}</button> : <Link className="text-button" href="/">Sign in</Link>}</div></div>{error && <p className="header-error" role="alert">{error}</p>}</header>;
}
