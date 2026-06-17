'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const industries = ['Technology', 'Healthcare', 'Finance', 'Fintech', 'Retail', 'Education', 'Real Estate', 'Other'];
const tones = ['Professional', 'Friendly', 'Casual', 'Expert'];

type Step = 'form' | 'analyzing' | 'overview';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const [form, setForm] = useState({
    company_name: '',
    website: '',
    industry: 'Technology',
    target_audience: '',
    tone: 'Professional',
    company_description: '',
  });

  const [finalForm, setFinalForm] = useState({ ...form });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else { setUser(session.user); setChecking(false); }
    });
  }, []);

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
      setStep('overview');
    } catch (e: any) {
      setError(e.message);
      setStep('form');
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

  if (step === 'form') return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-xs text-[#4ade80] uppercase tracking-widest mb-2">Step 1 of 2</p>
          <h1 className="text-2xl font-bold text-white">Tell us about your company</h1>
          <p className="text-sm text-white/40 mt-1">We will analyze your details and show you a content strategy before generating anything.</p>
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

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={!form.company_name || !form.website}
            className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            Analyze and Show Strategy
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'analyzing') return (
    <div className="min-h-screen bg-[#1e2128] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-[#4ade80] border-t-transparent animate-spin" />
      <p className="text-white font-medium">Analyzing your company...</p>
      <p className="text-white/30 text-sm">Building your content strategy</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs text-[#4ade80] uppercase tracking-widest mb-2">Step 2 of 2</p>
          <h1 className="text-2xl font-bold text-white">Here is your content strategy</h1>
          <p className="text-sm text-white/40 mt-1">Review everything. Edit what you want. Then confirm to start generating blogs.</p>
        </div>

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
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Sample Topics We Will Generate</p>
          <div className="flex flex-col gap-3">
            {(analysis?.suggested_topics || []).map((t: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-white text-sm font-medium">{t.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">{t.why}</p>
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

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            className="px-6 py-3 rounded-xl text-sm text-white/50 hover:text-white border border-white/[0.08] transition-colors"
          >
            Edit Details
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold rounded-xl py-3 text-sm transition-colors"
          >
            {saving ? 'Setting up...' : 'Confirm and Start Generating Blogs'}
          </button>
        </div>
      </div>
    </div>
  );
}
