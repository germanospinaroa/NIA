import type { SupabaseClient } from '@supabase/supabase-js';
import type { ApprovedBufferItem } from '@/lib/recurrent-daily';

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
