import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { intentionLabel, invalidIntention, isValidIntention, validCustomIntention } from '@/lib/intention';
import { isInvalidPreferredName } from '@/lib/profile-name';

const allowed = new Set([
  'first_name', 'last_name', 'preferred_name', 'direction_key', 'direction_text', 'voice_style', 'communication_preference', 'message_frequency', 'message_time_1', 'message_time_2', 'timezone', 'country_code',
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

  for (const key of ['first_name', 'last_name', 'preferred_name']) {
    if (!(key in values)) continue;
    if (values[key] !== null && typeof values[key] !== 'string') return NextResponse.json({ error: 'invalid_identity_field' }, { status: 422 });
    if (typeof values[key] === 'string') {
      values[key] = values[key].trim().replace(/\s+/g, ' ');
      if (isInvalidPreferredName(values[key])) return NextResponse.json({ error: 'invalid_identity_field' }, { status: 422 });
    }
  }

  if ('country_code' in values && (typeof values.country_code !== 'string' || !/^[A-Z]{2}$/.test(values.country_code))) {
    return NextResponse.json({ error: 'invalid_country_code' }, { status: 422 });
  }

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
      const displayText = validCustomIntention(text) ? text : intentionLabel(key);
      values.direction_text = displayText;
      values.desired_change_original = displayText;
      values.desired_change_summary = displayText;
    } else if (!validCustomIntention(text)) {
      return NextResponse.json({ error: 'invalid_custom_intention' }, { status: 422 });
    }
  } else if ('direction_text' in values || 'desired_change_original' in values) {
    const text = values.direction_text ?? values.desired_change_original;
    if (invalidIntention(text)) return NextResponse.json({ error: 'invalid_intention' }, { status: 422 });
  }

  const { data, error } = await supabase.from('profiles').update(values).eq('id', user.id).select('*').single();
  if (error) {
    console.error('[profile PATCH] update failed', {
      userId: user.id,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json({ error: 'profile_update_failed' }, { status: 400 });
  }
  return NextResponse.json({ profile: data });
}
