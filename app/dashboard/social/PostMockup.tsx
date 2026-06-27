'use client';

type Post = {
  image_url?: string;
  caption?: string;
  headline?: string;
  subtext?: string;
  cta?: string;
  platform?: 'instagram' | 'linkedin' | 'twitter' | 'facebook' | string;
  format?: 'post' | 'story' | string;
};

type Client = {
  company_name?: string;
  brand_color?: string;
  logo_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
};

function initials(name?: string) {
  if (!name) return 'IM';
  return name.trim().slice(0, 2).toUpperCase();
}

function Avatar({ name, size = 32 }: { name?: string; size?: number }) {
  return (
    <div style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
      <span style={{ fontSize: size * 0.4 }}>{initials(name)}</span>
    </div>
  );
}

// Text overlay rendered in browser — no server font issues
function PosterImage({ post, client, imgAspect, imgMaxH }: {
  post: Post; client?: Client; imgAspect: string; imgMaxH: string;
}) {
  const accent = client?.brand_color || '#d4a017';

  if (!post.image_url) {
    return (
      <div className={`w-full ${imgAspect} ${imgMaxH} bg-white/[0.03] flex items-center justify-center text-white/20 text-xs`}>
        No image yet
      </div>
    );
  }

  const hasOverlay = post.headline || post.subtext || post.cta;

  return (
    <div className={`relative w-full ${imgAspect} ${imgMaxH} overflow-hidden bg-black`}>
      <img src={post.image_url} alt="" className="w-full h-full object-cover" />

      {hasOverlay && (
        <div className="absolute inset-0 flex flex-col justify-end p-4"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }}>

          {/* Logo top-right */}
          {client?.logo_url && (
            <img src={client.logo_url} alt="" className="absolute top-3 right-3 h-8 object-contain" />
          )}

          {/* Headline */}
          {post.headline && (
            <h2 className="text-white font-black leading-tight mb-1"
              style={{ fontSize: 'clamp(14px, 4vw, 22px)', textShadow: '0 2px 8px rgba(0,0,0,0.9)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {post.headline}
            </h2>
          )}

          {/* Accent line */}
          {post.headline && (
            <div className="w-10 h-0.5 mb-2 rounded" style={{ background: accent }} />
          )}

          {/* Subtext */}
          {post.subtext && (
            <p className="text-white/85 leading-snug mb-3"
              style={{ fontSize: 'clamp(10px, 2.5vw, 13px)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {post.subtext}
            </p>
          )}

          {/* CTA button */}
          {post.cta && (
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold self-start"
              style={{ background: accent, color: '#000', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {post.cta}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShareBar({ post, client }: { post: Post; client?: Client }) {
  const caption = encodeURIComponent(post.caption || '');
  const imageUrl = post.image_url || '';

  const shares = [
    { label: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.12)', border: 'rgba(225,48,108,0.25)', icon: '📸',
      onClick: () => { navigator.clipboard.writeText(post.caption || ''); alert('Caption copied! Now paste it in Instagram.'); window.open('https://www.instagram.com/', '_blank'); } },
    { label: 'LinkedIn', color: '#0A66C2', bg: 'rgba(10,102,194,0.12)', border: 'rgba(10,102,194,0.25)', icon: '💼',
      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`, '_blank') },
    { label: 'X', color: '#ffffff', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', icon: '𝕏',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${caption}`, '_blank') },
    { label: 'Copy', color: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.2)', icon: '📋',
      onClick: () => { navigator.clipboard.writeText(post.caption || ''); alert('Caption copied!'); } },
  ];

  return (
    <div className="px-3 py-3 border-t border-white/10">
      <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Share to</p>
      <div className="flex gap-2 flex-wrap">
        {shares.map(s => (
          <button key={s.label} onClick={s.onClick}
            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80">
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
        {imageUrl && (
          <button onClick={async () => {
            try {
              const res = await fetch(imageUrl);
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'poster.jpg'; a.click();
              URL.revokeObjectURL(url);
            } catch { window.open(imageUrl, '_blank'); }
          }}
            style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.2)' }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80">
            <span>⬇</span> Download
          </button>
        )}
      </div>
    </div>
  );
}

export function PostMockup({ post, client, variant = 'small' }: {
  post: Post; client?: Client; variant?: 'small' | 'full';
}) {
  const platform = post.platform || 'instagram';
  const name = client?.company_name || 'Your Brand';
  const isStory = post.format === 'story';
  const imgAspect = isStory ? 'aspect-[9/16]' : 'aspect-square';
  const imgMaxH = variant === 'small' ? 'max-h-64' : 'max-h-[520px]';

  const Poster = () => <PosterImage post={post} client={client} imgAspect={imgAspect} imgMaxH={imgMaxH} />;

  if (platform === 'instagram') {
    return (
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden text-white">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Avatar name={name} size={28} />
          <span className="text-sm font-semibold flex-1 truncate">{name.toLowerCase().replace(/\s+/g, '')}</span>
          <span className="text-white/60 text-lg leading-none">•••</span>
        </div>
        <Poster />
        <div className="flex items-center gap-4 px-3 py-2 text-xl">
          <span>♡</span><span>💬</span><span>➤</span><span className="ml-auto">⚹</span>
        </div>
        {variant === 'full' && (
          <div className="px-3 pb-2 text-sm">
            <span className="font-semibold">{name.toLowerCase().replace(/\s+/g, '')}</span>{' '}
            <span className="text-white/80">{post.caption}</span>
          </div>
        )}
        <ShareBar post={post} client={client} />
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="bg-[#1b1f23] border border-white/10 rounded-xl overflow-hidden text-white">
        <div className="flex items-start gap-2 px-3 py-2.5">
          <Avatar name={name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className="text-xs text-white/50">Company • 1,204 followers</p>
            <p className="text-xs text-white/40">2h · 🌐</p>
          </div>
          <span className="text-white/60 text-lg leading-none">•••</span>
        </div>
        {variant === 'full' && <p className="px-3 pb-2 text-sm text-white/85 whitespace-pre-wrap">{post.caption}</p>}
        <Poster />
        <div className="flex items-center justify-between px-3 py-2 text-xs text-white/50 border-t border-white/10">
          <span>👍 Like</span><span>💬 Comment</span><span>↻ Repost</span><span>➤ Send</span>
        </div>
        <ShareBar post={post} client={client} />
      </div>
    );
  }

  if (platform === 'twitter') {
    return (
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden text-white">
        <div className="flex items-start gap-2 px-3 py-2.5">
          <Avatar name={name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {name} <span className="text-white/40 font-normal">@{name.toLowerCase().replace(/\s+/g, '')} · 2h</span>
            </p>
            {variant === 'full' && <p className="text-sm text-white/85 mt-1 whitespace-pre-wrap">{post.caption}</p>}
          </div>
        </div>
        <div className="px-3"><Poster /></div>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-white/50">
          <span>💬 24</span><span>↻ 12</span><span>♡ 318</span><span>📊 4.2K</span><span>➤</span>
        </div>
        <ShareBar post={post} client={client} />
      </div>
    );
  }

  return (
    <div className="bg-[#1c1e21] border border-white/10 rounded-xl overflow-hidden text-white">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Avatar name={name} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{name}</p>
          <p className="text-xs text-white/40">2h · 🌐</p>
        </div>
        <span className="text-white/60 text-lg leading-none">•••</span>
      </div>
      {variant === 'full' && <p className="px-3 pb-2 text-sm text-white/85 whitespace-pre-wrap">{post.caption}</p>}
      <Poster />
      <div className="flex items-center justify-between px-3 py-2 text-xs text-white/60 border-t border-white/10">
        <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
      </div>
      <ShareBar post={post} client={client} />
    </div>
  );
}
