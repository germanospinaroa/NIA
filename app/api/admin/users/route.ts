import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { authDirectory, parseAdminPeriod, parseLimit, parseOffset } from '@/lib/server/admin-data';
import { recordAdminAudit } from '@/lib/server/operational-observability';
import { aggregateUserCosts, type CostCall, type CallCostRow } from '@/lib/server/cost-ledger';

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const admin = createAdminClient();
  const url = new URL(request.url);
  const period = parseAdminPeriod(url);
  const limit = parseLimit(url.searchParams.get('limit'));
  const offset = parseOffset(url.searchParams.get('offset'));
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_users', targetType: 'user', metadata: { search, period: period.key } });
  const directory = await authDirectory(admin);
  let users = [...directory.values()];
  if (search) users = users.filter(user => user.email?.toLowerCase().includes(search) || user.id.toLowerCase().includes(search));
  const ids = users.map(user => user.id);
  const [{ data: profiles }, { data: interventions }, { data: feedback }, { data: events }, { data: subscriptions }, { data: executions }] = await Promise.all([
    ids.length ? admin.from('profiles').select('id,first_name,desired_change_original,current_context_original').in('id', ids) : { data: [] },
    ids.length ? admin.from('interventions').select('user_id,created_at').in('user_id', ids).order('created_at', { ascending: false }).limit(5000) : { data: [] },
    ids.length ? admin.from('intervention_feedback').select('user_id').in('user_id', ids).limit(5000) : { data: [] },
    ids.length ? admin.from('event_log').select('user_id,occurred_at').in('user_id', ids).order('occurred_at', { ascending: false }).limit(5000) : { data: [] },
    ids.length ? admin.from('subscriptions').select('user_id,status,plan_key,current_period_end').in('user_id', ids) : { data: [] },
    ids.length ? admin.from('execution_runs').select('id,user_id').in('user_id', ids).limit(5000) : { data: [] },
  ]);
  const executionRows = executions ?? [];
  const executionIds = executionRows.map(row => row.id);
  const { data: providerCalls } = executionIds.length ? await admin.from('execution_provider_calls').select('id,execution_run_id,provider,model,operation,input_tokens,output_tokens,total_tokens,created_at').in('execution_run_id', executionIds).limit(10000) : { data: [] };
  const providerRows = providerCalls ?? [];
  const costResult = providerRows.length ? await admin.from('provider_call_costs').select('*').in('provider_call_id', providerRows.map(row => row.id)) : { data: [], error: null };
  const costRows = costResult.data ?? [];
  const profileMap = new Map((profiles ?? []).map(row => [row.id, row]));
  const subscriptionMap = new Map((subscriptions ?? []).map(row => [row.user_id, row]));
  const rows = users.map(user => {
    const userInterventions = (interventions ?? []).filter(row => row.user_id === user.id);
    const userFeedback = (feedback ?? []).filter(row => row.user_id === user.id);
    const userEvents = (events ?? []).filter(row => row.user_id === user.id);
    const userCalls = providerRows.filter(row => executionRows.some(execution => execution.id === row.execution_run_id && execution.user_id === user.id));
    const userCostRows = costRows.filter(row => userCalls.some(call => call.id === row.provider_call_id));
    const userCost = costResult.error || (userCalls.length > 0 && userCostRows.length < userCalls.length) ? { status: 'NOT AVAILABLE', reason: 'Hay llamadas de proveedor sin costo calculado todavía.' } : { status: 'available', ...aggregateUserCosts(userCalls as CostCall[], userCostRows as CallCostRow[]) };
    const lastActivity = [...userInterventions.map(row => row.created_at), ...userEvents.map(row => row.occurred_at)].sort().at(-1) ?? null;
    return { ...user, profile: profileMap.get(user.id) ?? null, last_activity: lastActivity, interventions: userInterventions.length, feedback: userFeedback.length, active: Boolean(lastActivity && lastActivity >= period.from), subscription: subscriptionMap.get(user.id) ?? null, whatsapp: 'NOT AVAILABLE', cost: userCost };
  }).sort((a, b) => String(b.last_activity ?? '').localeCompare(String(a.last_activity ?? '')));
  return NextResponse.json({ data: rows.slice(offset, offset + limit), pagination: { limit, offset, total: rows.length }, period });
}
