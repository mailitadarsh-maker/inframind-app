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








function downEmailHtml(name: string, url: string, type: string, cause: string, action: string | null, severity: string | null): string {
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const utc = new Date().toUTCString();
  const actionBlock = action ? '<tr><td style="padding-bottom:20px"><div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:16px 20px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#fbbf24;text-transform:uppercase;letter-spacing:0.06em">Recommended Action</p><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">' + action + '</p></div></td></tr>' : '';
  const sevBlock = severity ? '<tr><td style="padding-bottom:20px"><span style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase">Severity: ' + severity + '</span></td></tr>' : '';
  return '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
    + '<body style="margin:0;padding:0;background:#0d0f16;font-family:-apple-system,BlinkMacSystemFont,sans-serif">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f16;padding:32px 16px"><tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">'
    + '<tr><td style="padding-bottom:24px"><table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td><b style="font-size:15px;color:#34d399">&#9632; InfraMind</b></td>'
    + '<td align="right"><span style="font-size:12px;color:#4b5563">' + utc + '</span></td>'
    + '</tr></table></td></tr>'
    + '<tr><td style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden">'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="background:#ef4444;height:3px"></td></tr>'
    + '<tr><td style="padding:28px 32px">'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="padding-bottom:16px"><span style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:0.05em">Offline</span></td></tr>'
    + '<tr><td style="padding-bottom:6px"><h1 style="margin:0;font-size:24px;font-weight:700;color:#f1f5f9">' + name + ' is down</h1></td></tr>'
    + '<tr><td style="padding-bottom:24px"><p style="margin:0;font-size:13px;color:#6b7280">Detected ' + now + '</p></td></tr>'
    + '<tr><td style="padding-bottom:20px;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px">'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td width="33%" style="padding-right:8px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Monitor</p><p style="margin:0;font-size:13px;font-weight:500;color:#e2e6f0">' + name + '</p></div></td>'
    + '<td width="33%" style="padding-right:8px;padding-left:8px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Type</p><p style="margin:0;font-size:13px;font-weight:500;color:#e2e6f0;text-transform:capitalize">' + type + '</p></div></td>'
    + '<td width="34%" style="padding-left:8px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Status</p><p style="margin:0;font-size:13px;font-weight:600;color:#f87171">Unreachable</p></div></td>'
    + '</tr></table></td></tr>'
    + '<tr><td style="padding-bottom:20px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">URL</p><p style="margin:0;font-size:13px;color:#6b7280;word-break:break-all">' + url + '</p></div></td></tr>'
    + '<tr><td style="padding-bottom:20px"><div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:16px 18px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#f87171;text-transform:uppercase;letter-spacing:0.06em">Root Cause</p><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.65">' + cause + '</p></div></td></tr>'
    + actionBlock + sevBlock
    + '<tr><td align="center" style="padding-top:4px"><a href="https://inframindhq.online/dashboard" style="display:inline-block;background:#34d399;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;padding:12px 30px;border-radius:8px">View Dashboard</a></td></tr>'
    + '</table></td></tr></table></td></tr>'
    + '<tr><td style="padding:24px 0 0;text-align:center"><p style="margin:0 0 4px;font-size:12px;color:#374151">InfraMind &mdash; Uptime &amp; API Monitoring</p><p style="margin:0;font-size:11px;color:#1f2937"><a href="https://inframindhq.online/settings" style="color:#374151">Manage alert settings</a></p></td></tr>'
    + '</table></td></tr></table></body></html>';
}

function recoveryEmailHtml(name: string, url: string, duration: string): string {
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const utc = new Date().toUTCString();
  return '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
    + '<body style="margin:0;padding:0;background:#0d0f16;font-family:-apple-system,BlinkMacSystemFont,sans-serif">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f16;padding:32px 16px"><tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">'
    + '<tr><td style="padding-bottom:24px"><table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td><b style="font-size:15px;color:#34d399">&#9632; InfraMind</b></td>'
    + '<td align="right"><span style="font-size:12px;color:#4b5563">' + utc + '</span></td>'
    + '</tr></table></td></tr>'
    + '<tr><td style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden">'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="background:#34d399;height:3px"></td></tr>'
    + '<tr><td style="padding:28px 32px">'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="padding-bottom:16px"><span style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#34d399;text-transform:uppercase;letter-spacing:0.05em">Back Online</span></td></tr>'
    + '<tr><td style="padding-bottom:6px"><h1 style="margin:0;font-size:24px;font-weight:700;color:#f1f5f9">' + name + ' has recovered</h1></td></tr>'
    + '<tr><td style="padding-bottom:24px"><p style="margin:0;font-size:13px;color:#6b7280">Resolved ' + now + '</p></td></tr>'
    + '<tr><td style="padding-bottom:20px;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px">'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td width="50%" style="padding-right:8px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Monitor</p><p style="margin:0;font-size:13px;font-weight:500;color:#e2e6f0">' + name + '</p></div></td>'
    + '<td width="50%" style="padding-left:8px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Downtime</p><p style="margin:0;font-size:14px;font-weight:700;color:#34d399">' + duration + ' min</p></div></td>'
    + '</tr></table></td></tr>'
    + '<tr><td style="padding-bottom:20px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px"><p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">URL</p><p style="margin:0;font-size:13px;color:#6b7280;word-break:break-all">' + url + '</p></div></td></tr>'
    + '<tr><td style="padding-bottom:20px"><div style="background:rgba(52,211,153,0.05);border:1px solid rgba(52,211,153,0.15);border-radius:8px;padding:16px 18px"><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.65">&#10003;&nbsp; Your service is responding normally. No further action required.</p></div></td></tr>'
    + '<tr><td align="center" style="padding-top:4px"><a href="https://inframindhq.online/dashboard" style="display:inline-block;background:#34d399;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;padding:12px 30px;border-radius:8px">View Dashboard</a></td></tr>'
    + '</table></td></tr></table></td></tr>'
    + '<tr><td style="padding:24px 0 0;text-align:center"><p style="margin:0 0 4px;font-size:12px;color:#374151">InfraMind &mdash; Uptime &amp; API Monitoring</p><p style="margin:0;font-size:11px;color:#1f2937"><a href="https://inframindhq.online/settings" style="color:#374151">Manage alert settings</a></p></td></tr>'
    + '</table></td></tr></table></body></html>';
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
          from: 'InfraMind <alert@inframindhq.online>', to: monitor.alert_email,
          subject: `✅ Recovery: ${monitor.name} is back online`,
          html: recoveryEmailHtml(monitor.name, monitor.target_url, duration),
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
          from: 'InfraMind <alert@inframindhq.online>', to: monitor.alert_email,
          subject: `🚨 Alert: ${monitor.name} is DOWN`,
          html: downEmailHtml(monitor.name, monitor.target_url, monitor.type ?? 'website', ai.cause, ai.action ?? null, ai.severity ?? null),
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