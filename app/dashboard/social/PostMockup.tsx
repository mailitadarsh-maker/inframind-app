'use client';

type Post = {
  image_url?: string;
  caption?: string;
  platform?: 'instagram' | 'linkedin' | 'twitter' | 'facebook' | string;
  format?: 'post' | 'story' | string;
};

type Client = {
  company_name?: string;
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
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      <span style={{ fontSize: size * 0.4 }}>{initials(name)}</span>
    </div>
  );
}

function ShareBar({ post, client }: { post: Post; client?: Client }) {
  const caption = encodeURIComponent(post.caption || '');
  const imageUrl = post.image_url || '';

  const shares = [
    {
      label: 'Instagram',
      color: '#E1306C',
      bg: 'rgba(225,48,108,0.12)',
      border: 'rgba(225,48,108,0.25)',
      icon: '📸',
      onClick: () => {
        navigator.clipboard.writeText(post.caption || '');
        alert('Caption copied! Now paste it in Instagram after opening the app.');
        window.open('https://www.instagram.com/', '_blank');
      },
    },
    {
      label: 'LinkedIn',
      color: '#0A66C2',
      bg: 'rgba(10,102,194,0.12)',
      border: 'rgba(10,102,194,0.25)',
      icon: '💼',
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`, '_blank');
      },
    },
    {
      label: 'X',
      color: '#ffffff',
      bg: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.15)',
      icon: '𝕏',
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${caption}`, '_blank');
      },
    },
    {
      label: 'Copy',
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.10)',
      border: 'rgba(74,222,128,0.2)',
      icon: '📋',
      onClick: () => {
        navigator.clipboard.writeText(post.caption || '');
        alert('Caption copied to clipboard!');
      },
    },
  ];

  return (
    <div className="px-3 py-3 border-t border-white/10">
      <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Share to</p>
      <div className="flex gap-2 flex-wrap">
        {shares.map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
        {imageUrl && (
          <button
            onClick={async () => {
              try {
                const res = await fetch(imageUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'poster.jpg';
                a.click();
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

export function PostMockup({
  post,
  client,
  variant = 'small',
}: {
  post: Post;
  client?: Client;
  variant?: 'small' | 'full';
}) {
  const platform = post.platform || 'instagram';
  const name = client?.company_name || 'Your Brand';
  const isStory = post.format === 'story';
  const imgAspect = isStory ? 'aspect-[9/16]' : 'aspect-square';
  const imgMaxH = variant === 'small' ? 'max-h-64' : 'max-h-[520px]';

  const Image = () =>
    post.image_url ? (
      <div className={`w-full bg-white/5 ${imgAspect} ${imgMaxH} overflow-hidden`}>
        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className={`w-full ${imgAspect} ${imgMaxH} bg-white/[0.03] flex items-center justify-center text-white/20 text-xs`}>
        No image yet
      </div>
    );

  // ---------- INSTAGRAM ----------
  if (platform === 'instagram') {
    return (
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden text-white">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Avatar name={name} size={28} />
          <span className="text-sm font-semibold flex-1 truncate">
            {name.toLowerCase().replace(/\s+/g, '')}
          </span>
          <span className="text-white/60 text-lg leading-none">•••</span>
        </div>
        <Image />
        <div className="flex items-center gap-4 px-3 py-2 text-xl">
          <span>♡</span><span>💬</span><span>➤</span>
          <span className="ml-auto">⚹</span>
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

  // ---------- LINKEDIN ----------
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
        {variant === 'full' && (
          <p className="px-3 pb-2 text-sm text-white/85 whitespace-pre-wrap">{post.caption}</p>
        )}
        <Image />
        <div className="flex items-center justify-between px-3 py-2 text-xs text-white/50 border-t border-white/10">
          <span>👍 Like</span><span>💬 Comment</span><span>↻ Repost</span><span>➤ Send</span>
        </div>
        <ShareBar post={post} client={client} />
      </div>
    );
  }

  // ---------- TWITTER / X ----------
  if (platform === 'twitter') {
    return (
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden text-white">
        <div className="flex items-start gap-2 px-3 py-2.5">
          <Avatar name={name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {name} <span className="text-white/40 font-normal">@{name.toLowerCase().replace(/\s+/g, '')} · 2h</span>
            </p>
            {variant === 'full' && (
              <p className="text-sm text-white/85 mt-1 whitespace-pre-wrap">{post.caption}</p>
            )}
          </div>
        </div>
        <div className="px-3"><Image /></div>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-white/50">
          <span>💬 24</span><span>↻ 12</span><span>♡ 318</span><span>📊 4.2K</span><span>➤</span>
        </div>
        <ShareBar post={post} client={client} />
      </div>
    );
  }

  // ---------- FACEBOOK ----------
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
      {variant === 'full' && (
        <p className="px-3 pb-2 text-sm text-white/85 whitespace-pre-wrap">{post.caption}</p>
      )}
      <Image />
      <div className="flex items-center justify-between px-3 py-2 text-xs text-white/60 border-t border-white/10">
        <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
      </div>
      <ShareBar post={post} client={client} />
    </div>
  );
}
