import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runDailyWhatsApp } from '@/lib/server/whatsapp-daily';

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const dryRun = new URL(request.url).searchParams.get('dry_run') === 'true';
  try {
    const results = await runDailyWhatsApp(createAdminClient(), new Date(), { dryRun });
    return NextResponse.json({ success: true, dry_run: dryRun, processed: results.length, results });
  } catch (error) {
    console.error('daily_whatsapp_job_failed', { reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'daily_whatsapp_unavailable' }, { status: 503 });
  }
}
