import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      businessName,
      website,
      industry,
      targetAudience,
      tone,
      frequency,
      competitors,
      notes,
      sampleBlogRef,
    } = body;

    if (!businessName || !industry) {
      return NextResponse.json({ error: 'businessName and industry are required' }, { status: 400 });
    }

    // Build slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        company_name: businessName,
        website: website || null,
        industry,
        target_audience: targetAudience,
        tone,
        frequency,                    // e.g. "daily1", "weekly", "monthly"
        competitors: competitors || null,
        brand_notes: notes || null,
        sample_blog_ref: sampleBlogRef || null,
        slug,
        status: 'active',
        payment_status: 'trial',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, client: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
