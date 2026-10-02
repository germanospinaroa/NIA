import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/onboarding';
  const authError = url.searchParams.get('error_code') || url.searchParams.get('error');
  if (authError) return NextResponse.redirect(new URL(`/acceso?error=${authError === 'otp_expired' || authError === 'access_denied' ? 'link_used' : 'auth_failed'}`, url.origin));
  if (!code) return NextResponse.redirect(new URL('/acceso?error=missing_code', url.origin));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/acceso?error=link_used', url.origin));
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
