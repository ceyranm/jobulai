/**
 * Admin Settings Sayfası
 * 
 * Sistem ayarlarını yönetmek için admin sayfası
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ModernHeader from '@/components/modern-header';
import SettingsForm from '@/components/settings-form';

export default async function AdminSettingsPage() {
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

  // Mevcut ayarları al
  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['logo_url', 'meta_title', 'meta_description']);

  const logoUrl = settings?.find(s => s.key === 'logo_url')?.value || '';
  const metaTitle = settings?.find(s => s.key === 'meta_title')?.value || '';
  const metaDescription = settings?.find(s => s.key === 'meta_description')?.value || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 bg-grid-pattern">
      <ModernHeader 
        title="Sistem Ayarları"
        subtitle="Logo ve Genel Ayarlar"
        backLink={{
          href: '/dashboard/admin',
          label: 'Dashboard'
        }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsForm 
          logoUrl={logoUrl}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
        />
      </main>
    </div>
  );
}
