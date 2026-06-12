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


function downEmailHtml(monitorName: string, monitorUrl: string, monitorType: string, cause: string, action: string | null, severity: string | null): string {
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const actionBlock = action ? `<tr><td style="padding-bottom:24px"><div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:18px 20px"><p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#fbbf24;text-transform:uppercase;letter-spacing:0.06em">&#128161; Recommended Action</p><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">${action}</p></div></td></tr>` : '';
  const severityBlock = severity ? `<tr><td style="padding-bottom:24px"><table cellpadding="0" cellspacing="0"><tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px 14px"><span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em">Severity: ${severity}</span></td></tr></table></td></tr>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0f16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f16;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td style="padding:0 0 28px 0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><span style="font-size:15px;font-weight:600;color:#34d399">&#9632; InfraMind</span></td><td align="right"><span style="font-size:12px;color:#4b5563">${new Date().toUTCString()}</span></td></tr></table></td></tr><tr><td style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#ef4444;height:4px;font-size:0">&nbsp;</td></tr><tr><td style="padding:32px 36px 28px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:20px"><span style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:#f87171;letter-spacing:0.04em;text-transform:uppercase">&#9679; Offline</span></td></tr><tr><td style="padding-bottom:8px"><h1 style="margin:0;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em;line-height:1.2">${monitorName} is down</h1></td></tr><tr><td style="padding-bottom:28px"><p style="margin:0;font-size:14px;color:#6b7280">Detected at ${now}</p></td></tr><tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;padding-bottom:24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Monitor</p><p style="margin:0;font-size:14px;font-weight:500;color:#e2e6f0">${monitorName}</p></div></td><td width="50%" style="padding-left:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Type</p><p style="margin:0;font-size:14px;font-weight:500;color:#e2e6f0;text-transform:capitalize">${monitorType}</p></div></td></tr><tr><td colspan="2" style="padding-top:12px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">URL</p><p style="margin:0;font-size:13px;color:#6b7280;word-break:break-all">${monitorUrl}</p></div></td></tr></table></td></tr><tr><td style="padding-bottom:24px"><div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:18px 20px"><p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#f87171;text-transform:uppercase;letter-spacing:0.06em">&#9888; Root Cause</p><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">${cause}</p></div></td></tr>${actionBlock}${severityBlock}<tr><td align="center" style="padding-top:8px"><a href="https://inframindhq.online/dashboard" style="display:inline-block;background:#34d399;color:#0d0f16;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:8px">View Dashboard &rarr;</a></td></tr></table></td></tr></table></td></tr><tr><td style="padding:28px 0 0;text-align:center"><p style="margin:0 0 6px;font-size:12px;color:#374151">InfraMind &mdash; Uptime &amp; API Monitoring</p><p style="margin:0;font-size:11px;color:#1f2937">Alert emails enabled for this monitor. <a href="https://inframindhq.online/settings" style="color:#374151">Manage settings</a></p></td></tr></table></td></tr></table></body></html>`;
}

