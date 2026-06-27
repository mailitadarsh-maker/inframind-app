'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PostMockup } from './PostMockup';

const typeColor: Record<string, string> = {
  educational: '#60a5fa',
  promotional: '#4ade80',
  story: '#f59e0b',
  trend: '#a78bfa',
  engagement: '#f87171',
};

export default function SocialDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'twitter'>('instagram');
  const [format, setFormat] = useState<'post' | 'story'>('post');
  const [suggestion, setSuggestion] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('global');
  const [savingRegion, setSavingRegion] = useState(false);
  const [viewPost, setViewPost] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [weekTheme, setWeekTheme] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: c } = await supabase.from('clients').select('*').eq('user_id', session.user.id).single();
      if (!c) { router.push('/dashboard/social/onboarding'); return; }
      // if (!c.social_onboarded) { router.push('/dashboard/social/onboarding'); return; }
      setClient(c);
      setRegion(c.region || 'global');
      const { data: posts } = await supabase.from('social_posts').select('*').eq('client_id', c.id).order('created_at', { ascending: false });
      setSocialPosts(posts || []);

      // Load saved topics or fetch new ones if >7 days old
      fetchTopics(c.id);
      setLoading(false);
    })();
  }, []);

  async function fetchTopics(clientId: string) {
    setLoadingTopics(true);
    try {
      const res = await fetch('/api/client/topic-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      });
      const data = await res.json();
      if (data.topics) { setTopics(data.topics); setWeekTheme(data.week_theme || ''); }
    } catch(e) { console.error('Topics error:', e); }
    setLoadingTopics(false);
  }

  async function generatePost() {
    if (!client) return;
    setGenerating(true);
    setProgress(0);
    setProgressLabel('Writing content...');
    setMessage('');
    const stages = [
      { pct: 15, label: 'Writing content...', delay: 800 },
      { pct: 35, label: 'Crafting headline & caption...', delay: 2000 },
      { pct: 55, label: 'Generating AI image...', delay: 4000 },
      { pct: 75, label: 'Adding text overlay...', delay: 7000 },
      { pct: 90, label: 'Uploading poster...', delay: 10000 },
    ];
    stages.forEach(({ pct, label, delay }) => {
      setTimeout(() => { setProgress(pct); setProgressLabel(label); }, delay);
    });
    try {
      const res = await fetch('/api/client/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id, platform, format, suggestion }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress(100);
        setProgressLabel('Done!');
        setMessage('Post generated!');
        setSuggestion('');
        setSelectedTopic(null);
        const { data: fresh } = await supabase.from('social_posts').select('*').eq('client_id', client.id).order('created_at', { ascending: false });
        setSocialPosts(fresh || []);
      } else {
        setMessage(data.error || 'Failed to generate post.');
      }
    } catch { setMessage('Something went wrong.'); }
    setGenerating(false);
    setTimeout(() => { setProgress(0); setProgressLabel(''); }, 1500);
  }

  const primary = client?.brand_primary_color || '#4ade80';
  const secondary = client?.brand_secondary_color || '#a78bfa';
  const accent = client?.brand_accent_color || '#60a5fa';

  const colorPalettes = [
    { name: 'Brand', colors: [primary, secondary, accent], desc: 'Your brand colors' },
    { name: 'Bold', colors: [primary, '#ffffff', '#000000'], desc: 'High contrast' },
    { name: 'Soft', colors: [primary + '99', secondary + '66', '#ffffff'], desc: 'Pastel feel' },
  ];
  const [selectedPalette, setSelectedPalette] = useState(0);

  if (loading) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-4xl mx-auto">

        <button onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          ← Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Social Media AI</p>
            <h1 className="text-2xl font-bold text-white">{client?.company_name}</h1>
            <p className="text-sm text-white/40 mt-1">{socialPosts.length} posts generated</p>
          </div>
        </div>

        {/* Weekly Topic Suggestions */}
        <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-white">✦ This Week's Topic Ideas</h2>
            <button onClick={() => fetchTopics(client.id)} disabled={loadingTopics}
              className="text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-30">
              {loadingTopics ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
          {weekTheme && <p className="text-xs text-white/30 mb-4 italic">{weekTheme}</p>}

          {loadingTopics ? (
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 flex-1 min-w-[140px] rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {topics.length === 0 && <p className="text-xs text-white/30 py-4 text-center">Loading topic ideas...</p>}
              {topics.map((t, i) => (
                <button key={i} onClick={() => {
                  setSelectedTopic(i);
                  setSuggestion(t.title + ': ' + t.description);
                }}
                  className={`text-left p-3 rounded-xl border transition-all ${selectedTopic === i ? 'border-[#4ade80]/40 bg-[#4ade80]/5' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/5'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: typeColor[t.type] + '20', color: typeColor[t.type] }}>
                      {t.type}
                    </span>
                    {selectedTopic === i && <span className="text-[10px] text-[#4ade80]">✓ Selected</span>}
                  </div>
                  <p className="text-xs font-semibold text-white">{t.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand Color Palettes */}
        <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">🎨 Brand Color Palettes</h2>
          <div className="flex gap-3">
            {colorPalettes.map((palette, i) => (
              <button key={i} onClick={() => setSelectedPalette(i)}
                className={`flex-1 text-left p-3 rounded-xl border transition-all ${selectedPalette === i ? 'border-[#4ade80]/50 bg-[#4ade80]/5' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'}`}>
                <div className="flex gap-1.5 mb-2">
                  {palette.colors.map((col, j) => (
                    <div key={j} className="w-8 h-8 rounded-lg border border-white/10" style={{ background: col }} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-white">{palette.name}</p>
                <p className="text-[10px] text-white/30">{palette.desc}</p>
                {selectedPalette === i && <p className="text-[10px] text-[#4ade80] mt-1 font-semibold">✓ Active</p>}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/20 mt-3">These colors are used automatically in your generated posters based on your brand settings.</p>
        </div>

        {/* Create Post */}
        <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-5">✦ Generate Social Post</h2>

          <div className="mb-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Platform</p>
            <div className="flex gap-2">
              {(['instagram', 'linkedin', 'twitter'] as const).map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${platform === p ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}>
                  {p === 'instagram' ? '📸 Instagram' : p === 'linkedin' ? '💼 LinkedIn' : '𝕏 Twitter'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Format</p>
            <div className="flex gap-2">
              {(['post', 'story'] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${format === f ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}>
                  {f === 'post' ? '⬛ Post / Poster' : '📱 Story'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 uppercase tracking-widest">Topic / Suggestion</p>
              {selectedTopic !== null && (
                <button onClick={() => { setSelectedTopic(null); setSuggestion(''); }}
                  className="text-[10px] text-white/30 hover:text-white/60">✕ Clear</button>
              )}
            </div>
            <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)}
              placeholder="Pick a topic above or write your own idea..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#4ade80]/40"
              rows={2} />
          </div>

          {message && (
            <div className={`mb-4 text-xs px-4 py-3 rounded-xl border ${message.includes('generated') ? 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>{message}</div>
          )}

          <button disabled={generating} onClick={generatePost}
            className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm transition-colors">
            {generating ? '✦ Generating...' : '+ Generate Post'}
          </button>

          {generating && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">{progressLabel}</span>
                <span className="text-xs text-[#4ade80] font-mono">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#4ade80] rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Posts list */}
        {socialPosts.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">
            {socialPosts.map(post => (
              <div key={post.id} className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  {post.image_url && (
                    <img src={post.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-white/40 capitalize">{post.platform}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-xs text-white/40 capitalize">{post.format}</span>
                      <span className="text-white/20">·</span>
                      <span className={`text-xs font-semibold ${post.status === 'published' ? 'text-[#4ade80]' : 'text-white/30'}`}>{post.status}</span>
                    </div>
                    {post.headline && <p className="text-sm font-semibold text-white mb-1 truncate">{post.headline}</p>}
                    <p className="text-xs text-white/40 line-clamp-2">{post.caption}</p>
                    <p className="text-[10px] text-white/20 mt-1">{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {post.status !== 'published' && (
                    <button onClick={async () => {
                      await supabase.from('social_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', post.id);
                      setSocialPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p));
                    }} className="text-xs bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 border border-blue-400/20 px-3 py-1.5 rounded-lg transition-colors">
                      ↑ Publish
                    </button>
                  )}
                  <button onClick={() => setViewPost(post)}
                    className="text-xs text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
                    View
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(post.caption)}
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
            ))}
          </div>
        )}

        {viewPost && (
          <div onClick={() => setViewPost(null)} className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center">
            <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-sm bg-[#13151a] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {viewPost.platform === 'instagram' ? '📸 Instagram' : viewPost.platform === 'linkedin' ? '💼 LinkedIn' : '𝕏 Twitter'}
                  </span>
                  <span className="text-xs text-white/40 capitalize">{viewPost.format}</span>
                </div>
                <button onClick={() => setViewPost(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-lg transition-colors">✕</button>
              </div>
              <div className="flex gap-2 px-4 py-2 border-b border-white/[0.06]">
                {(['instagram','linkedin','twitter'] as const).map(p => (
                  <button key={p} onClick={() => setViewPost({ ...viewPost, platform: p })}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${viewPost.platform === p ? 'bg-white/15 border-white/30 text-white font-semibold' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
                    {p === 'instagram' ? '📸' : p === 'linkedin' ? '💼' : '𝕏'}{' '}{p === 'twitter' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <div className="p-4">
                <PostMockup post={viewPost} client={client} variant="full" />
              </div>
            </div>
          </div>
        )}

        {/* Region Settings */}
        <div className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">⚙ Special Day Settings</h2>
          <p className="text-xs text-white/40 mb-3">We auto-generate special day posters 3 days before holidays. Choose which region's holidays to include.</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { id: 'global', label: '🌍 Global' },
              { id: 'india', label: '🇮🇳 India' },
              { id: 'middle_east', label: '🇦🇪 Middle East' },
              { id: 'us', label: '🇺🇸 United States' },
              { id: 'europe', label: '🇪🇺 Europe' },
            ].map(r => (
              <button key={r.id} onClick={() => setRegion(r.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${region === r.id ? 'bg-[#4ade80] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}>
                {r.label}
              </button>
            ))}
          </div>
          {/* Brand Style Upgrade for existing clients */}
          {!client?.brand_flux_suffix && (
            <div className="mb-4 p-4 rounded-xl bg-[#a78bfa]/5 border border-[#a78bfa]/20">
              <p className="text-xs text-[#a78bfa] font-semibold mb-1">✨ Upgrade your image quality</p>
              <p className="text-xs text-white/40 mb-3">Add brand style analysis to get better-matched AI images.</p>
              <button onClick={() => router.push('/dashboard/social/onboarding')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#a78bfa] transition-colors">
                Update Brand Style →
              </button>
            </div>
          )}
          <button disabled={savingRegion} onClick={async () => {
            if (!client) return;
            setSavingRegion(true);
            await supabase.from('clients').update({ region }).eq('id', client.id);
            setClient((c: any) => ({ ...c, region }));
            setSavingRegion(false);
          }} className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40">
            {savingRegion ? 'Saving...' : 'Save Region'}
          </button>
        </div>

        {socialPosts.length === 0 && !generating && (
          <div className="text-center py-16 text-white/20 text-sm">No posts yet. Generate your first one above.</div>
        )}
      </div>
    </div>
  );
}
