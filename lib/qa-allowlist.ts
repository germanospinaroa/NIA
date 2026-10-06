export function isQaEmail(email: string | null | undefined, configured = process.env.NIA_QA_EMAILS || '') {
  if (!email) return false;
  const allowed = configured.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
