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
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [domainMessage, setDomainMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      setDomainInput(clientData.custom_domain || '');
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

  const isTrial = client?.payment_status === 'trial' || (!client?.payment_status && (client?.plan || 'free') === 'free');
  const blogLimit = client?.blogs_per_month ?? null;
  const blogsUsed = blogs.length;
  const trialEndsAt = client?.trial_ends_at ? new Date(client.trial_ends_at) : null;
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const trialExpired = isTrial && trialEndsAt ? Date.now() >= trialEndsAt.getTime() : false;
  const limitReached = isTrial && ((blogLimit !== null && blogsUsed >= blogLimit) || trialExpired);

  const planLabel = client?.payment_status === 'trial'
    ? 'Free Trial'
    : client?.plan
      ? client.plan.charAt(0).toUpperCase() + client.plan.slice(1)
      : 'Free';

  async function requestBlog() {
    if (limitReached) { router.push('/upgrade'); return; }
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/client/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.limitReached) {
          setMessage(data.error || 'Free plan limit reached. Upgrade to generate more blogs.');
          return;
        }
        throw new Error(data.error || 'Failed');
      }
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

  async function saveDomain() {
    if (!domainInput.trim()) return;
    setSavingDomain(true);
    setDomainMessage(null);
    try {
      const res = await fetch('/api/client/save-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id, custom_domain: domainInput.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDomainMessage({ type: 'error', text: data.error || 'Failed to save domain.' });
      } else {
        setClient({ ...client, custom_domain: domainInput.trim().toLowerCase() });
        setDomainMessage({ type: 'success', text: `✅ Domain registered! Now add the CNAME record in your DNS settings (see below), then your blog will go live at ${domainInput.trim().toLowerCase()}` });
      }
    } catch (e: any) {
      setDomainMessage({ type: 'error', text: e.message });
    } finally {
      setSavingDomain(false);
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

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors group"
        >
          <span className="text-lg leading-none group-hover:-translate-x-0.5 transition-transform">←</span>
          Dashboard
        </button>

        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Blog Dashboard</p>
            <h1 className="text-2xl font-bold text-white">{client.company_name}</h1>
            <p className="text-sm text-white/40 mt-0.5">{client.website}</p>
          </div>
          <button
            onClick={requestBlog}
            disabled={generating}
            title={limitReached ? 'Free trial limit reached — upgrade to generate more blogs' : undefined}
            className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 ${
              limitReached
                ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                : 'bg-[#4ade80] hover:bg-[#22c55e] text-black'
            }`}
          >
            {generating ? 'Generating...' : limitReached ? 'Upgrade to Generate' : '+ Generate Blog'}
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Blogs', value: blogs.length },
            { label: 'Published', value: blogs.filter(b => b.status === 'published').length },
            { label: 'Plan', value: planLabel },
          ].map(s => (
            <div key={s.label} className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {isTrial && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Free Trial</p>
                <p className="text-white font-semibold text-sm">
                  {blogLimit !== null
                    ? `${Math.min(blogsUsed, blogLimit)} of ${blogLimit} trial blogs used`
                    : `${blogsUsed} blog${blogsUsed === 1 ? '' : 's'} used`}
                </p>
                {trialDaysLeft !== null && !trialExpired && (
                  <p className="text-white/30 text-xs mt-0.5">
                    {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} remaining · ₹0 · 4 blogs · 1 every alternate day
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/upgrade')}
                className="bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
              >
                Upgrade Plan →
              </button>
            </div>

            {blogLimit !== null && (
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (blogsUsed / blogLimit) * 100)}%`,
                    background: limitReached ? '#f87171' : blogsUsed === blogLimit - 1 ? '#fbbf24' : '#4ade80',
                  }}
                />
              </div>
            )}

            <p className="text-white/30 text-xs">
              {trialExpired
                ? 'Your free trial has ended. Upgrade to keep generating blogs.'
                : limitReached
                ? `You've used all ${blogLimit} trial blogs. Upgrade to keep generating fresh content.`
                : trialDaysLeft !== null
                ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your free trial. Generate manually anytime, or wait for auto-generation.`
                : 'Generate manually anytime, or wait for auto-generation.'}
            </p>
          </div>
        )}

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
                  const code = `<div id="inframind-blog"></div>\n<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`;
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
                {[
                  'Copy the embed code above',
                  'Paste it on any page of your website where you want blogs to appear',
                  'Your approved blogs will automatically show up there',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <p className="text-white/60 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <>
            {/* How to show blogs */}
            <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-6">
              <h2 className="text-base font-semibold text-white mb-1">How to show blogs on your website</h2>
              <p className="text-white/40 text-sm mb-6">No technical skills needed — just copy and paste. We'll help you if you get stuck.</p>

              <div className="flex flex-col gap-4 mb-6">
                {[
                  { title: 'Go to the Embed tab above', desc: 'You\'ll find a small piece of code there. Click "Copy Code" — that\'s all you need.' },
                  { title: 'Open your website editor', desc: 'This works on any website builder — Wix, Squarespace, WordPress, Webflow, Shopify, or a custom site. Open the page where you want your blogs to appear.' },
                  { title: 'Paste the code & save', desc: 'Look for an "HTML block", "Custom code", or "Embed" section in your editor. Paste the code there and save. Your approved blogs will automatically appear on that page.' },
                ].map((step, i) => (
                  <div key={i} className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-5 flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">{step.title}</p>
                      <p className="text-white/40 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#4ade80]/[0.05] border border-[#4ade80]/20 rounded-xl p-5 flex items-start gap-4 mb-4">
                <span className="text-xl flex-shrink-0">🙋</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Not sure how to do this? We'll do it for you — for free.</p>
                  <p className="text-white/50 text-sm">Just send us a WhatsApp or email and we'll connect your blogs to your website.</p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <a href="https://wa.me/919633474645?text=Hi%2C%20I%20need%20help%20connecting%20my%20blogs%20to%20my%20website" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                  💬 WhatsApp Us
                </a>
                <a href="mailto:hello@inframindhq.online?subject=Help connecting my site"
                  className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  ✉️ Email Support
                </a>
              </div>
            </div>

            {/* Custom Domain Section */}
            <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <h2 className="text-base font-semibold text-white mb-1">Get your own blog domain</h2>
                  <p className="text-white/40 text-sm">Show your blogs at <span className="text-white/70">blog.yourwebsite.com</span> instead of inframindhq.online.</p>
                </div>
                <span className="text-xs bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-3 py-1 rounded-full font-semibold flex-shrink-0">Premium</span>
              </div>

              {/* Step 1: Enter domain */}
              <div className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-5 mb-3">
                <div className="flex gap-4 items-start mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">Enter your blog subdomain</p>
                    <p className="text-white/40 text-sm mb-3">Type the subdomain you want to use — usually <span className="text-white/60">blog.yourwebsite.com</span></p>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        placeholder="blog.yourwebsite.com"
                        value={domainInput}
                        onChange={e => setDomainInput(e.target.value)}
                        className="flex-1 min-w-[200px] bg-[#26292f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#4ade80] transition-colors placeholder:text-white/20 font-mono"
                      />
                      <button
                        onClick={saveDomain}
                        disabled={savingDomain || !domainInput.trim()}
                        className="bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
                      >
                        {savingDomain ? 'Saving...' : client?.custom_domain ? 'Update Domain' : 'Save Domain'}
                      </button>
                    </div>

                    {domainMessage && (
                      <div className={`mt-3 text-sm rounded-xl px-4 py-3 ${
                        domainMessage.type === 'success'
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {domainMessage.text}
                      </div>
                    )}

                    {client?.custom_domain && !domainMessage && (
                      <p className="mt-2 text-xs text-[#4ade80]/70">
                        ✓ Current domain: <span className="font-mono">{client.custom_domain}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: DNS instructions */}
              <div className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-5 mb-3">
                <div className="flex gap-4 items-start">
                  <span className="w-7 h-7 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">Add this DNS record in Hostinger / GoDaddy</p>
                    <p className="text-white/40 text-sm mb-3">Go to your domain provider → DNS Settings → Add Record with these exact values:</p>
                    <div className="bg-[#26292f] border border-white/[0.08] rounded-lg p-3 font-mono text-xs grid grid-cols-2 gap-x-6 gap-y-2">
                      <span className="text-white/40">Type</span><span className="text-[#4ade80]">CNAME</span>
                      <span className="text-white/40">Name / Host</span><span className="text-[#4ade80]">blog</span>
                      <span className="text-white/40">Value / Points to</span><span className="text-[#4ade80]">cname.vercel-dns.com</span>
                      <span className="text-white/40">TTL</span><span className="text-[#4ade80]">Auto (or 3600)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Done */}
              <div className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-5 mb-5">
                <div className="flex gap-4 items-start">
                  <span className="w-7 h-7 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Wait 5–30 minutes & you're live!</p>
                    <p className="text-white/40 text-sm">Once DNS updates, your blog will automatically appear at your domain. Any blog you publish goes live there instantly — no more steps needed.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#4ade80]/[0.05] border border-[#4ade80]/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-white/60 text-sm">Confused about DNS? We'll do it for you — just send us a WhatsApp.</p>
                <a
                  href="https://wa.me/919633474645?text=Hi%2C%20I%20want%20to%20connect%20my%20own%20domain%20for%20my%20blog"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </div>

            {/* Company Settings */}
            <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-6">Company Settings</h2>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Name</label>
                  <input className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                    value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Website URL</label>
                  <input className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                    value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Description</label>
                  <textarea rows={3} className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
                    placeholder="e.g. Gold Vault is a fintech platform that lets anyone buy and invest in digital gold safely."
                    value={form.company_description} onChange={e => setForm(f => ({ ...f, company_description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Target Audience</label>
                  <input className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                    placeholder="e.g. retail investors, first-time gold buyers"
                    value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Industry</label>
                  <select className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                    value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Blog Tone</label>
                  <select className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                    value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <button onClick={saveSettings} disabled={saving}
                    className="bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
