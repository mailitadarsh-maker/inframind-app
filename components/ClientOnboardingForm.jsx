"use client";
import { useState, useRef } from "react";

const INDUSTRIES = [
  "SaaS / Tech", "E-commerce", "Healthcare", "Finance", "Real Estate",
  "Education", "Marketing Agency", "Legal", "Manufacturing", "Hospitality", "Other"
];

const TONES = [
  { value: "professional", label: "Professional", desc: "Authoritative, polished" },
  { value: "conversational", label: "Conversational", desc: "Friendly, approachable" },
  { value: "technical", label: "Technical", desc: "Data-driven, detailed" },
  { value: "inspirational", label: "Inspirational", desc: "Bold, motivating" },
];

const FREQUENCIES = [
  { value: "daily1", label: "Daily · 1 post/day", desc: "30 posts/month" },
  { value: "daily2", label: "Daily · 2 posts/day", desc: "60 posts/month" },
  { value: "daily3", label: "Daily · 3 posts/day", desc: "90 posts/month" },
  { value: "2/week", label: "2× / week", desc: "~8 posts/month" },
  { value: "weekly", label: "Weekly", desc: "4 posts/month" },
  { value: "biweekly", label: "Bi-weekly", desc: "2 posts/month" },
  { value: "monthly", label: "Monthly", desc: "1 post/month" },
];

const STEPS = ["Business", "Blog Style", "Brand Images", "Review"];

