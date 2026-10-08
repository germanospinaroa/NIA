import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDueWelcomeDeliveries } from '@/lib/server/welcome-delivery';
import { recoverIncompleteActivations } from '@/lib/server/onboarding-finalization';

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.WELCOME_CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const admin = createAdminClient();
    const recovery = await recoverIncompleteActivations(admin);
    const results = await sendDueWelcomeDeliveries(admin);
    return NextResponse.json({ success: true, recovery, processed: results.length, results });
  } catch (error) {
    console.error('welcome_delivery_job_failed', { reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'welcome_delivery_unavailable' }, { status: 503 });
  }
}
