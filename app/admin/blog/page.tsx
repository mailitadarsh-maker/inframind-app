'use client';

import { useState, useEffect } from 'react';

type Post = {
  slug: string;
  title: string;
  description: string;
  content: string;
  published: boolean;
  created_at: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch('/api/admin/blog');
    const result = await res.json();
    if (result.error) {
      setError('Failed to load posts.');
    } else {
      setPosts(result.data || []);
    }
    setLoading(false);
  }

  async function togglePublish(slug: string, published: boolean) {
    setActionLoading(slug);
    await fetch('/api/admin/blog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, published: !published }),
    });
    await fetchPosts();
    setActionLoading(null);
  }

  async function deletePost(slug: string) {
    if (!confirm(`Delete post "${slug}"? This cannot be undone.`)) return;
    setActionLoading(slug);
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    await fetchPosts();
    setActionLoading(null);
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#09090f', color: '#e2e6f0', minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>Blog Posts</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {!loading && posts.length === 0 && <p>No posts yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => (
          <div
            key={post.slug}
            style={{
              background: '#0d0f16',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: post.published ? 'rgba(52,211,153,0.15)' : 'rgba(250,204,21,0.15)',
                      color: post.published ? '#34d399' : '#facc15',
                    }}
                  >
                    {post.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#8a95a3' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{post.title}</h2>
                <p style={{ fontSize: '13px', color: '#8a95a3', marginBottom: '6px' }}>{post.description}</p>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#34d399' }}
                >
                  /blog/{post.slug} ↗
                </a>
                <button
                  onClick={() => setExpanded(expanded === post.slug ? null : post.slug)}
                  style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: '#8a95a3', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {expanded === post.slug ? 'Hide content ▲' : 'Preview content ▼'}
                </button>
                {expanded === post.slug && (
                  <div
                    style={{ marginTop: '10px', padding: '12px', background: '#06070b', borderRadius: '8px', fontSize: '13px', color: '#c5cad4', maxHeight: '300px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
                <button
                  onClick={() => setExpanded(expanded === post.slug ? null : post.slug)}
                  style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: '#8a95a3', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {expanded === post.slug ? 'Hide content ▲' : 'Preview content ▼'}
                </button>
                {expanded === post.slug && (
                  <div
                    style={{ marginTop: '10px', padding: '12px', background: '#06070b', borderRadius: '8px', fontSize: '13px', color: '#c5cad4', maxHeight: '300px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
                <button
                  onClick={() => setExpanded(expanded === post.slug ? null : post.slug)}
                  style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: '#8a95a3', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {expanded === post.slug ? 'Hide content ▲' : 'Preview content ▼'}
                </button>
                {expanded === post.slug && (
                  <div
                    style={{ marginTop: '10px', padding: '12px', background: '#06070b', borderRadius: '8px', fontSize: '13px', color: '#c5cad4', maxHeight: '300px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px' }}>
                <button
                  onClick={() => togglePublish(post.slug, post.published)}
                  disabled={actionLoading === post.slug}
                  style={{
                    background: post.published ? '#1f2128' : '#34d399',
                    color: post.published ? '#e2e6f0' : '#06140f',
                    border: post.published ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => deletePost(post.slug)}
                  disabled={actionLoading === post.slug}
                  style={{
                    background: 'transparent',
                    color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
