import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  // Check if required environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing required Supabase environment variables");
    return {
      supabase: null,
      response,
      error: "Missing Supabase configuration"
    };
  }

  let supabase;
  try {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the cookies for the request and response
            request.cookies.set({
              name,
              value,
              ...options
            });
            response = NextResponse.next({
              request: {
                headers: request.headers
              }
            });
            response.cookies.set({
              name,
              value,
              ...options
            });
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the cookies for the request and response
            request.cookies.set({
              name,
              value: '',
              ...options
            });
            response = NextResponse.next({
              request: {
                headers: request.headers
              }
            });
            response.cookies.set({
              name,
              value: '',
              ...options
            });
          }
        }
      }
    );
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return {
      supabase: null,
      response,
      error: "Failed to create Supabase client"
    };
  }

  return { supabase, response };
};

export const updateSession = async (request: NextRequest) => {
  try {
    const { supabase, response, error } = createClient(request);

    // If there was an error creating the client, return a safe response
    if (error || !supabase) {
      console.error("Supabase client error:", error);
      return NextResponse.next({
        request: {
          headers: request.headers
        }
      });
    }

    // This will refresh session if expired - required for Server Components
    let user;
    try {
      const { data: { user: userData } } = await supabase.auth.getUser();
      user = userData;
    } catch (authError) {
      console.error("Supabase auth error:", authError);
      // If there's an error with auth, continue without user data
      // This allows the app to work even if Supabase auth is temporarily unavailable
    }

    const isPublicRoute = request.nextUrl.pathname.startsWith('/admin/login') ||
                          request.nextUrl.pathname.startsWith('/auth');

    // Only redirect if we know the user doesn't exist and it's an admin route
    if (!user && !isPublicRoute && request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    return response;
  } catch (e) {
    console.error("Session update error:", e);
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};