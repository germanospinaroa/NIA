import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { intentionLabel, invalidIntention, isValidIntention, validCustomIntention } from '@/lib/intention';

const allowed = new Set([
  'first_name', 'direction_key', 'direction_text', 'voice_style', 'message_frequency', 'message_time_1', 'message_time_2', 'timezone',
  'whatsapp_enabled', 'whatsapp_phone', 'desired_change_original', 'desired_change_summary', 'desired_change_concepts', 'desired_change_language',
  'desired_change_started_at', 'desired_change_last_confirmed_at', 'desired_change_status', 'current_context_original', 'current_context_summary',
  'current_context_domain', 'current_context_started_at', 'current_context_last_confirmed_at', 'current_context_status', 'learning_profile',
]);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) return NextResponse.json({ error: 'profile_unavailable' }, { status: 500 });
  return NextResponse.json({ profile: data, email: user.email });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid_profile_payload' }, { status: 400 });
  const values = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.has(key)));

  if ('direction_key' in values) {
    const key = typeof values.direction_key === 'string' ? values.direction_key : null;
    const text = typeof values.direction_text === 'string' ? values.direction_text : null;
    if (key === 'intention_unclear') {
      values.direction_text = null;
      values.desired_change_original = null;
      values.desired_change_summary = null;
      values.desired_change_status = 'active';
    } else if (!isValidIntention(key, text)) {
      return NextResponse.json({ error: 'invalid_intention' }, { status: 422 });
    } else if (key !== 'custom') {
      values.direction_text = intentionLabel(key);
      values.desired_change_original = intentionLabel(key);
      values.desired_change_summary = intentionLabel(key);
    } else if (!validCustomIntention(text)) {
      return NextResponse.json({ error: 'invalid_custom_intention' }, { status: 422 });
    }
  } else if ('direction_text' in values || 'desired_change_original' in values) {
    const text = values.direction_text ?? values.desired_change_original;
    if (invalidIntention(text)) return NextResponse.json({ error: 'invalid_intention' }, { status: 422 });
  }

  const { data, error } = await supabase.from('profiles').upsert({ id: user.id, ...values }, { onConflict: 'id' }).select('*').single();
  if (error) return NextResponse.json({ error: 'profile_update_failed' }, { status: 400 });
  return NextResponse.json({ profile: data });
}
