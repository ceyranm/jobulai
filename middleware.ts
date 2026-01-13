/**
 * Next.js Middleware - Rol Bazlı Yönlendirme ve Yetkilendirme
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from './lib/supabase/middleware';
import { hasAccess, getDefaultRoute, getUserRole } from './lib/auth/roles';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public route'lar (herkes erişebilir)
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') || // Tüm API route'ları public (kendi authentication'ları var)
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/test-db');

  // Public route ise kontrol yapmadan devam et
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Middleware client'ı oluştur
    const { supabase, response } = createClient(request);

    // Kullanıcının giriş yapıp yapmadığını kontrol et
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Kullanıcının rolünü al
    const role = await getUserRole(supabase);

    // Rol yoksa profil oluşturma sayfasına yönlendir
    if (!role) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/register/success';
      return NextResponse.redirect(redirectUrl);
    }

    // Kullanıcının bu sayfaya erişim yetkisi var mı kontrol et
    if (!hasAccess(role, pathname)) {
      // Yetkisiz erişim denemelerinde kullanıcıyı kendi dashboard'una gönder
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getDefaultRoute(role);
      return NextResponse.redirect(redirectUrl);
    }

    // Header'lara rol ve kullanıcı ID'si ekle (sayfalarda kullanmak için)
    response.headers.set('x-user-role', role);
    response.headers.set('x-user-id', user.id);

    return response;
  } catch (error) {
    // Hata durumunda login sayfasına yönlendir
    console.error('Middleware error:', error);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    return NextResponse.redirect(redirectUrl);
  }
}

// Middleware'in hangi route'larda çalışacağını belirle
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
