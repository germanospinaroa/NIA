import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
    const allowed = (process.env.NIA_ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
    if (!user || !user.email || !allowed.includes(user.email.toLowerCase())) return NextResponse.redirect(new URL('/login', request.url));
  }
  if (request.nextUrl.pathname === '/login' && user) return NextResponse.redirect(new URL('/app', request.url));
  return supabaseResponse;
}

export const config = { matcher: ['/app/:path*', '/admin/:path*', '/login', '/onboarding/:path*'] };
