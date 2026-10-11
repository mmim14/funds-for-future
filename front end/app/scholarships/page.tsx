"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Profile = Record<string, string>;
function Icon({ bookmark = false }: { bookmark?: boolean }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">{bookmark ? <path d="M6 3h12v18l-6-4-6 4V3Z"/> : <><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M22 9v7"/></>}</svg>; }
import { opportunities } from "../lib/opportunities";

type Opportunity = typeof opportunities[number];
export default function Scholarships() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Recommended");
  const [filters, setFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("deadline");
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (detail) dialog.current?.showModal(); }, [detail]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("fund-for-future-profile") || "null");
      if (data && typeof data === "object") { setProfile(data); setInterests(Array.isArray(data.interests) ? data.interests.filter((v: unknown) => typeof v === "string") : []); }
      const bookmarks = JSON.parse(localStorage.getItem("fund-for-future-saved") || "[]");
      if (Array.isArray(bookmarks)) setSaved(bookmarks.filter((v: unknown) => typeof v === "string"));
    } catch { setMessage("Saved information could not be loaded. Please save your profile again."); }
    setReady(true);
  }, []);
  function match(item: Opportunity) {
    const stem = ["Computer science", "Engineering", "Natural sciences"].includes(profile?.major || "");
    const tech = ["Computer science", "Engineering"].includes(profile?.major || "");
    const service = interests.some(value => /volunteer|community|service/i.test(value));
    const rules = item.id === "stem" ? [[stem, `Your ${profile?.major?.toLowerCase()} interest`], [Number(profile?.gpa || 0) >= 3, `Your ${profile?.gpa} GPA`]] : item.id === "first" ? [[profile?.firstGeneration === "Yes", "Your first-generation student profile"]] : item.id === "community" ? [[profile?.state === "California", "Your California residency"], [service, "Your volunteer work"]] : [[tech, "Your technology interests"], [!!profile?.collegeStart?.includes("2027"), "Your college start in 2027"]];
    const reasons = rules.filter(([passed]) => passed).map(([, reason]) => String(reason));
    return { score: Math.round(reasons.length / rules.length * 100), reason: reasons.join(" · ") || "Explore the eligibility requirements", eligible: reasons.length === rules.length };
  }
  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
    try { localStorage.setItem("fund-for-future-saved", JSON.stringify(next)); setSaved(next); setMessage(""); } catch { setMessage("Your browser could not save this scholarship."); }
  }
  const recommended = opportunities.filter(item => match(item).eligible);
  const visible = opportunities.filter(item => (tab !== "Saved" || saved.includes(item.id)) && (tab !== "Recommended" || match(item).eligible) && (!category || item.category === category) && `${item.title} ${item.provider} ${item.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "amount" ? b.amount - a.amount : sort === "match" ? match(b).score - match(a).score : a.date.localeCompare(b.date));
  const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  return <><header><div className="header-inner"><Link href="/" className="brand"><span className="brand-icon">♧</span>Fund For Future</Link><div className="dashboard-actions"><Link href="/student-profile" className="secondary">Edit student profile ♙</Link><button className="text-button" onClick={() => { sessionStorage.removeItem("fund-for-future-session"); window.location.href = "/"; }}>Sign out ↪</button></div></div></header>
    <main className="scholarship-page"><div className="intro"><p className="eyebrow">Personalized for you</p><h1>Find funding for your next chapter.</h1><p>Explore opportunities selected around your education, interests and goals.</p></div>
      {ready && !profile && <div className="account-required"><p>Save your student profile to see personalized matches.</p><Link className="secondary" href="/">Complete profile</Link></div>}
      <div className="discovery-toolbar"><input aria-label="Search scholarships" placeholder="Search by scholarship, provider or keyword" value={query} onChange={e => setQuery(e.target.value)}/><button className="secondary" aria-expanded={filters} onClick={() => setFilters(!filters)}>Filters ☷</button><select aria-label="Sort scholarships" value={sort} onChange={e => setSort(e.target.value)}><option value="deadline">Deadline: soonest</option><option value="match">Match: highest</option><option value="amount">Award: highest</option></select></div>
      {filters && <div className="filter-panel"><label>Scholarship category<select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{opportunities.map(item => <option key={item.id}>{item.category}</option>)}</select></label><button className="text-button" onClick={() => { setCategory(""); setQuery(""); }}>Clear filters</button></div>}
      <div className="scholarship-tabs"><div role="tablist" aria-label="Scholarship lists">{["Recommended", "Saved", "Browse all"].map(value => <button role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} key={value} onClick={() => setTab(value)}>{value}{value === "Recommended" ? ` (${recommended.length})` : value === "Saved" ? ` (${saved.length})` : ""}</button>)}</div><small>{visible.length} sample opportunities</small></div>
      <p role="status" className="status">{message}</p>
      {!ready ? <p>Loading your matches…</p> : <div className="scholarship-grid">{visible.map(item => { const result = match(item); return <article className="card scholarship-card" key={item.id}><div className="scholarship-card-top"><span className="opportunity-icon" aria-hidden="true">{item.id === "stem" ? "♧" : item.id === "first" ? "♙" : item.id === "community" ? "♡" : "▧"}</span><button className={`bookmark ${saved.includes(item.id) ? "is-saved" : ""}`} aria-label={`${saved.includes(item.id) ? "Unsave" : "Save"} ${item.title}`} aria-pressed={saved.includes(item.id)} onClick={() => toggleSave(item.id)}>{saved.includes(item.id) ? "▣" : "♧"}</button></div><h2>{item.title}</h2><p className="provider">{item.provider}</p><div className="award-row"><div><div className="award">${item.amount.toLocaleString("en-US")}</div><small>One-time award</small></div><div className="deadline"><small>Apply by</small><p>{date(item.date)}</p></div></div><div className="compatibility"><div><span>Profile criteria matched</span><strong>{result.score}%</strong></div><progress max="100" value={result.score} aria-label={`${item.title} profile criteria matched`}/></div><span className="category-badge">{item.category}</span><p className="match-reason">✧ {result.reason}</p><div className="scholarship-card-bottom"><small>{item.work}</small><button className="secondary" onClick={() => setDetail(item)}>View details ↗</button></div></article>; })}</div>}
      {ready && !visible.length && <section className="card empty-results"><h2>{tab === "Saved" ? "No saved scholarships yet" : "No scholarships match this selection"}</h2><p>{tab === "Saved" ? "Use the bookmark on an opportunity to save it here." : "Try another search or browse all sample opportunities."}</p><button className="secondary" onClick={() => { setTab("Browse all"); setCategory(""); setQuery(""); }}>Browse all</button></section>}
      <nav className="next-page-nav" aria-label="Next page"><span>Keep your saved opportunities and college costs together.</span><Link className="primary" href="/college-finances">Next page ?</Link></nav>
      <footer><span>Demo workspace · All scholarships, dates and financial figures are illustrative sample data.</span><span>© 2026 Fund For Future</span></footer>
    </main>{detail && <dialog ref={dialog} className="card details-dialog" aria-labelledby="detail-title" onCancel={() => setDetail(null)} onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}><button autoFocus className="secondary close-details" onClick={() => setDetail(null)}>Close ×</button><p className="eyebrow">Sample opportunity</p><h2 id="detail-title">{detail.title}</h2><p>{detail.provider}</p><p>{detail.description}</p><h3>Eligibility criteria</h3><p>{detail.criteria}</p><p>${detail.amount.toLocaleString("en-US")} · Apply by {date(detail.date)}</p><p>{detail.work}</p><p className="hint">Matches count the sample criteria that fit your profile. These are illustrative opportunities; applications are not available.</p><button className="primary" onClick={() => toggleSave(detail.id)}>{saved.includes(detail.id) ? "Remove from saved" : "Save scholarship"}</button></dialog>}</>;
}
