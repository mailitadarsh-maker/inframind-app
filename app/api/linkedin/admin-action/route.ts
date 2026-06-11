import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, action, adminNote } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      );
    }

    // Fetch user email for notifications
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError) {
      console.log('USER FETCH ERROR:', userError);
    }

    const userEmail = userData?.user?.email;

    if (action === 'approve') {
      console.log('APPROVE USER:', userId);

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('max_monitors, trial_ends_at')
        .eq('id', userId)
        .single();

      console.log('PROFILE:', profile);
      console.log('FETCH ERROR:', fetchError);

      if (fetchError) throw fetchError;

      const newMonitorLimit = (profile.max_monitors || 1) + 10;

      // Fallback to today if trial_ends_at is null
      const trialEnd = profile.trial_ends_at
        ? new Date(profile.trial_ends_at)
        : new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      console.log('NEW TRIAL END:', trialEnd.toISOString());

      const finalNote = adminNote || 'Reward approved.';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          linkedin_reward_claimed: true,
          linkedin_reward_status: 'approved',
          linkedin_reward_claimed_at: new Date().toISOString(),
          linkedin_admin_note: finalNote,
          max_monitors: newMonitorLimit,
          trial_ends_at: trialEnd.toISOString(),
        })
        .eq('id', userId);

      console.log('UPDATE ERROR:', updateError);

      if (updateError) throw updateError;

      // Send approval email
      if (userEmail) {
        const emailHtml = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #09090f; color: #e2e6f0; border-radius: 12px;">
            <h2 style="color: #34d399; margin-bottom: 16px;">🎉 Your LinkedIn Reward Has Been Approved!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #c4c9d8;">
              Great news! Your LinkedIn post submission has been verified and approved.
            </p>
            <div style="background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); border-radius: 10px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #34d399; font-weight: 600;">
                +14 extra trial days and +10 monitor slots have been added to your account.
              </p>
            </div>
            ${finalNote ? `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;"><strong style="color: #c4c9d8;">Note from our team:</strong> ${finalNote}</p>
            </div>` : ''}
            <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
              Thanks for spreading the word about InfraMind!
            </p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: 'InfraMind <alerts@yourdomain.com>',
            to: userEmail,
            subject: '🎉 Your InfraMind LinkedIn Reward Has Been Approved',
            html: emailHtml,
          });
        } catch (emailErr) {
          console.error('EMAIL SEND ERROR (approve):', emailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Reward approved successfully',
      });
    }

    if (action === 'reject') {
      const finalNote =
        adminNote ||
        'LinkedIn post could not be verified. Please submit a valid public post.';

      const { error } = await supabase
        .from('profiles')
        .update({
          linkedin_reward_status: 'rejected',
          linkedin_admin_note: finalNote,
        })
        .eq('id', userId);

      if (error) throw error;

      // Send rejection email
      if (userEmail) {
        const rejectionHtml = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #09090f; color: #e2e6f0; border-radius: 12px;">
            <h2 style="color: #f87171; margin-bottom: 16px;">LinkedIn Reward Submission Update</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #c4c9d8;">
              We reviewed your LinkedIn post submission, but unfortunately it could not be approved at this time.
            </p>
            <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 14px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #fca5a5;"><strong>Reason:</strong> ${finalNote}</p>
            </div>
            <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
              You're welcome to submit a new post that meets our requirements from your dashboard.
            </p>
          </div>
        `;

        try {
          await resend.emails.send({
            from: 'InfraMind <alerts@yourdomain.com>',
            to: userEmail,
            subject: 'InfraMind LinkedIn Reward Submission Update',
            html: rejectionHtml,
          });
        } catch (emailErr) {
          console.error('EMAIL SEND ERROR (reject):', emailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Reward rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}