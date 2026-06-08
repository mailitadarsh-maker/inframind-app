import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';
import { generateIncidentAnalysis } from "@/lib/ai-analysis";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  console.log("🚀 API CHECK ROUTE TRIGGERED");

  const { data: monitors, error } = await supabase.from('monitors').select('*');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  for (const monitor of monitors || []) {
    console.log("--- Checking:", monitor.name, `(${monitor.type}) ---`);

    try {
      const response = await fetch(monitor.target_url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await supabase.from('monitors').update({
        status: 'online',
        last_checked: new Date().toISOString()
      }).eq('id', monitor.id);

      await supabase
        .from('incidents')
        .update({ resolved_at: new Date().toISOString() })
        .eq('monitor_id', monitor.id)
        .is('resolved_at', null);

      console.log("✅ ONLINE");

    } catch (err: any) {
      console.log("❌ OFFLINE:", err.message);

      const { data: existingIncident } = await supabase
        .from('incidents')
        .select('id')
        .eq('monitor_id', monitor.id)
        .is('resolved_at', null)
        .maybeSingle();

      if (!existingIncident) {
        console.log("🤖 Running AI Analysis for type:", monitor.type);

        const statusCode = err.message.match(/HTTP (\d+)/)?.[1]
          ? parseInt(err.message.match(/HTTP (\d+)/)[1])
          : 0;

        const aiAnalysis = await generateIncidentAnalysis(
          monitor.target_url,
          statusCode,
          err.message,
          monitor.type ?? "website"
        );

        console.log("🤖 AI RESULT:", aiAnalysis);

        const { error: insertError } = await supabase.from("incidents").insert({
          monitor_id: monitor.id,
          started_at: new Date().toISOString(),
          ai_cause: aiAnalysis.cause,
          ai_action: aiAnalysis.action,
          ai_severity: aiAnalysis.severity,
        });

        if (insertError) console.error("INSERT ERROR:", insertError);

        if (monitor.alert_email) {
          await resend.emails.send({
            from: 'InfraMind <onboarding@resend.dev>',
            to: monitor.alert_email,
            subject: `🚨 Alert: ${monitor.name} is DOWN`,
            html: `
              <h2>${monitor.name} is offline</h2>
              <p><strong>Type:</strong> ${monitor.type?.toUpperCase()}</p>
              <p><strong>Target:</strong> ${monitor.target_url}</p>
              <p><strong>Cause:</strong> ${aiAnalysis.cause}</p>
              <p><strong>Action:</strong> ${aiAnalysis.action}</p>
              <p><strong>Severity:</strong> ${aiAnalysis.severity?.toUpperCase()}</p>
            `
          });
        }
      }

      await supabase.from('monitors').update({
        status: 'offline',
        last_checked: new Date().toISOString()
      }).eq('id', monitor.id);
    }
  }

  return NextResponse.json({ success: true });
}