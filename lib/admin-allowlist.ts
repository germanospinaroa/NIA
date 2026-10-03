export function isAdminEmail(email: string | null | undefined, configured = process.env.NIA_ADMIN_EMAILS || '') {
  if (!email) return false;
  const allowed = configured.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
