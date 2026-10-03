import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-access';

export async function GET() {
  const access = await requireAdmin();
  if (!access.user) return NextResponse.json({ allowed: false }, { status: 403 });
  return NextResponse.json({ allowed: true });
}
