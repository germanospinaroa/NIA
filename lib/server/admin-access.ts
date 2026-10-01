import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allowed = (process.env.NIA_ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  if (!user || !user.email || !allowed.includes(user.email.toLowerCase())) return { user: null, supabase: null };
  return { user, supabase };
}
