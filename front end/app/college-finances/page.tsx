"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { opportunities } from "../lib/opportunities";

const categories = [
  { key: "tuition", label: "Tuition & fees", description: "Tuition and required university fees." },
  { key: "housing", label: "Housing & meals", description: "Room, board and your meal plan." },
  { key: "books", label: "Books & supplies", description: "Textbooks, course materials and equipment." },
  { key: "personal", label: "Transportation & personal", description: "Travel, daily essentials and personal expenses." },
] as const;
type Budget = { college: string; tuition: number; housing: number; books: number; personal: number; grants: number };
type Status = "Saved" | "Applied" | "Awarded" | "Not selected";
const statuses: Status[] = ["Saved", "Applied", "Awarded", "Not selected"];
const defaults: Budget = { college: "Sample State University", tuition: 18000, housing: 10000, books: 1200, personal: 2800, grants: 0 };
const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const validAmount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

function AmountInput({ id, name, label, value, onChange }: { id: string; name: string; label: string; value: number; onChange: (value: string) => void }) {
  const [text, setText] = useState(value === 0 ? "" : String(value));
  useEffect(() => { setText(value === 0 ? "" : String(value)); }, [value]);
  return <input id={id} name={name} aria-label={label} type="number" inputMode="numeric" min="0" max="10000000" step="1" value={text}
    onFocus={event => event.currentTarget.select()}
    onChange={event => { setText(event.target.value); onChange(event.target.value); }}
    onBlur={() => setText(value === 0 ? "" : String(value))}/>;
}

