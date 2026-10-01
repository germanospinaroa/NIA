import type { SupabaseClient } from '@supabase/supabase-js';

export type CostCall = { id?: string; provider_call_id?: string; execution_run_id?: string; user_id?: string | null; provider: string; model: string | null; operation: string; input_tokens: number | null; cached_input_tokens?: number | null; cache_write_tokens?: number | null; output_tokens: number | null; total_tokens: number | null; created_at: string };
export type PricingRow = { id: string; provider: string; model: string; operation_type: string; input_price_per_1m: number | string; cached_input_price_per_1m: number | string | null; cache_write_price_per_1m: number | string | null; output_price_per_1m: number | string | null; effective_from: string; effective_to: string | null; currency: string };
export type CallCostRow = { provider_call_id: string; pricing_id: string | null; cost_status: 'available' | 'unavailable'; cost_reason: string | null; input_cost: number | string | null; cached_input_cost: number | string | null; cache_write_cost: number | string | null; output_cost: number | string | null; total_cost: number | string | null; currency: string | null; calculated_at: string };
type CostRowWithOperation = CallCostRow & { operation?: string };

const numeric = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : null;
const cost = (tokens: number | null, price: number | string | null) => tokens === null || price === null ? null : tokens / 1_000_000 * Number(price);

export function calculateProviderCallCost(call: CostCall, pricing: PricingRow | null): Omit<CallCostRow, 'calculated_at'> {
  const providerCallId = call.id ?? call.provider_call_id ?? '';
  if (!call.model) return { provider_call_id: providerCallId, pricing_id: null, cost_status: 'unavailable', cost_reason: 'unknown_model', input_cost: null, cached_input_cost: null, cache_write_cost: null, output_cost: null, total_cost: null, currency: null };
  if (!pricing) return { provider_call_id: providerCallId, pricing_id: null, cost_status: 'unavailable', cost_reason: 'missing_pricing', input_cost: null, cached_input_cost: null, cache_write_cost: null, output_cost: null, total_cost: null, currency: null };
  if (call.input_tokens === null || call.input_tokens === undefined || (Number(pricing.output_price_per_1m ?? 0) > 0 && call.output_tokens === null)) return { provider_call_id: providerCallId, pricing_id: pricing.id, cost_status: 'unavailable', cost_reason: 'missing_usage', input_cost: null, cached_input_cost: null, cache_write_cost: null, output_cost: null, total_cost: null, currency: pricing.currency };
  const cachedTokens = call.cached_input_tokens ?? 0;
  const cacheWriteTokens = call.cache_write_tokens ?? 0;
  const ordinaryInputTokens = call.input_tokens - cachedTokens - cacheWriteTokens;
  if (ordinaryInputTokens < 0) return { provider_call_id: providerCallId, pricing_id: pricing.id, cost_status: 'unavailable', cost_reason: 'invalid_cache_usage', input_cost: null, cached_input_cost: null, cache_write_cost: null, output_cost: null, total_cost: null, currency: pricing.currency };
  if ((cachedTokens > 0 && pricing.cached_input_price_per_1m === null) || (cacheWriteTokens > 0 && pricing.cache_write_price_per_1m === null)) return { provider_call_id: providerCallId, pricing_id: pricing.id, cost_status: 'unavailable', cost_reason: 'missing_pricing', input_cost: null, cached_input_cost: null, cache_write_cost: null, output_cost: null, total_cost: null, currency: pricing.currency };
  const inputCost = cost(ordinaryInputTokens, pricing.input_price_per_1m)!;
  const cachedInputCost = cost(cachedTokens, pricing.cached_input_price_per_1m ?? 0)!;
  const cacheWriteCost = cost(cacheWriteTokens, pricing.cache_write_price_per_1m ?? 0)!;
  const outputCost = cost(call.output_tokens ?? 0, pricing.output_price_per_1m ?? 0)!;
  return { provider_call_id: providerCallId, pricing_id: pricing.id, cost_status: 'available', cost_reason: null, input_cost: inputCost, cached_input_cost: cachedInputCost, cache_write_cost: cacheWriteCost, output_cost: outputCost, total_cost: inputCost + cachedInputCost + cacheWriteCost + outputCost, currency: pricing.currency };
}

export async function resolvePricing(admin: SupabaseClient, call: CostCall) {
  if (!call.model) return null;
  const { data, error } = await admin.from('provider_pricing').select('*').eq('provider', call.provider).eq('model', call.model).eq('operation_type', call.operation).lte('effective_from', call.created_at).order('effective_from', { ascending: false }).limit(20);
  if (error) return null;
  return ((data ?? []) as PricingRow[]).find(row => !row.effective_to || row.effective_to > call.created_at) ?? null;
}

export async function persistProviderCallCost(admin: SupabaseClient, call: CostCall) {
  const result = calculateProviderCallCost(call, await resolvePricing(admin, call));
  if (!call.id && !call.provider_call_id) return result;
  const table = admin.from('provider_call_costs');
  if (typeof table.upsert !== 'function') return result;
  const { error } = await table.upsert(result, { onConflict: 'provider_call_id', ignoreDuplicates: true });
  if (error) console.error('[nia-provider-call-cost-failed]', error.message);
  return result;
}

export function attachCostMetadata(costs: CallCostRow[], calls: CostCall[]) {
  const operationByCall = new Map(calls.map(call => [String(call.id), call.operation]));
  return costs.map(row => ({ ...row, operation: operationByCall.get(row.provider_call_id) ?? 'unknown' }));
}

