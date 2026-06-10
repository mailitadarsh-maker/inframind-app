import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';
import { generateIncidentAnalysis } from "@/lib/ai-analysis";
import dns from 'dns/promises';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fetchWithRetry(url: string, options: any, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } finally { clearTimeout(timeoutId); }
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error("Max retries reached");
}

async function performMonitorCheck(monitor: any) {
  const start = Date.now();
  let resolvedIp = "N/A";
  try {
    const lookup = await dns.lookup(new URL(monitor.target_url).hostname);
    resolvedIp = lookup.address;
  } catch (e) {}
  
  try {
    let headers: Record<string, string> = {};

    // Auth Headers
    if (monitor.auth_type === "bearer" && monitor.auth_value) {
      headers["Authorization"] = `Bearer ${monitor.auth_value}`;
    }
    if (monitor.auth_type === "apikey" && monitor.auth_value) {
      headers["x-api-key"] = monitor.auth_value;
    }

    // Custom Headers Support
    if (monitor.custom_headers) {
      try {
        const custom = typeof monitor.custom_headers === "string" 
          ? JSON.parse(monitor.custom_headers) 
          : monitor.custom_headers;
        headers = { ...headers, ...custom };
      } catch (e) {
        console.error("Invalid custom headers", e);
      }
    }

    // Auto-inject JSON Content-Type
    if (monitor.request_body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetchWithRetry(monitor.target_url, {
      method: monitor.request_method || "GET",
      headers,
      body: monitor.request_method !== "GET" && monitor.request_body
        ? (typeof monitor.request_body === "string" ? monitor.request_body : JSON.stringify(monitor.request_body))
        : undefined,
      cache: "no-store",
    });

    const responseTime = Date.now() - start;

    if (monitor.type === "api" && monitor.expected_status && response.status !== monitor.expected_status) {
      throw new Error(`Expected ${monitor.expected_status} but got ${response.status}`);
    } else if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { data: incident } = await supabase.from('incidents').select('id, started_at').eq('monitor_id', monitor.id).is('resolved_at', null).maybeSingle();

    if (incident) {
      await supabase.from('incidents').update({ resolved_at: new Date().toISOString() }).eq('id', incident.id);
      if (monitor.alert_email) {
        const duration = ((Date.now() - new Date(incident.started_at).getTime()) / 60000).toFixed(1);
        await resend.emails.send({
          from: 'InfraMind <onboarding@resend.dev>', to: monitor.alert_email,
          subject: `✅ Recovery: ${monitor.name} is back online`,
          html: `<p>${monitor.name} recovered after ${duration} minutes.</p>`
        });
      }
    }

    await supabase.from('monitors').update({ status: 'online', last_status: 'online', response_time: responseTime, last_checked: new Date().toISOString() }).eq('id', monitor.id);

  } catch (err: any) {
    const detailedError = err?.message || "Unknown error";
    const { data: existingIncident } = await supabase.from('incidents').select('id').eq('monitor_id', monitor.id).is('resolved_at', null).maybeSingle();

    if (!existingIncident) {
      const statusCode = detailedError.match(/HTTP (\d+)/)?.[1] || detailedError.match(/got (\d+)/)?.[1];
      const ai = await generateIncidentAnalysis(monitor.target_url, statusCode ? parseInt(statusCode) : 0, detailedError, monitor.type ?? "website");
      
      await supabase.from("incidents").insert({
        monitor_id: monitor.id, started_at: new Date().toISOString(),
        ai_cause: ai.cause, ai_action: ai.action, ai_severity: ai.severity,
        raw_error: detailedError, failed_ip: resolvedIp,
      });

      if (monitor.alert_email) {
        await resend.emails.send({
          from: 'InfraMind <onboarding@resend.dev>', to: monitor.alert_email,
          subject: `🚨 Alert: ${monitor.name} is DOWN`,
          html: `<h2>${monitor.name} is offline</h2><p><strong>Cause:</strong> ${ai.cause}</p>`
        });
      }
    }
    await supabase.from('monitors').update({ status: 'offline', last_status: 'offline', response_time: 0, last_checked: new Date().toISOString() }).eq('id', monitor.id);
  }
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: monitors } = await supabase.from('monitors').select('*');
  if (!monitors) return NextResponse.json({ success: false });
  await Promise.allSettled(monitors.map(performMonitorCheck));
  return NextResponse.json({ success: true, processed: monitors.length });
}