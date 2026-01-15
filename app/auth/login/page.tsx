/**
 * Login Sayfası
 * 
 * Kullanıcıların giriş yapabileceği sayfa
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDefaultRoute } from '@/lib/auth/roles';
import type { UserRole } from '@/types/database';
import LoginForm from './login-form';

async function LoginPageWrapper() {
  const supabase = await createClient();
  
  // Kullanıcı zaten giriş yapmışsa dashboard'una yönlendir
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role) {
      const defaultRoute = getDefaultRoute(profile.role as UserRole);
      redirect(defaultRoute);
    }
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      }
    >
      <LoginPageWrapper />
    </Suspense>
  );
}
