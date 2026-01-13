/**
 * Aday Detay Sayfası
 * 
 * Consultant ve Admin'lerin aday detaylarını görüntüleyebileceği sayfa
 */

import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/logout-button';

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Profil ve rol kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['CONSULTANT', 'ADMIN'].includes(profile.role)) {
    redirect('/');
  }

  // Aday profilini al
  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'CANDIDATE')
    .single();

  if (!candidateProfile) {
    notFound();
  }

  // Aday bilgilerini al
  const { data: candidateInfo } = await supabase
    .from('candidate_info')
    .select('*')
    .eq('profile_id', params.id)
    .single();

  // Adayın belgelerini al
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('profile_id', params.id)
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return 'Beklemede';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/${profile.role.toLowerCase()}`}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Dashboard'a Dön
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Aday Detayları: {candidateProfile.full_name || 'İsimsiz'}
        </h1>

        {/* Profil Bilgileri */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profil Bilgileri</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad
              </label>
              <p className="text-gray-900">{candidateProfile.full_name || 'Belirtilmemiş'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kayıt Tarihi
              </label>
              <p className="text-gray-900">
                {new Date(candidateProfile.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Aday Bilgileri */}
        {candidateInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Aday Bilgileri</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidateInfo.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <p className="text-gray-900">{candidateInfo.phone}</p>
                </div>
              )}

              {candidateInfo.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <p className="text-gray-900">{candidateInfo.email}</p>
                </div>
              )}

              {candidateInfo.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <p className="text-gray-900">{candidateInfo.address}</p>
                </div>
              )}

              {candidateInfo.education_level && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eğitim Seviyesi
                  </label>
                  <p className="text-gray-900">{candidateInfo.education_level}</p>
                </div>
              )}

              {candidateInfo.experience_years !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deneyim Yılı
                  </label>
                  <p className="text-gray-900">{candidateInfo.experience_years} yıl</p>
                </div>
              )}

              {candidateInfo.skills && Array.isArray(candidateInfo.skills) && candidateInfo.skills.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beceriler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {candidateInfo.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Belgeler */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Belgeler ({documents?.length || 0})
          </h2>

          {documents && documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.file_name}</h3>
                          <p className="text-sm text-gray-600">{doc.document_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Yüklenme: {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        {doc.file_size && (
                          <span>Boyut: {(doc.file_size / 1024).toFixed(2)} KB</span>
                        )}
                      </div>
                      {doc.review_notes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Not:</strong> {doc.review_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}
                      >
                        {getStatusText(doc.status)}
                      </span>
                      <Link
                        href="/documents/review"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        İncele
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Bu adayın henüz belgesi bulunmuyor.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
