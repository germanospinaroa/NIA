import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveIntervention } from '@/lib/server/intervention';

export async function GET() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 }); const { data, error } = await supabase.from('interactions').select('*').order('created_at', { ascending: false }).limit(100); if (error) return NextResponse.json({ error: 'interactions_unavailable' }, { status: 500 }); return NextResponse.json({ interactions: data }); }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json();
  if (body.interaction_type !== 'nia_point' || !body.context_key) return NextResponse.json({ error: 'invalid_interaction' }, { status: 400 });
  let result;
  try { result = await resolveIntervention(supabase, user.id, body.context_key, 'web'); } catch { return NextResponse.json({ error: 'intervention_unavailable' }, { status: 503 }); }
  const { data, error } = await supabase.from('interactions').insert({ user_id: user.id, interaction_type: 'nia_point', context_key: body.context_key, direction_key: body.direction_key ?? null, content: result.intervention.text, feedback_type: body.feedback_type ?? null }).select('*').single();
  if (error) return NextResponse.json({ error: 'interaction_save_failed' }, { status: 400 });
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
  if (body.intervention_id && body.question && body.dimension) {
    const learning = body.learning_signal ?? null;
    await supabase.from('intervention_feedback').insert({ intervention_id: body.intervention_id, user_id: user.id, question: body.question, dimension: body.dimension, options: body.options ?? [], selected_option: body.feedback_type, learning_signal: learning });
    if (learning) await supabase.from('learning_signals').insert({ user_id: user.id, signal: learning.signal, value: learning, confidence: learning.confidence ?? null, source: 'intervention_feedback' });
  }
  return NextResponse.json({ interaction: data });
}
