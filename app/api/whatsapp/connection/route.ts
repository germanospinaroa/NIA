import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { maskPhone, whatsappConfigured } from '@/lib/server/whatsapp';

type CanonicalStatus = 'connected' | 'not_connected';

function canonicalConnection(data: { id: string; status: string; phone_number: string | null; connected_at: string | null; last_message_at: string | null } | null) {
  const status: CanonicalStatus = data?.status === 'connected' ? 'connected' : 'not_connected';
  if (!data || status === 'not_connected') return { status } as const;
  return { ...data, status, phone_number: data.phone_number ? maskPhone(data.phone_number) : null, replacement: { status: 'none' as const, attempt_id: null } };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!whatsappConfigured()) return NextResponse.json({ status: 'not_configured', message: 'La conexión de WhatsApp todavía no está disponible.' });
  const attemptId = new URL(request.url).searchParams.get('attempt_id');
  const [{ data, error }, { data: attempt, error: attemptError }] = await Promise.all([
    supabase.from('whatsapp_connections').select('id,status,phone_number,connected_at,last_message_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    attemptId
      ? supabase.from('whatsapp_link_tokens').select('id,purpose,status,rejection_reason,expires_at,expected_phone').eq('user_id', user.id).eq('id', attemptId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (error || attemptError) {
    const databaseError = error || attemptError;
    return NextResponse.json({ status: 'unavailable', message: 'No pudimos consultar la conexión de WhatsApp.' }, { status: databaseError?.code === '42P01' ? 503 : 500 });
  }

  const canonical = canonicalConnection(data);

  // Historical tokens never control the account-level state. They are only
  // meaningful when the caller explicitly asks about that exact attempt.
  if (!attemptId || !attempt) return NextResponse.json({ connection: canonical });

  const isPending = attempt.status === 'pending' && new Date(attempt.expires_at).getTime() > Date.now();
  const isConflict = attempt.status === 'rejected' && attempt.rejection_reason === 'already_connected';
  const isReplacement = attempt.purpose === 'replace';
  const isSucceeded = isReplacement && attempt.status === 'used' && data?.status === 'connected' && Boolean(attempt.expected_phone) && data.phone_number === attempt.expected_phone;

  if (isReplacement) {
    const replacementStatus = isSucceeded ? 'succeeded' : isConflict ? 'conflict' : isPending ? 'pending' : 'none';
    return NextResponse.json({ connection: { ...canonical, replacement: { status: replacementStatus, attempt_id: attempt.id } } });
  }

  if (isConflict && canonical.status === 'not_connected') {
    return NextResponse.json({ connection: { status: 'conflict', message: 'Este número ya está conectado a otra cuenta de NIA.', replacement: { status: 'none', attempt_id: attempt.id } } });
  }
  if (isPending && canonical.status === 'not_connected') {
    return NextResponse.json({ connection: { status: 'connecting', replacement: { status: 'none', attempt_id: attempt.id } } });
  }
  return NextResponse.json({ connection: canonical });
}
