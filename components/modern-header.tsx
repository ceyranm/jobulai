/**
 * Modern Header Component
 * 
 * Tüm sayfalarda kullanılacak modern header komponenti
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './logout-button';

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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Sol Taraf: Logo ve Başlık */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            {/* Logo */}
            <Link 
              href="/"
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                  <span className="text-2xl font-bold text-white">J</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Jobul<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
                </h1>
              </div>
            </Link>

            {/* Başlık ve Alt Başlık */}
            <div className="hidden md:block flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {backLink && (
                  <Link
                    href={backLink.href}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group/back flex-shrink-0"
                  >
                    <svg 
                      className="w-4 h-4 transform group-hover/back:-translate-x-0.5 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{backLink.label}</span>
                  </Link>
                )}
                {(getAutoTitle() || title) && (
                  <div className="flex items-center gap-2 min-w-0">
                    {backLink && (
                      <span className="text-gray-300">|</span>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {getAutoTitle()}
                      </h2>
                      {getAutoSubtitle() && (
                        <p className="text-xs text-gray-500 truncate">
                          {getAutoSubtitle()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Aksiyonlar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {showProfileLink && (
              <Link
                href={profileLinkHref}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden lg:inline">Profilim</span>
              </Link>
            )}
            
            {rightActions}
            
            <div className="flex items-center gap-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
