import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      );
    }

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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
  linkedin_reward_claimed: true,
  linkedin_reward_status: 'approved',
  linkedin_reward_claimed_at: new Date().toISOString(),
  linkedin_admin_note:
    'Verified successfully. 14 extra trial days have been added.',
  max_monitors: newMonitorLimit,
  trial_ends_at: trialEnd.toISOString(),
})
        .eq('id', userId);

      console.log('UPDATE ERROR:', updateError);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Reward approved successfully',
      });
    }
if (action === 'reject') {
  const { error } = await supabase
    .from('profiles')
    .update({
      linkedin_reward_status: 'rejected',
      linkedin_admin_note:
        'LinkedIn post could not be verified. Please submit a valid public post.',
    })
    .eq('id', userId);

  if (error) throw error;

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