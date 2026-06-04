import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      user_id,
      name,
      target_url,
      alert_email,
      type,
      expected_status,
    } = body;

    const { data, error } = await supabaseAdmin
      .from('monitors')
      .insert([
        {
          user_id,
          name,
          target_url,
          alert_email,
          type: type || 'website',
          expected_status: expected_status || 200,
          status: 'online',
          last_status: 'online',
          response_time: 0,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Create Monitor Error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      {
        status: 500,
      }
    );
  }
}