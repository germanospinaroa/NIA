import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { planConfig } from '@/lib/hotmart-checkout';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const sessionId = typeof input.session_id === 'string' && UUID.test(input.session_id) ? input.session_id : null;
    const plan = input.plan === 'monthly' || input.plan === 'annual' ? input.plan : null;
    const config = planConfig(plan);
    if (!sessionId || !plan || !config) return NextResponse.json({ created: false }, { status: 400 });
    const correlationId = randomUUID();
    const { error } = await createAdminClient().from('funnel_checkout_attempts').insert({ correlation_id: correlationId, session_id: sessionId, funnel_version: 'emotional_v3', plan, offer_code: config.offerCode });
    if (error) { console.error('funnel_checkout_attempt_failed', { code: error.code }); return NextResponse.json({ created: false }, { status: 503 }); }
    return NextResponse.json({ created: true, correlation_id: correlationId }, { status: 201 });
  } catch {
    return NextResponse.json({ created: false }, { status: 400 });
  }
}
