'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Step = 'details' | 'analyzing' | 'analysis' | 'palette' | 'photos' | 'upload' | 'style' | 'weekly' | 'plan' | 'done';

const socialPlans = [
  {
    name: 'Social Starter',
    price: '₹799',
    period: '/month',
    tagline: 'Perfect to get started',
    posts: '30 posts/month',
    features: ['30 AI posts/month', 'Instagram + LinkedIn + Twitter', 'AI poster generation', 'Brand color matching', 'Logo on every poster', 'Weekly topic suggestions'],
    popular: false,
  },
  {
    name: 'Social Growth',
    price: '₹1,499',
    period: '/month',
    tagline: 'Most popular',
    posts: '60 posts/month',
    features: ['60 AI posts/month', 'All platforms', 'Priority AI image generation', 'Custom brand palette', 'Logo on every poster', 'Weekly topic suggestions', 'Special day auto-posts', 'Priority support'],
    popular: true,
  },
  {
    name: 'Social Pro',
    price: '₹2,499',
    period: '/month',
    tagline: 'For serious brands',
    posts: 'Unlimited posts',
    features: ['Unlimited posts', 'All platforms', 'NVIDIA FLUX images', 'Full brand identity', 'Logo on every poster', 'Daily topic suggestions', 'Special day auto-posts', 'Dedicated support'],
    popular: false,
  },
];

