import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/onboarding';
  const authError = url.searchParams.get('error_code') || url.searchParams.get('error');
  if (authError) return NextResponse.redirect(new URL(`/acceso?error=${authError === 'otp_expired' || authError === 'access_denied' ? 'link_used' : 'auth_failed'}`, url.origin));
  if (!code) return NextResponse.redirect(new URL('/acceso?error=missing_code', url.origin));
  const response = NextResponse.redirect(new URL(safeNext, url.origin));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.headers.get('cookie') ? request.headers.get('cookie')!.split(';').map(value => {
          const separator = value.indexOf('=');
          return { name: value.slice(0, separator).trim(), value: decodeURIComponent(value.slice(separator + 1).trim()) };
        }) : [],
        setAll: cookiesToSet => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/acceso?error=link_used', url.origin));
  return response;
}