function recoveryEmailHtml(monitorName: string, monitorUrl: string, duration: string): string {
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0d0f16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f16;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td style="padding:0 0 28px 0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><span style="font-size:15px;font-weight:600;color:#34d399">&#9632; InfraMind</span></td><td align="right"><span style="font-size:12px;color:#4b5563">${new Date().toUTCString()}</span></td></tr></table></td></tr><tr><td style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#34d399;height:4px;font-size:0">&nbsp;</td></tr><tr><td style="padding:32px 36px 28px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:20px"><span style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:#34d399;letter-spacing:0.04em;text-transform:uppercase">&#9679; Back Online</span></td></tr><tr><td style="padding-bottom:8px"><h1 style="margin:0;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em;line-height:1.2">${monitorName} has recovered</h1></td></tr><tr><td style="padding-bottom:28px"><p style="margin:0;font-size:14px;color:#6b7280">Resolved at ${now}</p></td></tr><tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;padding-bottom:24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Monitor</p><p style="margin:0;font-size:14px;font-weight:500;color:#e2e6f0">${monitorName}</p></div></td><td width="50%" style="padding-left:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Downtime</p><p style="margin:0;font-size:14px;font-weight:600;color:#34d399">${duration} min</p></div></td></tr><tr><td colspan="2" style="padding-top:12px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">URL</p><p style="margin:0;font-size:13px;color:#6b7280;word-break:break-all">${monitorUrl}</p></div></td></tr></table></td></tr><tr><td style="padding-bottom:24px"><div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:8px;padding:18px 20px"><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">&#10003; Your service is responding normally. No further action required.</p></div></td></tr><tr><td align="center" style="padding-top:8px"><a href="https://inframindhq.online/dashboard" style="display:inline-block;background:#34d399;color:#0d0f16;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:8px">View Dashboard &rarr;</a></td></tr></table></td></tr></table></td></tr><tr><td style="padding:28px 0 0;text-align:center"><p style="margin:0 0 6px;font-size:12px;color:#374151">InfraMind &mdash; Uptime &amp; API Monitoring</p><p style="margin:0;font-size:11px;color:#1f2937">Alert emails enabled for this monitor. <a href="https://inframindhq.online/settings" style="color:#374151">Manage settings</a></p></td></tr></table></td></tr></table></body></html>`;
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
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recovery</title></head><body style="margin:0;padding:0;background:#0d0f16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f16;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><!-- Header --><tr><td style="padding:0 0 28px 0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#34d399;letter-spacing:-0.01em">&#9632; InfraMind</span></td><td align="right"><span style="font-size:12px;color:#4b5563">${new Date().toUTCString()}</span></td></tr></table></td></tr><!-- Recovery Card --><tr><td style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden"><table width="100%" cellpadding="0" cellspacing="0"><!-- Green top bar --><tr><td style="background:#34d399;height:4px;font-size:0">&nbsp;</td></tr><!-- Card body --><tr><td style="padding:32px 36px 28px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:20px"><table cellpadding="0" cellspacing="0"><tr><td style="background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.25);border-radius:20px;padding:5px 14px"><span style="font-size:12px;font-weight:600;color:#34d399;letter-spacing:0.04em;text-transform:uppercase">&#9679; Back Online</span></td></tr></table></td></tr><tr><td style="padding-bottom:8px"><h1 style="margin:0;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em;line-height:1.2">${monitor.name} has recovered</h1></td></tr><tr><td style="padding-bottom:28px"><p style="margin:0;font-size:14px;color:#6b7280">Resolved at ${new Date().toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}</p></td></tr><!-- Divider --><tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;padding-bottom:24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Monitor</p><p style="margin:0;font-size:14px;font-weight:500;color:#e2e6f0;word-break:break-all">${monitor.name}</p></div></td><td width="50%" style="padding-left:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Downtime</p><p style="margin:0;font-size:14px;font-weight:600;color:#34d399">${duration} min</p></div></td></tr><tr><td colspan="2" style="padding-top:12px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">URL</p><p style="margin:0;font-size:13px;font-weight:400;color:#6b7280;word-break:break-all">${monitor.target_url}</p></div></td></tr></table></td></tr><!-- Success message --><tr><td style="padding-bottom:24px"><div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:8px;padding:18px 20px"><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">&#10003; Your service is responding normally. No further action is required.</p></div></td></tr><!-- CTA --><tr><td align="center" style="padding-top:8px"><a href="https://inframindhq.online/dashboard" style="display:inline-block;background:#34d399;color:#0d0f16;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:8px;letter-spacing:-0.01em">View Dashboard &rarr;</a></td></tr></table></td></tr></table></td></tr><!-- Footer --><tr><td style="padding:28px 0 0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><p style="margin:0 0 6px;font-size:12px;color:#374151">InfraMind &mdash; Uptime &amp; API Monitoring</p><p style="margin:0;font-size:11px;color:#1f2937">You received this because alert emails are enabled for this monitor. <a href="https://inframindhq.online/settings" style="color:#374151">Manage settings</a></p></td></tr></table></td></tr></table></td></tr></table></body></html>`
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
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alert</title></head><body style="margin:0;padding:0;background:#0d0f16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f16;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><!-- Header --><tr><td style="padding:0 0 28px 0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#34d399;letter-spacing:-0.01em">&#9632; InfraMind</span></td><td align="right"><span style="font-size:12px;color:#4b5563">${new Date().toUTCString()}</span></td></tr></table></td></tr><!-- Alert Card --><tr><td style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden"><table width="100%" cellpadding="0" cellspacing="0"><!-- Red top bar --><tr><td style="background:#ef4444;height:4px;font-size:0">&nbsp;</td></tr><!-- Card body --><tr><td style="padding:32px 36px 28px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:20px"><table cellpadding="0" cellspacing="0"><tr><td style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);border-radius:20px;padding:5px 14px"><span style="font-size:12px;font-weight:600;color:#f87171;letter-spacing:0.04em;text-transform:uppercase">&#9679; Offline</span></td></tr></table></td></tr><tr><td style="padding-bottom:8px"><h1 style="margin:0;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em;line-height:1.2">${monitor.name} is down</h1></td></tr><tr><td style="padding-bottom:28px"><p style="margin:0;font-size:14px;color:#6b7280">Detected at ${new Date().toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}</p></td></tr><!-- Divider --><tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;padding-bottom:24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Monitor</p><p style="margin:0;font-size:14px;font-weight:500;color:#e2e6f0;word-break:break-all">${monitor.name}</p></div></td><td width="50%" style="padding-left:12px;vertical-align:top"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">Type</p><p style="margin:0;font-size:14px;font-weight:500;color:#e2e6f0;text-transform:capitalize">${monitor.type ?? 'website'}</p></div></td></tr><tr><td colspan="2" style="padding-top:12px"><div style="background:#0d0f16;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#4b5563;text-transform:uppercase;letter-spacing:0.06em">URL</p><p style="margin:0;font-size:13px;font-weight:400;color:#6b7280;word-break:break-all">${monitor.target_url}</p></div></td></tr></table></td></tr><!-- AI Cause --><tr><td style="padding-bottom:24px"><div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:18px 20px"><p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#f87171;text-transform:uppercase;letter-spacing:0.06em">&#9888; Root Cause</p><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">${ai.cause}</p></div></td></tr>${ai.action ? \`<!-- AI Action --><tr><td style="padding-bottom:24px"><div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:18px 20px"><p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#fbbf24;text-transform:uppercase;letter-spacing:0.06em">&#128161; Recommended Action</p><p style="margin:0;font-size:14px;color:#d1d5db;line-height:1.6">\${ai.action}</p></div></td></tr>\` : ''}<!-- Severity Badge -->${ai.severity ? \`<tr><td style="padding-bottom:24px"><table cellpadding="0" cellspacing="0"><tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px 14px"><span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em">Severity: \${ai.severity}</span></td></tr></table></td></tr>\` : ''}<!-- CTA --><tr><td align="center" style="padding-top:8px"><a href="https://inframindhq.online/dashboard" style="display:inline-block;background:#34d399;color:#0d0f16;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:8px;letter-spacing:-0.01em">View Dashboard &rarr;</a></td></tr></table></td></tr></table></td></tr><!-- Footer --><tr><td style="padding:28px 0 0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><p style="margin:0 0 6px;font-size:12px;color:#374151">InfraMind &mdash; Uptime &amp; API Monitoring</p><p style="margin:0;font-size:11px;color:#1f2937">You received this because alert emails are enabled for this monitor. <a href="https://inframindhq.online/settings" style="color:#374151">Manage settings</a></p></td></tr></table></td></tr></table></td></tr></table></body></html>`
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