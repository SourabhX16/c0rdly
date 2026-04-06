import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // During build (prerender), env vars may not exist — skip auth check
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 2. Public paths that skip auth: /login, /, anything starting with /f/, and /portal
  const isPublicPath = pathname === '/login' || pathname === '/' || pathname.startsWith('/f/') || pathname.startsWith('/portal');

  // 1. If no user, redirect to /login
  if (!user && !isPublicPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const isAuthRedirectPath = pathname === '/login' || pathname === '/';
    const isAdminPath = pathname.startsWith('/admin');
    const isPortalPath = pathname.startsWith('/portal');

    if (isAuthRedirectPath || isAdminPath || isPortalPath) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;

      // 3. If authenticated user visits /login or /
      if (isAuthRedirectPath) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = role === 'admin' ? '/admin' : '/portal';
        return NextResponse.redirect(redirectUrl);
      }

      // 4. If authenticated user visits any /admin/* path, but role is not admin
      if (isAdminPath && role !== 'admin') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/portal';
        return NextResponse.redirect(redirectUrl);
      }

      // 5. If authenticated user visits any /portal/* path, but role is admin
      if (isPortalPath && role === 'admin') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/admin';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}
