import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAudit } from '@/lib/server/operational-observability';
import { parseAdminPeriod, parseLimit, parseOffset } from '@/lib/server/admin-data';

const resources = ['execution_runs', 'generation_attempts', 'execution_provider_calls', 'event_log'] as const;
type Resource = typeof resources[number];

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const url = new URL(request.url);
  const resource = (url.searchParams.get('resource') ?? 'execution_runs') as Resource;
  if (!resources.includes(resource)) return NextResponse.json({ error: 'invalid_resource' }, { status: 400 });
  const period = parseAdminPeriod(url);
  const limit = parseLimit(url.searchParams.get('limit'), 50);
  const offset = parseOffset(url.searchParams.get('offset'));
  const admin = createAdminClient();
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_operations', targetType: resource, metadata: { limit, offset, period: period.key } });
  let query = admin.from(resource).select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  const userId = url.searchParams.get('user_id');
  const executionId = url.searchParams.get('execution_run_id');
  const eventType = url.searchParams.get('event_type');
  const status = url.searchParams.get('status');
  const dateColumn = resource === 'execution_runs' ? 'started_at' : resource === 'event_log' ? 'occurred_at' : 'created_at';
  query = query.gte(dateColumn, period.from).lt(dateColumn, period.to);
  if (userId && (resource === 'execution_runs' || resource === 'event_log')) query = query.eq('user_id', userId);
  if (userId && resource !== 'execution_runs' && resource !== 'event_log') return NextResponse.json({ error: 'user_filter_requires_execution_run_id' }, { status: 400 });
  if (executionId && resource !== 'execution_runs') query = query.eq('execution_run_id', executionId);
  if (eventType && resource === 'event_log') query = query.eq('event_type', eventType);
  if (status && resource === 'execution_runs') query = query.eq('status', status);
  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: 'operations_unavailable' }, { status: 500 });
  return NextResponse.json({ resource, data: data ?? [], pagination: { limit, offset, total: count ?? 0 }, period });
}
