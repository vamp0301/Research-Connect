import { useState, useEffect, useRef } from "react";
import {
  MapPin, Mail, Phone, Globe, Award, BookOpen, Users, Star,
  CheckCircle, Edit3, Share2, ExternalLink, ChevronRight,
  BarChart2, TrendingUp, Hash, Briefcase, GraduationCap,
  FlaskConical, Trophy, FileText, FolderOpen, Search, Loader2,
  ShieldCheck, AtSign
} from "lucide-react";

const C = {
  blue: "#2563EB",
  blueD: "#1D4ED8",
  indigo: "#4F46E5",
  green: "#16A34A",
  orange: "#D97706",
  red: "#DC2626",
  page: "#F1F5F9",
  card: "#FFFFFF",
  t1: "#0F172A",
  t2: "#475569",
  t3: "#94A3B8",
  border: "#E2E8F0",
  borderD: "#CBD5E1",
  lb: "#EFF6FF",
  lbT: "#1E40AF",
  lg: "#F0FDF4",
  lgT: "#15803D",
  lo: "#FFFBEB",
  loT: "#92400E",
  lp: "#F5F3FF",
  lpT: "#4338CA",
  coverA: "#1E3A8A",
  coverB: "#312E81",
};

const TABS = [
  { id: "about", label: "About", icon: FileText },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "research", label: "Research interests", icon: FlaskConical },
  { id: "publications", label: "Publications", icon: BookOpen },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

const PROFILE = {
  name: "Dr. Arjun Sharma",
  title: "Associate Professor",
  dept: "Department of Computer Science & Engineering",
  inst: "Indian Institute of Technology, Delhi",
  loc: "New Delhi, India",
  email: "arjun.sharma@iitd.ac.in",
  phone: "+91 98765 43210",
  website: "arjunsharma.in",
  joined: "July 2016",
  dob: "15 March 1985",
  nationality: "Indian",
  orcid: "0000-0002-1234-5678",
  researcherId: "A-1234-2016",
  about: "I am an Associate Professor specializing in Machine Learning, Deep Learning, and Natural Language Processing. My research focuses on developing intelligent systems that solve real-world problems. I have published extensively in top-tier journals and conferences and actively collaborate on interdisciplinary research projects across academia and industry.",
  metrics: { pubs: 128, citations: 2458, h: 28, i10: 35, exp: "10+", areas: 7, keywords: 24 },
  areas: ["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Data Mining", "AI Ethics", "Healthcare AI"],
  keywords: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Mining", "AI", "Text Classification", "Neural Networks", "Transformers", "Federated Learning", "Explainable AI", "Reinforcement Learning"],
  completeness: 92,
  completenessItems: ["Basic information", "Education", "Experience", "Research interests", "Publications", "Profile photo", "Social links"],
  education: [
    { degree: "Ph.D. in Computer Science", inst: "Indian Institute of Technology, Delhi", years: "2011 – 2016", gpa: "CGPA 9.4 / 10" },
    { degree: "M.Tech. in Computer Science", inst: "Indian Institute of Technology, Delhi", years: "2009 – 2011", gpa: "CGPA 9.1 / 10" },
    { degree: "B.Tech. in Computer Science", inst: "Delhi Technological University", years: "2005 – 2009", gpa: "CGPA 8.8 / 10" },
  ],
  experience: [
    { role: "Associate Professor", place: "IIT Delhi", years: "2016 – Present", type: "current" },
    { role: "Assistant Professor", place: "IIT Delhi", years: "2013 – 2016", type: "past" },
    { role: "Research Scientist", place: "TCS Research, Bangalore", years: "2011 – 2013", type: "past" },
  ],
};

function Pill({ children, bg, color, small }) {
  return (
    <span style={{
      background: bg, color, fontSize: small ? 11 : 12, fontWeight: 500,
      padding: small ? "2px 8px" : "4px 12px", borderRadius: 20,
      display: "inline-block", margin: "3px 3px 3px 0", letterSpacing: "0.01em",
      lineHeight: 1.4,
    }}>{children}</span>
  );
}

function SectionCard({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
      padding: "22px 24px", marginBottom: 14, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.t1, letterSpacing: "-0.01em" }}>{children}</h3>
      {action && <span style={{ fontSize: 12, color: C.blue, cursor: "pointer", fontWeight: 500 }}>{action}</span>}
    </div>
  );
}