export default function CollegeFinances() {
  const [budget, setBudget] = useState<Budget>(defaults);
  const [savedBudget, setSavedBudget] = useState<Budget>(defaults);
  const [saved, setSaved] = useState<string[]>([]);
  const [tracking, setTracking] = useState<Record<string, Status>>({});
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let failed = false;
    try {
      const ids: unknown = JSON.parse(localStorage.getItem("fund-for-future-saved") || "[]");
      if (Array.isArray(ids)) setSaved(ids.filter((id): id is string => typeof id === "string"));
    } catch { failed = true; }
    try {
      const stored = JSON.parse(localStorage.getItem("fund-for-future-budget") || "null");
      if (stored && typeof stored === "object") {
        const next = { ...defaults };
        if (typeof stored.college === "string") next.college = stored.college;
        for (const key of ["tuition", "housing", "books", "personal", "grants"] as const) if (validAmount(stored[key])) next[key] = stored[key];
        setBudget(next); setSavedBudget(next);
      }
    } catch { failed = true; }
    try {
      const stored = JSON.parse(localStorage.getItem("fund-for-future-tracking") || "{}");
      if (stored && typeof stored === "object") setTracking(Object.fromEntries(Object.entries(stored).filter(([, value]) => statuses.includes(value as Status))) as Record<string, Status>);
    } catch { failed = true; }
    if (failed) setMessage("Some saved information could not be loaded. Check your browser storage settings.");
    setReady(true);
  }, []);
  const scholarships = opportunities.filter(item => saved.includes(item.id));
  const total = categories.reduce((sum, item) => sum + budget[item.key], 0);
  const awarded = scholarships.filter(item => tracking[item.id] === "Awarded").reduce((sum, item) => sum + item.amount, 0);
  const pending = scholarships.filter(item => !tracking[item.id] || tracking[item.id] === "Saved" || tracking[item.id] === "Applied").reduce((sum, item) => sum + item.amount, 0);
  const confirmed = budget.grants + awarded;
  const gap = Math.max(0, total - confirmed);
  const coverage = total > 0 ? Math.min(100, Math.round(confirmed / total * 100)) : 0;
  function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { localStorage.setItem("fund-for-future-budget", JSON.stringify(budget)); setSavedBudget({ ...budget }); setMessage("Your budget is saved on this device."); }
    catch { setMessage("Your browser could not save the budget. Your edits are still visible here."); }
  }
  function updateStatus(id: string, status: Status) {
    const next = { ...tracking, [id]: status };
    try { localStorage.setItem("fund-for-future-tracking", JSON.stringify(next)); setTracking(next); setMessage("Scholarship status saved."); }
    catch { setMessage("Your browser could not save this status. Please try again."); }
  }
  function amount(key: Exclude<keyof Budget, "college">, value: string) {
    const number = Number(value);
    setBudget(current => ({ ...current, [key]: validAmount(number) ? number : 0 }));
  }
  return <><header><div className="header-inner"><Link href="/" className="brand"><span className="brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z M6 11v6c4 3 8 3 12 0v-6 M21 9v7"/></svg></span>Fund For Future</Link><div className="dashboard-actions"><Link className="secondary" href="/student-profile">Edit student profile</Link><button className="text-button" onClick={() => { sessionStorage.removeItem("fund-for-future-session"); window.location.href = "/"; }}>Sign out ↪</button></div></div></header>
    <main className="finance-page"><Link className="finance-back" href="/scholarships">← Back to scholarships</Link><div className="intro"><p className="eyebrow">Plan your next chapter</p><h1>Your scholarships. Your college budget.</h1><p>Track saved opportunities and adjust annual costs to see what’s covered and what’s still to fund.</p></div>
      <p className="status finance-status" role="status">{message}</p>
      {!ready ? <p>Loading your saved scholarships and budget…</p> : <><div className="finance-grid"><form className="card budget-card" onSubmit={saveBudget}><div className="college-banner"><span className="opportunity-icon" aria-hidden="true">▥</span><label>College or university<input name="college" value={budget.college} onChange={e => setBudget({ ...budget, college: e.target.value })} required maxLength={120}/><small>Estimated annual budget · USD / year</small></label></div><div className="budget-content"><h2>Your annual costs</h2><p className="hint">Enter the full-year amount for each category, before financial aid.</p>{categories.map(item => <div className="cost-row" key={item.key}><div><label htmlFor={`cost-${item.key}`}>{item.label}</label><p>{item.description}</p></div><div className="currency-field"><span aria-hidden="true">$</span><AmountInput id={`cost-${item.key}`} name={item.key} label={`${item.label} in USD per year`} value={budget[item.key]} onChange={value => amount(item.key, value)}/></div></div>)}<div className="budget-total"><div><strong>Estimated annual total</strong><small>All four cost categories combined</small></div><output>{money(total)}</output></div><div className="cost-row grant-row"><div><label htmlFor="grants">Grants & institutional aid</label><p>Confirmed annual aid, excluding scholarships below.</p></div><div className="currency-field"><span aria-hidden="true">$</span><AmountInput id="grants" name="grants" label="Grants and institutional aid in USD per year" value={budget.grants} onChange={value => amount("grants", value)}/></div></div></div><div className="budget-controls"><small>Save your costs and grants to update this device’s budget.</small><div><button type="button" className="secondary" onClick={() => { setBudget({ ...savedBudget }); setMessage("Unsaved budget changes discarded."); }}>Cancel</button><button className="primary" type="submit">Save budget</button></div></div></form>
      <aside className="funding-sidebar"><section className="card funding-card"><h2>Your funding picture</h2><p className="hint">Based on your current estimated annual budget.</p><small>Estimated annual budget</small><div className="funding-total">{money(total)}</div><div className="funding-confirmed"><div className="funding-label"><strong>Confirmed funding</strong><span>{coverage}% covered</span></div><div className="confirmed-amount">{money(confirmed)}</div><div className="funding-bar" role="img" aria-label={`${money(confirmed)} confirmed funding of ${money(total)} estimated costs`}><span style={{ width: `${total > 0 ? Math.min(100, budget.grants / total * 100) : 0}%` }}/><span style={{ width: `${total > 0 ? Math.min(Math.max(0, 100 - budget.grants / total * 100), awarded / total * 100) : 0}%` }}/></div><div className="funding-line"><span>Grants & institutional aid</span><strong>{money(budget.grants)}</strong></div><div className="funding-line"><span>Awarded scholarships</span><strong>{money(awarded)}</strong></div><div className="funding-gap"><div><strong>Still to fund</strong><small>Your remaining annual gap</small></div><strong>{money(gap)}</strong></div>{confirmed > total && <p className="hint">Funding exceeds your estimated costs by {money(confirmed - total)}.</p>}<div className="pending-note"><strong>{money(pending)} in pending scholarships</strong><p>Includes Saved and Applied scholarships. Not included in covered costs until marked Awarded.</p></div></div></section><section className="card planning-note"><h3>A plan, not a bill</h3><p>Planning estimates only. Check your college’s published costs. Saved scholarships are not confirmed funding.</p></section></aside></div>
      <section className="card tracker-card" aria-labelledby="tracker-title"><div className="tracker-heading"><div><p className="eyebrow">Your saved opportunities</p><h2 id="tracker-title">Scholarship tracker</h2><p className="hint">Update each status as you apply. Changes are saved on this device.</p></div><Link className="secondary" href="/scholarships">Find scholarships ↗</Link></div>{!scholarships.length ? <div className="tracker-empty"><h3>No saved scholarships yet</h3><p>Bookmark an opportunity on the scholarships page to track it here.</p><Link className="primary" href="/scholarships">Browse scholarships</Link></div> : <div className="tracker-list">{scholarships.map(item => <article className="tracker-row" key={item.id}><div><h3>{item.title}</h3><p>{item.provider}</p><small>Apply by {new Date(`${item.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</small></div><strong className="tracker-amount">{money(item.amount)}</strong><label>Status<select aria-label={`Status for ${item.title}`} value={tracking[item.id] || "Saved"} onChange={e => updateStatus(item.id, e.target.value as Status)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label></article>)}</div>}<p className="tracker-disclaimer">Sample award amounts are used for planning. Statuses are self-reported and do not submit applications or verify awards.</p></section></>}
      <footer><span>Demo workspace · All scholarships, dates and financial figures are illustrative sample data.</span><span>© 2026 Fund For Future</span></footer>
    </main></>;
}
