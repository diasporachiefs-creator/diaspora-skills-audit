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

// ── DBC BRAND PALETTE ──────────────────────────────────────
const COLORS = {
  cream: "#F7F2EA",
  creamDeep: "#EFE6D8",
  terracotta: "#C1623D",
  terracottaDeep: "#A14E2E",
  black: "#1A1612",
  charcoal: "#3A332C",
  taupe: "#8A7E6E",
  taupeLight: "#B8AC9A",
  border: "#DCD0BC",
  white: "#FFFFFF",
};

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
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: `You are The Diaspora Chief — a bold, culturally-aware business strategist helping African and Caribbean diaspora professionals monetise their skills online. Your tone is direct, warm, powerful, and culturally resonant. You must prove this is personalised by directly referencing specific words or details from what they wrote — never write anything generic enough to apply to any random reader.`,
          messages: [{ role: "user", content: `Based on this diaspora professional's audit answers:\n${summary}\n\nWrite a COMPLETE SKILLS ANALYSIS with these exact sections:\n\nYOUR DIASPORA ADVANTAGE\n2-3 sentences on their unique edge as a diaspora professional. Reference at least one specific detail from their answers above so it is unmistakably personal to them, not generic.\n\nYOUR #1 TRANSFERABLE SKILL\nName it boldly based on what they actually wrote above and explain why it's valuable in the online economy. 2-3 sentences.\n\nYOUR TOP 3 MONETISATION PATHS\nList exactly 3 paths suited to what they specifically wrote above. For each: name it, one sentence explanation, ONE concrete example of an actual product, service, or session they could sell (not a vague category — name the specific thing), and a realistic GBP income range. Format as a numbered list.\n\nUse plain text, no markdown symbols except numbered lists. Keep each section tight and punchy. Under 380 words total.` }],
        }),
      });
      const data = await res.json();
      setSkillsAnalysis(data.content?.map(c => c.text || "").join("") || "Your skills analysis is ready. You have a powerful combination of expertise and cultural insight that the market needs.");
    } catch {
      setSkillsAnalysis("Your profile reveals a rare combination of lived experience and professional expertise. The online economy is hungry for exactly what you bring. Your cultural background is not a barrier — it is your most compelling differentiator.");
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
    const summary = FIELDS.map(f => `${f.label}: ${inputs[f.id]}`).join("\n");
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are The Diaspora Chief — a bold, culturally-aware business strategist helping African and Caribbean diaspora professionals monetise their skills online. Your tone is direct, warm, powerful, and deeply culturally resonant. You must prove this is personalised by directly referencing specific words or details from what they wrote — never write anything generic enough to apply to any random reader.`,
          messages: [{ role: "user", content: `${firstName}'s Diaspora Skills Audit answers:\n${summary}\n\nWrite a personalised 90-Day Game Plan and Cultural Edge statement for ${firstName}.\n\nYOUR 90-DAY GAME PLAN\nOpen with one sentence starting exactly with "By Day 90, ${firstName} will have" that names the single concrete outcome this plan produces (e.g. their first paying client, a launched offer, a specific audience size) — make it concrete and tied to what they wrote above, not vague.\nThen:\nMonth 1 — Foundation\n(list 3 specific actions tied to what they wrote above)\nMonth 2 — Launch\n(list 3 specific actions)\nMonth 3 — Scale\n(list 3 specific actions)\n\nYOUR CULTURAL EDGE\nOne powerful paragraph on why ${firstName}'s diaspora background is a business asset, not a barrier — reference a specific detail from their answers above. Address them by name. End with a call to action to join DBC or book a session.\n\nUse plain text. No markdown symbols. Use numbered lists for the monthly actions. Under 420 words.` }],
        }),
      });
      const data = await res.json();
      setGamePlan(data.content?.map(c => c.text || "").join("") || "");
    } catch {
      setGamePlan("Your 90-day game plan is ready. Reach out to The Diaspora Chief directly to get your full personalised execution strategy.");
    }
    setLoadingPlan(false);
  };

  const resetAll = () => {
    setPage(1);
    setInputs({ background: "", expertise: "", strength: "", audience: "", goal: "" });
    setEmail(""); setFirstName(""); setEmailSubmitted(false);
    setSkillsAnalysis(""); setGamePlan(""); setErrors({});
  };

  const formatText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: "12px" }} />;
      const isHeader = /^(YOUR [A-Z#]|MONTH [123])/i.test(line.trim());
      if (isHeader) return (
        <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "700", letterSpacing: "3px", color: COLORS.terracotta, marginTop: "22px", marginBottom: "8px", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "6px" }}>
          {line}
        </div>
      );
      const isBullet = /^\d+\./.test(line.trim()) || line.trim().startsWith("-") || line.trim().startsWith("•");
      return (
        <div key={i} style={{ fontSize: "16px", lineHeight: "1.8", color: COLORS.charcoal, marginBottom: "4px", paddingLeft: isBullet ? "12px" : "0", fontFamily: "'DM Sans', sans-serif" }}>
          {line}
        </div>
      );
    });
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    input::placeholder, textarea::placeholder { color: ${COLORS.taupeLight}; }
    input:focus, textarea:focus { outline: none; border-color: ${COLORS.terracotta} !important; }
    .btn-primary:hover { background: ${COLORS.terracottaDeep} !important; }
    .btn-outline:hover { background: ${COLORS.cream} !important; color: ${COLORS.black} !important; }
    .back-btn:hover { color: ${COLORS.terracotta} !important; }
  `;

  const pageWrap = {
    minHeight: "100vh",
    background: COLORS.cream,
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 20px 64px",
  };

  const inner = { maxWidth: "620px", width: "100%", animation: "fadeUp 0.7s ease forwards" };

  const thickDivider = <div style={{ width: "100%", height: "3px", background: COLORS.terracotta, margin: "0 0 28px" }} />;

  const sectionHeader = (label) => (
    <div style={{ background: COLORS.black, padding: "14px 20px", marginBottom: "20px" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "700", letterSpacing: "4px", color: COLORS.cream, textTransform: "uppercase" }}>{label}</span>
    </div>
  );

  const inputBase = (err) => ({
    width: "100%",
    background: COLORS.white,
    border: `1.5px solid ${err ? "#C1623D" : COLORS.border}`,
    padding: "14px 16px",
    fontSize: "16px",
    fontFamily: "'DM Sans', sans-serif",
    color: COLORS.black,
    lineHeight: "1.6",
    transition: "border-color 0.2s",
    borderRadius: "0",
  });

  if (page === 1) return (
    <div style={pageWrap}>
      <style>{css}</style>
      <div style={{ ...inner, textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", background: COLORS.terracotta, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <span style={{ fontSize: "28px" }}>🌍</span>
        </div>

        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "5px", color: COLORS.taupe, marginBottom: "10px", textTransform: "uppercase" }}>
          Diaspora Builders Club
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "normal", fontSize: "clamp(38px, 8vw, 68px)", fontWeight: "400", color: COLORS.black, letterSpacing: "0.5px", lineHeight: "1.0", margin: "0 0 4px" }}>
          Diaspora
        </h1>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: "clamp(38px, 8vw, 68px)", fontWeight: "400", color: COLORS.terracotta, letterSpacing: "0.5px", lineHeight: "1.0", margin: "0 0 28px" }}>
          Skills Audit
        </h1>

        <div style={{ width: "100%", height: "3px", background: COLORS.terracotta, marginBottom: "28px" }} />

        <p style={{ fontSize: "20px", color: COLORS.charcoal, lineHeight: "1.85", maxWidth: "460px", margin: "0 auto 10px", fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontWeight: "400" }}>
          Discover your most powerful transferable skill and the exact online income streams built for your diaspora advantage.
        </p>

        <div style={{ width: "100%", height: "1px", background: COLORS.border, margin: "28px 0" }} />

        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "40px", flexWrap: "wrap" }}>
          {["5 Questions", "AI-Powered", "Free Blueprint"].map((t, i) => (
            <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", letterSpacing: "3px", color: COLORS.black, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
              <div style={{ width: "5px", height: "5px", background: COLORS.terracotta, borderRadius: "50%" }} />
              {t}
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => setPage(2)}
          style={{ background: COLORS.terracotta, color: COLORS.white, border: "none", padding: "18px 56px", fontSize: "13px", letterSpacing: "4px", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s", display: "block", margin: "0 auto" }}
        >
          START MY AUDIT
        </button>

        <div style={{ marginTop: "16px", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "2px", color: COLORS.taupe, textTransform: "uppercase" }}>
          Free · 3 Minutes · Built for the Diaspora
        </div>

        <div style={{ width: "100%", height: "3px", background: COLORS.black, marginTop: "48px" }} />
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "2px", color: COLORS.taupe, marginTop: "14px", textTransform: "uppercase" }}>
          The Diaspora Chief · diasporabuildersclub.com
        </div>
      </div>
    </div>
  );

  if (page === 2) return (
    <div style={pageWrap}>
      <style>{css}</style>
      <div style={inner}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", background: COLORS.terracotta, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontSize: "20px" }}>🌍</span>
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "5px", color: COLORS.taupe, marginBottom: "8px", textTransform: "uppercase" }}>Your Audit</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "400", color: COLORS.black, margin: "0 0 4px" }}>Tell Us About You</h2>
          {thickDivider}
          <p style={{ fontSize: "17px", color: COLORS.taupe, fontStyle: "italic", margin: 0, lineHeight: "1.7", fontFamily: "'DM Serif Display', serif" }}>The more specific you are, the more powerful your results</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {FIELDS.map((field, idx) => (
            <div key={field.id}>
              {sectionHeader(`${String(idx + 1).padStart(2, "0")} · ${field.label}`)}
              <div style={{ fontSize: "15px", color: COLORS.taupe, fontStyle: "italic", marginBottom: "10px", lineHeight: "1.6", fontFamily: "'DM Serif Display', serif" }}>{field.hint}</div>
              <textarea
                rows={3}
                value={inputs[field.id]}
                onChange={e => { setInputs(p => ({ ...p, [field.id]: e.target.value })); if (errors[field.id]) setErrors(p => ({ ...p, [field.id]: null })); }}
                placeholder={field.placeholder}
                style={{ ...inputBase(errors[field.id]), resize: "vertical" }}
              />
              {errors[field.id] && <div style={{ fontSize: "14px", color: COLORS.terracotta, marginTop: "4px", fontFamily: "'DM Sans', sans-serif", letterSpacing: "1px" }}>{errors[field.id]}</div>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            style={{ background: COLORS.terracotta, color: COLORS.white, border: "none", padding: "18px 56px", fontSize: "13px", letterSpacing: "4px", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s" }}
          >
            ANALYSE MY SKILLS
          </button>
          <button className="back-btn" onClick={() => setPage(1)} style={{ background: "none", border: "none", fontSize: "14px", color: COLORS.taupeLight, cursor: "pointer", letterSpacing: "2px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", transition: "color 0.2s" }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageWrap}>
      <style>{css}</style>
      <div style={inner}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", background: COLORS.terracotta, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontSize: "20px" }}>🌍</span>
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "5px", color: COLORS.taupe, marginBottom: "8px", textTransform: "uppercase" }}>Results</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "400", color: COLORS.black, margin: 0 }}>Your Skills Analysis</h2>
        </div>
        {thickDivider}

        <div style={{ background: COLORS.white, border: `1.5px solid ${COLORS.black}`, padding: "32px", marginBottom: "32px", minHeight: "80px" }}>
          {loadingAnalysis
            ? <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0" }}>
                <div style={{ width: "22px", height: "22px", border: `2px solid ${COLORS.border}`, borderTop: `2px solid ${COLORS.terracotta}`, borderRadius: "50%", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: "16px", color: COLORS.taupe, fontStyle: "italic", fontFamily: "'DM Serif Display', serif" }}>Analysing your diaspora advantage...</span>
              </div>
            : <div>{formatText(skillsAnalysis)}</div>
          }
        </div>

        {!loadingAnalysis && !emailSubmitted && (
          <div style={{ border: `3px solid ${COLORS.terracotta}`, padding: "32px", marginBottom: "28px", background: COLORS.white }}>
            {sectionHeader("Unlock Your 90-Day Game Plan")}
            <p style={{ fontSize: "17px", color: COLORS.charcoal, lineHeight: "1.8", marginBottom: "24px", fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
              Get your personalised 90-Day Execution Strategy and Cultural Edge statement — free, instantly.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <div>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); if (errors.firstName) setErrors(p => ({ ...p, firstName: null })); }}
                  style={inputBase(errors.firstName)}
                />
                {errors.firstName && <div style={{ fontSize: "14px", color: COLORS.terracotta, marginTop: "4px" }}>Required</div>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your best email address"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: null })); }}
                  style={inputBase(errors.email)}
                />
                {errors.email && <div style={{ fontSize: "14px", color: COLORS.terracotta, marginTop: "4px" }}>{errors.email}</div>}
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handleEmailSubmit}
              style={{ background: COLORS.terracotta, color: COLORS.white, border: "none", padding: "18px", width: "100%", fontSize: "13px", letterSpacing: "4px", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", transition: "background 0.2s" }}
            >
              SEND MY GAME PLAN →
            </button>
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "13px", color: COLORS.taupeLight, fontStyle: "italic", fontFamily: "'DM Serif Display', serif" }}>
              No spam. No fluff. Just your results.
            </div>
          </div>
        )}

        {emailSubmitted && (
          <div style={{ animation: "fadeUp 0.6s ease forwards" }}>
            <div style={{ background: COLORS.white, border: `1.5px solid ${COLORS.black}`, padding: "32px", marginBottom: "28px", minHeight: "80px" }}>
              {sectionHeader("Your 90-Day Game Plan")}
              {loadingPlan
                ? <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ width: "28px", height: "28px", border: `2px solid ${COLORS.border}`, borderTop: `2px solid ${COLORS.terracotta}`, borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 14px" }} />
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", letterSpacing: "3px", color: COLORS.taupe, textTransform: "uppercase" }}>Building your blueprint...</div>
                  </div>
                : <div>{formatText(gamePlan)}</div>
              }
            </div>

            {!loadingPlan && (
              <div style={{ background: COLORS.black, padding: "40px 32px", textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "5px", color: COLORS.taupeLight, marginBottom: "12px", textTransform: "uppercase" }}>
                  Ready to Execute?
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: "400", color: COLORS.cream, margin: "0 0 14px", lineHeight: "1.15" }}>
                  Don't Let This<br /><span style={{ fontStyle: "italic", color: COLORS.terracotta }}>Blueprint Collect Dust</span>
                </h3>
                <div style={{ width: "48px", height: "2px", background: COLORS.terracotta, margin: "0 auto 20px" }} />
                <p style={{ fontSize: "17px", color: COLORS.taupeLight, lineHeight: "1.8", maxWidth: "400px", margin: "0 auto 32px", fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                  Join the Diaspora Builders Club or book a free 15-minute Discovery Session to discuss your execution strategy and accountability plan.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px", margin: "0 auto" }}>
                  <a
                    href="https://diasporabuildersclub.com/join"
                    target="_blank" rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ background: COLORS.terracotta, color: COLORS.white, padding: "17px 32px", fontSize: "13px", letterSpacing: "3px", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", textDecoration: "none", display: "block", textTransform: "uppercase", transition: "background 0.2s" }}
                  >
                    JOIN DIASPORA BUILDERS CLUB →
                  </a>
                  <a
                    href="https://calendly.com/diasporachief/15min"
                    target="_blank" rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ background: "transparent", color: COLORS.cream, padding: "16px 32px", fontSize: "13px", letterSpacing: "3px", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", textDecoration: "none", display: "block", border: `1.5px solid ${COLORS.cream}`, textTransform: "uppercase", transition: "background 0.2s, color 0.2s" }}
                  >
                    BOOK FREE 15-MIN SESSION →
                  </a>
                </div>
                <div style={{ marginTop: "24px", width: "100%", height: "1px", background: COLORS.charcoal }} />
                <div style={{ marginTop: "16px", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "2px", color: COLORS.taupe, textTransform: "uppercase" }}>
                  Diaspora Builders Club · The Diaspora Chief
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button className="back-btn" onClick={resetAll} style={{ background: "none", border: "none", fontSize: "13px", color: COLORS.taupeLight, cursor: "pointer", letterSpacing: "2px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", transition: "color 0.2s" }}>
            ↩ Start Again
          </button>
        </div>
      </div>
    </div>
  );
}
