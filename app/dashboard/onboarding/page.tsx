'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const industries = ['Technology', 'Healthcare', 'Finance', 'Fintech', 'Retail', 'Education', 'Real Estate', 'Other'];
const tones = ['Professional', 'Friendly', 'Casual', 'Expert'];

type Step = 'form' | 'plan' | 'images' | 'analyzing' | 'overview';

const plans = [
  {
    name: 'Free Trial',
    price: '₹0',
    period: '7 days',
    tagline: 'No credit card needed',
    blogs: '4 blogs',
    generation: '1 blog every alternate day',
    frequency: '2/week',
    cta: 'Start Free Trial',
    ctaStyle: 'solid' as const,
    popular: false,
    freeTrial: true,
    features: [
      '4 blogs over 7 days',
      'Auto-generation every alternate day',
      'Manual generation anytime',
      'AI content strategy',
      'Approve & publish flow',
      'Embed script included',
    ],
  },
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    tagline: 'Best for small businesses',
    blogs: '15 blogs/mo',
    generation: 'Auto + manual',
    frequency: 'daily1',
    cta: 'Get Started',
    ctaStyle: 'outline' as const,
    popular: false,
    freeTrial: true,
    features: [
      '15 blogs per month',
      'Daily auto-generation',
      'Manual generation anytime',
      'SEO keyword targeting',
      'Approve & publish flow',
      'Embed script delivery',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '₹1,899',
    period: '/month',
    tagline: 'Most popular plan',
    blogs: '30 blogs/mo',
    generation: 'Daily auto + manual',
    frequency: 'daily1',
    cta: 'Get Started',
    ctaStyle: 'solid' as const,
    popular: true,
    freeTrial: true,
    features: [
      '30 blogs per month',
      'Daily auto-generation',
      'Manual generation anytime',
      'Advanced SEO strategy',
      'Approve & publish flow',
      'Embed script delivery',
      'Priority support',
      'Content performance insights',
    ],
  },
  {
    name: 'Pro',
    price: '₹2,499',
    period: '/month',
    tagline: 'For growing brands',
    blogs: '60 blogs/mo',
    generation: '2 blogs/day auto + manual',
    frequency: 'daily2',
    cta: 'Get Started',
    ctaStyle: 'outline' as const,
    popular: false,
    freeTrial: true,
    features: [
      '60 blogs per month',
      '2 auto-generated blogs per day',
      'Manual generation anytime',
      'Advanced SEO strategy',
      'Embed + WordPress delivery',
      'Dedicated support',
      'Content calendar',
      'Custom tone & style',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'on request',
    tagline: 'For agencies & large teams',
    blogs: 'Unlimited',
    generation: 'Custom schedule',
    frequency: 'daily3',
    cta: 'Contact Us',
    ctaStyle: 'outline' as const,
    popular: false,
    freeTrial: true,
    features: [
      'Unlimited blogs',
      'Custom generation schedule',
      'Multiple company profiles',
      'White label option',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [topicImages, setTopicImages] = useState<string[]>([]);
  const [brandFiles, setBrandFiles] = useState<File[]>([]);
  const [brandPreviews, setBrandPreviews] = useState<string[]>([]);
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#4ade80');
  const [secondaryColor, setSecondaryColor] = useState('#1e2128');
  const [extractingColors, setExtractingColors] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    website: '',
    industry: 'Technology',
    target_audience: '',
    tone: 'Professional',
    company_description: '',
    frequency: 'weekly',
    competitors: '',
    brand_notes: '',
    instagram_handle: '',
    linkedin_url: '',
    twitter_handle: '',
  });

  const [finalForm, setFinalForm] = useState({ ...form });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else { setUser(session.user); setChecking(false); }
    });
  }, []);

  function handlePlanSelect(plan: typeof plans[0]) {
    setSelectedPlan(plan);
    setForm(f => ({ ...f, frequency: plan.frequency }));
  }

  function handlePlanContinue() {
    if (!selectedPlan) return;
    if (selectedPlan.name === 'Enterprise') {
      window.location.href = 'mailto:hello@inframindhq.online?subject=Enterprise Plan';
      return;
    }
    setStep('images');
  }


  function handleBrandFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setBrandFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setBrandPreviews(previews);
  }

  function handleRemoveBrand(i: number) {
    setBrandFiles(f => f.filter((_, idx) => idx !== i));
    setBrandPreviews(p => p.filter((_, idx) => idx !== i));
  }

  async function handleBrandUploadAndAnalyze() {
    setUploadingBrand(true);
    setError('');
    try {
      if (brandFiles.length > 0 && user) {
        await Promise.all(brandFiles.map(async (file) => {
          const ext = file.name.split('.').pop();
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          await supabase.storage.from('brand-images').upload(path, file, { upsert: true });
        }));
      }
    } catch (e) {
      console.error('Brand upload error', e);
    } finally {
      setUploadingBrand(false);
    }
    handleAnalyze();
  }
  async function handleAnalyze() {
    setError('');
    setStep('analyzing');
    try {
      const res = await fetch('/api/client/analyze-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
      setFinalForm({
        ...form,
        company_description: data.analysis.suggested_description || form.company_description,
      });

      // Fetch cover images for each suggested topic
      const topics: { title: string }[] = data.analysis.suggested_topics || [];
      const images = await Promise.all(
        topics.map(async (t) => {
          const query = encodeURIComponent(t.title.split(' ').slice(0, 4).join(' '));
          try {
            const r = await fetch(
              `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
              { headers: { Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo'}` } }
            );
            const d = await r.json();
            return d.results?.[0]?.urls?.small || '';
          } catch {
            return '';
          }
        })
      );
      setTopicImages(images);
      setStep('overview');
    } catch (e: any) {
      setError(e.message);
      setStep('plan');
    }
  }

  async function handleConfirm() {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const { error: err } = await supabase.from('clients').upsert({
        user_id: user.id,
        company_name: finalForm.company_name,
        website: finalForm.website,
        industry: finalForm.industry,
        target_audience: finalForm.target_audience,
        tone: finalForm.tone,
        company_description: finalForm.company_description,
        frequency: form.frequency,
        competitors: form.competitors || null,
        brand_notes: form.brand_notes || null,
        plan: selectedPlan?.name || 'Free Trial',
        logo_url: (window as any).__logoUrl || null,
        brand_primary_color: primaryColor,
        brand_secondary_color: secondaryColor,
        instagram_handle: finalForm.instagram_handle || null,
        linkedin_url: finalForm.linkedin_url || null,
        twitter_handle: finalForm.twitter_handle || null,
        slug: finalForm.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      }, { onConflict: 'user_id' });
      router.push('/dashboard/client');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (checking) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading...</div>
    </div>
  );

  // ─── STEP 1: Company Details ──────────────────────────────────────────────
  if (step === 'form') return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <a href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white/80 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 mb-5 transition-colors">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="11" height="11"><path d="M10 8H3M6 5l-3 3 3 3" /></svg>
          Dashboard
        </a>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-xs text-[#4ade80] font-medium">Company</span>
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white/30 text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-xs text-white/30">Plan</span>
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white/30 text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-xs text-white/30">Strategy</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Tell us about your company</h1>
          <p className="text-sm text-white/40 mt-1">We will analyze your details and build a content strategy.</p>
        </div>

        <div className="bg-[#26292f] rounded-2xl border border-white/[0.08] p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Name</label>
            <input
              className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
              placeholder="e.g. Gold Vault"
              value={form.company_name}
              onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Website URL</label>
            <input
              className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
              placeholder="e.g. https://goldvault.app"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Company Description</label>
            <textarea
              rows={3}
              className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
              placeholder="e.g. Gold Vault is a fintech platform that lets anyone buy digital gold safely. We serve retail investors across India."
              value={form.company_description}
              onChange={e => setForm(f => ({ ...f, company_description: e.target.value }))}
            />
            <p className="text-xs text-white/20 mt-1">The more detail you give, the better your blogs will be.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Top Competitors (optional)</label>
            <input
              className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors"
              placeholder="e.g. competitor1.com, competitor2.com"
              value={form.competitors}
              onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-1.5 block">Brand Notes (optional)</label>
            <textarea
              rows={2}
              className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
              placeholder="e.g. Avoid dark topics, prefer upbeat tone, our brand color is green"
              value={form.brand_notes}
              onChange={e => setForm(f => ({ ...f, brand_notes: e.target.value }))}
            />
          </div>

          <button
            onClick={() => setStep('plan')}
            disabled={!form.company_name || !form.website}
            className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            Next: Choose Your Plan →
          </button>
        </div>
      </div>
    </div>
  );

  // ─── STEP 2: Plan Selection ───────────────────────────────────────────────
  if (step === 'plan') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 max-w-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold flex items-center justify-center">✓</span>
            <span className="text-xs text-white/30">Company</span>
          </div>
          <div className="flex-1 h-px bg-[#4ade80]/30" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-xs text-[#4ade80] font-medium">Plan</span>
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white/30 text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-xs text-white/30">Strategy</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Choose your plan</h1>
          <p className="text-sm text-white/40 mt-1">Every plan starts with a 7-day free trial. No credit card needed to begin.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {plans.slice(0, 3).map((plan) => {
            const isSelected = selectedPlan?.name === plan.name;
            return (
              <div
                key={plan.name}
                onClick={() => handlePlanSelect(plan)}
                className={`relative rounded-2xl p-5 flex flex-col border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#4ade80]/[0.08] border-[#4ade80]/60 ring-1 ring-[#4ade80]/40'
                    : plan.popular
                    ? 'bg-[#4ade80]/[0.03] border-[#4ade80]/20 hover:border-[#4ade80]/40'
                    : 'bg-[#26292f] border-white/[0.08] hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-[#4ade80] text-black text-xs font-bold px-3 py-0.5 rounded-full">⭐ Most Popular</span>
                  </div>
                )}

                {/* Free trial badge */}
                <div className="inline-flex items-center gap-1 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full px-2.5 py-0.5 mb-3 self-start">
                  <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
                  <span className="text-[10px] text-[#4ade80] font-semibold">7-day free trial</span>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-[#4ade80]">{plan.name}</p>
                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-white/30 text-xs mb-1.5">{plan.period}</span>
                </div>
                <p className="text-white/30 text-xs mb-4">{plan.tagline}</p>

                <div className="rounded-xl px-3 py-2.5 mb-4 bg-[#1e2128] border border-white/[0.06]">
                  <p className="text-white font-semibold text-sm">{plan.blogs}</p>
                  <p className="text-white/30 text-xs mt-0.5">{plan.generation}</p>
                </div>

                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="mt-0.5 flex-shrink-0 text-[#4ade80]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                <div className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-center transition-colors ${
                  isSelected
                    ? 'bg-[#4ade80] text-black'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/50'
                }`}>
                  {isSelected ? '✓ Selected' : 'Select Plan'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {plans.slice(3).map((plan) => {
            const isSelected = selectedPlan?.name === plan.name;
            return (
              <div
                key={plan.name}
                onClick={() => handlePlanSelect(plan)}
                className={`relative rounded-2xl p-5 flex flex-col border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#4ade80]/[0.08] border-[#4ade80]/60 ring-1 ring-[#4ade80]/40'
                    : 'bg-[#26292f] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {/* Free trial badge */}
                    <div className="inline-flex items-center gap-1 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full px-2.5 py-0.5 mb-3 self-start">
                      <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
                      <span className="text-[10px] text-[#4ade80] font-semibold">
                        {plan.name === 'Enterprise' ? 'Custom trial' : '7-day free trial'}
                      </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-[#4ade80]">{plan.name}</p>
                    <div className="flex items-end gap-1 mb-0.5">
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                      <span className="text-white/30 text-xs mb-1.5">{plan.period}</span>
                    </div>
                    <p className="text-white/30 text-xs">{plan.tagline}</p>
                  </div>
                  <div className="rounded-xl px-3 py-2.5 text-right bg-[#1e2128] border border-white/[0.06] flex-shrink-0">
                    <p className="text-white font-semibold text-sm">{plan.blogs}</p>
                    <p className="text-white/30 text-xs mt-0.5">{plan.generation}</p>
                  </div>
                </div>

                <ul className="grid grid-cols-2 gap-2 mb-4 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="mt-0.5 flex-shrink-0 text-[#4ade80]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-colors ${
                  isSelected
                    ? 'bg-[#4ade80] text-black'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/50'
                }`}>
                  {isSelected ? '✓ Selected' : 'Select Plan'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected plan summary + CTA */}
        {selectedPlan && (
          <div className="sticky bottom-6 bg-[#26292f] border border-[#4ade80]/30 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-xl shadow-black/40">
            <div>
              <p className="text-white font-semibold text-sm">{selectedPlan.name} — {selectedPlan.price}<span className="text-white/30 text-xs">{selectedPlan.period !== '7 days' ? selectedPlan.period : ''}</span></p>
              <p className="text-white/40 text-xs mt-0.5">{selectedPlan.blogs} · Publishing frequency auto-set</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setStep('form')}
                className="px-4 py-2.5 rounded-xl text-xs text-white/50 hover:text-white border border-white/[0.08] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handlePlanContinue}
                className="px-5 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold rounded-xl text-sm transition-colors"
              >
                {selectedPlan.name === 'Enterprise' ? 'Contact Us' : 'Continue →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // ─── STEP 3: Brand Images ────────────────────────────────────────────────
  if (step === 'images') return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold flex items-center justify-center">✓</span>
            <span className="text-xs text-white/30">Company</span>
          </div>
          <div className="flex-1 h-px bg-[#4ade80]/30" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold flex items-center justify-center">✓</span>
            <span className="text-xs text-white/30">Plan</span>
          </div>
          <div className="flex-1 h-px bg-[#4ade80]/30" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-xs text-[#4ade80] font-medium">Brand</span>
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-white/[0.08] text-white/30 text-xs font-bold flex items-center justify-center">4</span>
            <span className="text-xs text-white/30">Strategy</span>
          </div>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Brand & Social Setup</h1>
          <p className="text-sm text-white/40 mt-1">Add your social handles and brand images. Our AI uses these to generate on-brand content and images across blogs and social posts.</p>
        </div>
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {/* Social handles */}
        <div className="bg-[#26292f] rounded-2xl border border-white/[0.08] p-6 mb-4">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Your Social Profiles <span className="normal-case text-white/20">(optional — used for publishing)</span></p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E1306C]/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="#E1306C" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <input
                type="text"
                placeholder="@yourhandle"
                className="flex-1 bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#E1306C]/40"
                value={form.instagram_handle}
                onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="#0A66C2" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <input
                type="text"
                placeholder="linkedin.com/company/yourcompany"
                className="flex-1 bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#0A66C2]/40"
                value={form.linkedin_url}
                onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              <input
                type="text"
                placeholder="@yourhandle"
                className="flex-1 bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20"
                value={form.twitter_handle}
                onChange={e => setForm(f => ({ ...f, twitter_handle: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Logo upload */}
        <div className="bg-[#26292f] rounded-2xl border border-white/[0.08] p-6 mb-4">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Logo PNG <span className="normal-case text-white/20">(transparent background preferred — overlaid on posters)</span></p>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative w-20 h-20 rounded-xl bg-[#1e2128] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                <button onClick={() => { setLogoFile(null); setLogoPreview(''); (window as any).__logoUrl = null; }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">✕</button>
              </div>
            ) : (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-[#4ade80]/40 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0">
                <span className="text-white/20 text-2xl">+</span>
                <input type="file" accept="image/png,image/svg+xml,image/webp" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            )}
            <div className="text-xs text-white/30 leading-relaxed">
              Upload your logo in PNG or SVG format.<br/>
              It will be placed on all generated posters.<br/>
              <span className="text-white/20">Skip if you don't have one yet.</span>
            </div>
          </div>
        </div>

        {/* Brand colors */}
        <div className="bg-[#26292f] rounded-2xl border border-white/[0.08] p-6 mb-4">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Brand Colors</p>
          <p className="text-xs text-white/20 mb-4">{extractingColors ? '✦ Extracting from your images...' : 'Auto-extracted from your reference images. Adjust if needed.'}</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-2">Primary Color</p>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#4ade80]/40" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-2">Secondary Color</p>
              <div className="flex items-center gap-3">
                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-[#1e2128] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#4ade80]/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand images */}
        <div className="bg-[#26292f] rounded-2xl border border-white/[0.08] p-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Brand Reference Images <span className="normal-case text-white/20">(up to 5 — helps AI match your visual style)</span></p>
          <label className="block w-full cursor-pointer">
            <div className="border-2 border-dashed border-white/[0.12] hover:border-[#4ade80]/40 rounded-xl p-6 text-center transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <p className="text-white text-sm font-medium mb-1">Drop images here or click to upload</p>
              <p className="text-white/30 text-xs">PNG, JPG, WEBP up to 5MB each · Max 5 images</p>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleBrandFileChange} />
          </label>
          {brandPreviews.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">{brandPreviews.length} image{brandPreviews.length > 1 ? 's' : ''} selected</p>
              <div className="grid grid-cols-5 gap-2">
                {brandPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                    <button onClick={() => handleRemoveBrand(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
                {brandPreviews.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-white/[0.1] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#4ade80]/30 transition-colors">
                    <span className="text-white/20 text-xl">+</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                      const newFiles = Array.from(e.target.files || []);
                      const combined = [...brandFiles, ...newFiles].slice(0, 5);
                      setBrandFiles(combined);
                      setBrandPreviews(combined.map(f => URL.createObjectURL(f)));
                    }} />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setStep('plan')}
            className="px-6 py-3 rounded-xl text-sm text-white/50 hover:text-white border border-white/[0.08] transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => handleBrandUploadAndAnalyze()}
            disabled={uploadingBrand}
            className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 font-medium rounded-xl py-3 text-sm transition-colors disabled:opacity-40"
          >
            {uploadingBrand ? 'Uploading...' : 'Skip for now →'}
          </button>
          <button
            onClick={() => handleBrandUploadAndAnalyze()}
            disabled={uploadingBrand || brandFiles.length === 0}
            className="flex-1 bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            {uploadingBrand ? 'Uploading...' : 'Upload & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── ANALYZING ────────────────────────────────────────────────────────────
  if (step === 'analyzing') return (
    <div className="min-h-screen bg-[#1e2128] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-[#4ade80] border-t-transparent animate-spin" />
      <p className="text-white font-medium">Analyzing your company...</p>
      <p className="text-white/30 text-sm">Building your content strategy</p>
    </div>
  );

  // ─── STEP 4: Strategy Overview ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 max-w-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold flex items-center justify-center">✓</span>
            <span className="text-xs text-white/30">Company</span>
          </div>
          <div className="flex-1 h-px bg-[#4ade80]/30" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold flex items-center justify-center">✓</span>
            <span className="text-xs text-white/30">Plan</span>
          </div>
          <div className="flex-1 h-px bg-[#4ade80]/30" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80]/20 text-[#4ade80] text-xs font-bold flex items-center justify-center">✓</span>
            <span className="text-xs text-white/30">Brand</span>
          </div>
          <div className="flex-1 h-px bg-[#4ade80]/30" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#4ade80] text-black text-xs font-bold flex items-center justify-center">4</span>
            <span className="text-xs text-[#4ade80] font-medium">Strategy</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Here is your content strategy</h1>
          <p className="text-sm text-white/40 mt-1">Review everything. Edit what you want. Then confirm to start generating blogs and social posts.</p>
        </div>

        {/* Selected plan chip */}
        {selectedPlan && (
          <div className="flex items-center gap-2 mb-5 bg-[#4ade80]/[0.06] border border-[#4ade80]/20 rounded-xl px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-sm text-white font-medium">{selectedPlan.name} Plan</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs">{selectedPlan.blogs} · {selectedPlan.generation}</span>
            <button
              onClick={() => setStep('plan')}
              className="ml-auto text-xs text-white/30 hover:text-[#4ade80] transition-colors"
            >
              Change
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        <div className="bg-[#26292f] border border-[#4ade80]/20 rounded-2xl p-6 mb-5">
          <p className="text-xs text-[#4ade80] uppercase tracking-widest mb-2">Strategy Overview</p>
          <p className="text-white/80 text-sm leading-relaxed">{analysis?.content_summary}</p>
        </div>

        <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">SEO Keywords We Will Target</p>
          <div className="flex flex-wrap gap-2">
            {(analysis?.suggested_keywords || []).map((kw: string) => (
              <span key={kw} className="bg-[#4ade80]/10 text-[#4ade80] text-xs px-3 py-1.5 rounded-full border border-[#4ade80]/20">{kw}</span>
            ))}
          </div>
        </div>

        <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Sample Topics We Will Generate</p>
          <div className="flex flex-col gap-4">
            {(analysis?.suggested_topics || []).map((t: any, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                {topicImages[i] ? (
                  <div className="flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden bg-[#1e2128]">
                    <img
                      src={topicImages[i]}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-24 h-16 rounded-xl bg-[#1e2128] border border-white/[0.06] flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs flex items-center justify-center">{i + 1}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#4ade80] font-bold bg-[#4ade80]/10 px-2 py-0.5 rounded-full">#{i + 1}</span>
                  </div>
                  <p className="text-white text-sm font-medium leading-snug">{t.title}</p>
                  <p className="text-white/30 text-xs mt-1">{t.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Tone Advice</p>
            <p className="text-white/70 text-sm leading-relaxed">{analysis?.tone_recommendation}</p>
          </div>
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Audience Insight</p>
            <p className="text-white/70 text-sm leading-relaxed">{analysis?.audience_insight}</p>
          </div>
        </div>

        {/* Social post ideas */}
        {analysis?.social_post_ideas && analysis.social_post_ideas.length > 0 && (
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Sample Social Posts We Will Generate</p>
            <div className="flex flex-col gap-3">
              {analysis.social_post_ideas.map((post: any, i: number) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-[#1e2128] rounded-xl border border-white/[0.05]">
                  <div className="flex-shrink-0 mt-0.5">
                    {post.platform === 'instagram' && <span className="text-sm">📸</span>}
                    {post.platform === 'linkedin' && <span className="text-sm">💼</span>}
                    {post.platform === 'twitter' && <span className="text-sm">𝕏</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-white/30 capitalize">{post.platform}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-[10px] text-white/30 capitalize">{post.format || 'post'}</span>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">{post.caption_preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Improved Company Description</p>
          <p className="text-xs text-white/20 mb-3">We improved your description for SEO. Edit freely.</p>
          <textarea
            rows={3}
            className="w-full bg-[#1e2128] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#4ade80] transition-colors resize-none"
            value={finalForm.company_description}
            onChange={e => setFinalForm(f => ({ ...f, company_description: e.target.value }))}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('images')}
            className="px-6 py-3 rounded-xl text-sm text-white/50 hover:text-white border border-white/[0.08] transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            {saving ? 'Setting up...' : 'Confirm and Start Generating Content →'}
          </button>
        </div>
      </div>
    </div>
  );
}
