import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendBlogReadyEmail(clientRecord: { id: string; user_id: string; company_name: string }, blogTitle: string) {
  try {
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(clientRecord.user_id);
    const email = userData?.user?.email;

    if (userErr || !email) {
      console.error('sendBlogReadyEmail: could not resolve email for user_id', clientRecord.user_id, userErr);
      return;
    }

    const reviewUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://inframindhq.online') + '/dashboard/client/blog';

    await resend.emails.send({
      from: 'InfraMind <alert@inframindhq.online>',
      to: email,
      subject: `New blog ready for review: ${blogTitle}`,
      html: `
        <h2>New blog post ready for your review</h2>
        <p>Hi ${clientRecord.company_name || 'there'},</p>
        <p>A new blog post has just been generated for you:</p>
        <p style="font-size:16px;font-weight:600;">${blogTitle}</p>
        <p>Log in to your dashboard to review and approve it:</p>
        <p><a href="${reviewUrl}" style="background:#4ade80;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Review Blog</a></p>
        <p style="color:#888;font-size:12px;">InfraMind · Blog-as-a-Service</p>
      `,
    });
  } catch (e) {
    // Never let an email failure break blog generation
    console.error('sendBlogReadyEmail failed:', e);
  }
}
