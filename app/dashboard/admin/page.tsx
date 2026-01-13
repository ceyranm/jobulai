/**
 * Admin Dashboard Sayfası
 * 
 * Admin'lerin dashboard'u - Tüm kullanıcıları ve sistem ayarlarını yönetebilirler
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/logout-button';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'ADMIN') {
    redirect('/');
  }

  // Tüm kullanıcıları al (istatistikler için)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('role')
    .order('created_at', { ascending: false });

  // Rol bazlı sayıları hesapla
  const stats = {
    CANDIDATE: allProfiles?.filter(p => p.role === 'CANDIDATE').length || 0,
    MIDDLEMAN: allProfiles?.filter(p => p.role === 'MIDDLEMAN').length || 0,
    CONSULTANT: allProfiles?.filter(p => p.role === 'CONSULTANT').length || 0,
    ADMIN: allProfiles?.filter(p => p.role === 'ADMIN').length || 0,
    TOTAL: allProfiles?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Jobul<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz, {profile.full_name || 'Admin'}! 👋
          </h2>
          <p className="text-gray-600">
            Admin dashboard'unuza hoş geldiniz. Buradan tüm kullanıcıları yönetebilir,
            sistem ayarlarını değiştirebilirsiniz.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{stats.TOTAL}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aday</p>
                <p className="text-2xl font-bold text-gray-900">{stats.CANDIDATE}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Middleman</p>
                <p className="text-2xl font-bold text-gray-900">{stats.MIDDLEMAN}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👔</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Consultant</p>
                <p className="text-2xl font-bold text-gray-900">{stats.CONSULTANT}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admin</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ADMIN}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Yönetim İşlemleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
              <h4 className="font-semibold text-gray-900 mb-2">👥 Kullanıcı Yönetimi</h4>
              <p className="text-sm text-gray-600">Tüm kullanıcıları görüntüle ve yönet</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
              <h4 className="font-semibold text-gray-900 mb-2">⚙️ Sistem Ayarları</h4>
              <p className="text-sm text-gray-600">Sistem ayarlarını değiştir</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
