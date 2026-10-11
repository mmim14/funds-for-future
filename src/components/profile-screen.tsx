"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import AppHeader from "@/components/app-header";

const states = "Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming".split(",");
function Select({ label, name, options, initial = "" }: { label: string; name: string; options: string[]; initial?: string }) {
  return <label>{label}<span className="select-wrap"><select name={name} defaultValue={initial}><option value="">Select an option</option>{options.map(option => <option key={option}>{option}</option>)}</select></span></label>;
}
export default function ProfileScreen({ profileOnly = false }: { profileOnly?: boolean }) {
  const [interests, setInterests] = useState<string[]>([]);
  const [profileMessage, setProfileMessage] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const profileForm = useRef<HTMLFormElement>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  function populateProfile(profile: Record<string, unknown>) {
    for (const [name, value] of Object.entries(profile)) {
      const element = profileForm.current?.elements.namedItem(name);
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) element.value = String(value ?? "");
    }
    if (Array.isArray(profile.interests)) setInterests(profile.interests as string[]);
  }
  useEffect(() => {
    if (!profileOnly && window.location.hash === "#create-account") setCreateAccount(true);
    const controller = new AbortController();
    fetch("/api/student/profile", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (response.status === 401) return;
        if (!response.ok) throw new Error("Unable to load your student information.");
        const data = await response.json();
        setSignedIn(true); setStudentEmail(data.student.email);
        if (data.profile) populateProfile(data.profile);
      })
      .catch(error => { if (error.name !== "AbortError") setProfileMessage("Unable to load your account. Please try again."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [profileOnly]);
  function profileValues() {
    if (!profileForm.current) throw new Error("Student form is unavailable.");
    return { ...Object.fromEntries(new FormData(profileForm.current)), interests };
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) { setCreateAccount(true); setProfileMessage("Complete your student information, then create your account to save it."); return; }
    setBusy(true); setProfileMessage("");
    try {
      const response = await fetch("/api/student/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileValues()) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProfileMessage(data.message);
    } catch (error) { setProfileMessage(error instanceof Error ? error.message : "Unable to save. Please try again."); }
    finally { setBusy(false); }
  }
  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createAccount && !profileForm.current?.reportValidity()) { setAccountMessage("Complete your student information on the left first."); return; }
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true); setAccountMessage("");
    try {
      const response = await fetch(createAccount ? "/api/auth/register" : "/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.get("accountEmail"), password: fields.get("password"), ...(createAccount ? { profile: profileValues() } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSignedIn(true); setStudentEmail(data.student.email); form.reset();
      setAccountMessage(createAccount ? "Account created. Your student information is saved in the database." : "Signed in successfully.");
      if (!createAccount) {
        const loaded = await fetch("/api/student/profile", { cache: "no-store" });
        if (!loaded.ok) throw new Error("Signed in, but your profile could not be loaded. Refresh to try again.");
        const saved = await loaded.json();
        if (saved.profile) populateProfile(saved.profile);
      }
    } catch (error) { setAccountMessage(error instanceof Error ? error.message : "Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      window.location.assign("/");
    } catch (error) { setAccountMessage(error instanceof Error ? error.message : "Unable to sign out."); setBusy(false); }
  }
  return <>
    <AppHeader signedIn={signedIn} />
    <main className={profileOnly ? "student-profile-page" : undefined}><div className="intro">{profileOnly ? <h1>Enhance your profile</h1> : <><p className="eyebrow">Your next chapter starts here</p><h1>A little about you. A lot of possibility.</h1><p>Build your student profile to discover scholarships that fit your goals.</p></>}</div>
      {profileOnly && !signedIn && !loading && <section className="account-required" aria-labelledby="account-required-title"><div><h3 id="account-required-title">Create an account first</h3><p id="account-required-description">Create an account before editing or saving your student profile.</p></div><Link className="primary account-required-link" href="/#create-account">Create account</Link></section>}<div className={profileOnly ? "profile-only-grid" : "page-grid"}><section className="card profile-card" id="student-information"><h2>Student information</h2><form ref={profileForm} onSubmit={saveProfile}><fieldset className="profile-fields" disabled={busy || loading || (profileOnly && !signedIn)} aria-describedby={profileOnly ? "account-required-description" : undefined}>
        <section className="form-section"><h3>Personal details</h3><p className="hint">Your basic information helps us narrow down relevant opportunities.</p><div className="field-grid">
          <label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" value={studentEmail} onChange={event => setStudentEmail(event.target.value)} readOnly={signedIn} placeholder="you@example.com" required /></label><Select label="Home state" name="state" options={states}/>
        </div></section>
        <section className="form-section"><h3>Education &amp; interests</h3><p className="hint">Tell us where you are now and where you want to go.</p><div className="field-grid">
          <Select label="Current education level" name="education" initial="High school senior" options={["High school junior", "High school senior", "Undergraduate", "Transfer student", "Graduate student", "PhD student"]}/>
          <Select label="Expected college start" name="collegeStart" initial="Fall 2027" options={["Spring 2027", "Fall 2027", "Spring 2028", "Fall 2028", "Already enrolled"]}/>
          <Select label="Intended field of study" name="major" initial="Computer science" options={["Computer science", "Engineering", "Business", "Health sciences", "Arts & humanities", "Education", "Natural sciences", "Undecided"]}/>
          <label>Unweighted GPA<input name="gpa" type="number" min="0" max="4" step="0.01" defaultValue="3.70"/></label>
        </div><div className="interests"><span>Activities &amp; interests</span>{interests.map((interest, index) => <div className="interest-row" key={index}><input aria-label={`Interest ${index + 1}`} value={interest} placeholder="e.g. Volunteering" onChange={event => setInterests(interests.map((value, i) => i === index ? event.target.value : value))}/><button type="button" className="text-button" aria-label={`Remove interest ${index + 1}`} onClick={() => setInterests(interests.filter((_, i) => i !== index))}>Remove</button></div>)}<button className="text-button" type="button" onClick={() => setInterests([...interests, ""])}>+ Add interest</button></div></section>
        <section className="form-section last-section"><h3>Funding preferences</h3><p className="hint">Optional details can help you find more specific scholarships.</p><div className="field-grid">
          <Select label="First-generation college student" name="firstGeneration" initial="Yes" options={["Yes", "No", "Not sure", "Prefer not to say"]}/>
          <Select label="Scholarship preference" name="preference" initial="Merit & need-based" options={["Merit & need-based", "Merit-based", "Need-based", "Any scholarship"]}/>
          <label>Current tuition<input name="tuition" type="number" min="0" step="0.01"/></label>
          <Select label="Annual household income (USD)" name="householdIncome" options={["Low income: under $82,500", "Middle class: $82,500–$132,000", "Upper class: over $132,000", "Prefer not to say"]}/>
        </div></section><button className="primary save-button" type="submit">Save student information <span aria-hidden="true">→</span></button><p className="status" role="status">{profileMessage}</p>
      </fieldset></form></section>
      {!profileOnly && <aside><section className="card account-card" id="create-account"><h3>Your account</h3><p className="account-description">Your profile, saved scholarships and applications stay together</p><div className="account-divider"/><h4>{signedIn ? "Your account is connected" : createAccount ? "Create your account" : "Sign in"}</h4>
        {signedIn ? <div><p>{studentEmail}</p><button className="secondary" type="button" disabled={busy} onClick={signOut}>Sign out</button><p className="status" role="status">{accountMessage}</p></div> : <form onSubmit={submitAccount}>
          <label>Email address<input name="accountEmail" type="email" autoComplete="email" value={studentEmail} onChange={event => setStudentEmail(event.target.value)} required/></label><label>Password<input name="password" type="password" autoComplete={createAccount ? "new-password" : "current-password"} minLength={8} maxLength={128} required/></label>
          <button type="button" className="text-button forgot" onClick={() => setAccountMessage("Password reset is not available in this prototype yet.")}>Forgot password?</button>
          <div className="account-actions"><button className="primary" type="submit" disabled={busy || loading || signedIn}>{busy ? "Saving…" : signedIn ? "Signed in" : createAccount ? "Create account" : "Sign in"}</button><button className="secondary" type="button" disabled={busy || loading || signedIn} onClick={() => { setCreateAccount(!createAccount); setAccountMessage(""); }}>{createAccount ? "Back to sign in" : "Create account"}</button></div><p className="status" role="status">{accountMessage || (signedIn ? "Signed in as " + studentEmail : "")}</p>
        </form>}</section>
        <section className="discovery-card"><div className="campus-image" role="img" aria-label="Tree-lined university campus with historic brick buildings"/><div className="discovery-content"><h3>More you. Better discovery.</h3><p>We use your education, location and interests to suggest opportunities worth exploring.</p><small>A match is a starting point, not a guarantee. Always check each provider’s eligibility rules before applying.</small></div></section>
      </aside>}</div><footer><span>Student information is saved to your account. Explore sample opportunities in the Scholarship tab.</span><span>© 2026 Fund For Future</span></footer>
    </main>
  </>;
}
