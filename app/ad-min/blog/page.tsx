'use client';

import { useState, useEffect } from 'react';

type Post = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image?: string | null;
  content: string;
  published: boolean;
  created_at: string;
};

function htmlToPlainText(html: string): string {
  let text = html
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [genTopic, setGenTopic] = useState('');
  const [genDetails, setGenDetails] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageUpdateMsg, setImageUpdateMsg] = useState<string | null>(null);

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

  async function regenerateImage(slug: string, title: string, blogId: string) {
    setActionLoading(slug + '-regen');
    const res = await fetch('/api/admin/regenerate-blog-post-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blog_id: blogId }),
    });
    const result = await res.json();
    await fetchPosts();
    setActionLoading(null);
    setImageUpdateMsg(result.cover_image ? 'Image regenerated!' : 'Could not find image');
    setTimeout(() => setImageUpdateMsg(null), 3000);
  }

  async function updateImage(slug: string, url: string | null) {
    setActionLoading(slug + '-img');
    await fetch('/api/admin/blog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, cover_image: url }),
    });
    await fetchPosts();
    setEditingImage(null);
    setImageUrl('');
    setActionLoading(null);
    setImageUpdateMsg(url ? 'Image updated!' : 'Image removed!');
    setTimeout(() => setImageUpdateMsg(null), 3000);
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

  async function copyForLinkedIn(post: Post) {
    const plain = `${post.title}\n\n${htmlToPlainText(post.content)}`;
    await navigator.clipboard.writeText(plain);
    setCopied(post.slug);
    setTimeout(() => setCopied(null), 2000);
  }

  async function generatePost() {
    setGenerating(true);
    setGenMessage(null);
    try {
      const res = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: genTopic, details: genDetails }),
      });
      const result = await res.json();
      if (result.error) {
        setGenMessage(`Error: ${result.error}`);
      } else {
        setGenMessage(`Created draft: ${result.title}`);
        setGenTopic('');
        setGenDetails('');
        await fetchPosts();
      }
    } catch (err) {
      setGenMessage('Something went wrong.');
    }
    setGenerating(false);
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#09090f', color: '#e2e6f0', minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>Blog Posts</h1>

      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Generate New Post</h2>
        <input
          type="text"
          placeholder="Topic (leave blank for auto-pick)"
          value={genTopic}
          onChange={(e) => setGenTopic(e.target.value)}
          style={{ width: '100%', background: '#06070b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#e2e6f0', marginBottom: '8px' }}
        />
        <textarea
          placeholder="Optional details/instructions for the AI..."
          value={genDetails}
          onChange={(e) => setGenDetails(e.target.value)}
          rows={3}
          style={{ width: '100%', background: '#06070b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#e2e6f0', marginBottom: '10px', resize: 'vertical' }}
        />
        <button
          onClick={generatePost}
          disabled={generating}
          style={{ background: '#34d399', color: '#06140f', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          {generating ? 'Generating...' : 'Generate Post'}
        </button>
        {genMessage && (
          <p style={{ marginTop: '10px', fontSize: '13px', color: genMessage.startsWith('Error') ? '#f87171' : '#34d399' }}>
            {genMessage}
          </p>
        )}
      </div>

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
                {/* Image preview and controls */}
                {post.cover_image && editingImage !== post.slug && (
                  <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', height: '140px', position: 'relative' }}>
                    <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button onClick={() => regenerateImage(post.slug, post.title, post.id)}
                        disabled={actionLoading === post.slug + '-regen'}
                        style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                        {actionLoading === post.slug + '-regen' ? '...' : '🔄 Regenerate'}
                      </button>
                      <button onClick={() => updateImage(post.slug, null)}
                        style={{ background: 'rgba(220,38,38,0.8)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                )}
                {!post.cover_image && editingImage !== post.slug && (
                  <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No image</span>
                    <button onClick={() => regenerateImage(post.slug, post.title, post.id)}
                      disabled={actionLoading === post.slug + '-regen'}
                      style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                      {actionLoading === post.slug + '-regen' ? 'Finding...' : '🔄 Generate Image'}
                    </button>
                  </div>
                )}
                {editingImage === post.slug && (
                  <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Paste image URL (Pexels, Unsplash, etc.)</p>
                    <input
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://images.pexels.com/..."
                      style={{ width: '100%', background: '#0d0f16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 12, marginBottom: 8, boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => updateImage(post.slug, imageUrl || null)}
                        style={{ background: '#34d399', border: 'none', color: '#000', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Save
                      </button>
                      <button onClick={() => { setEditingImage(null); setImageUrl(''); }}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{post.title}</h2>
                <p style={{ fontSize: '13px', color: '#8a95a3', marginBottom: '6px' }}>{post.description}</p>
                
                  <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#34d399' }}
                >
                  {`/blog/${post.slug} ↗`}
                </a>

                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  <button
                    onClick={() => setExpanded(expanded === post.slug ? null : post.slug)}
                    style={{ fontSize: '12px', color: '#8a95a3', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {expanded === post.slug ? 'Hide content ▲' : 'Preview content ▼'}
                  </button>

                  <button
                    onClick={() => copyForLinkedIn(post)}
                    style={{ fontSize: '12px', color: '#34d399', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {copied === post.slug ? 'Copied ✓' : 'Copy for LinkedIn'}
                  </button>
                </div>

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
