import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';
import sslChecker from 'ssl-checker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  console.log('API CHECK VERSION 7.0 - CACHE BUSTED & ENHANCED LOGGING');

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

  console.log("TOTAL MONITORS:", monitors?.length);

  for (const monitor of monitors || []) {
    console.log("PROCESSING MONITOR:", monitor.name, monitor.type);
    
    try {
      if (monitor.type === 'ssl') {
        let newStatus = 'offline';

        try {
          const hostname = new URL(monitor.target_url).hostname;
          const sslInfo = await sslChecker(hostname);
          const expiryDate = new Date(sslInfo.validTo);
          
          const daysRemaining = Math.ceil(
            (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          if (daysRemaining <= 30 && daysRemaining > 14 && monitor.ssl_alert_stage !== 30) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `<p>SSL expires in <b>${daysRemaining} days</b>.</p>`,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 30 }).eq('id', monitor.id);
          }

          if (daysRemaining <= 14 && daysRemaining > 7 && monitor.ssl_alert_stage !== 14) {
             await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `<p>SSL expires in <b>${daysRemaining} days</b>.</p>`,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 14 }).eq('id', monitor.id);
          }

          if (daysRemaining <= 7 && daysRemaining > 1 && monitor.ssl_alert_stage !== 7) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `<p>SSL expires in <b>${daysRemaining} days</b>.</p>`,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 7 }).eq('id', monitor.id);
          }

          if (daysRemaining <= 1 && daysRemaining > 0 && monitor.ssl_alert_stage !== 1) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `🚨 SSL Expiring Tomorrow - ${monitor.name}`,
              html: `<p>Your SSL certificate expires in less than 24 hours.</p>`,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 1 }).eq('id', monitor.id);
          }

          if (daysRemaining <= 0 && monitor.ssl_alert_stage !== 0) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `🚨 SSL Certificate Expired - ${monitor.name}`,
              html: `<p>Your SSL certificate has expired.</p>`,
            });
            await supabase.from('monitors').update({ ssl_alert_stage: 0 }).eq('id', monitor.id);
          }

          if (daysRemaining > 30 && monitor.ssl_alert_stage !== null) {
            await supabase.from('monitors').update({ ssl_alert_stage: null }).eq('id', monitor.id);
          }

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

        if (newStatus !== monitor.status) {
          if (newStatus === 'offline') {
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
              html: `<p><b>${monitor.name}</b> SSL certificate is expired or unreachable.</p>`,
            });

          } else if (newStatus === 'online') {
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

            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `✅ SSL Alert: ${monitor.name} is BACK ONLINE`,
              html: `<p>Good news! Your SSL certificate is valid again.</p>`,
            });
          }
        }

        await supabase
          .from('monitors')
          .update({
            status: newStatus,
            last_status: monitor.status, 
            last_checked: new Date().toISOString(),
          })
          .eq('id', monitor.id);

      } else {
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

        if (newStatus !== monitor.status) {
          if (newStatus === 'offline') {
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
              html: `<p><b>${monitor.name}</b> is currently offline.</p>`,
            });

          } else if (newStatus === 'online') {
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

            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `✅ ${monitorLabel} Alert: ${monitor.name} is BACK ONLINE`,
              html: `<p>Good news! Your ${monitorLabel} is responding normally again.</p>`,
            });
          }
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
      console.error("MONITOR FAILED:", monitor.name, err?.message);
      const newStatus = 'offline';

      if (newStatus !== monitor.status) {
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

        try {
          await resend.emails.send({
            from: 'InfraMind <onboarding@resend.dev>',
            to: monitor.alert_email,
            subject: `🚨 ${monitorLabel} Alert: ${monitor.name} is DOWN`,
            html: `<p><b>${monitor.name}</b> is currently offline (Connection Error).</p>`,
          });
        } catch (emailError) {
          console.error("❌ EMAIL FAILED:", emailError);
        }
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