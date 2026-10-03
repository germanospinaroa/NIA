import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { aggregateDashboard } from '@/lib/server/admin-dashboard';
import { listAllAuthUsers, parseAdminPeriod } from '@/lib/server/admin-data';
import { recordAdminAudit } from '@/lib/server/operational-observability';
import { aggregateDashboardCost, type CallCostRow, type CostCall } from '@/lib/server/cost-ledger';

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const admin = createAdminClient();
  const period = parseAdminPeriod(new URL(request.url));
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_dashboard', targetType: 'dashboard', metadata: { period: period.key } });
  const inPeriod = <T extends { gte: (column: string, value: string) => T; lt: (column: string, value: string) => T }>(query: T, column: string): T => query.gte(column, period.from).lt(column, period.to);
  const [authUsers, executionsResult, attemptsResult, providerResult, interventionsResult, editorialResult, eventsResult, feedbackResult, learningResult, subscriptionsResult] = await Promise.all([
    listAllAuthUsers(admin),
    inPeriod(admin.from('execution_runs').select('id,user_id,status,duration_ms,failure_code,started_at'), 'started_at'),
    inPeriod(admin.from('generation_attempts').select('attempt_type,candidate_count,approved_candidate_count,rejection_count,duration_ms'), 'created_at'),
    inPeriod(admin.from('execution_provider_calls').select('id,execution_run_id,provider,model,operation,input_tokens,output_tokens,total_tokens,latency_ms,status,error_code,created_at'), 'created_at'),
    inPeriod(admin.from('interventions').select('user_id,status,created_at,delivered_at'), 'created_at'),
    inPeriod(admin.from('interventions').select('user_id,status,created_at,delivered_at,topic,intervention_type,depth'), 'created_at'),
    inPeriod(admin.from('event_log').select('user_id,event_type,metadata,occurred_at'), 'occurred_at'),
    inPeriod(admin.from('intervention_feedback').select('id', { count: 'exact', head: true }), 'created_at'),
    inPeriod(admin.from('learning_signals').select('id', { count: 'exact', head: true }), 'created_at'),
    admin.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  const dashboard = aggregateDashboard({
    users: authUsers.map(user => ({ id: user.id, created_at: user.created_at })),
    executions: executionsResult.data ?? [],
    attempts: attemptsResult.data ?? [],
    providerCalls: providerResult.data ?? [],
    interventions: interventionsResult.data ?? [],
    editorialInterventions: editorialResult.data ?? [],
    events: eventsResult.data ?? [],
    feedback: feedbackResult.count ?? 0,
    learningSignals: learningResult.count ?? 0,
    activeSubscriptions: subscriptionsResult.error ? null : subscriptionsResult.count ?? subscriptionsResult.data?.length ?? 0,
    period,
  });
  const providerCalls = (providerResult.data ?? []) as CostCall[];
  const providerCallIds = providerCalls.map(call => call.id).filter(Boolean) as string[];
  const costResult = providerCallIds.length ? await admin.from('provider_call_costs').select('*').in('provider_call_id', providerCallIds) : { data: [], error: null };
  const costs = costResult.error || (providerCalls.length > 0 && (costResult.data?.length ?? 0) < providerCalls.length) ? null : aggregateDashboardCost(providerCalls, (costResult.data ?? []) as CallCostRow[], dashboard.users.active, period.from, dashboard.interventions.approved);
  return NextResponse.json({ period, ...dashboard, costs: costs ?? { status: 'NOT AVAILABLE', reason: 'provider_call_costs todavía no está disponible o no hay cálculos persistidos.' } });
}
