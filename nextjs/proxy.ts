import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);
  
  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Root redirect
  if (pathname === '/') {
    url.pathname = user ? '/account' : '/login';
    return NextResponse.redirect(url);
  }

  // 2. Define protection rules
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isApiRoute = pathname.startsWith('/api');
  const isStatic = pathname.startsWith('/_next') || pathname.includes('.');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!user && !isAuthRoute && !isApiRoute && !isStatic && !isAdminRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 3. Admin protection
  if (!user && isAdminRoute && pathname !== '/admin' && !pathname.startsWith('/admin/login')) {
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
