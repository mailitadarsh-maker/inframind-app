import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ShareButton from '../../components/ShareButton';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  cover_image: string | null;
  created_at: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, title, description, content, cover_image, created_at')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | InfraMind Blog`,
    description: post.description,
    alternates: { canonical: `https://inframindhq.online/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://inframindhq.online/blog/${post.slug}`,
      images: post.cover_image ? [post.cover_image] : ['https://inframindhq.online/og-image.png'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.cover_image ? [post.cover_image] : ['https://inframindhq.online/og-image.png'],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="bg-[#22252c] min-h-screen">
      <Navbar />
      <article className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-green text-xs font-semibold uppercase tracking-wide hover:underline">
          ← Back to Blog
        </Link>

        <p className="text-text-2 text-xs mt-6 mb-2">
          {new Date(post.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-text leading-tight">
            {post.title}
          </h1>
          <ShareButton title={post.title} text={post.description} url={`https://inframindhq.online/blog/${post.slug}`} />
        </div>

        {post.cover_image && (
          <div className="aspect-[16/9] bg-[#1a1c22] rounded-xl overflow-hidden mb-8">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-invert prose-headings:text-text prose-p:text-text-2 prose-p:leading-relaxed prose-a:text-green prose-strong:text-text max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      <Footer />
    </main>
  );
}
