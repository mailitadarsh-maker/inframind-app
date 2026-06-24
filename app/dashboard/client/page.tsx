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
  const [tab, setTab] = useState<'blogs' | 'social' | 'embed' | 'settings'>('blogs');
  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'linkedin' | 'twitter'>('instagram');
  const [socialFormat, setSocialFormat] = useState<'post' | 'story'>('post');
  const [socialSuggestion, setSocialSuggestion] = useState('');
  const [generatingPost, setGeneratingPost] = useState(false);
  const [postMessage, setPostMessage] = useState('');
  const [socialPosts, setSocialPosts] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t === 'embed' || t === 'settings') setTab(t as any);
  }, []);
  const [settingsSection, setSettingsSection] = useState<'embed' | 'domain' | 'company' | 'wordpress'>('company');
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [domainMessage, setDomainMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [vercelCname, setVercelCname] = useState<string>('');
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
    frequency: 'weekly',
    competitors: '',
    brand_notes: '',
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
      if (clientData.custom_domain) {
        fetch(`/api/client/get-cname?domain=${clientData.custom_domain}`)
          .then(r => r.json())
          .then(d => { if (d.cname) setVercelCname(d.cname); });
      }
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
        frequency: clientData.frequency || 'weekly',
        competitors: clientData.competitors || '',
        brand_notes: clientData.brand_notes || '',
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

  async function uploadBrandImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !client?.id) return;
    const uploaded: string[] = [];
    for (const file of files.slice(0, 5)) {
      const ext = file.name.split('.').pop();
      const path = `brand-ref/${client.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('brand-images').upload(path, file, { upsert: true });
      console.log('Upload result:', error ? error.message : 'OK', path);
      if (!error) {
        const { data } = supabase.storage.from('brand-images').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      } else {
        console.error('Upload error:', error.message, error);
      }
    }
    if (uploaded.length) {
      const newUrls = [...(client?.brand_images || []), ...uploaded];
      await supabase.from('clients').update({ brand_images: newUrls }).eq('id', client.id);
      setClient((c: any) => ({ ...c, brand_images: newUrls }));
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
        frequency: form.frequency,
        competitors: form.competitors || null,
        brand_notes: form.brand_notes || null,
      })
      .eq('id', client.id);
    setSaving(false);
    if (!error) {
      setClient({ ...client, ...form });
      setMessage('Settings saved!');

      // Run AI analysis
      setAnalysing(true);
      setAnalysis(null);
      try {
        const res = await fetch('/api/client/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: form.company_name,
            industry: form.industry,
            target_audience: form.target_audience,
            company_description: form.company_description,
            tone: form.tone,
          })
        });
        const data = await res.json();
        setAnalysis(data.analysis || 'Could not load analysis.');
      } catch(e) { setAnalysis('Could not load analysis.'); }
      setAnalysing(false);
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
    <>
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-6xl mx-auto">

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
            {blogs.length > 0 && <p className="text-xs text-[#4ade80]/70 mt-1">✓ {blogs.filter(b => b.status === 'published').length} blog{blogs.filter(b => b.status === 'published').length !== 1 ? 's' : ''} live</p>}
          </div>
          <button
            onClick={() => limitReached ? window.open(`https://wa.me/919633474645?text=Hi%2C%20I%20want%20to%20upgrade%20my%20InfraMind%20plan.%20My%20account%20email%20is%20${client?.company_name || ''}`, '_blank') : requestBlog()}
            disabled={generating}
            title={limitReached ? 'Free trial limit reached — upgrade to generate more blogs' : undefined}
            className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 ${
              limitReached
                ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                : 'bg-[#4ade80] hover:bg-[#22c55e] text-black'
            }`}
          >
            {generating ? 'Generating...' : limitReached ? '⬆ Upgrade to Generate' : '+ Generate Blog'}
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Blogs</p>
            <p className="text-2xl font-bold text-white">{blogs.length}</p>
            <p className="text-xs text-white/30 mt-1">{blogs.length === 0 ? 'No blogs yet — generate your first!' : `${blogs.filter(b => b.status === 'approved').length} pending review`}</p>
          </div>
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Published</p>
            <p className="text-2xl font-bold text-white">{blogs.filter(b => b.status === 'published').length}</p>
            <p className="text-xs text-white/30 mt-1">{blogs.filter(b => b.status === 'published').length === 0 ? 'Nothing live yet' : 'Live on your site'}</p>
          </div>
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Plan</p>
            <p className="text-2xl font-bold text-white">{planLabel}</p>
            <button onClick={() => window.open(`https://wa.me/919633474645?text=Hi%2C%20I%20want%20to%20upgrade%20my%20InfraMind%20plan.%20My%20account%20email%20is%20${client?.company_name || ''}`, '_blank')} className="text-xs text-[#4ade80] hover:text-[#22c55e] mt-1 block transition-colors">
              {isTrial ? 'Upgrade for more →' : 'View plans →'}
            </button>
          </div>
        </div>

        {blogs.length === 0 && (
          <div className="bg-gradient-to-r from-[#4ade80]/10 to-[#22c55e]/5 border border-[#4ade80]/20 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">👋</div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Welcome! Let's get your first blog live.</h3>
                <p className="text-white/50 text-sm mb-4">It takes less than a minute. We'll write it for you — just click Generate.</p>
                <div className="flex gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-white/60"><span className="w-5 h-5 rounded-full bg-[#4ade80]/20 text-[#4ade80] flex items-center justify-center text-xs font-bold">1</span> Generate a blog</div>
                  <div className="flex items-center gap-2 text-sm text-white/40"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</span> We review & publish</div>
                  <div className="flex items-center gap-2 text-sm text-white/40"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</span> Embed on your site</div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                onClick={() => window.open(`https://wa.me/919633474645?text=Hi%2C%20I%20want%20to%20upgrade%20my%20InfraMind%20plan.%20My%20account%20email%20is%20${client?.company_name || ''}`, '_blank')}
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
          {([
            { id: 'blogs', label: 'Blogs' },
            { id: 'social', label: '✦ Social' },
            { id: 'embed', label: 'Embed' },
            { id: 'settings', label: 'Settings' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'blogs' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 w-full bg-[#26292f] border border-white/[0.08] rounded-2xl overflow-hidden">
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
                  <div key={blog.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/[0.06]">
                        {blog.cover_image ? <img src={blog.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">🖼</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{blog.title}</p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${
                        blog.status === 'published' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                        blog.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                        blog.status === 'rejected' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                        'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {blog.status}
                      </span>
                      <button
                        title="Regenerate cover image"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          btn.textContent = '…';
                          const res = await fetch('/api/admin/regenerate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blog_id: blog.id }) });
                          const data = await res.json();
                          if (data.cover_image) setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, cover_image: data.cover_image } : b));
                          btn.disabled = false;
                          btn.textContent = '↺';
                        }}
                        className="text-xs text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                      >↺</button>
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

          {/* Right sidebar */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest px-1 mb-2">Integrations</p>
              <div className="flex flex-col gap-1">
                {([
                  { id: 'embed', label: '📋 How to embed', desc: 'Add blogs to your site' },
                  { id: 'domain', label: '🌐 Custom domain', desc: 'Use your own blog URL' },
                  { id: 'wordpress', label: '🔌 WordPress', desc: 'Auto-publish to WordPress' },
                ] as const).map(s => (
                  <button key={s.id} onClick={() => setSettingsSection(s.id)}
                    className={`text-left px-4 py-3 rounded-xl transition-all border ${
                      settingsSection === s.id
                        ? 'bg-[#4ade80]/10 border-[#4ade80]/30 text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/10'
                    }`}>
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-xs text-white/30 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {settingsSection === 'embed' && (
              <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Add blogs to your website</h2>
                <p className="text-white/40 text-xs mb-4">No coding needed. Works on any website builder.</p>

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <p className="text-white text-xs font-semibold">Copy your embed code</p>
                </div>
                <div className="bg-[#1e2128] border border-white/[0.06] rounded-xl p-3 mb-4">
                  <div className="font-mono text-xs text-[#4ade80] break-all mb-3 leading-relaxed">
                    {`<div id="inframind-blog"></div>`}<br/>
                    {`<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(`<div id="inframind-blog"></div>\n<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`); alert('Copied!'); }}
                    className="text-xs bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold px-3 py-1.5 rounded-lg transition-colors w-full text-center">
                    📋 Copy Code
                  </button>
                </div>

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <p className="text-white text-xs font-semibold">Paste it in your website builder</p>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {([
                    { icon: '🔵', name: 'Wix', steps: 'Editor → + Add → Embed → Custom Code → paste & save' },
                    { icon: '🟣', name: 'Webflow', steps: 'Page Settings → Custom Code → Before body end → paste' },
                    { icon: '🟠', name: 'WordPress', steps: 'Appearance → Theme Editor → footer.php → paste before body end' },
                    { icon: '🟢', name: 'Shopify', steps: 'Online Store → Themes → Edit code → theme.liquid → paste before body end' },
                  ] as const).map(p => (
                    <div key={p.name} className="bg-[#1e2128] border border-white/[0.05] rounded-xl p-3">
                      <p className="text-white text-xs font-semibold mb-1">{p.icon} {p.name}</p>
                      <p className="text-white/40 text-xs leading-relaxed">{p.steps}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <p className="text-white text-xs font-semibold">Your blogs appear automatically ✓</p>
                </div>
                <p className="text-white/30 text-xs mb-4">Once pasted, every published blog shows up on your site with no extra steps.</p>

                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-white/30 text-xs mb-2">Need help? We'll set it up for you.</p>
                  <div className="flex gap-2">
                    <a href="https://wa.me/919633474645?text=Hi%2C%20I%20need%20help%20connecting%20my%20blogs%20to%20my%20website" target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center bg-[#4ade80] hover:bg-[#22c55e] text-black text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                      💬 WhatsApp
                    </a>
                    <a href="mailto:hello@inframindhq.online?subject=Help connecting my site"
                      className="flex-1 text-center border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
                      ✉️ Email
                    </a>
                  </div>
                </div>
              </div>
            )}

            {settingsSection === 'domain' && (
              <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-sm font-semibold text-white">Custom Domain</h2>
                  <span className="text-xs bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Premium</span>
                </div>
                <p className="text-white/40 text-xs mb-4">Show your blogs at your own URL like <span className="font-mono text-white/60">blog.yoursite.com</span></p>

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <p className="text-white text-xs font-semibold">Enter your subdomain</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="blog.yourwebsite.com" value={domainInput} onChange={e => setDomainInput(e.target.value)}
                    className="flex-1 bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#4ade80] font-mono" />
                  <button onClick={saveDomain} disabled={savingDomain || !domainInput.trim()}
                    className="bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-4 py-2 rounded-xl text-xs transition-colors flex-shrink-0">
                    {savingDomain ? 'Saving...' : 'Update'}
                  </button>
                </div>
                {client?.custom_domain && <p className="text-xs text-[#4ade80]/70 mb-4">✓ Current: <span className="font-mono">{client.custom_domain}</span></p>}
                {domainMessage && <div className={`mb-4 text-xs rounded-xl px-3 py-2 ${domainMessage.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{domainMessage.text}</div>}

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <p className="text-white text-xs font-semibold">Add this DNS record in your domain provider</p>
                </div>
                <p className="text-white/30 text-xs mb-2">Go to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.) and add:</p>
                <div className="bg-[#1e2128] border border-white/[0.08] rounded-xl p-3 font-mono text-xs grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                  <span className="text-white/40">Type</span><span className="text-[#4ade80]">CNAME</span>
                  <span className="text-white/40">Name</span><span className="text-[#4ade80]">{domainInput ? domainInput.split('.')[0] : 'blog'}</span>
                  <span className="text-white/40">Value</span><span className="text-[#4ade80] break-all">{vercelCname || 'cname.vercel-dns.com'}</span>
                  <span className="text-white/40">TTL</span><span className="text-[#4ade80]">Auto</span>
                </div>
                <p className="text-white/20 text-xs mb-4">DNS changes can take 5–30 minutes to go live.</p>

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <p className="text-white text-xs font-semibold">Your blog goes live automatically ✓</p>
                </div>
                <p className="text-white/30 text-xs mb-4">Once DNS propagates, your blogs will be accessible at your custom domain.</p>

                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-white/30 text-xs mb-2">Need help setting this up?</p>
                  <a href="https://wa.me/919633474645?text=Hi%2C%20I%20want%20to%20connect%20my%20own%20domain%20for%20my%20blog" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#4ade80] hover:bg-[#22c55e] text-black text-xs font-bold px-3 py-2 rounded-xl transition-colors w-full">
                    💬 WhatsApp Us — We'll set it up for you
                  </a>
                </div>
              </div>
            )}


            {settingsSection === 'wordpress' && (
              <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-1">WordPress Auto-Publish</h2>
                <p className="text-white/40 text-xs mb-4">Blogs approved by us get published to your WordPress site automatically.</p>

                <div className="flex gap-2 items-center mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <p className="text-white text-xs font-semibold">Select delivery mode</p>
                </div>
                <div className="mb-4">
                  <select className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                    value={form.delivery_mode} onChange={e => setForm(f => ({ ...f, delivery_mode: e.target.value }))}>
                    <option value="embed">Embed (show on InfraMind page)</option>
                    <option value="wordpress">WordPress (auto-publish to my site)</option>
                  </select>
                </div>

                {form.delivery_mode === 'wordpress' && (<>
                  <div className="flex gap-2 items-center mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                    <p className="text-white text-xs font-semibold">Enter your WordPress details</p>
                  </div>
                  <div className="flex flex-col gap-3 mb-4">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">WordPress Site URL</label>
                      <input className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                        placeholder="https://yourblog.com" value={form.wordpress_url} onChange={e => setForm(f => ({ ...f, wordpress_url: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">WordPress Username</label>
                      <input className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                        placeholder="admin" value={form.wordpress_username} onChange={e => setForm(f => ({ ...f, wordpress_username: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Application Password</label>
                      <input type="password" className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                        placeholder="xxxx xxxx xxxx xxxx" value={form.wordpress_app_password} onChange={e => setForm(f => ({ ...f, wordpress_app_password: e.target.value }))} />
                    </div>
                  </div>

                  <div className="flex gap-2 items-center mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                    <p className="text-white text-xs font-semibold">How to get your Application Password</p>
                  </div>
                  <div className="bg-[#1e2128] border border-white/[0.05] rounded-xl p-3 mb-4">
                    {[
                      'Log in to your WordPress admin panel',
                      'Go to Users → Your Profile',
                      'Scroll down to Application Passwords',
                      'Enter a name (e.g. "InfraMind") and click Add New',
                      'Copy the generated password and paste it above',
                    ].map((step, i) => (
                      <div key={i} className="flex gap-2 items-start mb-2 last:mb-0">
                        <span className="text-[#4ade80] text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-white/50 text-xs">{step}</p>
                      </div>
                    ))}
                  </div>
                </>)}

                <button onClick={saveSettings} disabled={saving}
                  className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors mb-4">
                  <div className="md:col-span-2">
  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Publishing Frequency</label>
  <select className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
    value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
    <option value="daily1">Daily · 1 post/day</option>
    <option value="daily2">Daily · 2 posts/day</option>
    <option value="daily3">Daily · 3 posts/day</option>
    <option value="2/week">2× / week</option>
    <option value="weekly">Weekly</option>
    <option value="biweekly">Bi-weekly</option>
    <option value="monthly">Monthly</option>
  </select>
</div>
<div className="md:col-span-2">
  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Top Competitors (optional)</label>
  <textarea rows={2} className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
    placeholder="e.g. competitor1.com, competitor2.com"
    value={form.competitors} onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))} />
</div>
<div className="md:col-span-2">
  <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Brand Notes (optional)</label>
  <textarea rows={2} className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
    placeholder="e.g. Avoid dark topics, prefer upbeat tone, brand color is green"
    value={form.brand_notes} onChange={e => setForm(f => ({ ...f, brand_notes: e.target.value }))} />
</div>
                </button>

                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-white/30 text-xs mb-2">Need help connecting WordPress?</p>
                  <a href="https://wa.me/919633474645?text=Hi%2C%20I%20need%20help%20connecting%20WordPress%20to%20InfraMind" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#4ade80] hover:bg-[#22c55e] text-black text-xs font-bold px-3 py-2 rounded-xl transition-colors w-full">
                    💬 WhatsApp Us — We'll connect it for you
                  </a>
                </div>
              </div>
            )}

            {/* Support Section */}
            <div className="mt-4 bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Need Help?</p>
              <p className="text-white text-xs font-semibold mb-1">We're here for you 👋</p>
              <p className="text-white/40 text-xs mb-4">Reach out anytime — we usually reply in minutes.</p>

              <div className="flex flex-col gap-2">
                <a href="https://wa.me/919633474645?text=Hi%2C%20I%20need%20help%20with%20InfraMind" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-white px-4 py-3 rounded-xl transition-all group">
                  <span className="text-lg">💬</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">WhatsApp</p>
                    <p className="text-xs text-white/40">Chat with us directly</p>
                  </div>
                  <span className="text-white/20 group-hover:text-white/60 text-xs transition-colors">→</span>
                </a>

                <a href="mailto:hello@inframindhq.online?subject=Support Request"
                  className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white px-4 py-3 rounded-xl transition-all group">
                  <span className="text-lg">✉️</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Email Support</p>
                    <p className="text-xs text-white/40">hello@inframindhq.online</p>
                  </div>
                  <span className="text-white/20 group-hover:text-white/60 text-xs transition-colors">→</span>
                </a>


              </div>

              <p className="text-white/20 text-xs text-center mt-4">Typical reply time: under 10 minutes</p>
            </div>
          </div>

          </div>
        )}


        {tab === 'social' && (
          <div className="space-y-6">
            {/* Create Post Panel */}
            <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-5">✦ Generate Social Post</h2>

              {/* Platform */}
              <div className="mb-4">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Platform</p>
                <div className="flex gap-2">
                  {(['instagram','linkedin','twitter'] as const).map(p => (
                    <button key={p} onClick={() => setSocialPlatform(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${socialPlatform === p ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}>
                      {p === 'instagram' ? '📸 Instagram' : p === 'linkedin' ? '💼 LinkedIn' : '𝕏 Twitter'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="mb-4">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Format</p>
                <div className="flex gap-2">
                  {(['post','story'] as const).map(f => (
                    <button key={f} onClick={() => setSocialFormat(f)}
                      className={`px-5 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${socialFormat === f ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}>
                      {f === 'post' ? '⬛ Post / Poster' : '📱 Story'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestion */}
              <div className="mb-5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Your Suggestion <span className="normal-case text-white/20">(optional)</span></p>
                <textarea
                  value={socialSuggestion}
                  onChange={e => setSocialSuggestion(e.target.value)}
                  placeholder="e.g. 'Highlight our new gold savings feature' or 'Something motivational about wealth building'"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#4ade80]/40"
                  rows={2}
                />
              </div>

              {postMessage && (
                <div className="mb-4 text-xs text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-xl px-4 py-3">{postMessage}</div>
              )}

              <button
                disabled={generatingPost}
                onClick={async () => {
                  if (!client) return;
                  setGeneratingPost(true);
                  setPostMessage('');
                  try {
                    const res = await fetch('/api/client/generate-post', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ client_id: client.id, platform: socialPlatform, format: socialFormat, suggestion: socialSuggestion }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setPostMessage('Post generated! Review it below.');
                      setSocialSuggestion('');
                      const { data: fresh } = await supabase.from('social_posts').select('*').eq('client_id', client.id).order('created_at', { ascending: false });
                      setSocialPosts(fresh || []);
                    } else {
                      setPostMessage(data.error || 'Failed to generate post.');
                    }
                  } catch(e) { setPostMessage('Something went wrong.'); }
                  setGeneratingPost(false);
                }}
                className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm transition-colors"
              >
                {generatingPost ? '✦ Generating...' : '+ Generate Post'}
              </button>
            </div>

            {/* Posts List */}
            {socialPosts.length > 0 && (
              <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Your Posts</h2>
                <div className="space-y-4">
                  {socialPosts.map(post => (
                    <div key={post.id} className="flex gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                      {/* Image */}
                      <div className={`flex-shrink-0 bg-white/5 rounded-xl overflow-hidden ${post.format === 'story' ? 'w-16 h-28' : 'w-20 h-20'}`}>
                        {post.image_url
                          ? <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No img</div>
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-white/40 capitalize">{post.platform === 'twitter' ? '𝕏 Twitter' : post.platform === 'instagram' ? '📸 Instagram' : '💼 LinkedIn'}</span>
                          <span className="text-white/20">·</span>
                          <span className="text-xs text-white/30 capitalize">{post.format}</span>
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'published' ? 'bg-[#4ade80]/10 text-[#4ade80]' : post.status === 'approved' ? 'bg-blue-400/10 text-blue-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{post.caption}</p>
                        <div className="flex gap-2 mt-3">
                          {post.status === 'pending' && (
                            <button
                              onClick={async () => {
                                await supabase.from('social_posts').update({ status: 'approved' }).eq('id', post.id);
                                setSocialPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'approved' } : p));
                              }}
                              className="text-xs bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/20 px-3 py-1.5 rounded-lg transition-colors">
                              ✓ Approve
                            </button>
                          )}
                          {post.status === 'approved' && (
                            <button
                              onClick={async () => {
                                await supabase.from('social_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', post.id);
                                setSocialPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p));
                              }}
                              className="text-xs bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 border border-blue-400/20 px-3 py-1.5 rounded-lg transition-colors">
                              ↑ Publish
                            </button>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(post.caption);
                            }}
                            className="text-xs text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                            Copy Caption
                          </button>
                          {post.image_url && (
                            <a href={post.image_url} download target="_blank"
                              className="text-xs text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                              ↓ Image
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'embed' && (
          <div className="flex flex-col gap-6">

            {/* Embed Code */}
            <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-1">Your Embed Code</h2>
              <p className="text-white/40 text-sm mb-4">Paste this on any page to display your blogs.</p>
              <div className="bg-[#1e2128] border border-white/[0.08] rounded-xl p-4 font-mono text-xs text-[#4ade80] break-all mb-3">
                {`<div id="inframind-blog"></div>`}<br/>
                {`<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`}
              </div>
              <button
                onClick={() => {
                  const code = `<div id="inframind-blog"></div>\n<script src="https://inframindhq.online/embed.js" data-client="${client?.slug || 'your-slug'}" defer></script>`;
                  navigator.clipboard.writeText(code);
                  alert('Copied!');
                }}
                className="text-xs bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Copy Code
              </button>
            </div>


          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-6">Company Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <div className="md:col-span-2">
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Target Audience</label>
                <input className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
                  placeholder="e.g. retail investors, first-time gold buyers"
                  value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Description</label>
                <textarea rows={3} className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
                  placeholder="e.g. Gold Vault is a fintech platform that lets anyone buy and invest in digital gold safely."
                  value={form.company_description} onChange={e => setForm(f => ({ ...f, company_description: e.target.value }))} />
              </div>
            </div>
            {/* Brand Reference Images */}
            <div className="mt-6">
              <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Brand Reference Images</label>
              <p className="text-xs text-white/30 mb-3">Used to match your brand style when generating blog cover images.</p>
              <div className="flex flex-wrap gap-3 mb-3">
                {(client?.brand_images || []).map((url: string, i: number) => (
                  <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/[0.08]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 px-4 py-2 rounded-lg transition-colors">
                <span>+ Upload Images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={uploadBrandImages} />
              </label>
            </div>

            <button onClick={saveSettings} disabled={saving}
              className="mt-5 w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold px-4 py-3 rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            {/* AI Analysis Panel */}
            {(analysing || analysis) && (
              <div className="mt-6 rounded-2xl border border-[#4ade80]/20 bg-[#4ade80]/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#4ade80] text-sm font-bold">✦ Content Strategy Analysis</span>
                  {analysing && <span className="text-white/30 text-xs animate-pulse">Analysing...</span>}
                </div>
                {analysing && (
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-3 bg-white/5 rounded-full animate-pulse" style={{width: `${70+i*10}%`}} />)}
                  </div>
                )}
                {analysis && (
                  <div className="text-sm text-white/70 space-y-3">
                    {analysis.split('\n').filter(Boolean).map((line, i) =>
                      line.startsWith('##') ? (
                        <p key={i} className="text-white font-semibold text-xs uppercase tracking-widest mt-4 first:mt-0">{line.replace(/^##\s*/, '')}</p>
                      ) : (
                        <p key={i} className="text-white/60 text-sm leading-relaxed">{line}</p>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    </>
  );
}