export default function ClientOnboardingForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    industry: "",
    targetAudience: "",
    aboutBusiness: "",
    tone: "professional",
    frequency: "weekly",
    competitors: "",
    sampleBlogRef: "",
    notes: "",
    refImages: [],
  });
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.businessName.trim()) e.businessName = "Required";
      if (!form.industry) e.industry = "Select an industry";
      if (!form.targetAudience.trim()) e.targetAudience = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 5);
    const previews = arr.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    set("refImages", [...form.refImages, ...previews].slice(0, 5));
  };

  const removeImage = (i) => {
    const imgs = [...form.refImages];
    URL.revokeObjectURL(imgs[i].url);
    imgs.splice(i, 1);
    set("refImages", imgs);
  };

  const handleSubmit = async () => {
    const profile = { ...form, refImageFiles: form.refImages.map(r => r.file) };
    onSubmit?.(profile);
    setSubmitted(true);
  };

  const progress = ((step + (submitted ? 1 : 0)) / STEPS.length) * 100;

  // ── Submitted state ──────────────────────────────────────────────────────────
  if (submitted) return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 480, textAlign: "center", padding: "56px 40px" }}>
        <div style={styles.successIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d0f16" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ ...styles.heading, marginBottom: 8 }}>Client profile created</h2>
        <p style={styles.muted}>
          <span style={styles.accent}>{form.businessName}</span> is onboarded. The first blog draft will be ready within 24 hours.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32, alignItems: "center" }}>
          <button style={{ ...styles.btn, background: "#1ddb78" }} onClick={() => window.location.href = "/ad-min/clients"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d0f16" strokeWidth="2.5" style={{ marginRight: 6 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Go to dashboard
          </button>
          <p style={{ ...styles.muted, fontSize: 11, marginTop: 4 }}>To add or change your client, contact support.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Blog-as-a-Service</p>
            <h1 style={styles.heading}>New client onboarding</h1>
          </div>
          <div style={styles.stepBadge}>{step + 1} / {STEPS.length}</div>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* Step tabs */}
        <div style={styles.tabs}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ ...styles.tab, ...(i === step ? styles.tabActive : i < step ? styles.tabDone : {}) }}>
              <span style={{ ...styles.tabDot, ...(i === step ? styles.tabDotActive : i < step ? styles.tabDotDone : {}) }}>
                {i < step
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  : i + 1}
              </span>
              <span style={styles.tabLabel}>{s}</span>
            </div>
          ))}
        </div>

        {/* ── Step 0: Business ─────────────────────────────────────────── */}
        {step === 0 && (
          <div style={styles.fields}>
            <Row>
              <Field label="Business name *" error={errors.businessName}>
                <input style={{ ...styles.input, ...(errors.businessName ? styles.inputError : {}) }}
                  placeholder="Acme Corp"
                  value={form.businessName}
                  onChange={e => set("businessName", e.target.value)} />
              </Field>
              <Field label="Website URL">
                <input style={styles.input}
                  placeholder="https://acmecorp.com"
                  value={form.website}
                  onChange={e => set("website", e.target.value)} />
              </Field>
            </Row>

            <Field label="Industry *" error={errors.industry}>
              <select style={{ ...styles.input, ...(errors.industry ? styles.inputError : {}) }}
                value={form.industry}
                onChange={e => set("industry", e.target.value)}>
                <option value="">Select industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>

            <Field label="Target audience *" error={errors.targetAudience}>
              <textarea style={{ ...styles.input, ...styles.textarea }}
                placeholder="e.g. Small business owners looking to scale their e-commerce store"
                value={form.targetAudience}
                onChange={e => set("targetAudience", e.target.value)} />
              {errors.targetAudience && <span style={styles.errorMsg}>{errors.targetAudience}</span>}
            </Field>

            <Field label="About your business *" error={errors.aboutBusiness}>
              <textarea style={{ ...styles.input, ...styles.textarea }}
                placeholder="What do you sell, what makes you different, what's your story?"
                value={form.aboutBusiness}
                onChange={e => set("aboutBusiness", e.target.value)} />
              {errors.aboutBusiness && <span style={styles.errorMsg}>{errors.aboutBusiness}</span>}
            </Field>
          </div>
        )}

        {/* ── Step 1: Blog Style ───────────────────────────────────────── */}
        {step === 1 && (
          <div style={styles.fields}>
            <Field label="Blog tone">
              <div style={styles.toneGrid}>
                {TONES.map(t => (
                  <button key={t.value}
                    style={{ ...styles.toneCard, ...(form.tone === t.value ? styles.toneCardActive : {}) }}
                    onClick={() => set("tone", t.value)}>
                    {form.tone === t.value && (
                      <div style={styles.toneCheck}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0d0f16" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                    <span style={styles.toneName}>{t.label}</span>
                    <span style={styles.toneDesc}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Publishing frequency">
              <div style={styles.freqGrid}>
                {FREQUENCIES.map(f => (
                  <button key={f.value}
                    style={{ ...styles.freqCard, ...(form.frequency === f.value ? styles.freqCardActive : {}) }}
                    onClick={() => set("frequency", f.value)}>
                    {form.frequency === f.value && (
                      <div style={styles.toneCheck}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0d0f16" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                    <span style={styles.toneName}>{f.label}</span>
                    <span style={styles.toneDesc}>{f.desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Top competitors (optional)">
              <textarea style={{ ...styles.input, ...styles.textarea }}
                placeholder="List competitor website URLs or brand names, one per line"
                value={form.competitors}
                onChange={e => set("competitors", e.target.value)} />
            </Field>

            <Field label="A blog post you love (or hate) — optional">
              <textarea style={{ ...styles.input, ...styles.textarea }}
                placeholder="Paste a URL or short excerpt of a blog you want us to match (or avoid) the style of"
                value={form.sampleBlogRef}
                onChange={e => set("sampleBlogRef", e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── Step 2: Brand Images ─────────────────────────────────────── */}
        {step === 2 && (
          <div style={styles.fields}>
            <p style={styles.muted}>
              Upload 3–5 reference images — hero banners, product photos, or anything that shows your visual style. These train the image generator to match your brand.
            </p>

            {/* Drop zone */}
            <div
              style={styles.dropzone}
              onClick={() => fileRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden
                onChange={e => handleFiles(e.target.files)} />
              <div style={styles.dropIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1ddb78" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p style={{ ...styles.muted, marginTop: 8 }}>
                Drag & drop or <span style={styles.accent}>browse files</span>
              </p>
              <p style={{ ...styles.muted, fontSize: 11, marginTop: 4 }}>PNG, JPG, WEBP · max 5 images</p>
            </div>

            {/* Previews */}
            {form.refImages.length > 0 && (
              <div style={styles.previewGrid}>
                {form.refImages.map((img, i) => (
                  <div key={i} style={styles.previewItem}>
                    <img src={img.url} alt={img.name} style={styles.previewImg} />
                    <button style={styles.removeBtn} onClick={() => removeImage(i)}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <p style={styles.previewName}>{img.name.length > 16 ? img.name.slice(0, 14) + "…" : img.name}</p>
                  </div>
                ))}
              </div>
            )}

            <Field label="Brand notes (optional)">
              <textarea style={{ ...styles.input, ...styles.textarea }}
                placeholder="e.g. Avoid dark backgrounds, prefer clean minimalist layouts, brand color is #2563eb"
                value={form.notes}
                onChange={e => set("notes", e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── Step 3: Review ───────────────────────────────────────────── */}
        {step === 3 && (
          <div style={styles.fields}>
            <div style={styles.reviewGrid}>
              <ReviewRow label="Business" value={form.businessName} />
              <ReviewRow label="Website" value={form.website || "—"} />
              <ReviewRow label="Industry" value={form.industry} />
              <ReviewRow label="Audience" value={form.targetAudience} />
              <ReviewRow label="Tone" value={TONES.find(t => t.value === form.tone)?.label} />
              <ReviewRow label="Frequency" value={FREQUENCIES.find(f => f.value === form.frequency)?.label} />
              <ReviewRow label="Competitors" value={form.competitors || "—"} />
              <ReviewRow label="Brand images" value={form.refImages.length ? `${form.refImages.length} image${form.refImages.length > 1 ? "s" : ""} uploaded` : "None"} />
            </div>
            <div style={styles.infoBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1ddb78" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ ...styles.muted, fontSize: 12, margin: 0 }}>
                After saving, the system will run trend research for <strong style={{ color: "#eef1f6" }}>{form.industry}</strong> and generate the first blog draft within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div style={styles.footer}>
          {step > 0
            ? <button style={styles.btnGhost} onClick={back}>← Back</button>
            : <div />}
          {step < STEPS.length - 1
            ? <button style={styles.btn} onClick={next}>Continue →</button>
            : <button style={{ ...styles.btn, background: "#1ddb78" }} onClick={handleSubmit}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d0f16" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Create client profile
              </button>}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.errorMsg}>{error}</span>}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>;
}

function ReviewRow({ label, value }) {
  return (
    <div style={styles.reviewRow}>
      <span style={styles.reviewLabel}>{label}</span>
      <span style={styles.reviewValue}>{value}</span>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0d0f16",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#11141d",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "36px 40px",
    width: "100%",
    maxWidth: 640,
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#1ddb78",
    margin: "0 0 6px",
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    color: "#eef1f6",
    margin: 0,
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  stepBadge: {
    fontSize: 12,
    color: "#8a95a3",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: "4px 12px",
    fontWeight: 500,
  },
  progressTrack: {
    height: 3,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 99,
    marginBottom: 28,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#1ddb78",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 32,
    flexWrap: "wrap",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "transparent",
    opacity: 0.4,
  },
  tabActive: {
    border: "1px solid rgba(29,219,120,0.3)",
    background: "rgba(29,219,120,0.06)",
    opacity: 1,
  },
  tabDone: {
    opacity: 0.7,
  },
  tabDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    color: "#8a95a3",
    fontWeight: 600,
    flexShrink: 0,
  },
  tabDotActive: {
    background: "#1ddb78",
    color: "#0d0f16",
  },
  tabDotDone: {
    background: "rgba(29,219,120,0.2)",
    color: "#1ddb78",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#8a95a3",
  },
  fields: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.04em",
    color: "#8a95a3",
    textTransform: "uppercase",
  },
  input: {
    background: "#0d0f16",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#eef1f6",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "rgba(248,113,113,0.5)",
  },
  textarea: {
    resize: "vertical",
    minHeight: 80,
  },
  errorMsg: {
    fontSize: 11,
    color: "#f87171",
    marginTop: 2,
  },
  toneGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  toneCard: {
    background: "#0d0f16",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "14px 16px",
    textAlign: "left",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    transition: "border-color 0.15s, background 0.15s",
  },
  toneCardActive: {
    border: "1px solid rgba(29,219,120,0.4)",
    background: "rgba(29,219,120,0.06)",
  },
  toneCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#1ddb78",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toneName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#eef1f6",
  },
  toneDesc: {
    fontSize: 11,
    color: "#8a95a3",
  },
  chipRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    padding: "7px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#0d0f16",
    color: "#8a95a3",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  chipActive: {
    border: "1px solid rgba(29,219,120,0.4)",
    background: "rgba(29,219,120,0.1)",
    color: "#1ddb78",
  },
  freqGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  freqCard: {
    background: "#0d0f16",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 14px",
    textAlign: "left",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    transition: "all 0.15s",
  },
  freqCardActive: {
    border: "1px solid rgba(29,219,120,0.4)",
    background: "rgba(29,219,120,0.06)",
  },
  dropzone: {
    border: "1.5px dashed rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "32px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s",
    background: "rgba(255,255,255,0.015)",
  },
  dropIcon: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(29,219,120,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 8px",
  },
  previewGrid: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  previewItem: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  previewImg: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  previewName: {
    fontSize: 10,
    color: "#8a95a3",
    margin: 0,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#f87171",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  reviewGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    background: "#0d0f16",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  reviewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    gap: 16,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#8a95a3",
    flexShrink: 0,
  },
  reviewValue: {
    fontSize: 13,
    color: "#eef1f6",
    textAlign: "right",
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: "rgba(29,219,120,0.05)",
    border: "1px solid rgba(29,219,120,0.15)",
    borderRadius: 8,
    padding: "12px 14px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 24,
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1ddb78",
    color: "#0d0f16",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "opacity 0.15s",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    color: "#8a95a3",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "color 0.15s",
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#1ddb78",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  muted: {
    color: "#8a95a3",
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
  },
  accent: {
    color: "#1ddb78",
    fontWeight: 600,
  },
};
