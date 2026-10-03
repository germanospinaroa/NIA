import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('profiles').select('learning_profile').eq('id', user.id).single();
  if (error) return NextResponse.json({ error: 'calibration_unavailable' }, { status: 500 });
  const calibration = data.learning_profile?.calibration?.status === 'calibration_required' ? data.learning_profile.calibration : null;
  return NextResponse.json({ status: calibration ? 'calibration_required' : 'ready', calibration });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json();
  const { data: profile, error: profileError } = await supabase.from('profiles').select('learning_profile').eq('id', user.id).single();
  if (profileError || !profile) return NextResponse.json({ error: 'profile_unavailable' }, { status: 500 });
  const calibration = profile.learning_profile?.calibration;
  if (!calibration || calibration.status !== 'calibration_required') return NextResponse.json({ error: 'calibration_not_required' }, { status: 409 });
  const option = Array.isArray(calibration.options) ? calibration.options.find((item: { id?: string }) => item.id === body.selected_option) : null;
  const context = typeof body.free_text === 'string' && body.free_text.trim() ? body.free_text.trim() : option?.context_value;
  if (!context || typeof context !== 'string') return NextResponse.json({ error: 'invalid_calibration_response' }, { status: 400 });
  const now = new Date().toISOString();
  const { error: historyError } = await supabase.from('context_history').update({ status: 'ended', ended_at: now }).eq('user_id', user.id).eq('status', 'active');
  if (historyError) return NextResponse.json({ error: 'calibration_save_failed' }, { status: 400 });
  const { error: insertError } = await supabase.from('context_history').insert({ user_id: user.id, context_original: context, source: 'calibration', status: 'active', started_at: now });
  if (insertError) return NextResponse.json({ error: 'calibration_save_failed' }, { status: 400 });
  const learningProfile = { ...(profile.learning_profile ?? {}), calibration: { ...calibration, status: 'resolved', resolved_at: now, response: context, selected_option: body.selected_option ?? null, free_text: typeof body.free_text === 'string' ? body.free_text.trim() : null } };
  const signalToResolve = calibration.reason === 'context_changed' ? 'current_context_status' : calibration.reason === 'desired_change_changed' ? 'desired_change_status' : null;
  if (signalToResolve) {
    const { error: signalError } = await supabase.from('learning_signals').update({ expires_at: now }).eq('user_id', user.id).eq('signal', signalToResolve).is('expires_at', null);
    if (signalError) return NextResponse.json({ error: 'calibration_save_failed' }, { status: 400 });
  }
  const { data: updated, error: updateError } = await supabase.from('profiles').update({ current_context_original: context, current_context_summary: context.slice(0, 180), current_context_started_at: now, current_context_last_confirmed_at: now, current_context_status: 'active', learning_profile: learningProfile }).eq('id', user.id).select('*').single();
  if (updateError) return NextResponse.json({ error: 'calibration_save_failed' }, { status: 400 });
  return NextResponse.json({ success: true, status: 'ready_to_generate', context, profile: updated });
}
