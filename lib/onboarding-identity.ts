function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function hasConfirmedOnboardingIdentity(learningProfile: unknown) {
  const onboarding = record(record(learningProfile).onboarding);
  const identity = record(onboarding.identity);
  return identity.status === 'answered' && typeof identity.confirmed_at === 'string' && Boolean(identity.confirmed_at);
}
