/**
 * Landing Page Header Component
 * 
 * Ana sayfa için özel header komponenti
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LandingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/"
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <span className="text-2xl font-bold text-white">J</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Jobul<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Özellikler
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Nasıl Çalışır?
            </Link>
            <Link
              href="#about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Hakkımızda
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/register"
              className="group relative px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">Kayıt Ol</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