export function aggregateCosts(costs: CostRowWithOperation[]) {
  const available = costs.filter(row => row.cost_status === 'available' && numeric(row.total_cost) !== null);
  const total = available.reduce((sum, row) => sum + Number(row.total_cost), 0);
  const byOperation = new Map<string, { operation: string; calls: number; total_tokens: number; total_cost: number; unavailable: number }>();
  for (const row of costs) {
    const operation = String(row.operation ?? 'unknown');
    const item = byOperation.get(operation) ?? { operation, calls: 0, total_tokens: 0, total_cost: 0, unavailable: 0 };
    item.calls += 1; item.total_cost += row.cost_status === 'available' ? Number(row.total_cost ?? 0) : 0; item.unavailable += row.cost_status === 'unavailable' ? 1 : 0; byOperation.set(operation, item);
  }
  return { total, availableCalls: available.length, unavailableCalls: costs.length - available.length, byOperation: [...byOperation.values()].map(row => ({ ...row, percentage: total ? row.total_cost / total : 0 })) };
}

export function aggregateUserCosts(calls: CostCall[], costs: CallCostRow[], now = new Date(), interventionCount = 0) {
  const costById = new Map(costs.map(row => [row.provider_call_id, row]));
  const sum = (from?: Date) => calls.reduce((total, call) => { if (from && new Date(call.created_at) < from) return total; const item = costById.get(String(call.id)); return total + (item?.cost_status === 'available' ? Number(item.total_cost ?? 0) : 0); }, 0);
  const executions = new Set(calls.map(call => call.execution_run_id).filter(Boolean)).size;
  return { today: sum(new Date(now.getTime() - 24 * 60 * 60 * 1000)), sevenDays: sum(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)), thirtyDays: sum(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), lifetime: sum(), executions, averagePerExecution: executions ? sum() / executions : null, averagePerIntervention: interventionCount ? sum() / interventionCount : null, byOperation: aggregateCosts(attachCostMetadata(costs, calls)).byOperation };
}

export function aggregateDashboardCost(calls: CostCall[], costs: CallCostRow[], activeUsers: number, periodFrom?: string, interventionCount = 0) {
  const scoped = periodFrom ? calls.filter(call => call.created_at >= periodFrom) : calls;
  const ids = new Set(scoped.map(call => call.id));
  const scopedCosts = costs.filter(row => ids.has(row.provider_call_id));
  const aggregate = aggregateCosts(attachCostMetadata(scopedCosts, scoped));
  const modelMap = new Map<string, { provider: string; model: string; calls: number; input_tokens: number; output_tokens: number; total_cost: number; unavailable: number }>();
  for (const call of scoped) { const item = modelMap.get(`${call.provider}:${call.model}`) ?? { provider: call.provider, model: call.model ?? 'unknown', calls: 0, input_tokens: 0, output_tokens: 0, total_cost: 0, unavailable: 0 }; const callCost = scopedCosts.find(row => row.provider_call_id === call.id); item.calls += 1; item.input_tokens += call.input_tokens ?? 0; item.output_tokens += call.output_tokens ?? 0; item.total_cost += callCost?.cost_status === 'available' ? Number(callCost.total_cost ?? 0) : 0; item.unavailable += callCost?.cost_status === 'unavailable' ? 1 : 0; modelMap.set(`${call.provider}:${call.model}`, item); }
  const trendMap = new Map<string, number>();
  for (const call of scoped) { const row = scopedCosts.find(item => item.provider_call_id === call.id); if (row?.cost_status === 'available') { const day = call.created_at.slice(0, 10); trendMap.set(day, (trendMap.get(day) ?? 0) + Number(row.total_cost ?? 0)); } }
  return { total: aggregate.total, averagePerExecution: new Set(scoped.map(call => call.execution_run_id).filter(Boolean)).size ? aggregate.total / new Set(scoped.map(call => call.execution_run_id).filter(Boolean)).size : null, averagePerIntervention: interventionCount ? aggregate.total / interventionCount : null, averagePerActiveUser: activeUsers ? aggregate.total / activeUsers : null, byOperation: aggregate.byOperation, byModel: [...modelMap.values()], trend: [...trendMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, total_cost]) => ({ date, total_cost })), unavailableCalls: aggregate.unavailableCalls };
}

export async function getExecutionCost(admin: SupabaseClient, executionId: string) {
  const { data: calls } = await admin.from('execution_provider_calls').select('id,execution_run_id,provider,model,operation,input_tokens,output_tokens,total_tokens,created_at').eq('execution_run_id', executionId);
  const callRows = (calls ?? []) as CostCall[];
  const ids = callRows.map(row => row.id).filter(Boolean) as string[];
  const costResult = ids.length ? await admin.from('provider_call_costs').select('*').in('provider_call_id', ids) : { data: [], error: null };
  if (costResult.error || (callRows.length > 0 && (costResult.data?.length ?? 0) < callRows.length)) return { status: 'NOT AVAILABLE', reason: 'Hay llamadas de proveedor sin costo calculado todavía.' };
  return { status: 'available', ...aggregateCosts(attachCostMetadata((costResult.data ?? []) as CallCostRow[], callRows)) };
}

export async function getUserCost(admin: SupabaseClient, userId: string) { const { data: executions } = await admin.from('execution_runs').select('id').eq('user_id', userId); const ids = (executions ?? []).map(row => row.id); const { data: calls } = ids.length ? await admin.from('execution_provider_calls').select('id,execution_run_id,provider,model,operation,input_tokens,output_tokens,total_tokens,created_at').in('execution_run_id', ids) : { data: [] }; const callIds = (calls ?? []).map(row => row.id); const { data: costs } = callIds.length ? await admin.from('provider_call_costs').select('*').in('provider_call_id', callIds) : { data: [] }; return aggregateUserCosts((calls ?? []) as CostCall[], (costs ?? []) as CallCostRow[]); }
