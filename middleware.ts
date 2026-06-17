import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/ad-min') && pathname !== '/ad-min/login') {
    const cookie = request.cookies.get('im_admin')?.value;

    if (!process.env.ADMIN_PASSWORD || cookie !== process.env.ADMIN_PASSWORD) {
      const loginUrl = new URL('/ad-min/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ad-min/:path*'],
};
