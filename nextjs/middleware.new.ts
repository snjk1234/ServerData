import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request);

    // Refresh session with error handling
    let user;
    if (supabase) {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser();
        user = userData;
      } catch (error) {
        console.error('Supabase auth error:', error);
        // If there's an error with Supabase auth, we'll continue without the user data
        // This allows the app to work even if Supabase is temporarily unavailable
      }
    }

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

    // If user is not authenticated and not on an allowed route, redirect to login
    // But only if we were able to successfully check the user's authentication status
    if (user === undefined && !isAuthRoute && !isApiRoute && !isStatic && !isAdminRoute) {
      // If we couldn't determine auth status, allow access to non-protected routes
      // For protected routes, redirect to login
      if (pathname !== '/' && !pathname.startsWith('/public')) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    } else if (!user && !isAuthRoute && !isApiRoute && !isStatic && !isAdminRoute) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // 3. Admin protection
    if (!user && isAdminRoute && pathname !== '/admin' && !pathname.startsWith('/admin/login')) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);

    // If there's an error with the middleware itself, allow the request to continue
    // This prevents the entire app from being blocked if there's a middleware error
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};