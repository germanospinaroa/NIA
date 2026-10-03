import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin-allowlist';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { user: null, supabase: null };
  return { user, supabase };
}
