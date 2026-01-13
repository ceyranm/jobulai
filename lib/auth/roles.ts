/**
 * Rol Kontrol Fonksiyonları
 */

import type { UserRole } from '@/types/database';

// Rol hiyerarşisi: Hangi roller hangi sayfalara erişebilir?
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  CANDIDATE: ['/dashboard/candidate', '/profile', '/documents/upload'],
  MIDDLEMAN: ['/dashboard/middleman', '/candidates', '/profile', '/documents/upload'],
  CONSULTANT: ['/dashboard/consultant', '/candidates', '/documents/review', '/profile', '/applications'],
  ADMIN: ['/dashboard/admin', '/users', '/settings', '/profile'],
};

/**
 * Kullanıcının bir sayfaya erişim yetkisi var mı kontrol eder
 */
export function hasAccess(userRole: UserRole | null, pathname: string): boolean {
  if (!userRole) return false;
  
  // Admin her yere erişebilir
  if (userRole === 'ADMIN') return true;
  
  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  
  return allowedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Kullanıcının rolüne göre varsayılan yönlendirme sayfasını döndürür
 */
export function getDefaultRoute(userRole: UserRole | null): string {
  switch (userRole) {
    case 'CANDIDATE':
      return '/dashboard/candidate';
    case 'MIDDLEMAN':
      return '/dashboard/middleman';
    case 'CONSULTANT':
      return '/dashboard/consultant';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

/**
 * Kullanıcının rolünü veritabanından alır
 */
export async function getUserRole(supabase: any): Promise<UserRole | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;

  return profile.role as UserRole;
}
