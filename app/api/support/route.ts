import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const MAX_SUBJECT = 160;
const MAX_MESSAGE = 4000;
function normalizedText(value: unknown, max: number) { return typeof value === 'string' ? value.trim().replace(/[ \t]+/g, ' ').slice(0, max) : ''; }
function safeError(error: unknown) { return error instanceof Error ? error.message.slice(0, 160) : 'support_email_failed'; }

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const subject = normalizedText(body?.subject, MAX_SUBJECT);
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE) : '';
  if (!subject || !message) return NextResponse.json({ error: 'subject_and_message_required' }, { status: 422 });
  const admin = createAdminClient();
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    admin.from('profiles').select('first_name,last_name,preferred_name,timezone').eq('id', user.id).maybeSingle(),
    admin.from('subscriptions').select('plan_key,status,trial').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const createdAt = new Date().toISOString();
  const metadata = { preferred_name: profile?.preferred_name ?? null, first_name: profile?.first_name ?? null, last_name: profile?.last_name ?? null, email: user.email ?? null, plan_key: subscription?.plan_key ?? null, subscription_status: subscription?.status ?? null, trial: subscription?.trial ?? false, path: typeof body?.path === 'string' ? body.path.slice(0, 200) : '/app/tu', timezone: profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone, timestamp: createdAt, user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? null };
  const { data: supportRequest, error: insertError } = await admin.from('support_requests').insert({ user_id: user.id, subject, message, status: 'pending', metadata }).select('id').single();
  if (insertError || !supportRequest) return NextResponse.json({ error: 'support_request_unavailable' }, { status: 500 });
  const recipient = process.env.SUPPORT_EMAIL_TO; const resendKey = process.env.RESEND_API_KEY; const sender = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
  if (!recipient || !resendKey || !sender) { const missing = [!recipient && 'SUPPORT_EMAIL_TO', !resendKey && 'RESEND_API_KEY', !sender && 'RESEND_FROM_EMAIL'].filter(Boolean); console.error('[support email not configured]', { missing }); await admin.from('support_requests').update({ status: 'failed', last_error: `missing:${missing.join(',')}` }).eq('id', supportRequest.id); return NextResponse.json({ error: 'support_email_not_configured', retryable: true }, { status: 503 }); }
  const text = `Nueva solicitud de soporte NIA\n\nAsunto:\n${subject}\n\nMensaje:\n${message}\n\nUsuario:\nAlias: ${profile?.preferred_name || profile?.first_name || 'No disponible'}\nNombre: ${[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'No disponible'}\nCorreo: ${user.email || 'No disponible'}\nUser ID: ${user.id}\n\nSuscripción:\nPlan: ${subscription?.plan_key || 'No disponible'}\nEstado: ${subscription?.status || 'No disponible'}\nTrial: ${subscription?.trial ? 'Sí' : 'No'}\n\nContexto técnico:\nRuta: ${metadata.path}\nTimezone: ${metadata.timezone}\nFecha: ${createdAt}`;
  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: sender, to: [recipient], subject: `[NIA Soporte] ${subject}`, text, ...(user.email ? { reply_to: user.email } : {}) }), signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error('resend_provider_error');
    await admin.from('support_requests').update({ status: 'sent', sent_at: new Date().toISOString(), last_error: null }).eq('id', supportRequest.id);
    return NextResponse.json({ status: 'sent' });
  } catch (error) {
    console.error('[support email failed]', { requestId: supportRequest.id, reason: safeError(error) });
    await admin.from('support_requests').update({ status: 'failed', last_error: safeError(error) }).eq('id', supportRequest.id);
    return NextResponse.json({ error: 'support_email_failed', retryable: true }, { status: 503 });
  }
}
