/**
 * Başvuru Detay Sayfası
 * 
 * Consultant'ların başvuru detaylarını görüntüleyip işlem yapabileceği sayfa
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import LogoutButton from '@/components/logout-button';
import DocumentControl from '@/components/document-control';
import ApplicationDecisionNew from '@/components/application-decision-new';
import DeleteApplicationButton from '@/components/delete-application-button';

type DocumentType = 'CV' | 'POLICE' | 'RESIDENCE' | 'KIMLIK' | 'DIPLOMA';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  profile_id: string;
  mime_type: string | null;
  created_at: string;
  review_notes: string | null;
}

interface CandidateInfo {
  id: string;
  profile_id: string;
  phone: string | null;
  email: string | null;
  national_id: string | null;
  address: string | null;
  date_of_birth: string | null;
  education_level: string | null;
  experience_years: number | null;
  skills: string[] | null;
  languages: any[] | null;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  application_status: string | null;
}

interface Application {
  profile: Profile;
  candidateInfo: CandidateInfo | null;
  documents: Document[];
  applicationStatus: 'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED';
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const profileId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
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

        // Profil ve rol kontrolü
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || !['CONSULTANT', 'ADMIN'].includes(profile.role)) {
          router.push('/');
          return;
        }

        // Aday profilini al
        const { data: candidateProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('role', 'CANDIDATE')
          .single();

        if (!candidateProfile) {
          setError('Başvuru bulunamadı');
          setLoading(false);
          return;
        }

        // Aday bilgilerini al
        const { data: candidateInfo } = await supabase
          .from('candidate_info')
          .select('*')
          .eq('profile_id', profileId)
          .single();

        // Belgeleri al
        const { data: documents } = await supabase
          .from('documents')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });

        const applicationStatus = (candidateProfile.application_status || 'NEW_APPLICATION') as
          'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED';

        setApplication({
          profile: candidateProfile,
          candidateInfo: candidateInfo || null,
          documents: documents || [],
          applicationStatus,
        });
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken hata oluştu');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase, profileId]);

  const handleDocumentUpdate = () => {
    // Sayfayı yenile
    window.location.reload();
  };

  const handleApplicationUpdate = () => {
    // Sayfayı yenile
    window.location.reload();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_APPLICATION':
        return (
          <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg">
            YENİ BAŞVURU
          </span>
        );
      case 'EVALUATION':
        return (
          <span className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-lg">
            DEĞERLENDİRME
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg">
            ONAYLANDI
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg">
            REDDEDİLDİ
          </span>
        );
      case 'UPDATE_REQUIRED':
        return (
          <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg">
            BİLGİ/EVRAK GÜNCELLEME
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-lg">
            {status}
          </span>
        );
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'CV':
        return 'CV';
      case 'POLICE':
        return 'Sabıka Kaydı';
      case 'RESIDENCE':
        return 'İkametgah';
      case 'KIMLIK':
        return 'Kimlik Belgesi';
      case 'DIPLOMA':
        return 'Diploma';
      default:
        return type;
    }
  };

  const getDocumentTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'CV':
        return '📄';
      case 'POLICE':
        return '🔒';
      case 'RESIDENCE':
        return '🏠';
      case 'KIMLIK':
        return '🆔';
      case 'DIPLOMA':
        return '🎓';
      default:
        return '📋';
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

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Başvuru bulunamadı'}</p>
          <Link
            href="/dashboard/consultant"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    );
  }

  const documentTypes: DocumentType[] = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/consultant"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Dashboard'a Dön
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Üst Bölüm: Başlık, Statü, Karar Butonları ve Sil Butonu */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Sol: Başlık ve Statü */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {application.profile.full_name || 'İsimsiz'}
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  ID: {application.profile.id.slice(0, 8)}...
                </p>
              </div>
              <div>
                {getStatusBadge(application.applicationStatus)}
              </div>
            </div>

            {/* Sağ: Karar Butonları ve Sil Butonu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ApplicationDecisionNew
                application={application}
                onUpdate={handleApplicationUpdate}
              />
              {application.applicationStatus !== 'UPDATE_REQUIRED' && (
                <DeleteApplicationButton
                  profileId={application.profile.id}
                  candidateName={application.profile.full_name || 'İsimsiz'}
                  onDelete={() => {
                    router.push('/dashboard/consultant');
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Ana İçerik: Yatay Düzen */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="grid grid-cols-12 gap-6">
            {/* Sol: Aday Bilgileri (4 kolon) */}
            <div className="col-span-12 lg:col-span-5 border-r-0 lg:border-r border-gray-200 pr-0 lg:pr-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Aday Bilgileri
              </h2>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Ad Soyad
                  </label>
                  <p className="text-gray-900 font-medium truncate">
                    {application.profile.full_name || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Telefon
                  </label>
                  <p className="text-gray-900 truncate">
                    {application.candidateInfo?.phone || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    TC Kimlik No
                  </label>
                  <p className="text-gray-900 truncate">
                    {application.candidateInfo?.national_id || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    E-posta
                  </label>
                  <p className="text-gray-900 truncate break-all">
                    {application.candidateInfo?.email || '-'}
                  </p>
                </div>

                {application.candidateInfo?.address && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Adres
                    </label>
                    <p className="text-gray-900 text-xs line-clamp-2">
                      {application.candidateInfo?.address}
                    </p>
                  </div>
                )}

                {application.candidateInfo?.education_level && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Eğitim Seviyesi
                    </label>
                    <p className="text-gray-900">
                      {application.candidateInfo.education_level}
                    </p>
                  </div>
                )}

                {application.candidateInfo && application.candidateInfo.experience_years !== null && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Deneyim Yılı
                    </label>
                    <p className="text-gray-900">
                      {application.candidateInfo.experience_years} yıl
                    </p>
                  </div>
                )}

                {application.candidateInfo?.skills && Array.isArray(application.candidateInfo.skills) && application.candidateInfo.skills.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Beceriler
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {application.candidateInfo.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ: Belgeler (7 kolon) */}
            <div className="col-span-12 lg:col-span-7 pl-0 lg:pl-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Belge Kontrolleri
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {documentTypes.map((docType) => {
                  const document = application.documents.find(
                    (doc) => doc.document_type === docType
                  );
                  const hasDocument = !!document;
                  const isApproved = document?.status === 'APPROVED';
                  const isRejected = document?.status === 'REJECTED';
                  const isPending = document?.status === 'PENDING';

                  return (
                    <div
                      key={docType}
                      className={`border-2 rounded-lg p-3 transition-all ${
                        isApproved
                          ? 'border-green-400 bg-green-50/50'
                          : isRejected
                          ? 'border-red-400 bg-red-50/50'
                          : isPending
                          ? 'border-yellow-400 bg-yellow-50/50'
                          : 'border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xl flex-shrink-0">{getDocumentTypeIcon(docType)}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {getDocumentTypeLabel(docType)}
                            </h3>
                            {hasDocument && (
                              <p className="text-xs text-gray-600 truncate mt-0.5" title={document.file_name}>
                                {document.file_name}
                              </p>
                            )}
                          </div>
                        </div>
                        {hasDocument && (
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded flex-shrink-0 ${
                              isApproved
                                ? 'bg-green-500 text-white'
                                : isRejected
                                ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {isApproved ? '✓' : isRejected ? '✗' : '⏳'}
                          </span>
                        )}
                      </div>

                      <DocumentControl
                        documentType={docType}
                        document={document}
                        profileId={application.profile.id}
                        onUpdate={handleDocumentUpdate}
                        applicationStatus={application.applicationStatus}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
