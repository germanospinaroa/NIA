import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { getNextMessageHealthDetail } from '@/lib/server/next-message-health';
import { recordAdminAudit } from '@/lib/server/operational-observability';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const admin = createAdminClient();
  await recordAdminAudit(admin, { adminUserId: access.user.id, action: 'view_next_message_health', targetType: 'user', targetId: id, metadata: { user_id: id } });
  try {
    return NextResponse.json(await getNextMessageHealthDetail(admin, id));
  } catch {
    return NextResponse.json({ error: 'next_message_health_unavailable' }, { status: 503 });
  }
}
