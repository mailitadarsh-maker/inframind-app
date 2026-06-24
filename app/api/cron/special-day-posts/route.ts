import { NextResponse } from 'next/server';
import { cronLog } from '@/lib/cron-logger';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Special days database
const SPECIAL_DAYS: { name: string; month: number; day: number; region: string }[] = [
  // Global
  { name: "New Year's Day", month: 1, day: 1, region: 'global' },
  { name: "Valentine's Day", month: 2, day: 14, region: 'global' },
  { name: "International Women's Day", month: 3, day: 8, region: 'global' },
  { name: "World Earth Day", month: 4, day: 22, region: 'global' },
  { name: "World Environment Day", month: 6, day: 5, region: 'global' },
  { name: "Friendship Day", month: 8, day: 4, region: 'global' },
  { name: "World Mental Health Day", month: 10, day: 10, region: 'global' },
  { name: "Christmas Day", month: 12, day: 25, region: 'global' },
  { name: "New Year's Eve", month: 12, day: 31, region: 'global' },
  // India
  { name: "Republic Day", month: 1, day: 26, region: 'india' },
  { name: "Holi", month: 3, day: 14, region: 'india' },
  { name: "Independence Day India", month: 8, day: 15, region: 'india' },
  { name: "Gandhi Jayanti", month: 10, day: 2, region: 'india' },
  { name: "Diwali", month: 10, day: 20, region: 'india' },
  // Middle East
  { name: "UAE National Day", month: 12, day: 2, region: 'middle_east' },
  { name: "Saudi National Day", month: 9, day: 23, region: 'middle_east' },
  // US
  { name: "Independence Day US", month: 7, day: 4, region: 'us' },
  { name: "Thanksgiving", month: 11, day: 28, region: 'us' },
  { name: "Black Friday", month: 11, day: 29, region: 'us' },
  // Europe
  { name: "Europe Day", month: 5, day: 9, region: 'europe' },
];

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + 3); // 3 days ahead

  const targetMonth = targetDate.getMonth() + 1;
  const targetDay = targetDate.getDate();

  const upcoming = SPECIAL_DAYS.filter(d => d.month === targetMonth && d.day === targetDay);
  if (upcoming.length === 0) return NextResponse.json({ message: 'No special days in 3 days' });

  // Get all active clients
  const { data: clients } = await supabase.from('clients').select('*').not('plan', 'eq', null);
  if (!clients?.length) return NextResponse.json({ message: 'No clients' });

  let generated = 0;
  for (const client of clients) {
    const clientRegion = client.region || 'global';
    const relevantDays = upcoming.filter(d => d.region === 'global' || d.region === clientRegion);
    
    for (const day of relevantDays) {
      // Check if already generated for this client+day
      const { count } = await supabase.from('social_posts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .eq('suggestion', day.name)
        .gte('created_at', new Date(now.getFullYear(), 0, 1).toISOString());
      
      if ((count || 0) > 0) continue;

      // Generate post for instagram by default
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://blog.goldvault.app'}/api/client/generate-post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: client.id,
            platform: 'instagram',
            format: 'post',
            special_day: day.name,
          }),
        });
        generated++;
        await cronLog('special-day-posts', 'success', `${day.name} post generated`, client.id, client.company_name, { day: day.name, platform: 'instagram' });
      } catch(e: any) { console.log(`Failed for ${client.company_name}:`, e); await cronLog('special-day-posts', 'failed', e.message || 'Unknown error', client.id, client.company_name, { day: day.name }); }
    }
  }

  return NextResponse.json({ message: `Generated ${generated} special day posts` });
}
