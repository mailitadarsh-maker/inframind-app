import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, linkedin_post_url, linkedin_reward_status, linkedin_submitted_at'
    )
    .eq('linkedin_reward_status', 'pending')
    .order('linkedin_submitted_at', { ascending: false });

  return NextResponse.json({
    data,
    error,
  });
}