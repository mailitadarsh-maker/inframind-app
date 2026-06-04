import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';
import sslChecker from 'ssl-checker';

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
      if (monitor.type === 'ssl') {
        console.log('SSL MONITOR DETECTED:', monitor.name);

        let newStatus = 'offline';

        try {
          const hostname = new URL(
            monitor.target_url
          ).hostname;

          const sslInfo = await sslChecker(hostname);

          console.log('SSL INFO:', JSON.stringify(sslInfo, null, 2));

          const expiryDate = new Date(
            sslInfo.validTo
          );

          const daysRemaining = Math.ceil(
            (
              expiryDate.getTime() -
              Date.now()
            ) /
            (1000 * 60 * 60 * 24)
          );

          // --- SSL WARNING LOGIC ---

          // 30 Day Alert
          if (
            daysRemaining <= 30 &&
            daysRemaining > 14 &&
            monitor.ssl_alert_stage !== 30
          ) {
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

            await supabase
              .from('monitors')
              .update({
                ssl_alert_stage: 30,
              })
              .eq('id', monitor.id);
          }

          // 14 Day Alert
          if (
            daysRemaining <= 14 &&
            daysRemaining > 7 &&
            monitor.ssl_alert_stage !== 14
          ) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `
                <h2>SSL Expiry Warning</h2>
                <p>SSL expires in <b>${daysRemaining} days</b>.</p>
              `,
            });

            await supabase
              .from('monitors')
              .update({
                ssl_alert_stage: 14,
              })
              .eq('id', monitor.id);
          }

          // 7 Day Alert
          if (
            daysRemaining <= 7 &&
            daysRemaining > 1 &&
            monitor.ssl_alert_stage !== 7
          ) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `⚠️ SSL Expiry Warning - ${monitor.name}`,
              html: `
                <h2>SSL Expiry Warning</h2>
                <p>SSL expires in <b>${daysRemaining} days</b>.</p>
              `,
            });

            await supabase
              .from('monitors')
              .update({
                ssl_alert_stage: 7,
              })
              .eq('id', monitor.id);
          }

          // 1 Day Alert
          if (
            daysRemaining <= 1 &&
            daysRemaining > 0 &&
            monitor.ssl_alert_stage !== 1
          ) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `🚨 SSL Expiring Tomorrow - ${monitor.name}`,
              html: `
                <h2>SSL Expiring Soon</h2>
                <p>Your SSL certificate expires in less than 24 hours.</p>
              `,
            });

            await supabase
              .from('monitors')
              .update({
                ssl_alert_stage: 1,
              })
              .eq('id', monitor.id);
          }

          // Expired Alert
          if (
            daysRemaining <= 0 &&
            monitor.ssl_alert_stage !== 0
          ) {
            await resend.emails.send({
              from: 'InfraMind <onboarding@resend.dev>',
              to: monitor.alert_email,
              subject: `🚨 SSL Certificate Expired - ${monitor.name}`,
              html: `
                <h2>SSL Certificate Expired</h2>
                <p>Your SSL certificate has expired.</p>
                <p>URL: ${monitor.target_url}</p>
              `,
            });

            await supabase
              .from('monitors')
              .update({
                ssl_alert_stage: 0,
              })
              .eq('id', monitor.id);
          }

          // Reset Logic (handles certificate renewals)
          if (
            daysRemaining > 30 &&
            monitor.ssl_alert_stage !== null
          ) {
            await supabase
              .from('monitors')
              .update({
                ssl_alert_stage: null,
              })
              .eq('id', monitor.id);
          }

          // --- END WARNING LOGIC ---

          await supabase
            .from('monitors')
            .update({
              ssl_expiry_date: expiryDate,
              ssl_days_remaining: daysRemaining,
            })
            .eq('id', monitor.id);

          newStatus =
            daysRemaining > 0
              ? 'online'
              : 'offline';

          console.log(
            hostname,
            expiryDate,
            daysRemaining
          );
        } catch (sslError) {
          console.error(
            'SSL CHECK FAILED:',
            sslError
          );

          newStatus = 'offline';
        }

        // DOWN ALERT
        if (monitor.status === 'online' && newStatus === 'offline') {
          console.log('🚨 SENDING DOWN ALERT EMAIL');

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
            subject: `🚨 SSL Alert: ${monitor.name} is DOWN`,
            html: `
              <h2>🚨 SSL Down Alert</h2>
              <p><b>${monitor.name}</b> SSL certificate is expired or unreachable.</p>
              <p>Type: SSL</p>
              <p>URL: ${monitor.target_url}</p>
              <p>Detected At: ${new Date().toLocaleString()}</p>
            `,
          });

          console.log('DOWN EMAIL RESULT:', JSON.stringify(emailResult));
        }

        // RECOVERY ALERT
        if (monitor.status === 'offline' && newStatus === 'online') {
          const { data: incident, error: incidentError } = await supabase
            .from('incidents')
            .select('*')
            .eq('monitor_id', monitor.id)
            .is('resolved_at', null)
            .maybeSingle();

          console.log('OPEN INCIDENT:', incident);
          console.log('OPEN INCIDENT ERROR:', incidentError);

          if (incident) {
            const resolvedAt = new Date();

            const durationSeconds = Math.floor(
              (resolvedAt.getTime() -
                new Date(incident.started_at).getTime()) / 1000
            );

            const { error: resolveError } = await supabase
              .from('incidents')
              .update({
                resolved_at: resolvedAt.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq('id', incident.id);

            if (resolveError) {
              console.error(
                'INCIDENT RESOLVE ERROR:',
                JSON.stringify(resolveError, null, 2)
              );
            }

            console.log('INCIDENT RESOLVED:', incident.id);
          }

          console.log('✅ SENDING RECOVERY EMAIL');

          const emailResult = await resend.emails.send({
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

          console.log('RECOVERY EMAIL RESULT:', JSON.stringify(emailResult));
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

        let newStatus = 'offline';

        if (monitor.type === 'website') {
          newStatus = response.ok
            ? 'online'
            : 'offline';
        }

        if (monitor.type === 'api') {
          newStatus =
            response.status === monitor.expected_status
              ? 'online'
              : 'offline';
        }

        console.log(
          monitor.name,
          monitor.type,
          response.status,
          monitor.expected_status,
          newStatus
        );

        let monitorLabel = 'Website';

        if (monitor.type === 'api') {
          monitorLabel = 'API';
        }

        // DOWN ALERT
        if (monitor.status === 'online' && newStatus === 'offline') {
          console.log('🚨 SENDING DOWN ALERT EMAIL');

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
            subject: `🚨 ${monitorLabel} Alert: ${monitor.name} is DOWN`,
            html: `
              <h2>🚨 ${monitorLabel} Down Alert</h2>
              <p><b>${monitor.name}</b> is currently offline.</p>
              <p>Type: ${monitorLabel}</p>
              <p>URL: ${monitor.target_url}</p>
              <p>Detected At: ${new Date().toLocaleString()}</p>
            `,
          });

          console.log('DOWN EMAIL RESULT:', JSON.stringify(emailResult));
        }

        // RECOVERY ALERT
        if (monitor.status === 'offline' && newStatus === 'online') {
          const { data: incident, error: incidentError } = await supabase
            .from('incidents')
            .select('*')
            .eq('monitor_id', monitor.id)
            .is('resolved_at', null)
            .maybeSingle();

          console.log('OPEN INCIDENT:', incident);
          console.log('OPEN INCIDENT ERROR:', incidentError);

          if (incident) {
            const resolvedAt = new Date();

            console.log('STARTED AT:', incident.started_at);
            console.log('RESOLVED AT:', resolvedAt.toISOString());

            const durationSeconds = Math.floor(
              (resolvedAt.getTime() -
                new Date(incident.started_at).getTime()) / 1000
            );

            console.log('DURATION SECONDS:', durationSeconds);

            const { error: resolveError } = await supabase
              .from('incidents')
              .update({
                resolved_at: resolvedAt.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq('id', incident.id);

            if (resolveError) {
              console.error(
                'INCIDENT RESOLVE ERROR:',
                JSON.stringify(resolveError, null, 2)
              );
            }

            console.log('INCIDENT RESOLVED:', incident.id);
          }

          console.log('✅ SENDING RECOVERY EMAIL');

          const emailResult = await resend.emails.send({
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

          console.log('RECOVERY EMAIL RESULT:', JSON.stringify(emailResult));
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
      console.error(
        'CHECK ERROR FULL:',
        JSON.stringify(err, null, 2)
      );

      console.error(
        'CHECK ERROR MESSAGE:',
        err?.message
      );

      console.error(
        'CHECK ERROR STACK:',
        err?.stack
      );

      if (monitor.status === 'online') {
        let monitorLabel = 'Website';

        if (monitor.type === 'api') {
          monitorLabel = 'API';
        }

        if (monitor.type === 'ssl') {
          monitorLabel = 'SSL';
        }

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

  return NextResponse.json({
    success: true,
  });
}