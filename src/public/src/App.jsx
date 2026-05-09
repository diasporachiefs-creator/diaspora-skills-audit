import { useState } from "react";

const FIELDS = [
  {
    id: "background",
    label: "Your Professional Background",
    placeholder: "e.g. I'm a nurse with 10 years in the NHS, specialising in mental health...",
    hint: "What's your career, role, or industry experience?",
  },
  {
    id: "expertise",
    label: "What People Come To You For",
    placeholder: "e.g. Friends always ask me for advice on managing money and budgeting...",
    hint: "What do people naturally seek your advice or help on?",
  },
  {
    id: "strength",
    label: "Your Natural Superpower",
    placeholder: "e.g. I'm great at breaking down complex ideas so anyone can understand them...",
    hint: "How do you naturally operate — teaching, connecting, building systems, inspiring?",
  },
  {
    id: "audience",
    label: "Who You Want To Serve",
    placeholder: "e.g. Diaspora professionals in corporate who want to start a side business...",
    hint: "Describe the person you most want to help — the more specific, the better.",
  },
  {
    id: "goal",
    label: "Your Online Income Goal",
    placeholder: "e.g. I want to make £3k/month consulting and eventually launch an online course...",
    hint: "What does financial freedom look like for you online?",
  },
];

const MAILCHIMP_FORM_ACTION = "https://YOUR_LIST.us21.list-manage.com/subscribe/post-json";
const MAILCHIMP_U = "YOUR_U_PARAM";
const MAILCHIMP_ID = "YOUR_ID_PARAM";

