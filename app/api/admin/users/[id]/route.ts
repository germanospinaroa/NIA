import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordAdminAudit } from '@/lib/server/operational-observability';
import { buildUserTimeline, buildUserUsage, groupProviderUsage } from '@/lib/server/admin-user-detail';
import { aggregateUserCosts, type CostCall, type CallCostRow } from '@/lib/server/cost-ledger';
import { buildEditorialMemory, type EditorialHistoryItem } from '@/lib/server/editorial-memory';

type Row = Record<string, unknown>;
const asRows = (value: unknown) => Array.isArray(value) ? value as Row[] : [];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const admin = createAdminClient();
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_user', targetType: 'user', targetId: id, metadata: { user_id: id, route: '/admin/users/[id]' } });
  const { data: authUser, error: authError } = await admin.auth.admin.getUserById(id);
  if (authError || !authUser?.user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const [profileResult, interventionsResult, interventionSummaryResult, feedbackResult, feedbackCountResult, learningResult, learningCountResult, contextsResult, desiredChangesResult, executionsResult, eventsResult, recalibrationCountResult, subscriptionResult, whatsappResult] = await Promise.all([
    admin.from('profiles').select('id,first_name,direction_key,direction_text,voice_style,communication_preference,message_frequency,timezone,whatsapp_enabled,desired_change_original,desired_change_summary,desired_change_started_at,current_context_original,current_context_summary,current_context_domain,current_context_started_at,learning_profile,created_at,updated_at').eq('id', id).maybeSingle(),
    admin.from('interventions').select('id,user_id,text,function,concept,angle,structure,topic,intervention_type,depth,editorial_take,experience_type,territory_key,exercise_present,question_present,feedback_requested,desired_change_snapshot,current_context_snapshot,channel,status,created_at,delivered_at').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('interventions').select('status,delivered_at').eq('user_id', id),
    admin.from('intervention_feedback').select('id,intervention_id,question,dimension,options,selected_option,learning_signal,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('intervention_feedback').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('learning_signals').select('id,signal,value,confidence,source,expires_at,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
    admin.from('learning_signals').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('context_history').select('id,context_original,context_summary,domain,source,status,started_at,ended_at,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
    admin.from('desired_change_history').select('id,desired_change_original,desired_change_summary,status,started_at,ended_at,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
    admin.from('execution_runs').select('id,status,intervention_id').eq('user_id', id),
    admin.from('event_log').select('id,event_type,entity_type,entity_id,execution_run_id,metadata,occurred_at,created_at').eq('user_id', id).order('occurred_at', { ascending: false }).limit(50),
    admin.from('event_log').select('id', { count: 'exact', head: true }).eq('user_id', id).in('event_type', ['recalibration_started', 'recalibration_completed']),
    admin.from('subscriptions').select('id,provider,plan_key,status,provider_customer_id,provider_subscription_id,current_period_end,created_at,updated_at').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('whatsapp_connections').select('status,wa_id').eq('user_id', id).eq('status', 'connected').maybeSingle(),
  ]);

  const allExecutions = asRows(executionsResult.data);
  const executionIds = allExecutions.map(row => String(row.id));
  const [attemptsResult, providerResult, executionListResult] = await Promise.all([
    executionIds.length ? admin.from('generation_attempts').select('id,execution_run_id,attempt_number,attempt_type,provider,model,status,candidate_count,approved_candidate_count,rejection_count,duration_ms,input_tokens,output_tokens,total_tokens,error_code,created_at').in('execution_run_id', executionIds).order('created_at', { ascending: false }) : { data: [] },
    executionIds.length ? admin.from('execution_provider_calls').select('id,execution_run_id,generation_attempt_id,provider,model,operation,input_tokens,output_tokens,total_tokens,latency_ms,status,error_code,created_at').in('execution_run_id', executionIds).order('created_at', { ascending: false }) : { data: [] },
    executionIds.length ? admin.from('execution_runs').select('id,request_id,channel,trigger_source,status,started_at,completed_at,duration_ms,intervention_id,failure_code,candidate_count,retry_count').in('id', executionIds).order('started_at', { ascending: false }).limit(20) : { data: [] },
  ]);
  const attempts = asRows(attemptsResult.data);
  const providerCalls = asRows(providerResult.data);
  const interventions = asRows(interventionsResult.data);
  const interventionSummary = asRows(interventionSummaryResult.data);
  const feedback = asRows(feedbackResult.data);
  const learning = asRows(learningResult.data);
  const contexts = asRows(contextsResult.data);
  const desiredChanges = asRows(desiredChangesResult.data);
  const events = asRows(eventsResult.data);
  const recentExecutions = asRows(executionListResult.data);
  const executionByIntervention = new Map(allExecutions.filter(row => row.intervention_id).map(row => [String(row.intervention_id), String(row.id)]));
  const recentInterventions = interventions.map(row => ({ ...row, execution_id: executionByIntervention.get(String(row.id)) ?? null }));
  const profile = profileResult.data as Row | null;
  const usage = buildUserUsage(allExecutions, interventionSummary, attempts, feedbackCountResult.count ?? 0, learningCountResult.count ?? 0, recalibrationCountResult.count ?? 0);
  const timeline = buildUserTimeline(events, contexts, desiredChanges);
  const providerUsage = groupProviderUsage(providerCalls);
  const costResult = providerCalls.length ? await admin.from('provider_call_costs').select('*').in('provider_call_id', providerCalls.map(row => String(row.id))) : { data: [], error: null };
  const cost = costResult.error || (providerCalls.length > 0 && (costResult.data?.length ?? 0) < providerCalls.length) ? { status: 'NOT AVAILABLE', reason: 'Hay llamadas de proveedor sin costo calculado todavía.' } : { status: 'available', ...aggregateUserCosts(providerCalls as CostCall[], (costResult.data ?? []) as CallCostRow[], new Date(), interventionSummary.length) };
  const editorialMemory = buildEditorialMemory(interventions as EditorialHistoryItem[]);
  const whatsappConnected = Boolean(profile?.whatsapp_enabled && whatsappResult.data?.wa_id);
  return NextResponse.json({ user: { id, email: authUser.user.email ?? null, created_at: authUser.user.created_at, last_sign_in_at: authUser.user.last_sign_in_at ?? null }, profile, current_state: { desired_change: profile?.desired_change_original ?? null, desired_change_since: profile?.desired_change_started_at ?? null, context: profile?.current_context_original ?? null, context_since: profile?.current_context_started_at ?? null, learning_profile: profile?.learning_profile ?? null }, editorial_memory: editorialMemory, history: { contexts, desired_changes: desiredChanges }, usage, timeline, interventions: recentInterventions, feedback, learning, executions: recentExecutions, provider_usage: providerUsage, subscription: subscriptionResult.data ?? null, onboarding: { status: 'NOT AVAILABLE', reason: 'onboarding_drafts no tiene user_id y onboarding_completed no conserva una relación de usuario confiable' }, whatsapp: whatsappConnected ? { status: 'connected', reason: 'WhatsApp conectado y habilitado.' } : { status: 'NOT AVAILABLE', reason: 'WhatsApp todavía no está conectado.' }, cost, availability: { subscription: subscriptionResult.data ? 'available' : 'NOT AVAILABLE', execution_detail: executionIds.length ? 'available' : 'NOT AVAILABLE', onboarding: 'NOT AVAILABLE', whatsapp: whatsappConnected ? 'available' : 'NOT AVAILABLE', cost: costResult.error ? 'NOT AVAILABLE' : 'available' } });
}
