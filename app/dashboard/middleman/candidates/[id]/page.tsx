/**
 * Middleman Aday Detay Sayfası
 * 
 * Middleman'lerin aday adına işlem yapabileceği sayfa
 * Profile sayfasına benzer ama middleman için
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import LogoutButton from '@/components/logout-button';
import DocumentRow from '@/components/document-row';

export default function MiddlemanCandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const candidateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Middleman profil kontrolü
        const { data: middlemanProfile } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', user.id)
          .single();

        if (!middlemanProfile || middlemanProfile.role !== 'MIDDLEMAN') {
          router.push('/');
          return;
        }

        // Aday profilini al (middleman'e bağlı olmalı)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', candidateId)
          .eq('role', 'CANDIDATE')
          .eq('middleman_id', user.id)
          .single();

        if (!profile) {
          setError('Aday bulunamadı veya bu aday size ait değil');
          setLoading(false);
          return;
        }

        setCandidateProfile(profile);

        // Aday bilgilerini al
        const { data: info } = await supabase
          .from('candidate_info')
          .select('*')
          .eq('profile_id', candidateId)
          .single();

        setCandidateInfo(info || null);

        // Belgeleri al
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          .eq('profile_id', candidateId)
          .order('updated_at', { ascending: false });

        setDocuments(docs || []);
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken hata oluştu');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase, candidateId]);

  const documentTypes = [
    { type: 'KIMLIK', label: 'Kimlik Belgesi', icon: '🆔' },
    { type: 'RESIDENCE', label: 'İkametgah', icon: '🏠' },
    { type: 'POLICE', label: 'Sabıka Kaydı', icon: '🔒' },
    { type: 'CV', label: 'CV', icon: '📄' },
    { type: 'DIPLOMA', label: 'Diploma', icon: '🎓' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_APPLICATION':
        return <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-lg">YENİ BAŞVURU</span>;
      case 'EVALUATION':
        return <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-lg">DEĞERLENDİRME</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg">ONAYLANDI</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg">REDDEDİLDİ</span>;
      case 'UPDATE_REQUIRED':
        return <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg">GÜNCELLEME GEREKLİ</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-lg">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !candidateProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Aday bulunamadı'}</p>
          <Link
            href="/dashboard/middleman"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/middleman"
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
          Aday Detay: {candidateProfile.full_name || 'İsimsiz'}
        </h1>

        {/* Başvuru Durumu */}
        {candidateProfile.application_status && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Başvuru Durumu</h3>
                {getStatusBadge(candidateProfile.application_status)}
              </div>
            </div>
          </div>
        )}

        {/* Profil Bilgileri */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Profil Bilgileri</h2>
            {(candidateProfile.application_status === 'NEW_APPLICATION' || 
              candidateProfile.application_status === 'UPDATE_REQUIRED') && (
              <Link
                href={`/dashboard/middleman/candidates/${candidateId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Düzenle
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {/* Temel Bilgiler */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <p className="text-gray-900">{candidateProfile.full_name || 'Belirtilmemiş'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon Numarası
                  </label>
                  <p className="text-gray-900">{candidateInfo?.phone || 'Belirtilmemiş'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TC Kimlik No
                  </label>
                  <p className="text-gray-900">{candidateInfo?.national_id || 'Belirtilmemiş'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doğum Tarihi
                  </label>
                  <p className="text-gray-900">
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

            {/* Aday Bilgileri */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Aday Bilgileri
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <p className="text-gray-900">{candidateInfo?.email || 'Belirtilmemiş'}</p>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <p className="text-gray-900">{candidateInfo?.address || 'Belirtilmemiş'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eğitim Seviyesi
                    </label>
                    <p className="text-gray-900">{candidateInfo?.education_level || 'Belirtilmemiş'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deneyim Yılı
                    </label>
                    <p className="text-gray-900">{candidateInfo?.experience_years || 0} yıl</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beceriler
                  </label>
                  {candidateInfo?.skills && candidateInfo.skills.length > 0 ? (
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
                  ) : (
                    <p className="text-gray-900">Belirtilmemiş</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Belgeler Bölümü */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Belgeler</h2>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Bilgi:</strong> Aday adına belge yükleyebilir, güncelleyebilir veya silebilirsiniz. Belgeler consultant'lar tarafından incelendikten sonra onaylanacaktır.
            </p>
          </div>

          {/* Belge Satırları */}
          <div className="space-y-4">
            {documentTypes.map((docType) => {
              const document = documents?.find((doc) => doc.document_type === docType.type);
              const canEdit = candidateProfile.application_status === 'NEW_APPLICATION' || 
                             candidateProfile.application_status === 'UPDATE_REQUIRED';
              return (
                <DocumentRow
                  key={docType.type}
                  documentType={docType.type as 'CV' | 'POLICE' | 'RESIDENCE' | 'KIMLIK' | 'DIPLOMA'}
                  documentTypeLabel={docType.label}
                  documentTypeIcon={docType.icon}
                  document={document}
                  profileId={candidateId}
                  canEdit={canEdit}
                  applicationStatus={candidateProfile.application_status || undefined}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
