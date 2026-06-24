import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function cronLog(
  cronJob: string,
  status: 'success' | 'failed' | 'skipped',
  message: string,
  clientId?: string,
  clientName?: string,
  details?: Record<string, any>
) {
  await supabase.from('cron_logs').insert({
    cron_job: cronJob,
    client_id: clientId || null,
    client_name: clientName || null,
    status,
    message,
    details: details || null,
  });
}
