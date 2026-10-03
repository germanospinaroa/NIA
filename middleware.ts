import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdminEmail } from '@/lib/admin-allowlist';
import { getSafeNextPath } from '@/lib/safe-next';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        const response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        supabaseResponse = response;
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if ((request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/onboarding')) && !user) return NextResponse.redirect(new URL('/acceso?error=auth_failed', request.url));
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login?next=/admin', request.url));
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  if (request.nextUrl.pathname === '/login' && user) {
    const nextPath = getSafeNextPath(request.nextUrl.searchParams.get('next'));
    return NextResponse.redirect(new URL(nextPath, request.url));
  }
  return supabaseResponse;
}

export const config = { matcher: ['/app/:path*', '/admin/:path*', '/login', '/onboarding/:path*'] };
