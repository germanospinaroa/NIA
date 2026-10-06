import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.from('hotmart_entitlements').select('user_id,status').ilike('buyer_email', email).order('created_at', { ascending: false }).limit(10);
  if (error && error.code !== '42P01') return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
  const eligible = (data ?? []).some(row => Boolean(row.user_id) && !['canceled', 'cancelled', 'refunded', 'expired'].includes(String(row.status).toLowerCase()));
  if (eligible) {
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  }
  // Unknown and ineligible emails receive the same response as eligible ones.
  return NextResponse.json({ ok: true });
}
