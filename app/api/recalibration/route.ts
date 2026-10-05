import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { contextStatusForDays } from '@/lib/intervention-engine';
import { recordEvent } from '@/lib/server/operational-observability';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: profile, error } = await supabase.from('profiles').select('desired_change_started_at,desired_change_last_confirmed_at,current_context_original,current_context_started_at').eq('id', user.id).single();
  if (error) return NextResponse.json({ error: 'profile_unavailable' }, { status: 500 });
  return NextResponse.json({ due: contextStatusForDays(profile.desired_change_last_confirmed_at, profile.desired_change_started_at), question: '¿Esto sigue siendo algo que quieres cambiar o vivir de otra manera?' });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json();
  const now = new Date().toISOString();
  await recordEvent(supabase, { userId: user.id, eventType: 'recalibration_started', entityType: 'profile', entityId: user.id, metadata: { option: body.option } });
  if (body.option === 'still_important') {
    const { data, error } = await supabase.from('profiles').update({ desired_change_last_confirmed_at: now, current_context_last_confirmed_at: now }).eq('id', user.id).select('*').single();
    if (error) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    await recordEvent(supabase, { userId: user.id, eventType: 'recalibration_completed', entityType: 'profile', entityId: user.id, metadata: { option: body.option } });
    return NextResponse.json({ profile: data, next: 'continue' });
  }
  if (body.option === 'context_changed' && typeof body.context_original === 'string' && body.context_original.trim()) {
    const { error: endError } = await supabase.from('context_history').update({ status: 'ended', ended_at: now }).eq('user_id', user.id).eq('status', 'active');
    if (endError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    const { error: insertError } = await supabase.from('context_history').insert({ user_id: user.id, context_original: body.context_original.trim(), source: 'recalibration', status: 'active', started_at: now });
    if (insertError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    const { data, error } = await supabase.from('profiles').update({ current_context_original: body.context_original.trim(), current_context_started_at: now, current_context_last_confirmed_at: now, current_context_status: 'active' }).eq('id', user.id).select('*').single();
    if (error) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    const { error: signalError } = await supabase.from('learning_signals').insert({ user_id: user.id, signal: 'current_context_status', value: { value: 'confirmed', source: 'recalibration' }, confidence: 1, source: 'recalibration' });
    if (signalError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    await recordEvent(supabase, { userId: user.id, eventType: 'context_changed', entityType: 'profile', entityId: user.id, metadata: { source: 'user_confirmed_context' } });
    await recordEvent(supabase, { userId: user.id, eventType: 'recalibration_completed', entityType: 'profile', entityId: user.id, metadata: { option: body.option } });
    return NextResponse.json({ profile: data, next: 'continue' });
  }
  if (body.option === 'new_change' && typeof body.desired_change_original === 'string' && body.desired_change_original.trim()) {
    const { data: current } = await supabase.from('profiles').select('desired_change_original,current_context_original').eq('id', user.id).single();
    const { error: endHistoryError } = await supabase.from('desired_change_history').update({ status: 'ended', ended_at: now }).eq('user_id', user.id).eq('status', 'active');
    if (endHistoryError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    if (current?.desired_change_original) {
      const { error: previousError } = await supabase.from('desired_change_history').insert({ user_id: user.id, desired_change_original: current.desired_change_original, desired_change_summary: current.desired_change_original.slice(0, 180), status: 'ended', ended_at: now });
      if (previousError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    }
    const { data, error } = await supabase.from('profiles').update({ desired_change_original: body.desired_change_original.trim(), desired_change_summary: body.desired_change_original.trim().slice(0, 180), desired_change_started_at: now, desired_change_last_confirmed_at: now, desired_change_status: 'active', current_context_original: null, current_context_status: 'changed' }).eq('id', user.id).select('*').single();
    if (error) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    const { error: activeHistoryError } = await supabase.from('desired_change_history').insert({ user_id: user.id, desired_change_original: body.desired_change_original.trim(), desired_change_summary: body.desired_change_original.trim().slice(0, 180), status: 'active', started_at: now });
    if (activeHistoryError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    const { error: signalError } = await supabase.from('learning_signals').insert({ user_id: user.id, signal: 'desired_change_status', value: { value: 'changed', source: 'recalibration' }, confidence: 1, source: 'recalibration' });
    if (signalError) return NextResponse.json({ error: 'recalibration_save_failed' }, { status: 400 });
    if (current?.desired_change_original) await supabase.from('context_history').insert({ user_id: user.id, context_original: current.current_context_original || 'contexto anterior', source: 'desired_change_changed', status: 'archived', ended_at: now });
    await recordEvent(supabase, { userId: user.id, eventType: 'desired_change_changed', entityType: 'profile', entityId: user.id, metadata: { source: 'user_confirmed_desired_change' } });
    await recordEvent(supabase, { userId: user.id, eventType: 'recalibration_completed', entityType: 'profile', entityId: user.id, metadata: { option: body.option } });
    return NextResponse.json({ profile: data, next: 'continue' });
  }
  return NextResponse.json({ error: 'invalid_recalibration' }, { status: 400 });
}
