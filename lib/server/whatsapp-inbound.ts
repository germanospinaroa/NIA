import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveIntervention } from '@/lib/server/intervention';
import { composeNiaMessage } from '@/lib/server/message-composer';
import { claimDelivery, sendClaimedDelivery } from '@/lib/server/whatsapp-daily';
import { localDate } from '@/lib/server/whatsapp-schedule';
import { recordEvent, recordExecutionStage, startIdempotentExecutionRun, updateExecutionRun } from '@/lib/server/operational-observability';
import type { ContextKey, FeedbackType } from '@/lib/mvp';
import type { EvolutionInboundMessage } from '@/lib/server/whatsapp';

type DbClient = SupabaseClient;
type InboundRow = { id: string; user_id: string | null; provider: string; provider_message_id: string | null; status: string; execution_run_id: string | null; response_provider_message_id: string | null };

const FEEDBACK: Array<{ text: string; value: FeedbackType }> = [
  { text: 'así sí', value: 'resonates' },
  { text: 'más real', value: 'needs_grounding' },
  { text: 'otro enfoque', value: 'different_angle' },
];

function normalized(text: string) { return text.trim().toLocaleLowerCase('es'); }

export function feedbackFromInbound(text: string): FeedbackType | null {
  const value = normalized(text).replace(/[.!¿?]+$/g, '');
  return FEEDBACK.find(item => value === item.text)?.value ?? null;
}

export function contextKeyFromInbound(text: string): ContextKey {
  const value = normalized(text);
  if (value.includes('conversación') || value.includes('conversacion')) return 'conversation';
  if (value.includes('falló') || value.includes('fallo') || value.includes('salió mal') || value.includes('salio mal')) return 'failure';
  if (value.includes('decidir') || value.includes('decisión') || value.includes('decision')) return 'decision';
  if (value.includes('dud') || value.includes('criterio')) return 'doubting';
  return 'intention';
}

export async function persistInboundMessage(admin: DbClient, message: EvolutionInboundMessage, userId: string | null): Promise<{ row: InboundRow; created: boolean }> {
  const payload = {
    user_id: userId,
    provider: 'evolution',
    provider_message_id: message.providerMessageId,
    wa_id: message.from,
    remote_jid: message.remoteJid,
    text: message.text || null,
    from_me: message.fromMe,
    status: 'received',
  };
  const { data, error } = await admin.from('whatsapp_inbound_messages').insert(payload).select('id,user_id,provider,provider_message_id,status,execution_run_id,response_provider_message_id').single();
  if (!error && data) return { row: data as InboundRow, created: true };
  if (error?.code !== '23505' || !message.providerMessageId) throw new Error(error?.code === '42P01' ? 'whatsapp_inbound_schema_missing' : 'whatsapp_inbound_persistence_failed');
  const { data: existing, error: existingError } = await admin.from('whatsapp_inbound_messages').select('id,user_id,provider,provider_message_id,status,execution_run_id,response_provider_message_id').eq('provider', 'evolution').eq('provider_message_id', message.providerMessageId).maybeSingle();
  if (existingError || !existing) throw new Error('whatsapp_inbound_persistence_failed');
  return { row: existing as InboundRow, created: false };
}

async function updateInbound(admin: DbClient, id: string, values: Record<string, unknown>) {
  const { error } = await admin.from('whatsapp_inbound_messages').update(values).eq('id', id);
  if (error) throw new Error('whatsapp_inbound_persistence_failed');
}

async function recordFeedback(admin: DbClient, inbound: InboundRow, userId: string, feedbackType: FeedbackType) {
  const { data: interaction } = await admin.from('interactions').select('id,intervention_id').eq('user_id', userId).eq('interaction_type', 'nia_point').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (interaction?.id) await admin.from('interactions').update({ feedback_type: feedbackType }).eq('id', interaction.id).eq('user_id', userId);
  await recordEvent(admin, { userId, eventType: 'feedback_received', entityType: 'whatsapp_inbound', entityId: inbound.id, metadata: { feedbackType, providerMessageIdPresent: Boolean(inbound.provider_message_id) } });
  await updateInbound(admin, inbound.id, { status: 'completed', processed_at: new Date().toISOString() });
}

