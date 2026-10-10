import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const EVENT_NAMES = new Set(['discover_started', 'premium_funnel_started', 'discover_screen_viewed', 'discover_screen_completed', 'premium_funnel_completed', 'pricing_viewed', 'plan_viewed', 'plans_viewed', 'plan_selected']);
const SCREEN_KEYS = new Set(['recognition', 'reframe', 'evidence', 'personalize', 'demo', 'continuity', 'testimonials']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function boundedString(value: unknown, max: number) { return typeof value === 'string' && value.length <= max ? value : null; }

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const sessionId = typeof input.session_id === 'string' && UUID.test(input.session_id) ? input.session_id : null;
    const eventName = typeof input.event_name === 'string' && EVENT_NAMES.has(input.event_name) ? input.event_name : null;
    const funnelVersion = input.funnel_version === 'short_v1' || input.funnel_version === 'short_v2' ? input.funnel_version : null;
    const screenIndex = input.screen_index == null ? null : Number.isInteger(input.screen_index) && Number(input.screen_index) >= 1 && Number(input.screen_index) <= 6 ? Number(input.screen_index) : null;
    const screenKey = input.screen_key == null ? null : typeof input.screen_key === 'string' && SCREEN_KEYS.has(input.screen_key) ? input.screen_key : null;
    if (!sessionId || !eventName || !funnelVersion) return NextResponse.json({ accepted: false }, { status: 400 });
    const { error } = await createAdminClient().from('funnel_events').insert({ session_id: sessionId, event_name: eventName, funnel_version: funnelVersion, screen_index: screenIndex, screen_key: screenKey, pathname: boundedString(input.pathname, 120) ?? '/', referrer: boundedString(input.referrer, 500), utm_source: boundedString(input.utm_source, 120), utm_medium: boundedString(input.utm_medium, 120), utm_campaign: boundedString(input.utm_campaign, 120) });
    if (error) { console.error('funnel_event_persist_failed', { code: error.code }); return NextResponse.json({ accepted: false }, { status: 202 }); }
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch {
    return NextResponse.json({ accepted: false }, { status: 202 });
  }
}