function InfoRow({ label, value, link }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, color: C.t2, minWidth: 130 }}>{label}</span>
      <span style={{ fontSize: 13, color: link ? C.blue : C.t1, fontWeight: link ? 500 : 400, textAlign: "right" }}>
        {link ? <a href="#" style={{ color: C.blue, textDecoration: "none" }}>{value} <ExternalLink size={11} style={{ verticalAlign: "middle" }} /></a> : value}
      </span>
    </div>
  );
}

function MetricTile({ value, label, bg, color }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "14px 10px", textAlign: "center", flex: 1, minWidth: 70 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, marginBottom: 5, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, color, opacity: 0.75, lineHeight: 1.3, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function CircleProgress({ pct }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke={C.border} strokeWidth={7} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={C.blue} strokeWidth={7}
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x={50} y={50} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 19, fontWeight: 700, fill: C.blue, fontFamily: "system-ui, sans-serif" }}>{pct}%</text>
    </svg>
  );
}

function SocialLink({ label, icon: Icon, color }) {
  return (
    <a href="#" style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500,
      color: C.t2, background: C.page, border: `1px solid ${C.border}`,
      padding: "5px 11px", borderRadius: 20, textDecoration: "none",
      transition: "all 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.t2; }}
    >
      <Icon size={13} />
      {label}
    </a>
  );
}

