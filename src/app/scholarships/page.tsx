"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import AppHeader from "@/components/app-header";
import { useStudent, storageKey } from "@/lib/use-student";
import { awardLabel, type Opportunity, type ScholarshipMatch } from "@/lib/opportunities";
import { useScholarships } from "@/lib/use-scholarships";


export default function Scholarships() {
  const { studentId, profile, loading, error } = useStudent();
  const { opportunities, loading: catalogLoading, error: catalogError } = useScholarships();
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [matching, setMatching] = useState(false);
  const [hasMatches, setHasMatches] = useState(false);
  const [matchingError, setMatchingError] = useState("");
  const matchSignature = JSON.stringify([profile, opportunities]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Browse all");
  const [filters, setFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("deadline");
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (detail) dialog.current?.showModal(); }, [detail]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (loading || catalogLoading) return;
    setSaved([]);
    if (!profile) setTab("Browse all");
    try {
      const bookmarks: unknown = studentId ? JSON.parse(localStorage.getItem(storageKey(studentId, "saved")) || "[]") : [];
      if (Array.isArray(bookmarks)) setSaved(bookmarks.filter((v): v is string => typeof v === "string" && opportunities.some(item => item.id === v)));
    } catch { setMessage("Saved scholarships could not be loaded. Check your browser storage settings."); }
    setMatches([]); setHasMatches(false);
    try {
      const cached = studentId ? JSON.parse(sessionStorage.getItem(storageKey(studentId, "matches")) || "null") : null;
      if (cached && cached.signature === matchSignature && cached.expires > Date.now() && Array.isArray(cached.matches)) {
        const restored = cached.matches.filter((item: ScholarshipMatch) => item && opportunities.some(opportunity => opportunity.id === item.id) && Number.isInteger(item.score) && item.score >= 0 && item.score <= 100 && typeof item.reason === "string" && ["potential", "unlikely", "uncertain"].includes(item.status));
        setMatches(restored); setHasMatches(true);
      }
    } catch { /* Matching remains usable when session storage is unavailable. */ }
    setReady(true);
  }, [studentId, loading, profile, catalogLoading, opportunities, matchSignature]);
  async function requestMatches() {
    setMatching(true); setMessage(""); setMatchingError("");
    try {
      const response = await fetch("/api/scholarships/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to match scholarships.");
      if (!Array.isArray(data.matches)) throw new Error("The matching response did not contain scores. Please try again.");
      try { if (studentId) sessionStorage.setItem(storageKey(studentId, "matches"), JSON.stringify({ signature: matchSignature, expires: Date.now() + 10 * 60000, matches: data.matches })); } catch { /* Display scores even if storage is blocked. */ }
      setMatches(data.matches); setHasMatches(true); setTab("Recommended"); setSort("match");
      setMessage("Matched " + data.considered + " of " + data.totalOpen + " open or undated scholarships. Review provider requirements before applying.");
    } catch (error) { setMatchingError(error instanceof Error ? error.message : "Unable to match scholarships."); }
    finally { setMatching(false); }
  }
  function match(item: Opportunity) {
    const result = matches.find(result => result.id === item.id);
    const closed = !!item.date && item.date < new Date().toISOString().slice(0, 10);
    return { closed, score: result?.score ?? 0, reason: result?.reason ?? (closed ? "The listed deadline has passed, so this scholarship is excluded from matching." : matching ? "Gemini is assessing this scholarship…" : matchingError ? "Matching failed. See the error above and try again." : hasMatches ? "This scholarship was not included in the current matching batch." : "Click Match with Gemini to assess fit with your profile."), eligible: !!result && result.status !== "unlikely" && result.score >= 60, status: result?.status };
  }
  function toggleSave(id: string) {
    if (!studentId) { setMessage("Sign in to save scholarships to this device."); return; }
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
    try { localStorage.setItem(storageKey(studentId, "saved"), JSON.stringify(next)); setSaved(next); setMessage(""); } catch { setMessage("Your browser could not save this scholarship."); }
  }
  const recommended = opportunities.filter(item => match(item).eligible);
  const visible = opportunities.filter(item => (tab !== "Saved" || saved.includes(item.id)) && (tab !== "Recommended" || match(item).eligible) && (!category || item.category === category) && `${item.title} ${item.provider} ${item.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "amount" ? (b.amount ?? -1) - (a.amount ?? -1) : sort === "match" ? match(b).score - match(a).score : (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const date = (value: string | null) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Check provider";
  return <><AppHeader signedIn={!!studentId} />
    <main className="scholarship-page"><div className="intro"><p className="eyebrow">{profile ? "Personalized for you" : "Explore scholarships"}</p><h1>Find funding for your next chapter.</h1><p>Explore opportunities selected around your education, interests and goals.</p></div>
      {ready && !profile && <div className="account-required"><p>Save your student profile to see personalized matches.</p><Link className="secondary" href="/student-profile">Complete profile</Link></div>}
      <section className="card matching-panel"><div><h2>Find your scholarship matches</h2><p>Gemini compares your saved education, interests, location and funding preferences with scholarship requirements. Your name, email and account credentials are never sent. Scores estimate fit, not eligibility or chances of winning.</p></div><button className="primary" disabled={!profile || !ready || matching || !!catalogError} onClick={requestMatches}>{matching ? "Matching…" : "Match with Gemini"}</button></section>
      {matchingError && <p className="matching-error" role="alert">{matchingError}</p>}
      <div className="discovery-toolbar"><input aria-label="Search scholarships" placeholder="Search by scholarship, provider or keyword" value={query} onChange={e => setQuery(e.target.value)}/><button className="secondary" aria-expanded={filters} onClick={() => setFilters(!filters)}>Filters ☷</button><select aria-label="Sort scholarships" value={sort} onChange={e => setSort(e.target.value)}><option value="deadline">Deadline: soonest</option><option value="match">Match: highest</option><option value="amount">Award: highest</option></select></div>
      {filters && <div className="filter-panel"><label>Scholarship category<select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{Array.from(new Set(opportunities.map(item => item.category))).map(value => <option key={value}>{value}</option>)}</select></label><button className="text-button" onClick={() => { setCategory(""); setQuery(""); }}>Clear filters</button></div>}
      <div className="scholarship-tabs"><div role="tablist" aria-label="Scholarship lists">{["Recommended", "Saved", "Browse all"].map(value => <button role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} key={value} onClick={() => setTab(value)}>{value}{value === "Recommended" ? ` (${recommended.length})` : value === "Saved" ? ` (${saved.length})` : ""}</button>)}</div><small>{visible.length} scholarships</small></div>
      <p role="status" className="status">{error || catalogError || message}</p>
      {!ready ? <p>Loading your matches…</p> : <div className="scholarship-grid">{visible.map(item => { const result = match(item); return <article className="card scholarship-card" key={item.id}><div className="scholarship-card-top"><span className="opportunity-icon" aria-hidden="true">▧</span><button className={`bookmark ${saved.includes(item.id) ? "is-saved" : ""}`} aria-label={`${saved.includes(item.id) ? "Unsave" : "Save"} ${item.title}`} aria-pressed={saved.includes(item.id)} onClick={() => toggleSave(item.id)}>{saved.includes(item.id) ? "▣" : "♧"}</button></div><h2>{item.title}</h2><p className="provider">{item.provider}</p><div className="award-row"><div><div className="award">{awardLabel(item)}</div><small>Listed award</small></div><div className="deadline"><small>Apply by</small><p>{date(item.date)}{item.date && item.date < new Date().toISOString().slice(0, 10) && " · Closed"}</p></div></div><div className="compatibility"><div><span>Gemini fit score</span><strong>{result.status ? result.score + "/100" : result.closed ? "Closed" : matching ? "Assessing…" : matchingError ? "Match failed" : hasMatches ? "Not included" : "Not assessed"}</strong></div><progress max="100" value={result.score} aria-label={`${item.title} Gemini fit score`}/></div><span className="category-badge">{item.category}</span><p className="match-reason">✧ {result.status === "uncertain" && "Needs verification · "}{result.reason}</p><div className="scholarship-card-bottom"><small>{item.work}</small><button className="secondary" onClick={() => setDetail(item)}>View details ↗</button></div></article>; })}</div>}
      {ready && !catalogError && !visible.length && <section className="card empty-results"><h2>{tab === "Saved" ? "No saved scholarships yet" : tab === "Recommended" && !hasMatches ? "Request your Gemini matches" : "No scholarships match this selection"}</h2><p>{tab === "Saved" ? "Use the bookmark on an opportunity to save it here." : "Try another search or browse all scholarships."}</p><button className="secondary" onClick={() => { setTab("Browse all"); setCategory(""); setQuery(""); }}>Browse all</button></section>}
      <nav className="next-page-nav" aria-label="Next page"><span>Keep your saved opportunities and college costs together.</span><Link className="primary" href="/college-finances">College finances →</Link></nav>
      <footer><span>Scholarship details come from our catalog. Verify current deadlines, award amounts and eligibility with the provider.</span><span>© 2026 Fund For Future</span></footer>
    </main>{detail && <dialog ref={dialog} className="card details-dialog" aria-labelledby="detail-title" onCancel={() => setDetail(null)} onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}><button autoFocus className="secondary close-details" onClick={() => setDetail(null)}>Close ×</button><p className="eyebrow">Scholarship details</p><h2 id="detail-title">{detail.title}</h2><p>{detail.provider}</p><p>{detail.description}</p><h3>Eligibility criteria</h3><p>{detail.criteria}</p><p>{awardLabel(detail)} · Apply by {date(detail.date)}</p><p>{detail.work}</p><p className="hint">AI matching is guidance, not verified eligibility. Apply through the provider. Bookmarks are saved on this device for your account.</p>{detail.url && <a className="secondary provider-link" href={detail.url} target="_blank" rel="noopener noreferrer">Visit provider ↗</a>}<button className="primary" onClick={() => toggleSave(detail.id)}>{saved.includes(detail.id) ? "Remove from saved" : "Save scholarship"}</button></dialog>}</>;
}
