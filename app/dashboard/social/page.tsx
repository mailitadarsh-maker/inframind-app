'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PostMockup } from './PostMockup';

export default function SocialDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'twitter'>('instagram');
  const [format, setFormat] = useState<'post' | 'story'>('post');
  const [suggestion, setSuggestion] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('global');
  const [savingRegion, setSavingRegion] = useState(false);
  const [viewPost, setViewPost] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: c } = await supabase.from('clients').select('*').eq('user_id', session.user.id).single();
      if (!c) { router.push('/dashboard/onboarding'); return; }
      setClient(c);
      setRegion(c.region || 'global');
      const { data: posts } = await supabase.from('social_posts').select('*').eq('client_id', c.id).order('created_at', { ascending: false });
      setSocialPosts(posts || []);
      setLoading(false);
    })();
  }, []);

  async function generatePost() {
    if (!client) return;
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/client/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id, platform, format, suggestion }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Post generated!');
        setSuggestion('');
        const { data: fresh } = await supabase.from('social_posts').select('*').eq('client_id', client.id).order('created_at', { ascending: false });
        setSocialPosts(fresh || []);
      } else {
        setMessage(data.error || 'Failed to generate post.');
      }
    } catch { setMessage('Something went wrong.'); }
    setGenerating(false);
  }

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
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Your Suggestion <span className="normal-case text-white/20">(optional)</span></p>
            <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)}
              placeholder="e.g. 'Highlight our new feature' or 'Something motivational about our brand'"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#4ade80]/40"
              rows={2} />
          </div>

          {message && (
            <div className={`mb-4 text-xs px-4 py-3 rounded-xl border ${message.includes('generated') ? 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>{message}</div>
          )}

          <button disabled={generating} onClick={generatePost}
            className="w-full bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm transition-colors">
            {generating ? '✦ Generating... (30-40s)' : '+ Generate Post'}
          </button>
        </div>

        {/* Posts Grid */}
        {socialPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPosts.map(post => (
              <div key={post.id} className="bg-[#1a1d23] border border-white/[0.06] rounded-2xl overflow-hidden">
                <PostMockup post={post} client={client} variant="small" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-white/40 capitalize">{post.platform === 'twitter' ? '𝕏 Twitter' : post.platform === 'instagram' ? '📸 Instagram' : '💼 LinkedIn'}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/30 capitalize">{post.format}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${post.status === 'published' ? 'bg-[#4ade80]/10 text-[#4ade80]' : post.status === 'approved' ? 'bg-blue-400/10 text-blue-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-3 line-clamp-3">{post.caption}</p>
                  <div className="flex gap-2 flex-wrap">
                    {post.status === 'pending' && (
                      <button onClick={async () => {
                        await supabase.from('social_posts').update({ status: 'approved' }).eq('id', post.id);
                        setSocialPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'approved' } : p));
                      }} className="text-xs bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/20 px-3 py-1.5 rounded-lg transition-colors">
                        ✓ Approve
                      </button>
                    )}
                    {post.status === 'approved' && (
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
              </div>
            ))}
          </div>
        )}

        {viewPost && (
          <div
            onClick={() => setViewPost(null)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <div onClick={e => e.stopPropagation()} className="max-w-sm w-full">
              <PostMockup post={viewPost} client={client} variant="full" />
              <button
                onClick={() => setViewPost(null)}
                className="mt-3 w-full text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 py-2 rounded-lg"
              >
                Close
              </button>
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
          <button
            disabled={savingRegion}
            onClick={async () => {
              if (!client) return;
              setSavingRegion(true);
              await supabase.from('clients').update({ region }).eq('id', client.id);
              setClient((c: any) => ({ ...c, region }));
              setSavingRegion(false);
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40">
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