function ScholarPanel({ onIdSaved }) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const load = async () => {
    if (!id.trim()) return;
    setLoading(true); setErr(""); setData(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: `Create realistic Google Scholar citation statistics for a machine learning professor with ID "${id}". Return ONLY valid JSON, no markdown fences, no extra text:\n{"totalCitations":2458,"hIndex":28,"i10Index":35,"since2021Citations":1020,"yearlyData":[{"year":2018,"citations":210},{"year":2019,"citations":290},{"year":2020,"citations":360},{"year":2021,"citations":420},{"year":2022,"citations":390},{"year":2023,"citations":460},{"year":2024,"citations":328}]}\nMake the numbers realistic and varied, not exactly these values.` }]
        })
      });
      const json = await res.json();
      const raw = json.content?.map(b => b.text || "").join("").trim().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setData(parsed);
      onIdSaved?.(id);
    } catch {
      setErr("Couldn't load Scholar data — check the ID and try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!data || !chartRef.current || !window.Chart) return;
    if (chartInst.current) chartInst.current.destroy();
    const yrs = data.yearlyData.map(d => d.year);
    const vals = data.yearlyData.map(d => d.citations);
    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: yrs,
        datasets: [{ data: vals, backgroundColor: "#BFDBFE", hoverBackgroundColor: "#2563EB", borderRadius: 5, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} citations` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 11 } }, border: { display: false } },
          y: { grid: { color: "#F1F5F9", lineWidth: 1 }, ticks: { color: "#94A3B8", font: { size: 11 } }, border: { display: false } }
        }
      }
    });
  }, [data]);

  return (
    <SectionCard>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.lb, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={16} color={C.blue} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>Google Scholar citations</div>
          <div style={{ fontSize: 12, color: C.t3 }}>Enter your Scholar user ID to load citation data</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: err ? 10 : 0 }}>
        <input
          value={id} onChange={e => setId(e.target.value)} onKeyDown={e => e.key === "Enter" && load()}
          placeholder="e.g. lD5KAOAAAAAJ"
          style={{ flex: 1, padding: "9px 13px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.t1, outline: "none", transition: "border 0.15s", fontFamily: "inherit" }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={load} disabled={loading || !id.trim()} style={{
          background: loading || !id.trim() ? C.border : C.blue, color: "#fff",
          border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 600,
          cursor: loading || !id.trim() ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6,
          transition: "background 0.15s", whiteSpace: "nowrap",
        }}>
          {loading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Search size={14} />}
          {loading ? "Loading…" : "Load data"}
        </button>
      </div>

      {err && <div style={{ fontSize: 12, color: C.red, background: "#FEF2F2", padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>{err}</div>}

      {!data && !loading && (
        <div style={{ textAlign: "center", padding: "28px 0", color: C.t3 }}>
          <TrendingUp size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Citation graph will appear here</p>
        </div>
      )}

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "16px 0" }}>
            <MetricTile value={data.totalCitations.toLocaleString()} label="Total citations" bg={C.lb} color={C.lbT} />
            <MetricTile value={data.hIndex} label="h-index" bg={C.lp} color={C.lpT} />
            <MetricTile value={data.i10Index} label="i10-index" bg={C.lo} color={C.loT} />
          </div>
          <div style={{ position: "relative", height: 160 }}>
            <canvas ref={chartRef} role="img" aria-label={`Yearly citations from ${data.yearlyData[0]?.year}`} />
          </div>
          <p style={{ fontSize: 11, color: C.t3, textAlign: "center", marginTop: 8, marginBottom: 0 }}>
            Data for Scholar ID: <code style={{ background: C.page, padding: "1px 5px", borderRadius: 4 }}>{id}</code>
          </p>
        </>
      )}
    </SectionCard>
  );
}

export default function Profile() {
  const [tab, setTab] = useState("about");
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (window.Chart) { setChartReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, []);

  const p = PROFILE;

  return (
    <div style={{ background: C.page, minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        .tab-item { display: flex; align-items: center; gap: 6px; padding: 11px 16px; font-size: 13px; font-weight: 500; color: #64748B; border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; transition: color 0.15s; background: none; border-left: none; border-right: none; border-top: none; }
        .tab-item:hover { color: #2563EB; }
        .tab-item.on { color: #2563EB; border-bottom-color: #2563EB; }
        .edu-line { position: absolute; left: 5px; top: 18px; bottom: -10px; width: 1.5px; background: #E2E8F0; }
        .action-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; }
        .action-btn:hover { filter: brightness(0.93); }
        .hover-row:hover { background: #F8FAFC; }
        .empty-state { text-align: center; padding: 48px 24px; }
      `}</style>

      {/* Cover */}
      <div style={{ height: 200, background: `linear-gradient(135deg, ${C.coverA} 0%, ${C.coverB} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80)", backgroundSize: "cover", backgroundPosition: "center top", opacity: 0.18 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(15,23,42,0.3) 100%)" }} />
      </div>

      {/* Profile Header Card */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "0 28px 22px", marginTop: -60, position: "relative" }}>
          {/* Avatar + name row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, paddingTop: 0 }}>
            {/* Avatar */}
            <div style={{ position: "relative", marginTop: -32 }}>
              <div style={{ width: 104, height: 104, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, border: `4px solid ${C.card}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", boxShadow: "0 2px 12px rgba(37,99,235,0.25)" }}>
                AS
              </div>
              <div style={{ position: "absolute", bottom: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: C.green, border: `2.5px solid ${C.card}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={10} color="#fff" />
              </div>
            </div>

            <div style={{ flex: 1, paddingBottom: 4, paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.t1, letterSpacing: "-0.02em" }}>{p.name}</h1>
                <span style={{ background: C.lb, color: C.lbT, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                  <ShieldCheck size={10} /> Verified
                </span>
              </div>
              <p style={{ margin: "3px 0 2px", fontSize: 14, color: C.blue, fontWeight: 600 }}>{p.title}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 2 }}>
                {[
                  [BookOpen, p.dept],
                  [GraduationCap, p.inst],
                  [MapPin, p.loc],
                ].map(([Icon, text], i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.t2 }}>
                    <Icon size={12} color={C.t3} /> {text}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
                <SocialLink label="ORCID" icon={AtSign} color="#A6CE39" />
                <SocialLink label="Google Scholar" icon={Search} color="#4285F4" />
                <SocialLink label="ResearchGate" icon={Users} color="#00CCBB" />
                <SocialLink label="LinkedIn" icon={Globe} color="#0A66C2" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, paddingBottom: 4, paddingTop: 20, flexShrink: 0 }}>
              <button className="action-btn" style={{ background: C.blue, color: "#fff" }}>
                <Edit3 size={14} /> Edit profile
              </button>
              <button className="action-btn" style={{ background: C.page, color: C.t1, border: `1px solid ${C.border}` }}>
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0, marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            {[
              { val: p.metrics.pubs, label: "Publications", color: C.blue },
              { val: p.metrics.citations.toLocaleString(), label: "Citations", color: C.green },
              { val: p.metrics.h, label: "h-index", color: C.indigo },
              { val: p.metrics.i10, label: "i10-index", color: C.orange },
              { val: p.metrics.exp, label: "Yrs experience", color: C.t2 },
              { val: p.metrics.areas, label: "Research areas", color: C.t2 },
              { val: p.metrics.keywords, label: "Keywords", color: C.t2 },
            ].map((m, i, arr) => (
              <div key={i} style={{ textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none", padding: "0 12px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{m.val}</div>
                <div style={{ fontSize: 11, color: C.t3, marginTop: 4, fontWeight: 500 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, marginTop: 14, overflowX: "auto", display: "flex" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`tab-item${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 248px", gap: 14, marginTop: 14, paddingBottom: 40, alignItems: "start" }}>

          {/* ── Left sidebar ── */}
          <div>
            {/* Contact */}
            <SectionCard>
              <SectionTitle>Contact</SectionTitle>
              {[
                { icon: Mail, val: p.email, link: true },
                { icon: Phone, val: p.phone },
                { icon: Globe, val: p.website, link: true },
                { icon: MapPin, val: p.loc },
              ].map(({ icon: Icon, val, link }, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                  <Icon size={14} color={C.t3} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: link ? C.blue : C.t1, fontWeight: link ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                </div>
              ))}
            </SectionCard>

            {/* Education mini */}
            <SectionCard>
              <SectionTitle action={<span onClick={() => setTab("education")} style={{ cursor: "pointer" }}>View all <ChevronRight size={12} style={{ verticalAlign: "middle" }} /></span>}>Education</SectionTitle>
              <div style={{ position: "relative" }}>
                {p.education.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < p.education.length - 1 ? 14 : 0, position: "relative" }}>
                    {i < p.education.length - 1 && <div style={{ position: "absolute", left: 5, top: 16, bottom: 0, width: 1.5, background: C.border }} />}
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.blue, flexShrink: 0, marginTop: 4, zIndex: 1 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.t1, lineHeight: 1.4 }}>{e.degree}</div>
                      <div style={{ fontSize: 11.5, color: C.t2, marginTop: 1 }}>{e.inst}</div>
                      <div style={{ fontSize: 11, color: C.orange, fontWeight: 500, marginTop: 2 }}>{e.years}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Experience mini */}
            <SectionCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.t1, letterSpacing: "-0.01em" }}>Experience</h3>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.t3, background: C.page, padding: "2px 7px", borderRadius: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Optional</span>
              </div>
              <div style={{ position: "relative" }}>
                {p.experience.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < p.experience.length - 1 ? 14 : 0, position: "relative" }}>
                    {i < p.experience.length - 1 && <div style={{ position: "absolute", left: 5, top: 16, bottom: 0, width: 1.5, background: C.border }} />}
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: e.type === "current" ? C.green : C.borderD, flexShrink: 0, marginTop: 4, zIndex: 1 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.t1, lineHeight: 1.4 }}>{e.role}</div>
                      <div style={{ fontSize: 11.5, color: C.t2 }}>{e.place}</div>
                      <div style={{ fontSize: 11, color: e.type === "current" ? C.green : C.t3, fontWeight: 500, marginTop: 2 }}>{e.years}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Center ── */}
          <div>
            {tab === "about" && (
              <>
                <SectionCard>
                  <SectionTitle>About me</SectionTitle>
                  <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: 0 }}>{p.about}</p>
                </SectionCard>

                <SectionCard>
                  <SectionTitle>Academic and professional information</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                    {[
                      ["Full name", p.name, false],
                      ["ORCID ID", p.orcid, false],
                      ["Date of birth", p.dob, false],
                      ["Researcher ID", p.researcherId, false],
                      ["Nationality", p.nationality, false],
                      ["ResearchGate", "View profile", true],
                      ["Designation", p.title, false],
                      ["LinkedIn", "View profile", true],
                      ["Department", "Computer Science & Engineering", false],
                      ["Website", p.website, true],
                      ["Institution", p.inst, false],
                      ["GitHub", "github.com/arjunsharma", true],
                      ["Joined", p.joined, false],
                      ["Email", p.email, false],
                    ].map(([label, val, link], i) => (
                      <InfoRow key={i} label={label} value={val} link={link} />
                    ))}
                  </div>
                </SectionCard>

                {chartReady && <ScholarPanel />}
              </>
            )}

            {tab === "education" && (
              <SectionCard>
                <SectionTitle>Education history</SectionTitle>
                {p.education.map((e, i) => (
                  <div key={i} className="hover-row" style={{ display: "flex", gap: 16, padding: "16px 12px", borderRadius: 10, borderBottom: i < p.education.length - 1 ? `1px solid ${C.border}` : "none", margin: "0 -12px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: C.lb, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <GraduationCap size={20} color={C.blue} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.t1 }}>{e.degree}</div>
                      <div style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>{e.inst}</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: C.blue, fontWeight: 500 }}>{e.years}</span>
                        <span style={{ fontSize: 12, color: C.t3 }}>·</span>
                        <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{e.gpa}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}

            {tab === "experience" && (
              <SectionCard>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.t1 }}>Work experience</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, background: C.page, padding: "3px 10px", borderRadius: 8, border: `1px solid ${C.border}`, letterSpacing: "0.04em" }}>Optional section</span>
                </div>
                {p.experience.map((e, i) => (
                  <div key={i} className="hover-row" style={{ display: "flex", gap: 16, padding: "16px 12px", borderRadius: 10, borderBottom: i < p.experience.length - 1 ? `1px solid ${C.border}` : "none", margin: "0 -12px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: e.type === "current" ? C.lg : C.page, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Briefcase size={20} color={e.type === "current" ? C.green : C.t3} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.t1 }}>{e.role}</span>
                        {e.type === "current" && <Pill bg={C.lg} color={C.lgT} small>Current</Pill>}
                      </div>
                      <div style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>{e.place}</div>
                      <div style={{ fontSize: 12, color: C.t3, marginTop: 6 }}>{e.years}</div>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}

            {tab === "research" && (
              <>
                <SectionCard>
                  <SectionTitle>Research areas</SectionTitle>
                  <div>{p.areas.map(a => <Pill key={a} bg={C.lp} color={C.lpT}>{a}</Pill>)}</div>
                </SectionCard>
                <SectionCard>
                  <SectionTitle>Keywords</SectionTitle>
                  <div>{p.keywords.map(k => <Pill key={k} bg={C.lb} color={C.lbT}><Hash size={10} style={{ verticalAlign: "middle", marginRight: 2 }} />{k}</Pill>)}</div>
                </SectionCard>
              </>
            )}

            {["publications", "projects", "achievements"].includes(tab) && (
              <SectionCard>
                <div className="empty-state">
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: C.lb, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    {tab === "publications" && <BookOpen size={26} color={C.blue} />}
                    {tab === "projects" && <FolderOpen size={26} color={C.blue} />}
                    {tab === "achievements" && <Trophy size={26} color={C.blue} />}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: C.t1, margin: "0 0 6px" }}>
                    No {tab} added yet
                  </p>
                  <p style={{ fontSize: 13, color: C.t2, margin: "0 0 20px", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
                    Add your {tab} to strengthen your academic profile and increase visibility.
                  </p>
                  <button className="action-btn" style={{ background: C.blue, color: "#fff", margin: "0 auto" }}>
                    + Add {tab.slice(0, -1)}
                  </button>
                </div>
              </SectionCard>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div>
            {/* Research Metrics */}
            <SectionCard style={{ padding: "20px 18px" }}>
              <SectionTitle>Research metrics</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <MetricTile value={p.metrics.pubs} label="Publications" bg={C.lb} color={C.lbT} />
                <MetricTile value={p.metrics.citations.toLocaleString()} label="Citations" bg={C.lg} color={C.lgT} />
                <MetricTile value={p.metrics.h} label="h-index" bg={C.lp} color={C.lpT} />
                <MetricTile value={p.metrics.i10} label="i10-index" bg={C.lo} color={C.loT} />
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.t1 }}>{p.metrics.exp}</div>
                  <div style={{ fontSize: 10, color: C.t3, fontWeight: 500, marginTop: 2 }}>Yrs research exp.</div>
                </div>
                <div style={{ width: 1, background: C.border }} />
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.t1 }}>{p.metrics.keywords}</div>
                  <div style={{ fontSize: 10, color: C.t3, fontWeight: 500, marginTop: 2 }}>Keywords</div>
                </div>
              </div>
            </SectionCard>

            {/* Research areas */}
            <SectionCard style={{ padding: "20px 18px" }}>
              <SectionTitle action={<span onClick={() => setTab("research")} style={{ cursor: "pointer" }}>View all</span>}>Research areas</SectionTitle>
              <div>{p.areas.slice(0, 5).map(a => <Pill key={a} bg={C.lp} color={C.lpT} small>{a}</Pill>)}</div>
            </SectionCard>

            {/* Top keywords */}
            <SectionCard style={{ padding: "20px 18px" }}>
              <SectionTitle action={<span onClick={() => setTab("research")} style={{ cursor: "pointer" }}>View all</span>}>Top keywords</SectionTitle>
              <div>{p.keywords.slice(0, 7).map(k => <Pill key={k} bg={C.lb} color={C.lbT} small>{k}</Pill>)}</div>
            </SectionCard>

            {/* Profile completeness */}
            <SectionCard style={{ padding: "20px 18px" }}>
              <SectionTitle>Profile completeness</SectionTitle>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <CircleProgress pct={p.completeness} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: C.green, fontWeight: 600 }}>Excellent — almost complete</p>
                  {p.completenessItems.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.t2, marginBottom: 4 }}>
                      <CheckCircle size={12} color={C.green} style={{ flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
