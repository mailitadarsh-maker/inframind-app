import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      name,
      target_url,
      alert_email,
      type,
      expected_status,
      request_method,
      auth_type,
      auth_value,
      custom_headers,
      request_body
    } = body;

    // 1. Basic validation
    if (!user_id || !name || !target_url || !alert_email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // 3. Trial expired check
    if (
      profile.plan === 'trial' &&
      profile.trial_ends_at &&
      new Date() > new Date(profile.trial_ends_at)
    ) {
      return NextResponse.json(
        {
          error: 'Your free trial has expired. Please upgrade your plan.',
          code: 'TRIAL_EXPIRED'
        },
        { status: 403 }
      );
    }

    // 4. Count current monitors
    const { count, error: countError } = await supabase
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (countError) {
      return NextResponse.json(
        { error: 'Unable to verify monitor limit' },
        { status: 500 }
      );
    }

    // 5. Monitor limit check
    const maxMonitors = profile.max_monitors ?? 3;
    if ((count ?? 0) >= maxMonitors) {
      return NextResponse.json(
        {
          error: `Monitor limit reached (${maxMonitors}). Upgrade your plan to add more monitors.`,
          code: 'MONITOR_LIMIT_REACHED'
        },
        { status: 403 }
      );
    }

    // 6. Insert new monitor
    const { data, error } = await supabase
      .from('monitors')
      .insert([
        {
          user_id,
          name,
          target_url,
          alert_email,
          type,
          expected_status: type === 'api' ? expected_status : null,
          request_method: request_method || 'GET',
          auth_type: auth_type || 'none',
          auth_value: auth_value || null,
          custom_headers: custom_headers || null,
          request_body: request_body || null,
          status: 'pending', 
          last_checked: null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, monitor: data });

  } catch (error: any) {
  console.error('Create Monitor Error:', error);

  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: error?.message,
      stack: error?.stack
    },
    { status: 500 }
  );
}
}