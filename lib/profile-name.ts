export type ProfileName = { preferred_name?: string | null; first_name?: string | null };

export function preferredAddressName(profile: ProfileName | null | undefined) {
  const preferred = typeof profile?.preferred_name === 'string' ? profile.preferred_name.trim() : '';
  if (preferred) return preferred;
  const first = typeof profile?.first_name === 'string' ? profile.first_name.trim() : '';
  return first || null;
}
