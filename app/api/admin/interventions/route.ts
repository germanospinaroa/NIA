import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAudit } from '@/lib/server/operational-observability';
import { authDirectory, parseAdminPeriod, parseLimit, parseOffset } from '@/lib/server/admin-data';

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const url = new URL(request.url);
  const period = parseAdminPeriod(url);
  const limit = parseLimit(url.searchParams.get('limit'), 25);
  const offset = parseOffset(url.searchParams.get('offset'));
  const userId = url.searchParams.get('user_id');
  const channel = url.searchParams.get('channel');
  const functionFilter = url.searchParams.get('function');
  const status = url.searchParams.get('status');
  const admin = createAdminClient();
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_interventions', targetType: 'intervention', metadata: { period: period.key, limit, offset } });
  const [{ data: interventions, error, count }, { data: candidates }, { data: feedback }, { data: learning }, { data: history }, { data: desiredHistory }] = await Promise.all([
    (() => { let query = admin.from('interventions').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1).gte('created_at', period.from).lt('created_at', period.to); if (userId) query = query.eq('user_id', userId); if (channel) query = query.eq('channel', channel); if (functionFilter) query = query.eq('function', functionFilter); if (status) query = query.eq('status', status); return query; })(),
    admin.from('intervention_candidates').select('*').order('created_at', { ascending: false }).limit(300),
    admin.from('intervention_feedback').select('*').order('created_at', { ascending: false }).limit(100),
    admin.from('learning_signals').select('*').order('created_at', { ascending: false }).limit(100),
    admin.from('context_history').select('*').order('created_at', { ascending: false }).limit(100),
    admin.from('desired_change_history').select('*').order('created_at', { ascending: false }).limit(100),
  ]);
  if (error) return NextResponse.json({ error: 'audit_unavailable' }, { status: 500 });
  const rows = interventions ?? [];
  const userIds = [...new Set([...rows, ...(candidates ?? []), ...(feedback ?? []), ...(learning ?? []), ...(history ?? []), ...(desiredHistory ?? [])].map(row => row.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length ? await admin.from('profiles').select('id,first_name,desired_change_original,current_context_original').in('id', userIds) : { data: [] };
  const authUsers = userIds.length ? await authDirectory(admin, userIds) : new Map();
  const profileByUser = new Map((profiles ?? []).map(profile => [profile.id, profile]));
  const authByUser = authUsers;
  const enriched = rows.map(row => ({ ...row, profile: { ...(profileByUser.get(row.user_id) ?? {}), ...(authByUser.get(row.user_id) ?? {}) }, candidates: (candidates ?? []).filter(candidate => candidate.intervention_id === row.id), feedback: (feedback ?? []).filter(item => item.intervention_id === row.id), learning: (learning ?? []).filter(item => item.user_id === row.user_id), history: (history ?? []).filter(item => item.user_id === row.user_id), desiredHistory: (desiredHistory ?? []).filter(item => item.user_id === row.user_id) }));
  return NextResponse.json({ interventions: enriched, candidates: candidates ?? [], feedback: feedback ?? [], learning: learning ?? [], history: history ?? [], desiredHistory: desiredHistory ?? [], profiles: profiles ?? [], authUsers: [...authByUser.values()], pagination: { limit, offset, total: count ?? 0 }, period });
}
