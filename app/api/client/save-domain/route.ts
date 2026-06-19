import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { client_id, custom_domain } = await req.json();

    if (!client_id || !custom_domain) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Validate domain format (e.g. blog.example.com)
    const domainRegex = /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z]{2,}$/i;
    if (!domainRegex.test(custom_domain)) {
      return NextResponse.json({ error: 'Invalid domain format. Use something like blog.yoursite.com' }, { status: 400 });
    }

    // Step 1: Add domain to Vercel automatically
    const vercelRes = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: custom_domain }),
      }
    );

    const vercelData = await vercelRes.json();

    // Domain already exists on Vercel is fine — treat as success
    if (!vercelRes.ok && vercelData.error?.code !== 'domain_already_exists') {
      console.error('Vercel API error:', vercelData);
      return NextResponse.json({ error: 'Failed to register domain with Vercel. Please try again.' }, { status: 500 });
    }

    // Step 2: Save custom_domain to Supabase
    const { error: dbError } = await supabase
      .from('clients')
      .update({ custom_domain })
      .eq('id', client_id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, domain: custom_domain });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
