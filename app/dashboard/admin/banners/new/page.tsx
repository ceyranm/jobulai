/**
 * Yeni Banner Ekleme Sayfası
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ModernHeader from '@/components/modern-header';
import BannerForm from '../banner-form';

export default async function NewBannerPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 bg-grid-pattern">
      <ModernHeader 
        title="Yeni Banner Ekle"
        subtitle="Slider Kartı Oluşturun"
        backLink={{
          href: '/dashboard/admin/banners',
          label: 'Banner Yönetimi'
        }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BannerForm />
      </main>
    </div>
  );
}
