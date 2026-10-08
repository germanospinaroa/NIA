import { localDate } from './whatsapp-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureActivationWelcome } from './reception-welcome';
import { scheduleWelcomeDelivery } from './welcome-delivery';
import { refillApprovedBuffer } from './refill-approved-buffer';
import { firstPsychologicalLocalDate } from './whatsapp-schedule';
import { hasConfirmedOnboardingIdentity } from '@/lib/onboarding-identity';
import { recordEvent } from './operational-observability';

export function normalizeOnboardingSchedule<T extends { message_frequency?: number | null; message_time_2?: string | null }>(profile: T) {
  return { ...profile, message_frequency: 1, message_time_2: null };
}

export function chooseFirstIntendedLocalDate(input: { candidate: string; timezone: string; now: Date; occupied: boolean }) {
  if (!input.occupied) return input.candidate;
  return localDate(input.timezone, new Date(input.now.getTime() + 86_400_000));
}

export function hasCompletedOnboardingPersonalization(profile: { learning_profile?: unknown }) {
  const learning = profile.learning_profile && typeof profile.learning_profile === 'object' ? profile.learning_profile as Record<string, unknown> : {};
  const onboarding = learning.onboarding && typeof learning.onboarding === 'object' ? learning.onboarding as Record<string, unknown> : {};
  const personalization = onboarding.personalization && typeof onboarding.personalization === 'object' ? onboarding.personalization as Record<string, unknown> : {};
  return personalization.status === 'answered' || personalization.status === 'skipped';
}

type RecoveryProfile = {
  id: string;
  account_status?: string | null;
  whatsapp_enabled?: boolean | null;
  onboarding_completed?: boolean | null;
  first_name?: string | null;
  last_name?: string | null;
  preferred_name?: string | null;
  desired_change_original?: string | null;
  current_context_original?: string | null;
  learning_profile?: unknown;
  timezone?: string | null;
  country_code?: string | null;
  message_time_1?: string | null;
};

function missingOnboardingRequirement(profile: RecoveryProfile) {
  if (profile.account_status !== 'active') return 'account_not_active';
  if (profile.whatsapp_enabled !== true) return 'whatsapp_disabled';
  if (!profile.first_name?.trim() || !profile.last_name?.trim() || !profile.preferred_name?.trim()) return 'identity_incomplete';
  if (!profile.desired_change_original?.trim()) return 'desired_change_incomplete';
  if (!profile.current_context_original?.trim()) return 'current_context_incomplete';
  if (!hasCompletedOnboardingPersonalization(profile)) return 'personalization_incomplete';
  if (!profile.country_code || !profile.timezone || !profile.message_time_1) return 'timing_incomplete';
  return null;
}

async function prepareFirstBufferBestEffort(admin: SupabaseClient, userId: string, intendedLocalDate: string, now: Date) {
  try {
    const prepared = await refillApprovedBuffer(admin, userId, { now, minBufferDays: 1, targetBufferDays: 1, maxCostUsd: Number(process.env.REFILL_MAX_COST_USD || 0.03), firstIntendedLocalDate: intendedLocalDate });
    const preparedSuccessfully = prepared.created.length > 0 || prepared.skipped.includes('buffer_at_target');
    if (!preparedSuccessfully) {
      await recordEvent(admin, { userId, eventType: 'first_buffer_prepare_failed', entityType: 'approved_intervention_buffer', metadata: { reason: prepared.skipped[0] || 'no_buffer_created', intended_local_date: intendedLocalDate } });
    }
    return preparedSuccessfully;
  } catch (error) {
    await recordEvent(admin, { userId, eventType: 'first_buffer_prepare_failed', entityType: 'approved_intervention_buffer', metadata: { reason: error instanceof Error ? error.message : 'buffer_prepare_failed', intended_local_date: intendedLocalDate } });
    return false;
  }
}

