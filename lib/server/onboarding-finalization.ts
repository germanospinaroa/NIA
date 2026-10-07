import { localDate } from './whatsapp-schedule';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureActivationWelcome } from './reception-welcome';
import { scheduleWelcomeDelivery } from './welcome-delivery';
import { refillApprovedBuffer } from './refill-approved-buffer';
import { firstPsychologicalLocalDate } from './whatsapp-schedule';
import { hasConfirmedOnboardingIdentity } from '@/lib/onboarding-identity';

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

export async function completeOnboardingAfterWhatsapp(admin: SupabaseClient, userId: string, now = new Date()) {
  const { data: profile, error: profileError } = await admin.from('profiles').select('first_name,last_name,preferred_name,desired_change_original,current_context_original,learning_profile,timezone,country_code,message_time_1,message_frequency,message_time_2,onboarding_completed').eq('id', userId).maybeSingle();
  if (profileError || !profile) throw new Error('profile_unavailable');
  if (!profile.onboarding_completed && !hasConfirmedOnboardingIdentity(profile.learning_profile)) throw new Error('identity_required');
  if (!profile.first_name?.trim() || !profile.last_name?.trim() || !profile.preferred_name?.trim()) throw new Error('identity_required');
  if (!profile.desired_change_original?.trim()) throw new Error('desired_change_required');
  if (!profile.current_context_original?.trim()) throw new Error('current_context_required');
  if (!hasCompletedOnboardingPersonalization(profile)) throw new Error('personalization_required');
  if (!profile.country_code || !profile.timezone || !profile.message_time_1) throw new Error('timing_required');
  if (profile.onboarding_completed) {
    const welcome = await ensureActivationWelcome(admin, { userId, firstName: profile.first_name, preferredName: profile.preferred_name, timezone: profile.timezone, now });
    const delivery = await scheduleWelcomeDelivery(admin, { userId, interactionId: String(welcome.interaction.id), dueAt: new Date(now.getTime() + 60_000) });
    if (!welcome.interaction.id || !delivery.id || delivery.interaction_id !== String(welcome.interaction.id)) throw new Error('welcome_persistence_failed');
    return { alreadyCompleted: true, intendedLocalDate: null, welcomeScheduled: true, welcomeDueAt: delivery.due_at, bufferPrepared: true };
  }
  const normalizedProfile = normalizeOnboardingSchedule(profile);
  const { error: normalizationError } = await admin.from('profiles').update({ message_frequency: normalizedProfile.message_frequency, message_time_2: normalizedProfile.message_time_2 }).eq('id', userId).eq('onboarding_completed', false);
  if (normalizationError) throw new Error('onboarding_schedule_normalization_failed');

  const timezone = profile.timezone;
  const candidateLocalDate = firstPsychologicalLocalDate(timezone, profile.message_time_1, now);
  const [{ data: dailyInteraction, error: dailyInteractionError }, { data: sentDelivery, error: sentDeliveryError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', userId).eq('interaction_type', 'daily_message').eq('local_date', candidateLocalDate).limit(1).maybeSingle(),
    admin.from('whatsapp_daily_deliveries').select('id').eq('user_id', userId).eq('local_date', candidateLocalDate).eq('status', 'sent').limit(1).maybeSingle(),
  ]);
  if (dailyInteractionError || sentDeliveryError) throw new Error('onboarding_delivery_lookup_failed');
  const intendedLocalDate = chooseFirstIntendedLocalDate({ candidate: candidateLocalDate, timezone, now, occupied: Boolean(dailyInteraction || sentDelivery) });
  const prepared = await refillApprovedBuffer(admin, userId, { now, minBufferDays: 1, targetBufferDays: 1, maxCostUsd: Number(process.env.REFILL_MAX_COST_USD || 0.03), firstIntendedLocalDate: intendedLocalDate });
  if (prepared.created.length === 0 && !prepared.skipped.includes('buffer_at_target')) throw new Error('first_buffer_not_prepared');
  const welcome = await ensureActivationWelcome(admin, { userId, firstName: profile.first_name, preferredName: profile.preferred_name, timezone, now });
  const delivery = await scheduleWelcomeDelivery(admin, { userId, interactionId: String(welcome.interaction.id), dueAt: new Date(now.getTime() + 60_000) });
  const [{ data: persistedWelcome, error: persistedWelcomeError }, { data: persistedDelivery, error: persistedDeliveryError }] = await Promise.all([
    admin.from('interactions').select('id').eq('user_id', userId).eq('interaction_type', 'nia_welcome').maybeSingle(),
    admin.from('whatsapp_welcome_deliveries').select('id,interaction_id,due_at').eq('user_id', userId).maybeSingle(),
  ]);
  if (persistedWelcomeError || persistedDeliveryError || !persistedWelcome || !persistedDelivery || persistedDelivery.interaction_id !== String(persistedWelcome.id)) throw new Error('welcome_persistence_failed');
  const { error: completionError } = await admin.from('profiles').update({ onboarding_completed: true, onboarding_completed_at: now.toISOString(), message_frequency: normalizedProfile.message_frequency, message_time_2: normalizedProfile.message_time_2, timezone }).eq('id', userId).eq('onboarding_completed', false);
  if (completionError) throw new Error('onboarding_completion_failed');
  const { data: completedProfile, error: completedProfileError } = await admin.from('profiles').select('onboarding_completed,onboarding_completed_at').eq('id', userId).maybeSingle();
  if (completedProfileError || !completedProfile?.onboarding_completed || !completedProfile.onboarding_completed_at) throw new Error('onboarding_completion_failed');
  return { alreadyCompleted: false, intendedLocalDate, welcomeScheduled: true, welcomeDueAt: delivery.due_at, bufferPrepared: prepared.created.length > 0 || prepared.skipped.includes('buffer_at_target') };
}
