import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
 console.log('API CHECK VERSION 5 - INCIDENT DEBUG');

  const { data: monitors, error } = await supabase
    .from('monitors')
    .select('*');

  if (error) {
    console.error('SUPABASE ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  for (const monitor of monitors || []) {
    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);

      const start = Date.now();

      const response = await fetch(monitor.target_url, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseTime = Date.now() - start;

      const newStatus = response.ok
        ? 'online'
        : 'offline';

// DOWN ALERT
if (
  monitor.status === 'online' &&
  newStatus === 'offline'
) {
  console.log('🚨 SENDING DOWN ALERT EMAIL');

  const { data: existingIncident } = await supabase
    .from('incidents')
    .select('id')
    .eq('monitor_id', monitor.id)
    .is('resolved_at', null)
    .maybeSingle();

  if (!existingIncident) {
    console.log(
      'CREATING INCIDENT FOR:',
      monitor.id
    );

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        monitor_id: monitor.id,
        started_at: new Date().toISOString(),
      })
      .select();

    console.log('INCIDENT DATA:', data);

    if (error) {
      console.error(
        'INCIDENT ERROR:',
        JSON.stringify(error, null, 2)
      );
    }
  }

  const emailResult = await resend.emails.send({
    from: 'InfraMind <onboarding@resend.dev>',
    to: monitor.alert_email,
    subject: `🚨 ${monitor.name} is DOWN`,
    html: `
      <h2>🚨 Website Down Alert</h2>
      <p><b>${monitor.name}</b> is currently offline.</p>
      <p>URL: ${monitor.target_url}</p>
      <p>Detected At: ${new Date().toLocaleString()}</p>
    `,
  });

  console.log(
    'DOWN EMAIL RESULT:',
    JSON.stringify(emailResult)
  );
}
// RECOVERY ALERT
if (
  monitor.status === 'offline' &&
  newStatus === 'online'
) {
  const { data: incident } = await supabase
    .from('incidents')
    .select('*')
    .eq('monitor_id', monitor.id)
    .is('resolved_at', null)
    .single();

  if (incident) {
    const resolvedAt = new Date();

    const durationSeconds = Math.floor(
      (
        resolvedAt.getTime() -
        new Date(incident.started_at).getTime()
      ) / 1000
    );

    await supabase
      .from('incidents')
      .update({
        resolved_at: resolvedAt.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', incident.id);
  }

  console.log('✅ SENDING RECOVERY EMAIL');

  const emailResult = await resend.emails.send({
    from: 'InfraMind <onboarding@resend.dev>',
    to: monitor.alert_email,
    subject: `✅ ${monitor.name} is BACK ONLINE`,
    html: `
      <h2>✅ Website Back Online</h2>
      <p>Good news! Your website is responding normally again.</p>
      <p>URL: ${monitor.target_url}</p>
      <p>Response Time: ${responseTime} ms</p>
      <p>Recovered At: ${new Date().toLocaleString()}</p>
    `,
  });

  console.log(
    'RECOVERY EMAIL RESULT:',
    JSON.stringify(emailResult)
  );
}

  await supabase
  .from('monitors')
  .update({
    status: newStatus,
    last_status: monitor.status,
    response_time: responseTime,
    last_checked: new Date().toISOString(),
  })
  .eq('id', monitor.id);

    } catch (err) {
      console.error('CHECK ERROR:', err);

      if (monitor.status === 'online') {
        const { data: existingIncident } = await supabase
          .from('incidents')
          .select('id')
          .eq('monitor_id', monitor.id)
          .is('resolved_at', null)
          .maybeSingle();

        if (!existingIncident) {
          await supabase
            .from('incidents')
            .insert({
              monitor_id: monitor.id,
              started_at: new Date().toISOString(),
            });
        }

        const emailResult = await resend.emails.send({
          from: 'InfraMind <onboarding@resend.dev>',
          to: monitor.alert_email,
          subject: `🚨 ${monitor.name} is DOWN`,
          html: `
            <h2>🚨 Website Down Alert</h2>
            <p><b>${monitor.name}</b> is currently offline.</p>
            <p>URL: ${monitor.target_url}</p>
            <p>Detected At: ${new Date().toLocaleString()}</p>
          `,
        });

        console.log(
          'DOWN EMAIL RESULT:',
          JSON.stringify(emailResult)
        );
      }

      await supabase
        .from('monitors')
        .update({
          status: 'offline',
          last_status: monitor.status,
          response_time: 0,
          last_checked: new Date().toISOString(),
        })
        .eq('id', monitor.id);
    }
  } // closes FOR LOOP

  return NextResponse.json({
    success: true,
  });
}