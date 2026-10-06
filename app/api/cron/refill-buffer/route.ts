import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { refillApprovedBuffer, refillEligibleProductionUsers } from '@/lib/server/refill-approved-buffer';
import { recordEvent } from '@/lib/server/operational-observability';

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (process.env.REFILL_BUFFER_ENABLED !== 'true') return NextResponse.json({ enabled: false, status: 'disabled' });
  const admin = createAdminClient();
  if (process.env.REFILL_PRODUCTION_ENABLED === 'true') {
    try {
      const result = await refillEligibleProductionUsers(admin, {
        onEvent: event => recordEvent(admin, { userId: event.userId, eventType: event.eventType, entityType: 'approved_intervention_buffer', metadata: event.metadata }),
      });
      return NextResponse.json({ success: true, mode: 'production', result });
    } catch (error) {
      console.error('approved_buffer_production_refill_failed', { reason: error instanceof Error ? error.message : 'unknown' });
      return NextResponse.json({ error: 'approved_buffer_production_refill_failed' }, { status: 503 });
    }
  }
  const userId = process.env.REFILL_TEST_USER_ID;
  if (!userId) return NextResponse.json({ error: 'refill_test_user_not_configured' }, { status: 503 });
  try {
    const result = await refillApprovedBuffer(admin, userId);
    return NextResponse.json({ success: true, mode: 'qa_single_user', result });
  } catch (error) {
    console.error('approved_buffer_refill_failed', { user_id: userId, reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'approved_buffer_refill_failed' }, { status: 503 });
  }
}
