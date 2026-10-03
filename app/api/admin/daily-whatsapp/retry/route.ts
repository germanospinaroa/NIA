import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { claimExistingFailedDelivery, sendClaimedDelivery } from '@/lib/server/whatsapp-daily';

export const maxDuration = 30;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const deliveryId = body && typeof body === 'object' && typeof (body as { delivery_id?: unknown }).delivery_id === 'string' ? (body as { delivery_id: string }).delivery_id : null;
  if (!deliveryId || !/^[0-9a-f-]{36}$/i.test(deliveryId)) return NextResponse.json({ error: 'invalid_delivery_id' }, { status: 400 });

  const admin = createAdminClient();
  try {
    const outcome = await claimExistingFailedDelivery(admin, deliveryId);
    if (outcome.kind === 'not_found') return NextResponse.json({ error: 'delivery_not_found' }, { status: 404 });
    if (outcome.kind === 'already_sent') return NextResponse.json({ status: 'already_sent', delivery_id: deliveryId });
    if (outcome.kind === 'locked') return NextResponse.json({ error: 'delivery_locked' }, { status: 409 });
    if (outcome.kind === 'not_retryable') return NextResponse.json({ error: 'delivery_not_retryable', status: outcome.status }, { status: 409 });
    if (outcome.kind !== 'claimed') return NextResponse.json({ error: 'delivery_retry_unavailable' }, { status: 503 });

    const { claim } = outcome;
    const [{ data: interaction, error: interactionError }, { data: connection, error: connectionError }] = await Promise.all([
      admin.from('interactions').select('id,user_id,content').eq('id', claim.interactionId).eq('user_id', claim.userId).maybeSingle(),
      admin.from('whatsapp_connections').select('user_id,wa_id,status').eq('user_id', claim.userId).eq('status', 'connected').maybeSingle(),
    ]);
    if (interactionError || !interaction) return NextResponse.json({ error: 'interaction_not_found' }, { status: 422 });
    if (connectionError || !connection?.wa_id) return NextResponse.json({ error: 'whatsapp_not_connected' }, { status: 422 });

    const delivery = await sendClaimedDelivery(admin, claim, connection.wa_id, String(interaction.content));
    if (!delivery.ok) return NextResponse.json({ error: 'delivery_failed', reason: delivery.reason }, { status: 502 });
    return NextResponse.json({ status: 'sent', delivery_id: claim.id, interaction_id: claim.interactionId, slot: claim.slot, provider_message_id_present: Boolean(delivery.providerMessageId) });
  } catch (error) {
    console.error('[daily-whatsapp-retry] failed', { reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'delivery_retry_unavailable' }, { status: 503 });
  }
}
