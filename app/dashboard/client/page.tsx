'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-blue-500/20 text-blue-400',
  published: 'bg-green-500/20 text-green-400',
};

export default function ClientDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'blogs' | 'settings' | 'embed'>('blogs');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    website: '',
    industry: 'Technology',
    target_audience: '',
    tone: 'Professional',
    company_description: '',
    delivery_mode: 'embed',
    wordpress_url: '',
    wordpress_username: '',
    wordpress_app_password: '',
  });

  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Fintech', 'Real Estate', 'Other'];
  const tones = ['Professional', 'Friendly', 'Casual', 'Expert'];

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!clientData) { router.push('/dashboard/onboarding'); return; }
      setClient(clientData);
      setForm({
        company_name: clientData.company_name || '',
        website: clientData.website || '',
        industry: clientData.industry || 'Technology',
        target_audience: clientData.target_audience || '',
        tone: clientData.tone || 'Professional',
        company_description: clientData.company_description || '',
        delivery_mode: clientData.delivery_mode || 'embed',
        wordpress_url: clientData.wordpress_url || '',
        wordpress_username: clientData.wordpress_username || '',
        wordpress_app_password: clientData.wordpress_app_password || '',
      });

      const { data: blogData } = await supabase
        .from('client_blogs')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      setBlogs(blogData || []);
      setLoading(false);
    }
    load();
  }, []);

  async function requestBlog() {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/client/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage('Blog generated! It is pending approval.');
      const { data: blogData } = await supabase
        .from('client_blogs')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      setBlogs(blogData || []);
      setTab('blogs');
    } catch (e: any) {
      setMessage('Error: ' + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    const { error } = await supabase
      .from('clients')
      .update({
        company_name: form.company_name,
        website: form.website,
        industry: form.industry,
        target_audience: form.target_audience,
        tone: form.tone,
        company_description: form.company_description,
        delivery_mode: form.delivery_mode || 'embed',
        wordpress_url: form.wordpress_url || null,
        wordpress_username: form.wordpress_username || null,
        wordpress_app_password: form.wordpress_app_password || null,
      })
      .eq('id', client.id);
    setSaving(false);
    if (!error) {
      setClient({ ...client, ...form });
      setMessage('Settings saved!');
    } else {
      setMessage('Error: ' + error.message);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Blog Dashboard</p>
            <h1 className="text-2xl font-bold text-white">{client.company_name}</h1>
            <p className="text-sm text-white/40 mt-0.5">{client.website}</p>
          </div>
          <button
            onClick={requestBlog}
            disabled={generating}
            className="bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {generating ? 'Generating...' : '+ Generate Blog'}
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Blogs', value: blogs.length },
            { label: 'Published', value: blogs.filter(b => b.status === 'published').length },
            { label: 'Plan', value: client.plan.charAt(0).toUpperCase() + client.plan.slice(1) },
          ].map(s => (
            <div key={s.label} className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['blogs', 'settings', 'embed'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'blogs' && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Your Blogs</h2>
            </div>
            {blogs.length === 0 ? (
              <div className="px-6 py-12 text-center text-white/30 text-sm">
                No blogs yet. Click "+ Generate Blog" to get started.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {blogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">✍️</p>
                  <p className="text-white font-medium">No blogs yet</p>
                  <p className="text-white/30 text-sm mt-1">Click + Generate Blog to create your first one</p>
                </div>
              )}
              {blogs.map(blog => (
                  <div key={blog.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{blog.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${
                        blog.status === 'published' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                        blog.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                        blog.status === 'rejected' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                        'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {blog.status}
                      </span>
                      <a
                        href={`/dashboard/client/blog?id=${blog.id}`}
                        className="text-xs text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                      >Review</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'embed' && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-2">Embed Your Blog</h2>
            <p className="text-white/40 text-sm mb-6">Paste this script tag anywhere on your website to display your published blogs.</p>

            <div className="mb-6">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Your Embed Code</p>
              <div className="bg-[#1e2128] border border-white/[0.08] rounded-xl p-4 font-mono text-xs text-[#4ade80] break-all">
                {`<div id="inframind-blog"></div>`}<br/>
                {`<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`}
              </div>
              <button
                onClick={() => {
                  const code = `<div id="inframind-blog"></div>
<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`;
                  navigator.clipboard.writeText(code);
                  alert('Copied to clipboard!');
                }}
                className="mt-3 text-xs bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Copy Code
              </button>
            </div>

            <div className="bg-[#1e2128] border border-white/[0.08] rounded-xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">How it works</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs flex items-center justify-center flex-shrink-0">1</span>
                  <p className="text-white/60 text-sm">Copy the embed code above</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs flex items-center justify-center flex-shrink-0">2</span>
                  <p className="text-white/60 text-sm">Paste it on any page of your website where you want blogs to appear</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs flex items-center justify-center flex-shrink-0">3</span>
                  <p className="text-white/60 text-sm">Your approved blogs will automatically show up there</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-2">Delivery Method</h2>
            <p className="text-white/40 text-sm mb-6">Choose how approved blogs get published to your site.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setForm(f => ({ ...f, delivery_mode: 'embed' }))}
                className={`text-left rounded-xl p-4 border transition-colors ${
                  form.delivery_mode === 'embed' || !form.delivery_mode
                    ? 'border-[#4ade80]/50 bg-[#4ade80]/[0.06]'
                    : 'border-white/[0.08] bg-[#1e2128] hover:border-white/20'
                }`}
              >
                <p className="text-white font-semibold text-sm mb-1">🔌 Embed Script</p>
                <p className="text-white/40 text-xs">Paste a script tag on your site. Works anywhere.</p>
              </button>

              <button
                onClick={() => setForm(f => ({ ...f, delivery_mode: 'wordpress' }))}
                className={`text-left rounded-xl p-4 border transition-colors ${
                  form.delivery_mode === 'wordpress'
                    ? 'border-[#4ade80]/50 bg-[#4ade80]/[0.06]'
                    : 'border-white/[0.08] bg-[#1e2128] hover:border-white/20'
                }`}
              >
                <p className="text-white font-semibold text-sm mb-1">📝 WordPress Auto-Publish</p>
                <p className="text-white/40 text-xs">Approved blogs post directly to your WP site.</p>
              </button>
            </div>

            <p className="text-white/30 text-xs mb-6 -mt-2">
              Not on WordPress? Use Embed Script — it works on any website (Next.js, Shopify, Webflow, custom-built, etc.), since it's just a script tag you paste into your site.
            </p>

            <div className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap mb-2">
              <div>
                <p className="text-white font-semibold text-sm mb-1">Need help connecting your site?</p>
                <p className="text-white/40 text-xs">We'll set up the embed or WordPress connection for you — just reach out.</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <a
                  href="mailto:hello@inframindhq.online?subject=Help connecting my site"
                  className="flex items-center gap-2 bg-transparent border border-white/20 hover:border-[#4ade80]/50 hover:text-[#4ade80] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  ✉️ Email Support
                </a>
                <a
                  href="https://wa.me/919633474645?text=Hi%2C%20I%20need%20help%20connecting%20my%20site%20to%20InfraMind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </div>

            {form.delivery_mode === 'wordpress' && (
              <div className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-4">WordPress Connection</p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Site URL</label>
                    <input
                      type="text"
                      placeholder="https://yoursite.com"
                      value={form.wordpress_url || ''}
                      onChange={e => setForm(f => ({ ...f, wordpress_url: e.target.value }))}
                      className="w-full bg-[#26292f] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">WordPress Username</label>
                    <input
                      type="text"
                      placeholder="admin"
                      value={form.wordpress_username || ''}
                      onChange={e => setForm(f => ({ ...f, wordpress_username: e.target.value }))}
                      className="w-full bg-[#26292f] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Application Password</label>
                    <input
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={form.wordpress_app_password || ''}
                      onChange={e => setForm(f => ({ ...f, wordpress_app_password: e.target.value }))}
                      className="w-full bg-[#26292f] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50"
                    />
                    <p className="text-white/30 text-xs mt-1.5">
                      Generate this in WordPress under Users → Profile → Application Passwords. Not your login password.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-6">Company Settings</h2>
            <div className="grid grid-cols-2 gap-5">

              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Name</label>
                <input
                  className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                  value={form.company_name}
                  onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Website URL</label>
                <input
                  className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
                  placeholder="e.g. Gold Vault is a fintech platform that lets anyone buy and invest in digital gold safely and easily. We serve retail investors across India."
                  value={form.company_description}
                  onChange={e => setForm(f => ({ ...f, company_description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Target Audience</label>
                <input
                  className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                  placeholder="e.g. retail investors, first-time gold buyers"
                  value={form.target_audience}
                  onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Industry</label>
                <select
                  className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                  value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                >
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Blog Tone</label>
                <select
                  className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                  value={form.tone}
                  onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
                >
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
