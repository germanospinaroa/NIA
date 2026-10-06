import { NextResponse } from 'next/server';

/** Legacy callback kept only so old bookmarks fail closed; auth no longer uses links. */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/acceso?error=auth_flow_retired', request.url));
}
