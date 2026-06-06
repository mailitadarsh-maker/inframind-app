import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Using the service role key to bypass RLS, exactly like your create route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, target_url, alert_email, type, expected_status } = body;

    // Basic validation
    if (!id || !name || !target_url || !alert_email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    // Update the existing monitor in Supabase
    const { data, error } = await supabase
      .from('monitors')
      .update({
        name,
        target_url,
        alert_email,
        type,
        expected_status: type === 'api' ? expected_status : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, monitor: data });

  } catch (error: any) {
    console.error('Update Monitor Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}