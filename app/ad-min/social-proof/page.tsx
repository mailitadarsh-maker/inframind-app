'use client';

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Post = {
  id: string;
  name: string;
  initials: string;
  role: string;
  post_text: string;
  linkedin_url: string;
  likes: number;
  comments: number;
  time_ago: string;
  display_order: number;
  active: boolean;
};

const blank = { name: "", initials: "", role: "", post_text: "", linkedin_url: "", likes: 0, comments: 0, time_ago: "", display_order: 0, active: true };

const inp: React.CSSProperties = {
  width: "100%", background: "#0d0f16", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, padding: "10px 12px", color: "#e2e6f0", fontSize: 14,
  marginBottom: 10, outline: "none", boxSizing: "border-box",
};

export default function SocialProofAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...blank });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("social_proof_posts").select("*").order("display_order", { ascending: true });
    setPosts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function f(k: string, v: string | number | boolean) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function autoInitials(name: string) {
    return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  }

  async function save() {
    const payload = { ...form, likes: Number(form.likes), comments: Number(form.comments), display_order: Number(form.display_order) };
    if (editing) {
      await supabase.from("social_proof_posts").update(payload).eq("id", editing);
      setMsg("Updated!");
    } else {
      await supabase.from("social_proof_posts").insert([payload]);
      setMsg("Added!");
    }
    setForm({ ...blank });
    setEditing(null);
    load();
    setTimeout(() => setMsg(""), 2500);
  }

  function edit(p: Post) {
    setEditing(p.id);
    setForm({ name: p.name, initials: p.initials, role: p.role, post_text: p.post_text, linkedin_url: p.linkedin_url, likes: p.likes, comments: p.comments, time_ago: p.time_ago, display_order: p.display_order, active: p.active });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("social_proof_posts").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c12", color: "#e2e6f0", padding: "40px 24px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <a href="/ad-min" style={{ color: "#4ade80", fontSize: 13, textDecoration: "none" }}>← Back to dashboard</a>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "16px 0 6px" }}>Social Proof Posts</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Paste the LinkedIn URL, fill in the details manually, then save.</p>

        <div style={{ background: "#0d0f16", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{editing ? "Edit Post" : "Add New Post"}</h2>

          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>LinkedIn Post URL</label>
          <input style={inp} placeholder="https://linkedin.com/posts/..." value={form.linkedin_url}
            onChange={e => f("linkedin_url", e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Full Name</label>
              <input style={inp} placeholder="Farhathullah Najeeb" value={form.name}
                onChange={e => { f("name", e.target.value); if (!editing) f("initials", autoInitials(e.target.value)); }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Initials</label>
              <input style={inp} placeholder="FN" value={form.initials} onChange={e => f("initials", e.target.value)} />
            </div>
          </div>

          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Role / Headline</label>
          <input style={inp} placeholder="Senior Flutter Developer @ Pips Technology" value={form.role}
            onChange={e => f("role", e.target.value)} />

          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Post Text</label>
          <textarea style={{ ...inp, height: 100, resize: "vertical" } as React.CSSProperties}
            placeholder="Copy-paste the LinkedIn post text here..." value={form.post_text}
            onChange={e => f("post_text", e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Likes</label>
              <input style={inp} type="number" placeholder="47" value={form.likes} onChange={e => f("likes", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Comments</label>
              <input style={inp} type="number" placeholder="12" value={form.comments} onChange={e => f("comments", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Time ago</label>
              <input style={inp} placeholder="3d" value={form.time_ago} onChange={e => f("time_ago", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Order</label>
              <input style={inp} type="number" placeholder="0" value={form.display_order} onChange={e => f("display_order", e.target.value)} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={form.active} onChange={e => f("active", e.target.checked)} />
            Show on site (active)
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} style={{ background: "#4ade80", color: "#0a0c12", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {editing ? "Update" : "Add Post"}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ ...blank }); }}
                style={{ background: "transparent", color: "#e2e6f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
            )}
          </div>
          {msg && <p style={{ color: "#4ade80", marginTop: 10, fontSize: 13 }}>{msg}</p>}
        </div>

        {loading ? <p style={{ color: "#6b7280" }}>Loading...</p> : posts.map(p => (
          <div key={p.id} style={{ background: "#0d0f16", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#c8d4e8", color: "#1e2128", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{p.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: p.active ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", color: p.active ? "#4ade80" : "#6b7280" }}>{p.active ? "Live" : "Hidden"}</span>
                {p.time_ago && <span style={{ fontSize: 11, color: "#6b7280" }}>{p.time_ago}</span>}
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.post_text}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => edit(p)} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#e2e6f0", cursor: "pointer" }}>Edit</button>
              <button onClick={() => del(p.id)} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#f87171", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
