import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processHotmartEvent, validHotmartToken } from '@/lib/server/hotmart';

export async function POST(request: Request) {
  const token = request.headers.get('x-hotmart-hottok');
  if (!validHotmartToken(token, process.env.HOTMART_HOTTOK)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  try {
    const result = await processHotmartEvent(createAdminClient(), payload, new URL(request.url).origin);
    return NextResponse.json({ ok: true, duplicate: result.duplicate });
  } catch (error) {
    console.error('[hotmart webhook] processing failed', { code: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'hotmart_processing_failed' }, { status: 500 });
  }
}
