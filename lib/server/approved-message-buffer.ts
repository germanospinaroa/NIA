import type { SupabaseClient } from '@supabase/supabase-js';
import { interventionSignature as dailyInterventionSignature, normalizedMessageHash, type ApprovedBufferItem, type InterventionDepth, type InterventionMode, type MovementExposure } from '@/lib/recurrent-daily';

type BufferRow = {
  id: string;
  user_id: string;
  intended_local_date: string;
  plan: ApprovedBufferItem['plan'];
  message: string;
  status: ApprovedBufferItem['status'];
  normalized_message_hash: string;
  intervention_signature: string;
  context_version: string;
  created_at: string;
  consumed_at?: string | null;
};

export const BUFFER_DEPENDENCY_NOT_DELIVERED = 'approved_buffer_dependency_not_delivered';

async function hasSentDeliveryForInteraction(admin: SupabaseClient, userId: string, interactionId: string) {
  const { data, error } = await admin.from('whatsapp_daily_deliveries').select('id').eq('user_id', userId).eq('interaction_id', interactionId).eq('status', 'sent').limit(1).maybeSingle();
  if (error) throw new Error('approved_buffer_delivery_lookup_failed');
  return Boolean(data);
}

async function dependencyWasDelivered(admin: SupabaseClient, row: BufferRow) {
  const dependencyId = row.plan.dependsOnBufferItemId;
  if (!dependencyId) return true;
  const { data: predecessor, error: predecessorError } = await admin.from('approved_intervention_buffer').select('id,user_id,intended_local_date,status').eq('id', dependencyId).maybeSingle();
  if (predecessorError) throw new Error('approved_buffer_dependency_lookup_failed');
  if (!predecessor || predecessor.user_id !== row.user_id || predecessor.status === 'invalidated') return false;
  const { data: interactions, error: interactionError } = await admin.from('interactions').select('id').eq('user_id', row.user_id).eq('interaction_type', 'daily_message').eq('local_date', predecessor.intended_local_date);
  if (interactionError) throw new Error('approved_buffer_dependency_lookup_failed');
  for (const interaction of interactions ?? []) if (await hasSentDeliveryForInteraction(admin, row.user_id, interaction.id)) return true;
  return false;
}

async function invalidateDependents(admin: SupabaseClient, userId: string, rootId: string) {
  const { data: rows, error } = await admin.from('approved_intervention_buffer').select('id,plan,status').eq('user_id', userId).in('status', ['approved', 'buffered']);
  if (error) throw new Error('approved_buffer_dependency_lookup_failed');
  const invalidated = new Set([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const candidate of rows ?? []) {
      const dependencyId = candidate.plan?.dependsOnBufferItemId;
      if (candidate.id && dependencyId && invalidated.has(dependencyId) && !invalidated.has(candidate.id)) {
        invalidated.add(candidate.id);
        changed = true;
      }
    }
  }
  const ids = [...invalidated].filter(id => id !== rootId);
  if (!ids.length) return;
  const { error: updateError } = await admin.from('approved_intervention_buffer').update({ status: 'invalidated', invalidated_at: new Date().toISOString() }).eq('user_id', userId).in('id', ids).in('status', ['approved', 'buffered']);
  if (updateError) throw new Error('approved_buffer_dependency_invalidation_failed');
}

export async function loadApprovedMessageForDate(admin: SupabaseClient, userId: string, localDate: string) {
  const { data, error } = await admin.from('approved_intervention_buffer').select('*').eq('user_id', userId).eq('intended_local_date', localDate).in('status', ['approved', 'buffered']).order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (error?.code === '42P01') return null;
  if (error) throw new Error('approved_buffer_unavailable');
  const row = data as BufferRow | null;
  if (!row) return null;
  if (!(await dependencyWasDelivered(admin, row))) {
    await admin.from('approved_intervention_buffer').update({ status: 'invalidated', invalidated_at: new Date().toISOString() }).eq('id', row.id).in('status', ['approved', 'buffered']);
    await invalidateDependents(admin, userId, row.id);
    throw new Error(BUFFER_DEPENDENCY_NOT_DELIVERED);
  }
  return row;
}

export async function consumeApprovedMessage(admin: SupabaseClient, row: BufferRow) {
  const { data, error } = await admin.from('approved_intervention_buffer').update({ status: 'consumed', consumed_at: new Date().toISOString() }).eq('id', row.id).in('status', ['approved', 'buffered']).select('*').maybeSingle();
  if (error) throw new Error('approved_buffer_consume_failed');
  return data as BufferRow | null;
}

