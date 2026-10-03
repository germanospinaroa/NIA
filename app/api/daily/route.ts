import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CalibrationRequiredError, resolveIntervention } from '@/lib/server/intervention';
import { recordEvent, startExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';
import { intentionLabel, invalidIntention, validCustomIntention } from '@/lib/intention';
import { composeNiaMessage } from '@/lib/server/message-composer';

function localDate(timezone: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profileError) return NextResponse.json({ error: 'profile_unavailable' }, { status: 500 });
  const storedDirection = typeof profile.desired_change_original === 'string' ? profile.desired_change_original.trim() : typeof profile.direction_text === 'string' ? profile.direction_text.trim() : '';
  const direction = validCustomIntention(storedDirection) ? storedDirection : intentionLabel(profile.direction_key);
  if (!direction || invalidIntention(direction) || profile.direction_key === 'intention_unclear') return NextResponse.json({ status: 'intention_required', error: 'valid_intention_required' }, { status: 422 });
  const date = localDate(profile.timezone);
  const [{ data: existing }, { data: recent }] = await Promise.all([
    supabase.from('interactions').select('*').eq('user_id', user.id).eq('interaction_type', 'daily_message').eq('local_date', date).maybeSingle(),
    supabase.from('interactions').select('content').eq('user_id', user.id).eq('interaction_type', 'daily_message').order('created_at', { ascending: false }).limit(8),
  ]);
  if (existing) return NextResponse.json({ interaction: existing, local_date: date });
  const idempotencyKey = `daily:${date}`;
  let execution;
  try { execution = await startExecutionRun(supabase, { userId: user.id, channel: 'web', triggerSource: 'daily', idempotencyKey }); } catch { return NextResponse.json({ error: 'daily_unavailable' }, { status: 500 }); }
  let result;
  try {
    result = await resolveIntervention(supabase, user.id, 'intention', 'web', idempotencyKey, execution);
  } catch (error) {
    await updateExecutionRun(supabase, execution, { status: error instanceof CalibrationRequiredError ? 'failed' : error instanceof Error && error.message === 'no_approved_intervention' ? 'no_approved_intervention' : 'failed', failure: error });
    if (error instanceof CalibrationRequiredError) {
      await recordEvent(supabase, { userId: user.id, eventType: 'recalibration_started', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { reason: error.calibration.reason } });
      return NextResponse.json({ status: 'calibration_required', calibration: error.calibration });
    }
    await recordEvent(supabase, { userId: user.id, eventType: 'intervention_failed', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { error: error instanceof Error ? error.message : String(error) } });
    return NextResponse.json({ error: 'daily_unavailable' }, { status: 500 });
  }
  const message = composeNiaMessage({ content: result.intervention.text, firstName: typeof profile.first_name === 'string' ? profile.first_name : null, timezone: typeof profile.timezone === 'string' ? profile.timezone : null, userKey: user.id, recentContents: (recent ?? []).map(row => row.content).filter((value): value is string => typeof value === 'string') });
  const { data: created, error } = await supabase.from('interactions').insert({ user_id: user.id, interaction_type: 'daily_message', direction_key: profile.direction_key, content: message, local_date: date }).select('*').single();
  if (!error) return NextResponse.json({ interaction: created, local_date: date });
  await updateExecutionRun(supabase, execution, { status: 'failed', interventionId: result.interventionId, failure: new Error('persistence_error') });
  await recordEvent(supabase, { userId: user.id, eventType: 'intervention_failed', entityType: 'intervention', entityId: result.interventionId, executionRunId: execution.executionId, metadata: { error: 'interaction_persistence_failed' } });
  const { data: winner } = await supabase.from('interactions').select('*').eq('user_id', user.id).eq('interaction_type', 'daily_message').eq('local_date', date).single();
  if (winner) return NextResponse.json({ interaction: winner, local_date: date });
  return NextResponse.json({ error: 'daily_unavailable' }, { status: 500 });
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
