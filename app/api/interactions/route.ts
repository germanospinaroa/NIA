import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CalibrationRequiredError, resolveIntervention } from '@/lib/server/intervention';
import { recordEvent, startExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';

export async function GET() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); const { data, error } = await supabase.from('interactions').select('*').order('created_at', { ascending: false }).limit(100); if (error) return NextResponse.json({ error: 'interactions_unavailable' }, { status: 500 }); return NextResponse.json({ interactions: data }); }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json();
  if (body.interaction_type !== 'nia_point' || !body.context_key) return NextResponse.json({ error: 'invalid_interaction' }, { status: 400 });
  const idempotencyKey = request.headers.get('idempotency-key') || body.idempotency_key || undefined;
  let execution;
  try { execution = await startExecutionRun(supabase, { userId: user.id, channel: 'web', triggerSource: 'nia_point', idempotencyKey }); } catch { return NextResponse.json({ error: 'intervention_unavailable' }, { status: 503 }); }
  let result;
  try { result = await resolveIntervention(supabase, user.id, body.context_key, 'web', idempotencyKey, execution, { writerVersion: 'v2' }); } catch (error) {
    await updateExecutionRun(supabase, execution, { status: error instanceof CalibrationRequiredError ? 'failed' : error instanceof Error && ['no_approved_intervention', 'no_approved_intervention_after_repair'].includes(error.message) ? 'no_approved_intervention' : 'failed', failure: error });
    if (error instanceof CalibrationRequiredError) {
      await recordEvent(supabase, { userId: user.id, eventType: 'recalibration_started', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { reason: error.calibration.reason } });
      return NextResponse.json({ status: 'calibration_required', calibration: error.calibration });
    }
    await recordEvent(supabase, { userId: user.id, eventType: 'intervention_failed', entityType: 'execution_run', entityId: execution.executionId, executionRunId: execution.executionId, metadata: { error: error instanceof Error ? error.message : String(error) } });
    return NextResponse.json({ error: 'intervention_unavailable' }, { status: 503 });
  }
  const { data, error } = await supabase.from('interactions').insert({ user_id: user.id, interaction_type: 'nia_point', context_key: body.context_key, direction_key: body.direction_key ?? null, content: result.intervention.text, feedback_type: body.feedback_type ?? null }).select('*').single();
  if (error) {
    await updateExecutionRun(supabase, execution, { status: 'failed', interventionId: result.interventionId, failure: new Error('persistence_error') });
    await recordEvent(supabase, { userId: user.id, eventType: 'intervention_failed', entityType: 'intervention', entityId: result.interventionId, executionRunId: execution.executionId, metadata: { error: 'interaction_persistence_failed' } });
    return NextResponse.json({ error: 'interaction_save_failed' }, { status: 400 });
  }
  return NextResponse.json({ interaction: data, intervention: result.intervention, intervention_id: result.interventionId, feedback: result.feedback });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.interaction_id || !body.feedback_type) return NextResponse.json({ error: 'invalid_feedback' }, { status: 400 });
  const { data, error } = await supabase.from('interactions').update({ feedback_type: body.feedback_type }).eq('id', body.interaction_id).eq('user_id', user.id).select('*').single();
  if (error) return NextResponse.json({ error: 'feedback_save_failed' }, { status: 400 });
  await recordEvent(supabase, { userId: user.id, eventType: 'feedback_received', entityType: 'interaction', entityId: body.interaction_id, metadata: { feedbackType: body.feedback_type, interventionId: body.intervention_id ?? null } });
  if (body.intervention_id && body.question && body.dimension) {
    const learning = body.learning_signal ?? null;
    await supabase.from('intervention_feedback').insert({ intervention_id: body.intervention_id, user_id: user.id, question: body.question, dimension: body.dimension, options: body.options ?? [], selected_option: body.feedback_type, learning_signal: learning });
    const { data: sourceIntervention } = await supabase.from('interventions').select('execution_context,concept,angle,function,structure,current_context_snapshot').eq('id', body.intervention_id).eq('user_id', user.id).maybeSingle();
    if (learning && sourceIntervention?.execution_context !== 'qa') {
      const value = { ...learning, concept: sourceIntervention?.concept, angle: sourceIntervention?.angle, function: sourceIntervention?.function, structure: sourceIntervention?.structure, context: sourceIntervention?.current_context_snapshot };
      const expiresAt = learning.signal === 'wording_quality' || learning.signal === 'angle_quality' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
      await supabase.from('learning_signals').insert({ user_id: user.id, signal: learning.signal, value, confidence: learning.confidence ?? null, source: 'intervention_feedback', expires_at: expiresAt });
      await recordEvent(supabase, { userId: user.id, eventType: 'learning_signal_created', entityType: 'intervention', entityId: body.intervention_id, metadata: { signal: learning.signal } });
    }
  }
  return NextResponse.json({ interaction: data });
}
