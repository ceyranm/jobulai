/**
 * Banner Yönetimi Sayfası
 * 
 * Admin'lerin banner'ları yönetebileceği sayfa
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ModernHeader from '@/components/modern-header';
import BannerManagementClient from './banner-management-client';

export default async function BannerManagementPage() {
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

  // Tüm banner'ları al
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 bg-grid-pattern">
      <ModernHeader 
        title="Banner Yönetimi"
        subtitle="Slider Kartlarını Yönetin"
        backLink={{
          href: '/dashboard/admin',
          label: 'Dashboard'
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BannerManagementClient initialBanners={banners || []} />
      </main>
    </div>
  );
}
