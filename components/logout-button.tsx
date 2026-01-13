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
    const supabase = createClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      router.push('/');
      router.refresh();
    } else {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      Çıkış Yap
    </button>
  );
}
