import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all /admin routes — only signed-in users may enter;
  // the admin page itself checks the admin role via RLS/UI.
  if (user && request.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
