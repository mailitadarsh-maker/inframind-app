import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Blog | InfraMind',
  description: 'Tips, guides, and updates on uptime monitoring, API health, SSL certificates, and keeping your apps running.',
  alternates: { canonical: 'https://inframindhq.online/blog' },
};

export const revalidate = 60;

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  cover_image: string | null;
  created_at: string;
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <main className="bg-[#22252c] min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-green text-xs font-semibold uppercase tracking-wide mb-2">Blog</p>
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
          Insights on uptime, APIs &amp; SSL monitoring
        </h1>
        <p className="text-text-2 text-sm mb-12 max-w-2xl">
          Practical guides and updates to help you keep your apps running — written in plain English.
        </p>

        {(!posts || posts.length === 0) && (
          <p className="text-text-2 text-sm">No posts yet. Check back soon.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts?.map((post: BlogPost) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-[#1a1c22] border border-white/[0.05] rounded-xl overflow-hidden hover:border-green/25 hover:-translate-y-1 transition-all duration-300"
            >
              {post.cover_image && (
                <div className="aspect-[16/9] bg-[#22252c] overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="text-text-2 text-xs mb-2">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <h2 className="text-text text-base font-semibold mb-2 group-hover:text-green transition-colors">
                  {post.title}
                </h2>
                <p className="text-text-2 text-sm leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
