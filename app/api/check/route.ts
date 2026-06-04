import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';
import sslChecker from 'ssl-checker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  console.log('API CHECK VERSION 5.1 - PRODUCTION READY');

  const { data: monitors, error } = await supabase
    .from('monitors')
    .select('*');

  if (error) {
    console.error('SUPABASE ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  for (const monitor of monitors || []) {
    try {
      // ==========================================
      // 1. SSL MONITORING LOGIC
      // ==========================================
      if (monitor.type === 'ssl') {
        console.log('SSL MONITOR DETECTED:', monitor.name);
        let newStatus = 'offline';

        try {
          const hostname = new URL(monitor.target_url).hostname;
          const sslInfo = await sslChecker(hostname);
          const expiryDate = new Date(sslInfo.validTo);
          
          const daysRemaining = Math.ceil(
            (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          // --- SSL EXPIRY WATERMARK ALERTS ---
          
          // 30 Day Alert
          if (daysRemaining <= 30 && daysRemaining > 14 && monitor.ssl_alert_stage !== 30) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `
                <h2>SSL Expiry Warning</h2>
                <p><b>${monitor.name}</b></p>
                <p>URL: ${monitor.target_url}</p>
                <p>SSL expires in <b>${daysRemaining} days</b>.</p>
                <p>Expiry Date: ${expiryDate.toLocaleDateString()}</p>
              `,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 30 }).eq('id', monitor.id);
          }

          // 14 Day Alert
          if (daysRemaining <= 14 && daysRemaining > 7 && monitor.ssl_alert_stage !== 14) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `
                <h2>SSL Expiry Warning</h2>
                <p><b>${monitor.name}</b></p>
                <p>SSL expires in <b>${daysRemaining} days</b>.</p>
              `,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 14 }).eq('id', monitor.id);
          }

          // 7 Day Alert
          if (daysRemaining <= 7 && daysRemaining > 1 && monitor.ssl_alert_stage !== 7) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `
                <h2>SSL Expiry Warning</h2>
                <p><b>${monitor.name}</b></p>
                <p>SSL expires in <b>${daysRemaining} days</b>.</p>
              `,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 7 }).eq('id', monitor.id);
          }

          // 1 Day Alert
          if (daysRemaining <= 1 && daysRemaining > 0 && monitor.ssl_alert_stage !== 1) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `🚨 SSL Expiring Tomorrow - ${monitor.name}`,
              html: `
                <h2>SSL Expiring Soon</h2>
                <p><b>${monitor.name}</b></p>
                <p>Your SSL certificate expires in less than 24 hours.</p>
              `,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 1 }).eq('id', monitor.id);
          }

          // Expired Alert
          if (daysRemaining <= 0 && monitor.ssl_alert_stage !== 0) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `🚨 SSL Certificate Expired - ${monitor.name}`,
              html: `
                <h2>SSL Certificate Expired</h2>
                <p><b>${monitor.name}</b></p>
                <p>Your SSL certificate has expired.</p>
                <p>URL: ${monitor.target_url}</p>
              `,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 0 }).eq('id', monitor.id);
          }

          // Reset Logic (handles successful certificate renewals automatically)
          if (daysRemaining > 30 && monitor.ssl_alert_stage !== null) {
            await supabase.from('monitors').update({ ssl_alert_stage: null }).eq('id', monitor.id);
          }

          // --- END WARNING LOGIC ---

          await supabase
            .from('monitors')
            .update({
              ssl_expiry_date: expiryDate,
              ssl_days_remaining: daysRemaining,
            })
            .eq('id', monitor.id);

          newStatus = daysRemaining > 0 ? 'online' : 'offline';

        } catch (sslError) {
          console.error('SSL CHECK FAILED:', sslError);
          newStatus = 'offline';
        }

        // SSL DOWN ALERT (Incident Tracking)
        if (monitor.status === 'online' && newStatus === 'offline') {
          console.log('🚨 SENDING SSL DOWN ALERT EMAIL');

          const { data: existingIncident } = await supabase
            .from('incidents')
            .select('id')
            .eq('monitor_id', monitor.id)
            .is('resolved_at', null)
            .maybeSingle();

          if (!existingIncident) {
            await supabase.from('incidents').insert({
              monitor_id: monitor.id,
              started_at: new Date().toISOString(),
            });
          }

          await resend.emails.send({
            from: 'InfraMind <onboarding@resend.dev>',
            to: monitor.alert_email,
            subject: `🚨 SSL Alert: ${monitor.name} is DOWN`,
            html: `
              <h2>🚨 SSL Down Alert</h2>
              <p><b>${monitor.name}</b> SSL certificate is expired or unreachable.</p>
              <p>Type: SSL</p>
              <p>URL: ${monitor.target_url}</p>
              <p>Detected At: ${new Date().toLocaleString()}</p>
            `,
          });
        }

        // SSL RECOVERY ALERT
        if (monitor.status === 'offline' && newStatus === 'online') {
          const { data: incident } = await supabase
            .from('incidents')
            .select('*')
            .eq('monitor_id', monitor.id)
            .is('resolved_at', null)
            .maybeSingle();

          if (incident) {
            const resolvedAt = new Date();
            const durationSeconds = Math.floor(
              (resolvedAt.getTime() - new Date(incident.started_at).getTime()) / 1000
            );

            await supabase
              .from('incidents')
              .update({
                resolved_at: resolvedAt.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq('id', incident.id);
          }

          console.log('✅ SENDING SSL RECOVERY EMAIL');
          await resend.emails.send({
            from: 'InfraMind <onboarding@resend.dev>',
            to: monitor.alert_email,
            subject: `✅ SSL Alert: ${monitor.name} is BACK ONLINE`,
            html: `
              <h2>✅ SSL Back Online</h2>
              <p>Good news! Your SSL certificate is valid again.</p>
              <p>URL: ${monitor.target_url}</p>
              <p>Recovered At: ${new Date().toLocaleString()}</p>
            `,
          });
        }

        await supabase
          .from('monitors')
          .update({
            status: newStatus,
            last_status: monitor.status,
            last_checked: new Date().toISOString(),
          })
          .eq('id', monitor.id);

      } 
      // ==========================================
      // 2. HTTP / API MONITORING LOGIC
      // ==========================================
      else {
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 10000);
        const start = Date.now();

        const response = await fetch(monitor.target_url, {
          cache: 'no-store',
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const responseTime = Date.now() - start;
        let newStatus = 'offline';

        if (monitor.type === 'website') {
          newStatus = response.ok ? 'online' : 'offline';
        }

        if (monitor.type === 'api') {
          newStatus = response.status === monitor.expected_status ? 'online' : 'offline';
        }

        const monitorLabel = monitor.type === 'api' ? 'API' : 'Website';

        // HTTP DOWN ALERT
        if (monitor.status === 'online' && newStatus === 'offline') {
          console.log(`🚨 SENDING ${monitorLabel.toUpperCase()} DOWN ALERT EMAIL`);

          const { data: existingIncident } = await supabase
            .from('incidents')
            .select('id')
            .eq('monitor_id', monitor.id)
            .is('resolved_at', null)
            .maybeSingle();

          if (!existingIncident) {
            await supabase.from('incidents').insert({
              monitor_id: monitor.id,
              started_at: new Date().toISOString(),
            });
          }

          await resend.emails.send({
            from: 'InfraMind <onboarding@resend.dev>',
            to: monitor.alert_email,
            subject: `🚨 ${monitorLabel} Alert: ${monitor.name} is DOWN`,
            html: `
              <h2>🚨 ${monitorLabel} Down Alert</h2>
              <p><b>${monitor.name}</b> is currently offline.</p>
              <p>Type: ${monitorLabel}</p>
              <p>URL: ${monitor.target_url}</p>
              <p>Detected At: ${new Date().toLocaleString()}</p>
            `,
          });
        }

        // HTTP RECOVERY ALERT
        if (monitor.status === 'offline' && newStatus === 'online') {
          const { data: incident } = await supabase
            .from('incidents')
            .select('*')
            .eq('monitor_id', monitor.id)
            .is('resolved_at', null)
            .maybeSingle();

          if (incident) {
            const resolvedAt = new Date();
            const durationSeconds = Math.floor(
              (resolvedAt.getTime() - new Date(incident.started_at).getTime()) / 1000
            );

            await supabase
              .from('incidents')
              .update({
                resolved_at: resolvedAt.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq('id', incident.id);
          }

          console.log(`✅ SENDING ${monitorLabel.toUpperCase()} RECOVERY EMAIL`);
          await resend.emails.send({
            from: 'InfraMind <onboarding@resend.dev>',
            to: monitor.alert_email,
            subject: `✅ ${monitorLabel} Alert: ${monitor.name} is BACK ONLINE`,
            html: `
              <h2>✅ ${monitorLabel} Back Online</h2>
              <p>Good news! Your ${monitorLabel} is responding normally again.</p>
              <p>URL: ${monitor.target_url}</p>
              <p>Response Time: ${responseTime} ms</p>
              <p>Recovered At: ${new Date().toLocaleString()}</p>
            `,
          });
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
      }

    } catch (err: any) {
      // ==========================================
      // 3. GLOBAL ERROR FALLBACK (TIMEOUTS/DNS FAILURES)
      // ==========================================
      console.error('CHECK ERROR FULL:', err?.message || err);

      if (monitor.status === 'online') {
        const monitorLabel = monitor.type === 'api' ? 'API' : (monitor.type === 'ssl' ? 'SSL' : 'Website');

        const { data: existingIncident } = await supabase
          .from('incidents')
          .select('id')
          .eq('monitor_id', monitor.id)
          .is('resolved_at', null)
          .maybeSingle();

        if (!existingIncident) {
          await supabase.from('incidents').insert({
            monitor_id: monitor.id,
            started_at: new Date().toISOString(),
          });
        }

        await resend.emails.send({
          from: 'InfraMind <onboarding@resend.dev>',
          to: monitor.alert_email,
          subject: `🚨 ${monitorLabel} Alert: ${monitor.name} is DOWN`,
          html: `
            <h2>🚨 ${monitorLabel} Down Alert</h2>
            <p><b>${monitor.name}</b> is currently offline (Connection Error).</p>
            <p>Type: ${monitorLabel}</p>
            <p>URL: ${monitor.target_url}</p>
            <p>Detected At: ${new Date().toLocaleString()}</p>
          `,
        });
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
  }

  return NextResponse.json({ success: true });
}