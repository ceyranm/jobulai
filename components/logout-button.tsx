/**
 * Logout Button Component
 * 
 * Kullanıcıyı çıkış yaptıran buton
 */

'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

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

  return (
    <button
      onClick={handleLogout}
      className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all shadow-sm hover:shadow-md"
    >
      <svg 
        className="w-4 h-4 transform group-hover:rotate-12 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span className="hidden sm:inline">Çıkış Yap</span>
    </button>
  );
}
