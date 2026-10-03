import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsAppReplyButtons } from '@/lib/server/whatsapp';

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || typeof (body as { user_id?: unknown }).user_id !== 'string') return NextResponse.json({ error: 'invalid_user_id' }, { status: 400 });
  const userId = (body as { user_id: string }).user_id;
  const admin = createAdminClient();
  const { data: connection } = await admin.from('whatsapp_connections').select('wa_id,status').eq('user_id', userId).eq('status', 'connected').maybeSingle();
  if (!connection?.wa_id) return NextResponse.json({ error: 'whatsapp_not_connected' }, { status: 422 });
  const delivery = await sendWhatsAppReplyButtons(connection.wa_id, '¿Cómo te pareció esta prueba?', [{ id: 'liked', title: 'Me gustó' }, { id: 'mixed', title: 'Más o menos' }, { id: 'not_useful', title: 'No me funcionó' }]);
  if (!delivery.ok) return NextResponse.json({ status: 'failed', reason: delivery.reason }, { status: 502 });
  return NextResponse.json({ status: 'accepted', provider_message_id_present: Boolean(delivery.providerMessageId), provider_message_id: delivery.providerMessageId });
}