export default function SocialOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('details');
  const [client, setClient] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ company_name: '', website: '', industry: '', target_audience: '', company_description: '' });
  const [analysis, setAnalysis] = useState<any>(null);
  const [palettes, setPalettes] = useState<any[]>([]);
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [brandPhotos, setBrandPhotos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('Social Growth');
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [weekTheme, setWeekTheme] = useState('');
  const [checking, setChecking] = useState(true);
  const [pexelsPhotos, setPexelsPhotos] = useState<any[]>([]);
  const [selectedPexels, setSelectedPexels] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [brandStyle, setBrandStyle] = useState<any>(null);
  const [analysingStyle, setAnalysingStyle] = useState(false);
  const [weeklyConfirmed, setWeeklyConfirmed] = useState(false);
  const [loadingPexels, setLoadingPexels] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUser(session.user);
      const { data: c } = await supabase.from('clients').select('*').eq('user_id', session.user.id).single();
      setChecking(false);
      if (c) {
        setClient(c);
        // if (c.social_onboarded) { router.push('/dashboard/social'); return; }
        setForm({
          company_name: c.company_name || '',
          website: c.website || '',
          industry: c.industry || '',
          target_audience: c.target_audience || '',
          company_description: c.company_description || '',
        });
        // Load brand photos from storage
        const { data: files } = await supabase.storage.from('brand-images').list(session.user.id + '/');
        if (files) {
          const urls = files.filter((f: any) => !f.name.includes('logo')).map((f: any) => {
            const { data } = supabase.storage.from('brand-images').getPublicUrl(session.user.id + '/' + f.name);
            return data.publicUrl;
          });
          setBrandPhotos(urls);
        }
      }
    })();
  }, []);

  async function analyzeAndContinue() {
    setStep('analyzing');
    try {
      const res = await fetch('/api/client/social-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setTopics(data.topics || []);
      setWeekTheme(data.week_theme || '');
      // Generate 3 palette options
      const primary = client?.brand_primary_color || '#4ade80';
      const secondary = client?.brand_secondary_color || '#a78bfa';
      setPalettes([
        { name: 'Brand Identity', colors: [primary, secondary, '#ffffff'], desc: 'Your exact brand colors' },
        { name: 'Bold Contrast', colors: [primary, '#000000', '#ffffff'], desc: 'High impact, maximum visibility' },
        { name: 'Soft Premium', colors: [secondary, primary + 'aa', '#f8f8f8'], desc: 'Elegant and sophisticated' },
      ]);
      setStep('analysis');
    } catch {
      setStep('details');
    }
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    const chosenPalette = palettes[selectedPalette];
    const allRefPhotos = [...uploadedPhotos, ...selectedPexels];
    await supabase.from('clients').upsert({
      user_id: user.id,
      company_name: form.company_name,
      website: form.website,
      industry: form.industry,
      target_audience: form.target_audience,
      company_description: form.company_description,
      slug: form.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      social_onboarded: true,
      social_plan: selectedPlan,
      social_palette: chosenPalette,
      social_brand_photos: allRefPhotos.length > 0 ? allRefPhotos : selectedPhotos,
      brand_style_keywords: brandStyle?.styleKeywords || null,
      brand_flux_suffix: brandStyle?.fluxStyleSuffix || null,
      brand_photo_style: brandStyle?.photoStyle || null,
      topic_suggestions: topics,
      topic_suggestions_at: new Date().toISOString(),
      topic_week_theme: weekTheme,
      brand_primary_color: chosenPalette?.colors[0] || client?.brand_primary_color,
      brand_secondary_color: chosenPalette?.colors[1] || client?.brand_secondary_color,
    }, { onConflict: 'user_id' });
    setSaving(false);
    router.push('/dashboard/social');
  }

  if (checking) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading...</div>
    </div>
  );

  // ── STEP: Details ──
  if (step === 'details') return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Social Media AI</p>
        <h1 className="text-2xl font-bold text-white mb-1">Set up your social presence</h1>
        <p className="text-sm text-white/40 mb-8">We'll analyze your brand and generate a content strategy.</p>

        {client && (
          <div className="mb-6 p-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 text-xs text-[#4ade80]">
            ✓ We've pre-filled your details from your blog profile. Review and continue.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {[
            { key: 'company_name', label: 'Company Name', placeholder: 'GoldVault' },
            { key: 'website', label: 'Website', placeholder: 'https://goldvault.app' },
            { key: 'industry', label: 'Industry', placeholder: 'Fintech' },
            { key: 'target_audience', label: 'Target Audience', placeholder: 'Young investors, 25-40' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">{label}</label>
              <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4ade80]/40" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">What does your company do?</label>
            <textarea value={form.company_description} onChange={e => setForm(f => ({ ...f, company_description: e.target.value }))}
              placeholder="We help young Indians invest in gold digitally..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#4ade80]/40" />
          </div>
        </div>

        <button onClick={analyzeAndContinue} disabled={!form.company_name || !form.industry}
          className="w-full mt-6 bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm transition-colors">
          Analyze & Continue →
        </button>
      </div>
    </div>
  );

  // ── STEP: Analyzing ──
  if (step === 'analyzing') return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#4ade80]/30 border-t-[#4ade80] animate-spin mx-auto mb-6" />
        <h2 className="text-white font-semibold mb-2">Analyzing your brand...</h2>
        <p className="text-white/40 text-sm">Building your social media strategy</p>
      </div>
    </div>
  );

  // ── STEP: Analysis Overview ──
  if (step === 'analysis' && analysis) return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Social Media Analysis</p>
        <h1 className="text-2xl font-bold text-white mb-1">{form.company_name}</h1>
        <p className="text-sm text-white/40 mb-8">Here's your personalized social media strategy.</p>

        <div className="flex flex-col gap-4 mb-8">
          <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-[#4ade80] font-semibold uppercase tracking-widest mb-2">Strategy Overview</p>
            <p className="text-sm text-white/80">{analysis.strategy}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-xs text-[#60a5fa] font-semibold uppercase tracking-widest mb-2">Audience Insight</p>
              <p className="text-sm text-white/70">{analysis.audience}</p>
            </div>
            <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-xs text-[#a78bfa] font-semibold uppercase tracking-widest mb-2">Tone & Style</p>
              <p className="text-sm text-white/70">{analysis.tone}</p>
            </div>
          </div>
          <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-[#f59e0b] font-semibold uppercase tracking-widest mb-3">This Week's Topics</p>
            {weekTheme && <p className="text-xs text-white/30 italic mb-3">{weekTheme}</p>}
            <div className="flex flex-col gap-2">
              {topics.map((t: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-xs font-bold text-[#f59e0b] mt-0.5">#{i+1}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.title}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setStep('palette')}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold py-3 rounded-xl text-sm transition-colors">
          Choose Your Color Palette →
        </button>
      </div>
    </div>
  );

  // ── STEP: Palette ──
  if (step === 'palette') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Step 2 of 4</p>
        <h1 className="text-2xl font-bold text-white mb-1">Choose your color palette</h1>
        <p className="text-sm text-white/40 mb-8">This will be used on all your AI-generated posters.</p>

        <div className="flex flex-col gap-4 mb-8">
          {palettes.map((p, i) => (
            <button key={i} onClick={() => setSelectedPalette(i)}
              className={`text-left p-4 rounded-2xl border transition-all ${selectedPalette === i ? 'border-[#4ade80]/50 bg-[#4ade80]/5' : 'border-white/[0.06] bg-[#1a1d23] hover:border-white/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                {p.colors.map((col: string, j: number) => (
                  <div key={j} className="w-10 h-10 rounded-xl border border-white/10" style={{ background: col }} />
                ))}
                {selectedPalette === i && <span className="ml-auto text-xs text-[#4ade80] font-semibold">✓ Selected</span>}
              </div>
              <p className="text-sm font-semibold text-white">{p.name}</p>
              <p className="text-xs text-white/40">{p.desc}</p>
            </button>
          ))}
        </div>

        <button onClick={async () => { setStep('upload'); setLoadingPexels(true); const r = await fetch('/api/client/brand-photos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ industry: form.industry, company_name: form.company_name }) }); const d = await r.json(); setPexelsPhotos(d.photos || []); setLoadingPexels(false); }}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold py-3 rounded-xl text-sm transition-colors">
          {'Upload Brand Photos →'}
        </button>
      </div>
    </div>
  );

  // ── STEP: Photos ──
  if (step === 'photos') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Step 3 of 4</p>
        <h1 className="text-2xl font-bold text-white mb-1">Choose brand photos</h1>
        <p className="text-sm text-white/40 mb-8">Pick up to 3 photos to use as inspiration for your poster backgrounds.</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {brandPhotos.map((url, i) => (
            <button key={i} onClick={() => setSelectedPhotos(prev =>
              prev.includes(url) ? prev.filter(p => p !== url) : prev.length < 3 ? [...prev, url] : prev
            )}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedPhotos.includes(url) ? 'border-[#4ade80]' : 'border-transparent'}`}>
              <img src={url} alt="" className="w-full h-full object-cover" />
              {selectedPhotos.includes(url) && (
                <div className="absolute inset-0 bg-[#4ade80]/20 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <button onClick={() => setStep('plan')}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold py-3 rounded-xl text-sm transition-colors">
          Choose Plan →
        </button>
        <button onClick={() => setStep('plan')} className="w-full mt-2 text-white/30 hover:text-white text-xs py-2 transition-colors">
          Skip — use AI-generated backgrounds
        </button>
      </div>
    </div>
  );

  // ── STEP: Upload brand photos ──
  if (step === 'upload') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Step 3 of 5</p>
        <h1 className="text-2xl font-bold text-white mb-1">Upload your brand photos</h1>
        <p className="text-sm text-white/40 mb-6">Upload 3–5 photos that represent your brand style. We'll use Claude Vision to extract your visual identity.</p>

        <label className="block w-full border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-[#4ade80]/40 transition-colors mb-6">
          <input type="file" multiple accept="image/*" className="hidden" onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const urls: string[] = [];
            for (const file of files.slice(0, 5)) {
              const reader = new FileReader();
              await new Promise<void>(resolve => {
                reader.onload = (ev) => { urls.push(ev.target?.result as string); resolve(); };
                reader.readAsDataURL(file);
              });
            }
            setUploadedPhotos(prev => [...prev, ...urls].slice(0, 5));
          }} />
          <div className="text-3xl mb-2">📸</div>
          <p className="text-sm text-white/60">Click to upload photos</p>
          <p className="text-xs text-white/30 mt-1">JPG, PNG up to 5 photos</p>
        </label>

        {uploadedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {uploadedPhotos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setUploadedPhotos(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        )}

        {loadingPexels ? (
          <p className="text-xs text-white/30 text-center mb-6">Loading style suggestions...</p>
        ) : pexelsPhotos.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-white/40 mb-3">Or pick a style from these industry photos:</p>
            <div className="grid grid-cols-3 gap-3">
              {pexelsPhotos.map((p: any) => (
                <button key={p.id} onClick={() => setSelectedPexels(prev =>
                  prev.includes(p.url) ? prev.filter(x => x !== p.url) : prev.length < 3 ? [...prev, p.url] : prev
                )} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedPexels.includes(p.url) ? 'border-[#4ade80]' : 'border-transparent'}`}>
                  <img src={p.thumb} alt="" className="w-full h-full object-cover" />
                  {selectedPexels.includes(p.url) && (
                    <div className="absolute inset-0 bg-[#4ade80]/20 flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={async () => {
          const allPhotos = [...uploadedPhotos, ...selectedPexels];
          if (allPhotos.length === 0) { setStep('weekly'); return; }
          setAnalysingStyle(true);
          setStep('style');
          try {
            const res = await fetch('/api/client/analyze-brand-style', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image_urls: selectedPexels,
                company_name: form.company_name,
                industry: form.industry,
                client_id: client?.id,
              }),
            });
            const data = await res.json();
            setBrandStyle(data);
          } catch(e) { console.error(e); }
          setAnalysingStyle(false);
          setStep('weekly');
        }} className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold py-3 rounded-xl text-sm transition-colors">
          {uploadedPhotos.length > 0 || selectedPexels.length > 0 ? 'Analyse Style & Continue →' : 'Skip — Use AI Style →'}
        </button>
      </div>
    </div>
  );

  // ── STEP: Style analysing ──
  if (step === 'style') return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#a78bfa]/30 border-t-[#a78bfa] animate-spin mx-auto mb-6" />
        <h2 className="text-white font-semibold mb-2">Analysing your visual style...</h2>
        <p className="text-white/40 text-sm">Claude Vision is extracting your brand aesthetic</p>
      </div>
    </div>
  );

  // ── STEP: Weekly content confirmation ──
  if (step === 'weekly') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Step 4 of 5</p>
        <h1 className="text-2xl font-bold text-white mb-1">Confirm this week's content</h1>
        <p className="text-sm text-white/40 mb-2">These topics will guide your AI-generated posts this week.</p>
        {weekTheme && <p className="text-xs text-[#4ade80] mb-6 italic">Theme: {weekTheme}</p>}

        {brandStyle && (
          <div className="bg-[#1a1d23] border border-[#a78bfa]/20 rounded-2xl p-4 mb-6">
            <p className="text-xs text-[#a78bfa] font-semibold uppercase tracking-widest mb-2">Visual Style Extracted ✓</p>
            <p className="text-xs text-white/60 mb-2">{brandStyle.brandSummary}</p>
            <div className="flex flex-wrap gap-2">
              {brandStyle.styleKeywords?.map((k: string) => (
                <span key={k} className="px-2 py-1 rounded-lg bg-[#a78bfa]/10 text-[#a78bfa] text-xs">{k}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-8">
          {topics.map((t: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#1a1d23] border border-white/[0.06]">
              <span className="text-xs font-bold text-[#f59e0b] mt-0.5 shrink-0">#{i+1}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{t.title}</p>
                <p className="text-xs text-white/40 mt-1">{t.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: t.type === 'educational' ? '#1e3a5f' : t.type === 'promotional' ? '#1a3a2a' : t.type === 'story' ? '#3a2a1a' : '#2a1a3a', color: t.type === 'educational' ? '#60a5fa' : t.type === 'promotional' ? '#4ade80' : t.type === 'story' ? '#f59e0b' : '#a78bfa' }}>
                  {t.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { setWeeklyConfirmed(true); setStep('plan'); }}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold py-3 rounded-xl text-sm transition-colors">
          Confirm & Choose Plan →
        </button>
        <button onClick={async () => {
          const res = await fetch('/api/client/social-analysis', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form }),
          });
          const data = await res.json();
          setTopics(data.topics || []);
          setWeekTheme(data.week_theme || '');
        }} className="w-full mt-2 text-white/30 hover:text-white/60 text-xs py-2 transition-colors">
          ↻ Regenerate topics
        </button>
      </div>
    </div>
  );

  // ── STEP: Plan ──

  if (step === 'plan') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Step 4 of 4</p>
        <h1 className="text-2xl font-bold text-white mb-1">Choose your plan</h1>
        <p className="text-sm text-white/40 mb-8">All plans include AI poster generation with your brand identity.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {socialPlans.map(plan => (
            <button key={plan.name} onClick={() => setSelectedPlan(plan.name)}
              className={`text-left p-5 rounded-2xl border transition-all ${selectedPlan === plan.name ? 'border-[#4ade80]/50 bg-[#4ade80]/5' : 'border-white/[0.06] bg-[#1a1d23] hover:border-white/20'} ${plan.popular ? 'relative' : ''}`}>
              {plan.popular && <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-[#4ade80] text-black px-3 py-1 rounded-full">Most Popular</span>}
              <p className="text-lg font-bold text-white mb-0.5">{plan.price}<span className="text-sm font-normal text-white/40">{plan.period}</span></p>
              <p className="text-sm font-semibold text-white mb-0.5">{plan.name}</p>
              <p className="text-xs text-white/40 mb-3">{plan.tagline}</p>
              <p className="text-xs font-semibold text-[#4ade80] mb-3">{plan.posts}</p>
              <div className="flex flex-col gap-1.5">
                {plan.features.map(f => (
                  <p key={f} className="text-xs text-white/60">✓ {f}</p>
                ))}
              </div>
              {selectedPlan === plan.name && <p className="text-xs text-[#4ade80] font-semibold mt-3">✓ Selected</p>}
            </button>
          ))}
        </div>

        <button onClick={finish} disabled={saving}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm transition-colors">
          {saving ? 'Setting up...' : 'Start Creating Posts →'}
        </button>
        <button onClick={finish} disabled={saving} className="w-full mt-2 text-white/30 hover:text-white text-xs py-2 transition-colors">
          Skip for now — decide later
        </button>
      </div>
    </div>
  );

  return null;
}