export async function processInboundMessage(admin: DbClient, message: EvolutionInboundMessage, inbound: InboundRow, userId: string) {
  const feedback = feedbackFromInbound(message.text);
  if (feedback) { await recordFeedback(admin, inbound, userId, feedback); return { kind: 'feedback' as const }; }
  const idempotencyKey = `whatsapp:evolution:${message.providerMessageId}`;
  const concurrencyKey = `whatsapp_inbound:${userId}:${message.providerMessageId}`;
  const claimed = await startIdempotentExecutionRun(admin, { userId, channel: 'whatsapp', triggerSource: 'whatsapp_inbound', idempotencyKey, requestId: randomUUID(), executionContext: 'production', concurrencyKey });
  const execution = claimed.context;
  if (!claimed.created) return { kind: 'duplicate' as const, executionId: execution.executionId };
  await updateInbound(admin, inbound.id, { user_id: userId, status: 'processing', execution_run_id: execution.executionId });
  await recordEvent(admin, { userId, eventType: 'inbound_resolved', entityType: 'whatsapp_inbound', entityId: inbound.id, executionRunId: execution.executionId, metadata: { providerMessageId: message.providerMessageId } });
  await recordEvent(admin, { userId, eventType: 'inbound_processing_started', entityType: 'whatsapp_inbound', entityId: inbound.id, executionRunId: execution.executionId, metadata: { providerMessageId: message.providerMessageId } });
  try {
    const contextKey = contextKeyFromInbound(message.text);
    const result = await resolveIntervention(admin, userId, contextKey, 'whatsapp', idempotencyKey, execution, { maxGenerationAttempts: 1, disableTechnicalGenerationRetry: true, executionContext: 'production', allowRelevantFallback: false });
    await recordExecutionStage(admin, execution, 'intervention', { status: 'PASS', intervention_id: result.interventionId });
    const { data: profile } = await admin.from('profiles').select('first_name,timezone,direction_key').eq('id', userId).single();
    if (!profile) throw new Error('profile_unavailable');
    const { data: recent } = await admin.from('interactions').select('content').eq('user_id', userId).order('created_at', { ascending: false }).limit(16);
    const content = composeNiaMessage({ content: result.intervention.text, firstName: profile.first_name, timezone: profile.timezone, userKey: userId, now: new Date(), recentContents: (recent ?? []).map(row => String(row.content)) });
    await recordExecutionStage(admin, execution, 'composer', { status: 'PASS' });
    const date = localDate(profile.timezone);
    const { data: interaction, error: interactionError } = await admin.from('interactions').insert({ user_id: userId, interaction_type: 'nia_point', context_key: contextKey, direction_key: profile.direction_key ?? null, content, local_date: date }).select('id').single();
    if (interactionError || !interaction) throw new Error('interaction_persistence_failed');
    await recordExecutionStage(admin, execution, 'interaction', { status: 'PASS', interaction_id: interaction.id });
    const claim = await claimDelivery(admin, { userId, interactionId: interaction.id, localDate: date, slot: `inbound:${message.providerMessageId}` });
    if (!claim) throw new Error('delivery_claim_unavailable');
    await recordExecutionStage(admin, execution, 'delivery', { status: 'PASS', delivery_id: claim.id });
    const connection = await admin.from('whatsapp_connections').select('wa_id,status').eq('user_id', userId).eq('provider', 'evolution').eq('status', 'connected').maybeSingle();
    if (!connection.data?.wa_id) throw new Error('whatsapp_not_connected');
    await admin.from('whatsapp_connections').update({ last_message_at: new Date().toISOString() }).eq('user_id', userId).eq('provider', 'evolution').eq('status', 'connected');
    const delivery = await sendClaimedDelivery(admin, { ...claim, userId, interactionId: interaction.id, localDate: date, slot: `inbound:${message.providerMessageId}` }, connection.data.wa_id, content);
    if (!delivery.ok) throw new Error('evolution_send_failed');
    await recordExecutionStage(admin, execution, 'sender', { status: 'PASS', provider: 'evolution' });
    await recordExecutionStage(admin, execution, 'evolution', { status: 'PASS', http_status: delivery.status, provider_message_id: delivery.providerMessageId ?? null });
    await updateInbound(admin, inbound.id, { status: 'completed', processed_at: new Date().toISOString(), response_provider_message_id: delivery.providerMessageId ?? null, error_code: null });
    await recordEvent(admin, { userId, eventType: 'inbound_processing_completed', entityType: 'whatsapp_inbound', entityId: inbound.id, executionRunId: execution.executionId, metadata: { providerMessageId: message.providerMessageId, responseProviderMessageId: delivery.providerMessageId ?? null } });
    await updateExecutionRun(admin, execution, { status: 'approved', interventionId: result.interventionId, candidateCount: result.candidates.length, stageResults: { inbound: { status: 'PASS' } } });
    return { kind: 'completed' as const, executionId: execution.executionId, interventionId: result.interventionId, interactionId: interaction.id, deliveryId: claim.id, providerMessageId: delivery.providerMessageId ?? null };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    const noApproved = messageText === 'no_approved_intervention';
    await updateInbound(admin, inbound.id, { status: noApproved ? 'no_approved_intervention' : 'failed', processed_at: new Date().toISOString(), error_code: noApproved ? 'no_approved_intervention' : messageText.slice(0, 100) });
    await recordEvent(admin, { userId, eventType: 'inbound_processing_failed', entityType: 'whatsapp_inbound', entityId: inbound.id, executionRunId: execution.executionId, metadata: { errorCode: noApproved ? 'no_approved_intervention' : messageText.slice(0, 100) } });
    await updateExecutionRun(admin, execution, { status: noApproved ? 'no_approved_intervention' : 'failed', failure: error });
    return { kind: noApproved ? 'no_approved_intervention' as const : 'failed' as const, executionId: execution.executionId, error: messageText };
  }
}

export async function processUnresolvedInbound(admin: DbClient, message: EvolutionInboundMessage, inbound: InboundRow) {
  const reply = 'Este número todavía no está conectado a NIA. Conéctalo desde tu cuenta para poder reconocerte.';
  const { sendWhatsAppText } = await import('@/lib/server/whatsapp');
  const sent = await sendWhatsAppText(message.from, reply);
  await updateInbound(admin, inbound.id, { status: sent.ok ? 'unresolved' : 'failed', processed_at: new Date().toISOString(), response_provider_message_id: sent.ok ? sent.providerMessageId ?? null : null, error_code: sent.ok ? 'whatsapp_not_connected' : 'unresolved_reply_failed' });
  return sent;
}