export async function releaseConsumedMessage(admin: SupabaseClient, row: BufferRow) {
  const { data, error } = await admin.from('approved_intervention_buffer').update({ status: 'buffered', consumed_at: null }).eq('id', row.id).eq('status', 'consumed').select('*').maybeSingle();
  if (error) throw new Error('approved_buffer_release_failed');
  return data as BufferRow | null;
}

export async function storeApprovedMessage(admin: SupabaseClient, input: Omit<BufferRow, 'id' | 'created_at'>) {
  const { data, error } = await admin.from('approved_intervention_buffer').insert(input).select('*').single();
  if (error) throw new Error('approved_buffer_store_failed');
  return data as BufferRow;
}

export async function invalidateFutureApprovedMessages(admin: SupabaseClient, userId: string, contextVersion: string) {
  const { error } = await admin.from('approved_intervention_buffer').update({ status: 'invalidated', invalidated_at: new Date().toISOString() }).eq('user_id', userId).neq('context_version', contextVersion).in('status', ['approved', 'buffered']);
  if (error && error.code !== '42P01') throw new Error('approved_buffer_invalidation_failed');
}

function planMode(value: unknown): InterventionMode {
  return value === 'introduce' || value === 'deepen' || value === 'apply' || value === 'contrast' || value === 'anticipate' || value === 'reinforce' || value === 'integrate' || value === 'transfer' || value === 'evidence' || value === 'reflect_or_observe' ? value : 'introduce';
}

function planDepth(value: unknown): InterventionDepth {
  return value === 'foundational' || value === 'developed' || value === 'advanced' ? value : 'foundational';
}

function bufferMovementExposure(row: BufferRow, deliveredAt: string): MovementExposure {
  const plan = row.plan;
  const interventionMode = planMode(plan.interventionMode);
  const depth = planDepth(plan.depth);
  const canonicalMovement = plan.canonicalMovement;
  const contextUsed = Array.isArray(plan.contextUsed) ? plan.contextUsed.filter((value): value is string => typeof value === 'string') : [];
  return {
    canonicalMovement,
    deliveredAt,
    takeaway: plan.reason,
    interventionMode,
    angle: plan.angle,
    depth,
    contextUsed,
    message: row.message,
    normalizedMessageHash: row.normalized_message_hash || normalizedMessageHash(row.message),
    interventionSignature: row.intervention_signature || dailyInterventionSignature({ canonicalMovement, interventionMode, angle: plan.angle, depth, contextUsed }),
    newContribution: plan.newContribution,
    expectedTakeaway: plan.expectedTakeaway,
  };
}

/**
 * A consumed buffer row is learning history only after its materialized daily
 * interaction has a successful WhatsApp delivery. Consumed/pending/failed
 * rows remain reservations, but are deliberately excluded from exposures.
 */
export async function loadDeliveredBufferExposures(admin: SupabaseClient, userId: string): Promise<MovementExposure[]> {
  const { data: consumed, error: bufferError } = await admin.from('approved_intervention_buffer').select('*').eq('user_id', userId).eq('status', 'consumed');
  if (bufferError?.code === '42P01') return [];
  if (bufferError) throw new Error('approved_buffer_delivery_lookup_failed');
  const rows = (consumed ?? []) as BufferRow[];
  if (!rows.length) return [];
  const dates = [...new Set(rows.map(row => row.intended_local_date))];
  const { data: interactions, error: interactionError } = await admin.from('interactions').select('id,local_date,content').eq('user_id', userId).eq('interaction_type', 'daily_message').in('local_date', dates);
  if (interactionError) throw new Error('approved_buffer_interaction_lookup_failed');
  const matching = (interactions ?? []).filter(interaction => rows.some(row => row.intended_local_date === interaction.local_date && row.message === interaction.content));
  if (!matching.length) return [];
  const interactionIds = matching.map(interaction => interaction.id).filter(Boolean);
  const { data: deliveries, error: deliveryError } = await admin.from('whatsapp_daily_deliveries').select('interaction_id,sent_at').eq('user_id', userId).eq('status', 'sent').in('interaction_id', interactionIds);
  if (deliveryError) throw new Error('approved_buffer_delivery_lookup_failed');
  const deliveryByInteraction = new Map((deliveries ?? []).map(delivery => [delivery.interaction_id, delivery.sent_at ?? null]));
  const exposures: MovementExposure[] = [];
  const seenRows = new Set<string>();
  for (const interaction of matching) {
    const sentAt = deliveryByInteraction.get(interaction.id);
    if (!sentAt) continue;
    const row = rows.find(candidate => candidate.intended_local_date === interaction.local_date && candidate.message === interaction.content);
    if (row && !seenRows.has(row.id)) {
      seenRows.add(row.id);
      exposures.push(bufferMovementExposure(row, sentAt));
    }
  }
  return exposures;
}
