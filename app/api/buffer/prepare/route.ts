import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { refillApprovedBuffer } from '@/lib/server/refill-approved-buffer';

export const maxDuration = 300;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const result = await refillApprovedBuffer(createAdminClient(), user.id);
    return NextResponse.json({ status: 'prepared', result });
  } catch (error) {
    console.error('[buffer prepare] failed', { userId: user.id, reason: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'buffer_prepare_failed' }, { status: 503 });
  }
}
