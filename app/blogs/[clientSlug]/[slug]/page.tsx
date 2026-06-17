import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BlogPostPage({ params }: { params: Promise<{ clientSlug: string; slug: string }> }) {
  const { clientSlug, slug } = await params;

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, website, industry');

  const client = (clients || []).find(c => {
    const domain = c.website.replace('https://', '').replace('http://', '').replace(/\/+$/, '').toLowerCase();
    const nameSlug = c.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return domain === clientSlug || nameSlug === clientSlug;
  });

  if (!client) notFound();

  const { data: blog } = await supabase
    .from('client_blogs')
    .select('*')
    .eq('client_id', client.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-[#1e2128] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-green-400 uppercase tracking-widest mb-3">{client.industry}</p>
        <h1 className="text-3xl font-bold text-white leading-tight mb-4">{blog.title}</h1>
        {blog.description && (
          <p className="text-white/50 text-base mb-8 leading-relaxed">{blog.description}</p>
        )}
        <p className="text-xs text-white/30 mb-10">
          {new Date(blog.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div
          className="prose prose-invert prose-p:text-white/70 prose-h2:text-white prose-h2:text-xl prose-h2:font-semibold prose-li:text-white/70 prose-strong:text-white max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-white/20 mb-1">Powered by</p>
          <a href="https://inframindhq.online" target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline">InfraMind</a>
        </div>
      </div>
    </div>
  );
}
