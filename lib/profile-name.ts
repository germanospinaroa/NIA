export type ProfileName = { preferred_name?: string | null; first_name?: string | null };

export function normalizeProfileName(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function isInvalidPreferredName(value: unknown) {
  return normalizeProfileName(value).toLocaleLowerCase() === 'nia';
}

export function safePreferredName(value: unknown) {
  const normalized = normalizeProfileName(value);
  return normalized && !isInvalidPreferredName(normalized) ? normalized : '';
}

export function preferredAddressName(profile: ProfileName | null | undefined) {
  const preferred = safePreferredName(profile?.preferred_name);
  if (preferred) return preferred;
  const first = safePreferredName(profile?.first_name);
  return first || null;
}
