import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';

  if (host.startsWith('transition.')) {
    const { pathname } = req.nextUrl;

    // Root → SNF disclosure page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/snf', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
