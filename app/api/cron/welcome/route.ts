import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDueWelcomeDeliveries } from '@/lib/server/welcome-delivery';

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const results = await sendDueWelcomeDeliveries(createAdminClient());
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error('welcome_delivery_job_failed', { reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'welcome_delivery_unavailable' }, { status: 503 });
  }
}