async function subscribeToList({ email, firstName, auditAnswers }) {
  const summary = FIELDS.map(f => `${f.label}: ${auditAnswers[f.id]}`).join(" | ");
  try {
    const url = `${MAILCHIMP_FORM_ACTION}?u=${MAILCHIMP_U}&id=${MAILCHIMP_ID}&EMAIL=${encodeURIComponent(email)}&FNAME=${encodeURIComponent(firstName)}&MMERGE3=${encodeURIComponent(summary.slice(0, 255))}&tags=diaspora-skills-audit&c=handleMailchimpCallback`;
    await new Promise((resolve) => {
      const script = document.createElement("script");
      window.handleMailchimpCallback = () => {
        delete window.handleMailchimpCallback;
        document.body.removeChild(script);
        resolve();
      };
      script.src = url;
      document.body.appendChild(script);
      setTimeout(resolve, 3000);
    });
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export default function DiasporaSkillsAudit() {
  const [page, setPage] = useState(1);
  const [inputs, setInputs] = useState({ background: "", expertise: "", strength: "", audience: "", goal: "" });
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [skillsAnalysis, setSkillsAnalysis] = useState("");
  const [gamePlan, setGamePlan] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [errors, setErrors] = useState({});
  const [mailchimpStatus, setMailchimpStatus] = useState(null);

  const validate = () => {
    const e = {};
    FIELDS.forEach(f => { if (!inputs[f.id].trim()) e[f.id] = "Required"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoadingAnalysis(true);
    setPage(3);
    const summary = FIELDS.map(f => `${f.label}: ${inputs[f.id]}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          system: `You are The Diaspora Chief — a bold, culturally-aware business strategist helping African and Caribbean diaspora professionals monetise their skills online. Your tone is direct, warm, powerful, and culturally resonant. Be specific and make the person feel seen.`,
          messages: [{ role: "user", content: `Based on this diaspora professional's audit answers:\n${summary}\n\nWrite a COMPLETE SKILLS ANALYSIS with these exact sections:\n\nYOUR DIASPORA ADVANTAGE\n2-3 sentences on their unique edge as a diaspora professional. Make them feel powerful.\n\nYOUR #1 TRANSFERABLE SKILL\nName it boldly and explain why it's valuable in the online economy. 2-3 sentences.\n\nYOUR TOP 3 MONETISATION PATHS\nList exactly 3 paths. For each: name it, one sentence explanation, realistic GBP income range. Format as numbered list.\n\nUse plain text, no markdown symbols except numbered lists. Keep each section tight and punchy. Under 350 words total.` }],
        }),
      });
      const data = await res.json();
      setSkillsAnalysis(data.content?.map(c => c.text || "").join("") || "Your skills analysis is ready.");
    } catch {
      setSkillsAnalysis("Your profile reveals a rare combination of lived experience and professional expertise.");
    }
    setLoadingAnalysis(false);
  };

  const handleEmailSubmit = async () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!email.trim() || !email.includes("@")) e.email = "Please enter a valid email";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setEmailSubmitted(true);
    setLoadingPlan(true);
    const mcResult = await subscribeToList({ email, firstName, auditAnswers: inputs });
    setMailchimpStatus(mcResult.success ? "subscribed" : "failed");
    const summary = FIELDS.map(f => `${f.label}: ${inputs[f.id]}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 900,
          system: `You are The Diaspora Chief — a bold, culturally-aware business strategist helping African and Caribbean diaspora professionals monetise their skills online. Your tone is direct, warm, powerful, and deeply culturally resonant.`,
          messages: [{ role: "user", content: `${firstName}'s Diaspora Skills Audit answers:\n${summary}\n\nWrite a personalised 90-Day Game Plan for ${firstName}.\n\nYOUR 90-DAY GAME PLAN\nMonth 1 — Foundation\n(list 3 specific actions)\nMonth 2 — Launch\n(list 3 specific actions)\nMonth 3 — Scale\n(list 3 specific actions)\n\nYOUR CULTURAL EDGE\nOne powerful paragraph on why ${firstName}'s diaspora background is a business asset. End with a call to action to join DBC.\n\nUse plain text. No markdown symbols. Under 400 words.` }],
        }),
      });
      const data = await res.json();
      setGamePlan(data.content?.map(c => c.text || "").join("") || "");
    } catch {
      setGamePlan("Your 90-day game plan is ready. Reach out to The Diaspora Chief directly.");
    }
    setLoadingPlan(false);
  };

  const resetAll = () => {
    setPage(1);
    setInputs({ background: "", expertise: "", strength: "", audience: "", goal: "" });
    setEmail(""); setFirstName(""); setEmailSubmitted(false);
    setSkillsAnalysis(""); setGamePlan(""); setErrors({});
    setMailchimpStatus(null);
  };
  const formatText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: "12px" }} />;
      const isHeader = /^(YOUR [A-Z#]|MONTH [123])/i.test(line.trim());
      if (isHeader) return (
        <div key={i} style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "13px", fontWeight: "700", letterSpacing: "3px", color: "#111111", marginTop: "22px", marginBottom: "8px", textTransform: "uppercase", borderBottom: "1px solid #DDDDDD", paddingBottom: "6px" }}>
          {line}
        </div>
      );
      const isBullet = /^\d+\./.test(line.trim()) || line.trim().startsWith("-");
      return (
        <div key={i} style={{ fontSize: "16px", lineHeight: "1.8", color: "#111111", marginBottom: "4px", paddingLeft: isBullet ? "12px" : "0", fontFamily: "'Georgia', serif" }}>
          {line}
        </div>
      );
    });
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    input::placeholder, textarea::placeholder { color: #AAAAAA; }
    input:focus, textarea:focus { outline: none; border-color: #111111 !important; }
    .btn-primary:hover { background: #333333 !important; }
    .btn-outline:hover { background: #111111 !important; color: #FFFFFF !important; }
    .back-btn:hover { color: #111111 !important; }
  `;

  const pageWrap = {
    minHeight: "100vh", background: "#F5F5F3",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px 64px",
  };
  const inner = { maxWidth: "620px", width: "100%", animation: "fadeUp 0.7s ease forwards" };
  const thickDivider = <div style={{ width: "100%", height: "3px", background: "#111111", margin: "0 0 28px" }} />;
  const sectionHeader = (label) => (
    <div style={{ background: "#111111", padding: "14px 20px", marginBottom: "20px" }}>
      <span style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "13px", fontWeight: "700", letterSpacing: "4px", color: "#FFFFFF", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
  const inputBase = (err) => ({
    width: "100%", background: "#FFFFFF",
    border: `1.5px solid ${err ? "#CC0000" : "#CCCCCC"}`,
    padding: "14px 16px", fontSize: "16px",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#111111", lineHeight: "1.6", transition: "border-color 0.2s", borderRadius: "0",
  });

  if (page === 1) return (
    <div style={pageWrap}>
      <style>{css}</style>
      <div style={{ ...inner, textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", background: "#111111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <span style={{ fontSize: "28px" }}>🌍</span>
        </div>
        <div style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "5px", color: "#888888", marginBottom: "10px", textTransform: "uppercase" }}>Diaspora Builders Club</div>
        <h1 style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "clamp(38px, 8vw, 68px)", fontWeight: "700", color: "#111111", letterSpacing: "3px", lineHeight: "1.0", margin: "0 0 4px", textTransform: "uppercase" }}>DIASPORA</h1>
        <h1 style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "clamp(38px, 8vw, 68px)", fontWeight: "300", color: "#111111", letterSpacing: "3px", lineHeight: "1.0", margin: "0 0 28px", textTransform: "uppercase" }}>SKILLS AUDIT</h1>
        <div style={{ width: "100%", height: "3px", background: "#111111", marginBottom: "28px" }} />
        <p style={{ fontSize: "20px", color: "#444444", lineHeight: "1.85", maxWidth: "460px", margin: "0 auto 10px", fontStyle: "italic" }}>
          Discover your most powerful transferable skill and the exact online income streams built for your diaspora advantage.
        </p>
        <div style={{ width: "100%", height: "1px", background: "#CCCCCC", margin: "28px 0" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "40px", flexWrap: "wrap" }}>
          {["5 Questions", "AI-Powered", "Free Blueprint"].map((t, i) => (
            <div key={i} style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "12px", letterSpacing: "3px", color: "#111111", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "5px", height: "5px", background: "#111111", borderRadius: "50%" }} />{t}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setPage(2)} style={{ background: "#111111", color: "#FFFFFF", border: "none", padding: "18px 56px", fontSize: "13px", letterSpacing: "4px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s", display: "block", margin: "0 auto" }}>
          START MY AUDIT
        </button>
        <div style={{ marginTop: "16px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "2px", color: "#AAAAAA", textTransform: "uppercase" }}>Free · 3 Minutes · Built for the Diaspora</div>
        <div style={{ width: "100%", height: "3px", background: "#111111", marginTop: "48px" }} />
        <div style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "2px", color: "#888888", marginTop: "14px", textTransform: "uppercase" }}>The Diaspora Chief · diasporabuildersclub.com</div>
      </div>
    </div>
  );

  if (page === 2) return (
    <div style={pageWrap}>
      <style>{css}</style>
      <div style={inner}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", background: "#111111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontSize: "20px" }}>🌍</span>
          </div>
          <div style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "5px", color: "#888888", marginBottom: "8px", textTransform: "uppercase" }}>Your Audit</div>
          <h2 style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "700", color: "#111111", letterSpacing: "3px", margin: "0 0 4px", textTransform: "uppercase" }}>TELL US ABOUT YOU</h2>
          {thickDivider}
          <p style={{ fontSize: "17px", color: "#666666", fontStyle: "italic", margin: 0, lineHeight: "1.7" }}>The more specific you are, the more powerful your results</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {FIELDS.map((field, idx) => (
            <div key={field.id}>
              {sectionHeader(`${String(idx + 1).padStart(2, "0")} · ${field.label}`)}
              <div style={{ fontSize: "15px", color: "#888888", fontStyle: "italic", marginBottom: "10px", lineHeight: "1.6" }}>{field.hint}</div>
              <textarea rows={3} value={inputs[field.id]} onChange={e => { setInputs(p => ({ ...p, [field.id]: e.target.value })); if (errors[field.id]) setErrors(p => ({ ...p, [field.id]: null })); }} placeholder={field.placeholder} style={{ ...inputBase(errors[field.id]), resize: "vertical" }} />
              {errors[field.id] && <div style={{ fontSize: "14px", color: "#CC0000", marginTop: "4px" }}>{errors[field.id]}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <button className="btn-primary" onClick={handleSubmit} style={{ background: "#111111", color: "#FFFFFF", border: "none", padding: "18px 56px", fontSize: "13px", letterSpacing: "4px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s" }}>
            ANALYSE MY SKILLS
          </button>
          <button className="back-btn" onClick={() => setPage(1)} style={{ background: "none", border: "none", fontSize: "14px", color: "#AAAAAA", cursor: "pointer", letterSpacing: "2px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", textTransform: "uppercase", transition: "color 0.2s" }}>← Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageWrap}>
      <style>{css}</style>
      <div style={inner}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", background: "#111111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontSize: "20px" }}>🌍</span>
          </div>
          <div style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "5px", color: "#888888", marginBottom: "8px", textTransform: "uppercase" }}>Results</div>
          <h2 style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "700", color: "#111111", letterSpacing: "3px", margin: 0, textTransform: "uppercase" }}>YOUR SKILLS ANALYSIS</h2>
        </div>
        {thickDivider}
        <div style={{ background: "#FFFFFF", border: "1.5px solid #111111", padding: "32px", marginBottom: "32px", minHeight: "80px" }}>
          {loadingAnalysis
            ? <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0" }}>
                <div style={{ width: "22px", height: "22px", border: "2px solid #CCCCCC", borderTop: "2px solid #111111", borderRadius: "50%", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: "16px", color: "#888888", fontStyle: "italic" }}>Analysing your diaspora advantage...</span>
              </div>
            : <div>{formatText(skillsAnalysis)}</div>
          }
        </div>
        {!loadingAnalysis && !emailSubmitted && (
          <div style={{ border: "3px solid #111111", padding: "32px", marginBottom: "28px", background: "#FFFFFF" }}>
            {sectionHeader("Unlock Your 90-Day Game Plan")}
            <p style={{ fontSize: "17px", color: "#444444", lineHeight: "1.8", marginBottom: "24px", fontStyle: "italic" }}>Get your personalised 90-Day Execution Strategy — free, instantly.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <div>
                <input type="text" placeholder="Your first name" value={firstName} onChange={e => { setFirstName(e.target.value); if (errors.firstName) setErrors(p => ({ ...p, firstName: null })); }} style={inputBase(errors.firstName)} />
                {errors.firstName && <div style={{ fontSize: "14px", color: "#CC0000", marginTop: "4px" }}>Required</div>}
              </div>
              <div>
                <input type="email" placeholder="Your best email address" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: null })); }} style={inputBase(errors.email)} />
                {errors.email && <div style={{ fontSize: "14px", color: "#CC0000", marginTop: "4px" }}>{errors.email}</div>}
              </div>
            </div>
            <button className="btn-primary" onClick={handleEmailSubmit} style={{ background: "#111111", color: "#FFFFFF", border: "none", padding: "18px", width: "100%", fontSize: "13px", letterSpacing: "4px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s" }}>
              SEND MY GAME PLAN →
            </button>
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "13px", color: "#AAAAAA", fontStyle: "italic" }}>No spam. No fluff. Just your results.</div>
          </div>
        )}
        {emailSubmitted && (
          <div style={{ animation: "fadeUp 0.6s ease forwards" }}>
            {mailchimpStatus === "subscribed" && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F0FAF0", border: "1px solid #4CAF50", padding: "12px 16px", marginBottom: "20px" }}>
                <span>✅</span>
                <span style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "12px", letterSpacing: "2px", color: "#2E7D32", textTransform: "uppercase" }}>Added to Diaspora Builders Club list</span>
              </div>
            )}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #111111", padding: "32px", marginBottom: "28px", minHeight: "80px" }}>
              {sectionHeader("Your 90-Day Game Plan")}
              {loadingPlan
                ? <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ width: "28px", height: "28px", border: "2px solid #CCCCCC", borderTop: "2px solid #111111", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 14px" }} />
                    <div style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "13px", letterSpacing: "3px", color: "#888888", textTransform: "uppercase" }}>Building your blueprint...</div>
                  </div>
                : <div>{formatText(gamePlan)}</div>
              }
            </div>
            {!loadingPlan && (
              <div style={{ background: "#111111", padding: "40px 32px", textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "5px", color: "#AAAAAA", marginBottom: "12px", textTransform: "uppercase" }}>Ready to Execute?</div>
                <h3 style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: "700", color: "#FFFFFF", letterSpacing: "2px", margin: "0 0 14px", lineHeight: "1.15", textTransform: "uppercase" }}>DON'T LET THIS<br />BLUEPRINT COLLECT DUST</h3>
                <div style={{ width: "48px", height: "2px", background: "#FFFFFF", margin: "0 auto 20px" }} />
                <p style={{ fontSize: "17px", color: "#AAAAAA", lineHeight: "1.8", maxWidth: "400px", margin: "0 auto 32px", fontStyle: "italic", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Join the Diaspora Builders Club or book a free 15-minute Discovery Session.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px", margin: "0 auto" }}>
                  <a href="https://diasporabuildersclub.com/join" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: "#FFFFFF", color: "#111111", padding: "17px 32px", fontSize: "13px", letterSpacing: "3px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontWeight: "700", textDecoration: "none", display: "block", textTransform: "uppercase" }}>
                    JOIN DIASPORA BUILDERS CLUB →
                  </a>
                  <a href="https://calendly.com/diasporachief/15min" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ background: "transparent", color: "#FFFFFF", padding: "16px 32px", fontSize: "13px", letterSpacing: "3px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontWeight: "700", textDecoration: "none", display: "block", border: "1.5px solid #FFFFFF", textTransform: "uppercase" }}>
                    BOOK FREE 15-MIN SESSION →
                  </a>
                </div>
                <div style={{ marginTop: "24px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", fontSize: "11px", letterSpacing: "2px", color: "#555555", textTransform: "uppercase" }}>Diaspora Builders Club · The Diaspora Chief</div>
              </div>
            )}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button className="back-btn" onClick={resetAll} style={{ background: "none", border: "none", fontSize: "13px", color: "#CCCCCC", cursor: "pointer", letterSpacing: "2px", fontFamily: "'Futura', 'Trebuchet MS', sans-serif", textTransform: "uppercase" }}>↩ Start Again</button>
        </div>
      </div>
    </div>
  );
}
