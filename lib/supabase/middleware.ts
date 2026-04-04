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

  // Public paths that don't require auth
  const publicPaths = ['/login', '/signup', '/'];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname === path
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')) {
    console.log('🔍 Login redirect - User ID:', user.id);
    
    // TEMPORARY: Always redirect to /admin for authenticated users
    console.log('⚠️ TEMPORARY: Redirecting all authenticated users to /admin');
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
    
    /* Original code - commented out for debugging
    // Fetch profile to determine role-based redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('🔍 Login redirect - Profile:', profile);

    const url = request.nextUrl.clone();
    if (profile?.role === 'admin') {
      console.log('✅ Redirecting to /admin');
      url.pathname = '/admin';
    } else {
      console.log('⚠️ Redirecting to /dashboard (not admin)');
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
    */
  }

  // Role-based route protection
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Admin route check - User ID:', user.id);
    
    // TEMPORARY: Skip role check, allow all authenticated users
    console.log('⚠️ TEMPORARY: Allowing all authenticated users to /admin');
    return supabaseResponse;
    
    /* Original code - commented out for debugging
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('🔒 Admin route check - Profile:', profile);
    console.log('🔒 Admin route check - Error:', profileError);

    // TEMPORARY: Allow access even if not admin (for debugging)
    if (!profile) {
      console.log('⚠️ No profile found, but allowing access for debugging');
      // Create profile on the fly
      await supabase.from('profiles').insert({
        id: user.id,
        role: 'admin',
        contact_email: user.email
      });
    } else if (profile?.role !== 'admin') {
      console.log('❌ Not admin, redirecting to /dashboard');
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    console.log('✅ Admin verified, allowing access');
    */
  }

  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('🔄 Dashboard redirect - redirecting to /admin');
    // TEMPORARY: Redirect dashboard to admin
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
    
    /* Original code - commented out
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    */
  }

  return supabaseResponse;
}
