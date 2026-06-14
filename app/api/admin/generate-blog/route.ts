import { NextResponse } from 'next/server';
import { generateBlogPost, pickUnusedTopic } from '@/lib/generateBlogPost';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { topic, details } = body as { topic?: string; details?: string };

  const finalTopic = topic && topic.trim() ? topic.trim() : await pickUnusedTopic();

  try {
    const result = await generateBlogPost(finalTopic, details);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
