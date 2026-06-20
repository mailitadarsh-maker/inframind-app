import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAIN_DOMAINS = ['inframindhq.online', 'localhost'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const host = hostname.split(':')[0];

  // Admin auth check
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get('im_admin')?.value;
    if (!process.env.ADMIN_PASSWORD || cookie !== process.env.ADMIN_PASSWORD) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Custom domain routing
  const isMainDomain = MAIN_DOMAINS.some(d => host === d || host.endsWith('.inframindhq.online') || host.endsWith('.vercel.app'));
  if (!isMainDomain) {
    const url = request.nextUrl.clone();
    url.pathname = '/custom-blog' + (pathname === '/' ? '' : pathname);

    // Must set header on the REQUEST (not response) so the page can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-custom-domain', host);

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
