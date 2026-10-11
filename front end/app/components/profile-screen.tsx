"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

const states = "Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming".split(",");
function Select({ label, name, options, initial = "" }: { label: string; name: string; options: string[]; initial?: string }) {
  return <label>{label}<span className="select-wrap"><select name={name} defaultValue={initial}><option value="">Select an option</option>{options.map(option => <option key={option}>{option}</option>)}</select></span></label>;
}
export default function ProfileScreen({ profileOnly = false }: { profileOnly?: boolean }) {
  const [interests, setInterests] = useState<string[]>([]);
  const [profileMessage, setProfileMessage] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  useEffect(() => {
    if (!profileOnly && window.location.hash === "#create-account") setCreateAccount(true);
  }, [profileOnly]);
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profileOnly) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { localStorage.setItem("fund-for-future-profile", JSON.stringify({ ...values, interests })); setProfileMessage("Your profile is saved on this device. Scholarship discovery is coming soon."); }
    catch { setProfileMessage("Your browser could not save this profile. Enable local storage and try again."); }
  }
  return <>
    {!profileOnly && <header><div className="header-inner"><a className="brand" href="/" aria-label="Fund For Future home"><span className="brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M21 9v7"/></svg></span>Fund For Future</a><Link className="profile-link" href="/student-profile"><svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>Student profile</Link></div></header>}
    <main className={profileOnly ? "student-profile-page" : undefined}><div className="intro">{profileOnly ? <h1>Enhance your profile</h1> : <><p className="eyebrow">Your next chapter starts here</p><h1>A little about you. A lot of possibility.</h1><p>Build your student profile to discover scholarships that fit your goals.</p></>}</div>
      {profileOnly && <section className="account-required" aria-labelledby="account-required-title"><div><h3 id="account-required-title">Create an account first</h3><p id="account-required-description">Create an account before editing or saving your student profile.</p></div><Link className="primary account-required-link" href="/#create-account">Create account</Link></section>}<div className={profileOnly ? "profile-only-grid" : "page-grid"}><section className="card profile-card" id="student-information"><h2>Student information</h2><form onSubmit={saveProfile}><fieldset className="profile-fields" disabled={profileOnly} aria-describedby={profileOnly ? "account-required-description" : undefined}>
        <section className="form-section"><h3>Personal details</h3><p className="hint">Your basic information helps us narrow down relevant opportunities.</p><div className="field-grid">
          <label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label><Select label="Home state" name="state" options={states}/>
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
        </div></section><button className="primary save-button" type="submit">Save &amp; discover scholarships <span aria-hidden="true">→</span></button><p className="status" role="status">{profileMessage}</p>
      </fieldset></form></section>
      {!profileOnly && <aside><section className="card account-card" id="create-account"><h3>Your account</h3><p className="account-description">Your profile, saved scholarships and applications stay together</p><div className="account-divider"/><h4>{createAccount ? "Create your account" : "Sign in to a different account"}</h4>
        <form onSubmit={event => { event.preventDefault(); setAccountMessage("This is a demo. Account authentication is not connected yet."); }}>
          <label>Email address<input name="accountEmail" type="email" autoComplete="email" required/></label><label>Password<input name="password" type="password" autoComplete={createAccount ? "new-password" : "current-password"} minLength={8} required/></label>
          <button type="button" className="text-button forgot" onClick={() => setAccountMessage("Password reset will be available when account authentication is connected.")}>Forgot password?</button>
          <div className="account-actions"><button className="primary" type="submit">{createAccount ? "Create account" : "Sign in"}</button><button className="secondary" type="button" onClick={() => { setCreateAccount(!createAccount); setAccountMessage(""); }}>{createAccount ? "Back to sign in" : "Create account"}</button></div><p className="status" role="status">{accountMessage}</p>
        </form></section>
        <section className="discovery-card"><div className="campus-image" role="img" aria-label="Tree-lined university campus with historic brick buildings"/><div className="discovery-content"><h3>More you. Better discovery.</h3><p>We use your education, location and interests to suggest opportunities worth exploring.</p><small>A match is a starting point, not a guarantee. Always check each provider’s eligibility rules before applying.</small></div></section>
      </aside>}</div><footer><span>Demo workspace · All scholarships, dates and financial figures are illustrative sample data.</span><span>© 2026 Fund For Future</span></footer>
    </main>
  </>;
}
