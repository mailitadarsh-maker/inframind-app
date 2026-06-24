'use client';

type Post = {
  image_url?: string;
  caption?: string;
  platform?: 'instagram' | 'linkedin' | 'twitter' | 'facebook' | string;
  format?: 'post' | 'story' | string;
};

type Client = {
  company_name?: string;
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
        {variant === 'full' && (
          <>
            <div className="flex items-center gap-4 px-3 py-2.5 text-xl">
              <span>♡</span>
              <span>💬</span>
              <span>➤</span>
              <span className="ml-auto">⚹</span>
            </div>
            <div className="px-3 pb-3 text-sm">
              <span className="font-semibold">{name.toLowerCase().replace(/\s+/g, '')}</span>{' '}
              <span className="text-white/80">{post.caption}</span>
            </div>
          </>
        )}
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
            <p className="text-xs text-white/50 truncate">Company • 1,204 followers</p>
            <p className="text-xs text-white/40">2h · 🌐</p>
          </div>
          <span className="text-white/60 text-lg leading-none">•••</span>
        </div>
        {variant === 'full' && (
          <p className="px-3 pb-2 text-sm text-white/85 whitespace-pre-wrap">{post.caption}</p>
        )}
        <Image />
        {variant === 'full' && (
          <div className="flex items-center justify-between px-3 py-2.5 text-xs text-white/60 border-t border-white/10 mt-1">
            <span>👍 Like</span>
            <span>💬 Comment</span>
            <span>↻ Repost</span>
            <span>➤ Send</span>
          </div>
        )}
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
        <div className="px-3">
          <Image />
        </div>
        {variant === 'full' && (
          <div className="flex items-center justify-between px-4 py-2.5 text-xs text-white/50">
            <span>💬 24</span>
            <span>↻ 12</span>
            <span>♡ 318</span>
            <span>📊 4.2K</span>
            <span>➤</span>
          </div>
        )}
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
      {variant === 'full' && (
        <div className="flex items-center justify-between px-3 py-2.5 text-xs text-white/60 border-t border-white/10 mt-1">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>↗ Share</span>
        </div>
      )}
    </div>
  );
}
