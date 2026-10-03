import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CalibrationRequiredError } from '@/lib/server/intervention';
import { getOrCreateDailyInteraction } from '@/lib/server/daily-message';
import { localDate } from '@/lib/server/whatsapp-schedule';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const result = await getOrCreateDailyInteraction(supabase, user.id, 'web');
    return NextResponse.json({ interaction: result.interaction, local_date: result.localDate });
  } catch (error) {
    if (error instanceof CalibrationRequiredError) return NextResponse.json({ status: 'calibration_required', calibration: error.calibration });
    if (error instanceof Error && error.message === 'valid_intention_required') return NextResponse.json({ status: 'intention_required', error: 'valid_intention_required' }, { status: 422 });
    return NextResponse.json({ error: error instanceof Error && error.message === 'profile_unavailable' ? 'profile_unavailable' : 'daily_unavailable' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const feedback_type = typeof body.feedback_type === 'string' ? body.feedback_type : '';
  const feedback_note = typeof body.feedback_note === 'string' ? body.feedback_note.trim().slice(0, 500) : null;
  if (!['serves', 'different', 'not_me', 'relevant', 'almost', 'not_relevant'].includes(feedback_type)) return NextResponse.json({ error: 'invalid_feedback' }, { status: 400 });
  const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single();
  const { data, error } = await supabase.from('interactions').update({ feedback_type, feedback_note: feedback_type === 'not_me' ? feedback_note : null }).eq('user_id', user.id).eq('interaction_type', 'daily_message').eq('local_date', localDate(profile?.timezone || 'UTC')).select('*').single();
  if (error) return NextResponse.json({ error: 'daily_feedback_failed' }, { status: 400 });
  return NextResponse.json({ interaction: data });
}
