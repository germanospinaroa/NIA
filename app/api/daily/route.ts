import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveIntervention } from '@/lib/server/intervention';

function localDate(timezone: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profileError) return NextResponse.json({ error: 'profile_unavailable' }, { status: 500 });
  const date = localDate(profile.timezone);
  const { data: existing } = await supabase.from('interactions').select('*').eq('user_id', user.id).eq('interaction_type', 'daily_message').eq('local_date', date).maybeSingle();
  if (existing) return NextResponse.json({ interaction: existing, local_date: date });
  let result;
  try { result = await resolveIntervention(supabase, user.id, 'intention'); } catch { return NextResponse.json({ error: 'daily_unavailable' }, { status: 500 }); }
  const { data: created, error } = await supabase.from('interactions').insert({ user_id: user.id, interaction_type: 'daily_message', direction_key: profile.direction_key, content: result.intervention.text, local_date: date }).select('*').single();
  if (!error) return NextResponse.json({ interaction: created, local_date: date });
  const { data: winner } = await supabase.from('interactions').select('*').eq('user_id', user.id).eq('interaction_type', 'daily_message').eq('local_date', date).single();
  if (winner) return NextResponse.json({ interaction: winner, local_date: date });
  return NextResponse.json({ error: 'daily_unavailable' }, { status: 500 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { feedback_type } = await request.json();
  const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single();
  const { data, error } = await supabase.from('interactions').update({ feedback_type }).eq('user_id', user.id).eq('interaction_type', 'daily_message').eq('local_date', localDate(profile?.timezone || 'UTC')).select('*').single();
  if (error) return NextResponse.json({ error: 'daily_feedback_failed' }, { status: 400 });
  return NextResponse.json({ interaction: data });
}