export async function completeOnboardingAfterWhatsapp(admin: SupabaseClient, userId: string, now = new Date()) {
  const { data: profile, error: profileError } = await admin.from('profiles').select('first_name,last_name,preferred_name,desired_change_original,current_context_original,learning_profile,timezone,country_code,message_time_1,message_frequency,message_time_2,onboarding_completed').eq('id', userId).maybeSingle();
  if (profileError || !profile) throw new Error('profile_unavailable');
  if (!profile.onboarding_completed && !hasConfirmedOnboardingIdentity(profile.learning_profile)) throw new Error('identity_required');
  if (!profile.first_name?.trim() || !profile.last_name?.trim() || !profile.preferred_name?.trim()) throw new Error('identity_required');
  if (!profile.desired_change_original?.trim()) throw new Error('desired_change_required');
  if (!profile.current_context_original?.trim()) throw new Error('current_context_required');
  if (!hasCompletedOnboardingPersonalization(profile)) throw new Error('personalization_required');
  if (!profile.country_code || !profile.timezone || !profile.message_time_1) throw new Error('timing_required');

  const normalizedProfile = normalizeOnboardingSchedule(profile);
  const timezone = profile.timezone;
  const candidateLocalDate = firstPsychologicalLocalDate(timezone, profile.message_time_1, now);
  const [{ data: dailyInteraction, error: dailyInteractionError }, { data: sentDelivery, error: sentDeliveryError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', candidateLocalDate).limit(1).maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id').eq('user_id', userId).eq('local_date', candidateLocalDate).eq('status', 'sent').limit(1).maybeSingle(),
  ]);
  if (dailyInteractionError || sentDeliveryError) throw new Error('onboarding_delivery_lookup_failed');
  const intendedLocalDate = chooseFirstIntendedLocalDate({ candidate: candidateLocalDate, timezone, now, occupied: Boolean(dailyInteraction || sentDelivery) });

  if (!profile.onboarding_completed) {
    const { error: normalizationError } = await admin.from('profiles').update({ message_frequency: normalizedProfile.message_frequency, message_time_2: normalizedProfile.message_time_2 }).eq('id', userId).eq('onboarding_completed', false);
    if (normalizationError) throw new Error('onboarding_schedule_normalization_failed');
    const { error: completionError } = await admin.from('profiles').update({ onboarding_completed: true, onboarding_completed_at: now.toISOString(), message_frequency: normalizedProfile.message_frequency, message_time_2: normalizedProfile.message_time_2, timezone }).eq('id', userId).eq('onboarding_completed', false);
    if (completionError) throw new Error('onboarding_completion_failed');
    const { data: completedProfile, error: completedProfileError } = await admin.from('profiles').select('onboarding_completed,onboarding_completed_at').eq('id', userId).maybeSingle();
    if (completedProfileError || !completedProfile?.onboarding_completed || !completedProfile.onboarding_completed_at) throw new Error('onboarding_completion_failed');
  }

  const welcome = await ensureActivationWelcome(admin, { userId, firstName: profile.first_name, preferredName: profile.preferred_name, timezone, now });
  const delivery = await scheduleWelcomeDelivery(admin, { userId, interactionId: String(welcome.interaction.id), dueAt: new Date(now.getTime() + 60_000) });
  if (!welcome.interaction.id || !delivery.id || delivery.interaction_id !== String(welcome.interaction.id)) throw new Error('welcome_persistence_failed');
  const [{ data: persistedWelcome, error: persistedWelcomeError }, { data: persistedDelivery, error: persistedDeliveryError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', userId).eq('interaction_type', 'nia_welcome').maybeSingle(),
    admin.from('whatsapp_welcome_deliveries').select('id,interaction_id,due_at').eq('user_id', userId).maybeSingle(),
  ]);
  if (persistedWelcomeError || persistedDeliveryError || !persistedWelcome || !persistedDelivery || persistedDelivery.interaction_id !== String(persistedWelcome.id)) throw new Error('welcome_persistence_failed');

  const bufferPrepared = await prepareFirstBufferBestEffort(admin, userId, intendedLocalDate, now);
  return { alreadyCompleted: Boolean(profile.onboarding_completed), intendedLocalDate, welcomeScheduled: true, welcomeDueAt: delivery.due_at, bufferPrepared };
}

export async function recoverIncompleteActivations(admin: SupabaseClient, now = new Date()) {
  const { data: profiles, error } = await admin.from('profiles').select('id,account_status,whatsapp_enabled,onboarding_completed,first_name,last_name,preferred_name,desired_change_original,current_context_original,learning_profile,timezone,country_code,message_time_1').eq('account_status', 'active').eq('whatsapp_enabled', true).eq('onboarding_completed', false);
  if (error) throw new Error('activation_recovery_profiles_unavailable');
  const candidates = (profiles ?? []) as RecoveryProfile[];
  if (!candidates.length) return { found: 0, recovered: 0, skipped: 0, failed: 0 };
  const ids = candidates.map(profile => profile.id);
  const { data: connections, error: connectionError } = await admin.from('whatsapp_connections').select('user_id,wa_id,status,provider').in('user_id', ids).eq('provider', 'evolution').eq('status', 'connected');
  if (connectionError) throw new Error('activation_recovery_connections_unavailable');
  const connected = new Set((connections ?? []).filter(row => Boolean(row.wa_id)).map(row => row.user_id));
  let recovered = 0; let skipped = 0; let failed = 0;
  for (const profile of candidates) {
    const missing = missingOnboardingRequirement(profile);
    if (missing || !connected.has(profile.id)) {
      skipped += 1;
      await recordEvent(admin, { userId: profile.id, eventType: 'incomplete_activation_skipped', entityType: 'profile', metadata: { reason: missing || 'whatsapp_not_connected' } });
      continue;
    }
    try {
      await completeOnboardingAfterWhatsapp(admin, profile.id, now);
      recovered += 1;
    } catch (recoveryError) {
      failed += 1;
      await recordEvent(admin, { userId: profile.id, eventType: 'incomplete_activation_recovery_failed', entityType: 'profile', metadata: { reason: recoveryError instanceof Error ? recoveryError.message : 'activation_recovery_failed' } });
    }
  }
  return { found: candidates.length, recovered, skipped, failed };
}
