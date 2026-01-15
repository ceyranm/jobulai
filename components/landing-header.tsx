/**
 * Landing Page Header Component
 * 
 * Exsit-style modern SaaS header
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDefaultRoute } from '@/lib/auth/roles';
import type { UserRole } from '@/types/database';
import Logo from './logo';

export default function LandingHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        // Kullanıcının rolünü al
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role) {
          setUserRole(profile.role);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, [pathname]);

  // Menü açıkken body scroll'unu engelle
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="h-10 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="#about"
                className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-slate-50"
              >
                Hakkımızda
              </Link>
              <Link
                href="#features"
                className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-slate-50"
              >
                Özellikler
              </Link>
              <Link
                href="#how-it-works"
                className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-slate-50"
              >
                Nasıl Çalışır?
              </Link>
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {isLoggedIn && userRole ? (
                <Link
                  href={getDefaultRoute(userRole as UserRole)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
                  >
                    Ücretsiz Başla
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menüyü aç"
            >
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <Logo className="h-8 w-auto" />
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menüyü kapat"
            >
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-1">
              <Link
                href="#about"
                onClick={closeMenu}
                className="block px-4 py-3 text-base font-semibold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                Hakkımızda
              </Link>
              <Link
                href="#features"
                onClick={closeMenu}
                className="block px-4 py-3 text-base font-semibold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                Özellikler
              </Link>
              <Link
                href="#how-it-works"
                onClick={closeMenu}
                className="block px-4 py-3 text-base font-semibold text-slate-700 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                Nasıl Çalışır?
              </Link>
            </div>

            {/* Menu Footer Buttons */}
            <div className="mt-8 space-y-3 pt-6 border-t border-slate-200">
              {isLoggedIn && userRole ? (
                <Link
                  href={getDefaultRoute(userRole as UserRole)}
                  onClick={closeMenu}
                  className="block w-full px-6 py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={closeMenu}
                    className="block w-full px-6 py-3 text-center text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={closeMenu}
                    className="block w-full px-6 py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Ücretsiz Başla
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
