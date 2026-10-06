import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin-allowlist';
import { isQaEmail } from '@/lib/qa-allowlist';
import { randomBytes } from 'node:crypto';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.from('hotmart_entitlements').select('user_id,status').ilike('buyer_email', email).order('created_at', { ascending: false }).limit(10);
  if (error && error.code !== '42P01') return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
  const eligible = (data ?? []).some(row => Boolean(row.user_id) && !['canceled', 'cancelled', 'refunded', 'expired'].includes(String(row.status).toLowerCase()));
  const adminAuthorized = isAdminEmail(email);
  const qaAuthorized = isQaEmail(email);
  const accessAuthorized = adminAuthorized || qaAuthorized;
  if (!eligible && !accessAuthorized) return NextResponse.json({ ok: true });

  if (accessAuthorized) {
    let userId: string | null = null;
    let createdQaUser = false;
    for (let page = 1; page <= 20 && !userId; page += 1) {
      const listed = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (listed.error) return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
      const match = listed.data.users.find(candidate => candidate.email?.trim().toLowerCase() === email);
      userId = match?.id ?? null;
      if (listed.data.users.length < 1000) break;
    }
    if (!userId) {
      const created = await admin.auth.admin.createUser({ email, password: randomBytes(32).toString('hex'), email_confirm: true, user_metadata: { must_set_password: true, account_status: 'pending_activation' } });
      if (created.error || !created.data.user) return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
      userId = created.data.user.id;
      createdQaUser = true;
    }
    if (createdQaUser) {
      const { error: profileError } = await admin.from('profiles').upsert({ id: userId, first_name: 'NIA', account_status: 'pending_activation', must_set_password: true }, { onConflict: 'id' });
      if (profileError) return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
    } else {
      const { data: profile, error: profileLookupError } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (profileLookupError) return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
      if (!profile) {
        const { error: profileInsertError } = await admin.from('profiles').insert({ id: userId, first_name: 'NIA', account_status: 'pending_activation', must_set_password: true });
        if (profileInsertError) return NextResponse.json({ error: 'access_unavailable' }, { status: 503 });
      }
    }
  }

  const supabase = await createClient();
  const otp = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (otp.error) {
    console.error('[auth] otp delivery failed', { code: otp.error.name || 'supabase_error', status: otp.error.status ?? 'unknown' });
    return NextResponse.json({ error: 'otp_delivery_failed' }, { status: 503 });
  }
  // Unknown and ineligible emails receive the same response as eligible ones.
  return NextResponse.json({ ok: true });
}
