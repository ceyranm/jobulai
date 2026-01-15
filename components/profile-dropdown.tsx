/**
 * Profile Dropdown Component
 * 
 * Sağ üst köşede profil menüsü ve dropdown
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfileDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Profil bilgilerini al
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();
          
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Dışarı tıklanınca dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      
      // Refresh token hatası olsa bile logout işlemini tamamla
      const { error } = await supabase.auth.signOut();
      
      // Hata olsa bile cookie'leri temizle ve yönlendir
      if (error && error.message?.includes('Refresh Token')) {
        // Cookie'leri manuel temizle
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      // Ana sayfaya yönlendir
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Logout error:', err);
      // Hata olsa bile ana sayfaya yönlendir
      router.push('/');
      router.refresh();
    }
  };

  const isAdmin = profile?.role === 'ADMIN';
  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profil Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group border border-transparent hover:border-gray-200/50"
      >
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-gray-900">
            {profile?.full_name || 'Kullanıcı'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {profile?.role?.toLowerCase() || 'Kullanıcı'}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-gray-700'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menü */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/60 py-2 z-50 transform transition-all duration-200 ease-out opacity-100 scale-100 backdrop-blur-sm">
          {/* Profil Bilgisi */}
          <div className="px-4 py-3 border-b border-gray-100/80 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
            <div className="text-sm font-semibold text-gray-900">
              {profile?.full_name || 'Kullanıcı'}
            </div>
            <div className="text-xs text-gray-500 capitalize mt-0.5">
              {profile?.role?.toLowerCase() || 'Kullanıcı'}
            </div>
          </div>

          {/* Menü Öğeleri */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-200 group/item"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover/item:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profilim</span>
            </Link>

            <Link
              href="/?view=true"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-200 group/item"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover/item:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Siteyi Görüntüle</span>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-200 group/item"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover/item:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Sistem Ayarları</span>
              </Link>
            )}

            <div className="border-t border-gray-100 my-1.5"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-all duration-200 group/item"
            >
              <svg className="w-5 h-5 text-red-400 group-hover/item:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
