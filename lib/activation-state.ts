export type PasswordUpdateError = { code?: string | null } | null | undefined;

/** Supabase reports same_password when the activation password is already set. */
export function passwordRequirementSatisfied(error: PasswordUpdateError) {
  return !error || error.code === 'same_password';
}
