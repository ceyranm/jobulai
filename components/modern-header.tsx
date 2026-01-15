/**
 * Modern Header Component
 * 
 * Tüm sayfalarda kullanılacak modern header komponenti
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './logo';
import ProfileDropdown from './profile-dropdown';

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  backLink?: {
    href: string;
    label: string;
  };
  rightActions?: React.ReactNode;
  showProfileLink?: boolean;
  profileLinkHref?: string;
}

export default function ModernHeader({
  title,
  subtitle,
  backLink,
  rightActions,
  showProfileLink = false,
  profileLinkHref = '/profile',
}: ModernHeaderProps) {
  const pathname = usePathname();

  // Dashboard ana sayfası URL'ini belirle
  const getDashboardHomeUrl = () => {
    if (pathname?.includes('/dashboard/candidate')) {
      return '/dashboard/candidate';
    }
    if (pathname?.includes('/dashboard/consultant')) {
      return '/dashboard/consultant';
    }
    if (pathname?.includes('/dashboard/middleman')) {
      return '/dashboard/middleman';
    }
    if (pathname?.includes('/dashboard/admin')) {
      return '/dashboard/admin';
    }
    return '/';
  };

  // Dashboard sayfalarında otomatik title belirle
  const getAutoTitle = () => {
    if (title) return title;
    
    if (pathname?.includes('/dashboard/candidate')) {
      return 'Ana Sayfa';
    }
    if (pathname?.includes('/dashboard/consultant')) {
      return 'Consultant Dashboard';
    }
    if (pathname?.includes('/dashboard/middleman')) {
      return 'Middleman Dashboard';
    }
    if (pathname?.includes('/dashboard/admin')) {
      return 'Admin Dashboard';
    }
    return 'Dashboard';
  };

  const getAutoSubtitle = () => {
    if (subtitle) return subtitle;
    
    if (pathname?.includes('/dashboard/candidate')) {
      return 'Aday Paneli';
    }
    if (pathname?.includes('/dashboard/consultant')) {
      return 'Başvuru Yönetimi';
    }
    if (pathname?.includes('/dashboard/middleman')) {
      return 'Aday Yönetimi';
    }
    if (pathname?.includes('/dashboard/admin')) {
      return 'Sistem Yönetimi';
    }
    return '';
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Sol Taraf: Logo ve Başlık */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Logo */}
            <Link href={getDashboardHomeUrl()} className="flex items-center group">
              <Logo />
            </Link>

            {/* Başlık ve Alt Başlık - Sadece backLink varsa göster */}
            {backLink && (
              <div className="hidden md:block">
                <Link
                  href={backLink.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50/50 group/back flex-shrink-0"
                >
                  <svg 
                    className="w-4 h-4 transform group-hover/back:-translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{backLink.label}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Sağ Taraf: Aksiyonlar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {rightActions}
            
            {/* Profil Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
