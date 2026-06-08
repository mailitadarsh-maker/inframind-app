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
      auth_value
    } = body;

    if (!user_id || !name || !target_url || !alert_email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

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
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}