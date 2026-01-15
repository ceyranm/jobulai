/**
 * Profil Sayfası (Profilim)
 *
 * Kullanıcının tüm profil bilgilerini görüntüleyip yönetebileceği sayfa
 * Temel Bilgiler, Aday Bilgileri ve Belgeler bölümleri
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';
import ProfileDocumentCard from '@/components/profile-document-card';
import ChangePasswordForm from '@/components/change-password-form';
import PhoneNumberEditor from '@/components/phone-number-editor';
import AddressEditor from '@/components/address-editor';
import ExperienceYearsEditor from '@/components/experience-years-editor';
import SkillsEditor from '@/components/skills-editor';
import AccountDeletionRequest from '@/components/account-deletion-request';
import Footer from '@/components/footer';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Profil bilgilerini al
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  // Aday bilgilerini al (varsa)
  const { data: candidateInfo } = await supabase
    .from('candidate_info')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  // Belgeleri al
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('profile_id', user.id)
    .order('updated_at', { ascending: false });

  // Belge türlerini tanımla
  const documentTypes = [
    { type: 'KIMLIK', label: 'Kimlik Belgesi', icon: '🆔' },
    { type: 'RESIDENCE', label: 'İkametgah', icon: '🏠' },
    { type: 'POLICE', label: 'Sabıka Kaydı', icon: '🔒' },
    { type: 'CV', label: 'CV', icon: '📄' },
    { type: 'DIPLOMA', label: 'Diploma', icon: '🎓' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernHeader
        title="Profilim"
        subtitle="Profil Bilgileri ve Belgeler"
        backLink={{
          href: `/dashboard/${profile.role.toLowerCase()}`,
          label: 'Ana Sayfa'
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profil Bilgileri - Yan Yana Kartlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Temel Bilgiler Kartı */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h2>
                <p className="text-gray-600">Kişisel bilgileriniz</p>
              </div>
            </div>
            {profile.role === 'CANDIDATE' && (profile.application_status === 'NEW_APPLICATION' || profile.application_status === 'UPDATE_REQUIRED') && (
              <div className="mb-6">
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Düzenle
                </Link>
              </div>
            )}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Ad Soyad
                </label>
                <p className="text-gray-900 font-medium">{profile.full_name || 'Belirtilmemiş'}</p>
              </div>

              <PhoneNumberEditor phone={candidateInfo?.phone || null} profileId={user.id} />

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  TC Kimlik No
                </label>
                <p className="text-gray-900 font-medium">{candidateInfo?.national_id || 'Belirtilmemiş'}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Doğum Tarihi
                </label>
                <p className="text-gray-900 font-medium">
                  {candidateInfo?.date_of_birth
                    ? new Date(candidateInfo.date_of_birth).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          {/* Aday Bilgileri Kartı (Eğer CANDIDATE ise) */}
          {profile.role === 'CANDIDATE' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Aday Bilgileri</h2>
                  <p className="text-gray-600">İş ve eğitim bilgileriniz</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-4 border border-emerald-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    E-posta
                  </label>
                  <p className="text-gray-900 font-medium">{user.email || candidateInfo?.email || 'Belirtilmemiş'}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-4 border border-emerald-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Kayıt Tarihi
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(profile.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <AddressEditor address={candidateInfo?.address || null} profileId={user.id} />

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-4 border border-emerald-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Eğitim Seviyesi
                  </label>
                  <p className="text-gray-900 font-medium">{candidateInfo?.education_level || 'Belirtilmemiş'}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-4 border border-emerald-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Deneyim Yılı
                  </label>
                  <p className="text-gray-900 font-medium">{candidateInfo?.experience_years || 0} yıl</p>
                </div>

                <SkillsEditor skills={candidateInfo?.skills || []} profileId={user.id} />
              </div>
            </div>
          )}
        </div>


        {/* Şifre Yenileme Bölümü (Tüm roller için) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Güvenlik Ayarları</h2>
              <p className="text-gray-600">Şifrenizi güncelleyin ve hesabınızı koruyun</p>
            </div>
          </div>
          <ChangePasswordForm />
        </div>

        {/* Hesap Silme Bölümü */}
        <AccountDeletionRequest profileId={user.id} />
      </main>
      <Footer simple />
    </div>
  );
}
