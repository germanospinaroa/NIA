import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { refillApprovedBuffer } from '@/lib/server/refill-approved-buffer';

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (process.env.REFILL_BUFFER_ENABLED !== 'true') return NextResponse.json({ enabled: false, status: 'disabled' });
  const userId = process.env.REFILL_TEST_USER_ID;
  if (!userId) return NextResponse.json({ error: 'refill_test_user_not_configured' }, { status: 503 });
  try {
    const result = await refillApprovedBuffer(createAdminClient(), userId);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('approved_buffer_refill_failed', { user_id: userId, reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'approved_buffer_refill_failed' }, { status: 503 });
  }
}
