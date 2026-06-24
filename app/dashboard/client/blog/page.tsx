'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function BlogReviewContent() {
  const router = useRouter();
  const params = useSearchParams();
  const blogId = params.get('id');

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!blogId) return;
    supabase
      .from('client_blogs')
      .select('*')
      .eq('id', blogId)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setBlog(data);
        setLoading(false);
      });
  }, [blogId]);

  async function handleAction(action: 'approve' | 'reject') {
    setActing(action);
    setError('');
    try {
      const res = await fetch('/api/client/approve-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog_id: blogId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/dashboard/client');
    } catch (e: any) {
      setError(e.message);
      setActing(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="text-white/40 text-sm">Loading blog...</div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="text-red-400 text-sm">Blog not found.</div>
    </div>
  );

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    published: 'text-green-400 bg-green-400/10 border-green-400/20',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
    draft: 'text-white/40 bg-white/5 border-white/10',
  };

  return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => router.push('/dashboard/client')}
              className="text-xs text-white/30 hover:text-white/60 mb-3 flex items-center gap-1 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">{blog.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusColor[blog.status] || statusColor.draft}`}>
                {blog.status}
              </span>
              <span className="text-xs text-white/30">
                {new Date(blog.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {blog.status === 'pending' && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleAction('reject')}
                disabled={!!acting}
                className="px-5 py-2.5 rounded-xl text-sm border border-red-400/20 text-red-400 hover:bg-red-400/10 disabled:opacity-40 transition-colors"
              >
                {acting === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={!!acting}
                className="px-5 py-2.5 rounded-xl text-sm bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold disabled:opacity-40 transition-colors"
              >
                {acting === 'approve' ? 'Approving...' : 'Approve & Publish'}
              </button>
            </div>
          )}

          {blog.status === 'published' && (
            <span className="text-xs text-green-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Published
            </span>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Blog preview */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Preview bar */}
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-gray-400 font-mono">{blog.title} — Preview</span>
          </div>
          {/* Rendered blog */}
          <div className="px-12 py-10 max-w-2xl mx-auto">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">
              {new Date(blog.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {blog.cover_image && (
              <img src={blog.cover_image} alt={blog.title} className="w-full h-56 object-cover rounded-xl mb-6" />
            )}
            <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">{blog.title}</h1>
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/<h2[^>]*>.*?<\/h2>/i, '') }}
            />
          </div>
        </div>

        {/* Bottom action bar for pending blogs */}
        {blog.status === 'pending' && (
          <div className="mt-6 bg-[#26292f] border border-yellow-400/10 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Ready to publish?</p>
              <p className="text-xs text-white/30 mt-0.5">Approving will mark this blog as published and make it available for delivery.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleAction('reject')}
                disabled={!!acting}
                className="px-5 py-2.5 rounded-xl text-sm border border-red-400/20 text-red-400 hover:bg-red-400/10 disabled:opacity-40 transition-colors"
              >
                {acting === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={!!acting}
                className="px-5 py-2.5 rounded-xl text-sm bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold disabled:opacity-40 transition-colors"
              >
                {acting === 'approve' ? 'Approving...' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BlogReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    }>
      <BlogReviewContent />
    </Suspense>
  );
}