import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchPexelsImage(title: string): Promise<string | null> {
  try {
    const topicLower = title.toLowerCase();
    let searchQuery = 'technology laptop workspace';

    if (topicLower.includes('ssl') || topicLower.includes('certificate') || topicLower.includes('security')) {
      searchQuery = 'cybersecurity lock digital';
    } else if (topicLower.includes('downtime') || topicLower.includes('outage') || topicLower.includes('incident')) {
      searchQuery = 'server room data center';
    } else if (topicLower.includes('api') || topicLower.includes('deploy') || topicLower.includes('developer')) {
      searchQuery = 'developer coding laptop dark';
    } else if (topicLower.includes('uptime') || topicLower.includes('monitor')) {
      searchQuery = 'dashboard analytics screen';
    } else if (topicLower.includes('status') || topicLower.includes('page')) {
      searchQuery = 'website design screen monitor';
    } else if (topicLower.includes('business') || topicLower.includes('founder') || topicLower.includes('small')) {
      searchQuery = 'business office startup team';
    } else if (topicLower.includes('cost') || topicLower.includes('revenue') || topicLower.includes('loss')) {
      searchQuery = 'business growth chart analytics';
    }

    const query = encodeURIComponent(searchQuery);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=10&orientation=landscape`, {
      headers: { Authorization: process.env.PEXELS_API_KEY! },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.photos?.length) return null;
    const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
    return photo.src.large || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { slug, title } = await request.json();
  const cover_image = await fetchPexelsImage(title);

  if (cover_image) {
    await supabase.from('blog_posts').update({ cover_image }).eq('slug', slug);
  }

  return NextResponse.json({ cover_image });
}
