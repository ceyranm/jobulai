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
import ModernHeader from '@/components/modern-header';
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

  const [userRole, setUserRole] = useState<'CONSULTANT' | 'ADMIN' | null>(null);

  const loadData = async () => {
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

      // Kullanıcı rolünü kaydet
      setUserRole(profile.role as 'CONSULTANT' | 'ADMIN');

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
  };

  useEffect(() => {
    loadData();
  }, [router, supabase, profileId]);

  const handleDocumentUpdate = async () => {
    // Verileri tekrar yükle
    await loadData();
  };

  const handleApplicationUpdate = async () => {
    // Verileri tekrar yükle
    await loadData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_APPLICATION':
        return (
          <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
            YENİ BAŞVURU
          </span>
        );
      case 'EVALUATION':
        return (
          <span className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
            DEĞERLENDİRME
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
            ONAYLANDI
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-4 py-2 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
            REDDEDİLDİ
          </span>
        );
      case 'UPDATE_REQUIRED':
        return (
          <span className="px-4 py-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg border border-orange-200">
            BİLGİ/EVRAK GÜNCELLEME
          </span>
        );
      default:
        return (
          <span className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-4">{error || 'Başvuru bulunamadı'}</p>
          <Link
            href="/dashboard/consultant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    );
  }

  const documentTypes: DocumentType[] = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'];
  const totalDocuments = documentTypes.length;
  const uploadedDocuments = application.documents.length;
  const approvedDocuments = application.documents.filter((doc) => doc.status === 'APPROVED').length;

  // Back link'i kullanıcı rolüne göre belirle
  const getBackLink = () => {
    if (userRole === 'ADMIN') {
      return {
        href: '/dashboard/admin/users',
        label: "Kullanıcı Listesine Dön"
      };
    }
    return {
      href: '/dashboard/consultant',
      label: "Dashboard'a Dön"
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ModernHeader 
        title="Başvuru Detayı"
        subtitle="Aday Başvuru İnceleme"
        backLink={getBackLink()}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section - Professional */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 mb-6 sm:mb-8 overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-semibold text-white">
                    {application.profile.full_name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1 truncate">
                    {application.profile.full_name || 'İsimsiz'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                    Başvuru ID: {application.profile.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto flex justify-start sm:justify-end">
                {getStatusBadge(application.applicationStatus)}
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-slate-50/50 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 lg:gap-8">
              {application.candidateInfo?.email && (
                <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-700 w-full sm:w-auto">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-900 truncate">{application.candidateInfo?.email}</span>
                </div>
              )}
              {application.candidateInfo?.phone && (
                <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-700 w-full sm:w-auto">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-900">{application.candidateInfo?.phone}</span>
                </div>
              )}
              {application.candidateInfo && application.candidateInfo.experience_years !== null && application.candidateInfo.experience_years !== undefined && (
                <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-700 w-full sm:w-auto">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-900">{application.candidateInfo?.experience_years || 0} Yıl Deneyim</span>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-white">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <ApplicationDecisionNew
                  application={application}
                  onUpdate={handleApplicationUpdate}
                />
              </div>
              {application.applicationStatus !== 'UPDATE_REQUIRED' && (
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <DeleteApplicationButton
                    profileId={application.profile.id}
                    candidateName={application.profile.full_name || 'İsimsiz'}
                    onDelete={() => {
                      router.push('/dashboard/consultant');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ana İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Sol: Aday Bilgileri */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Aday Bilgileri
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Ad Soyad
                    </label>
                    <p className="text-sm text-slate-900 font-medium">{application.profile.full_name || '-'}</p>
                  </div>

                  {application.candidateInfo?.phone && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Telefon
                      </label>
                      <p className="text-sm text-slate-900">{application.candidateInfo?.phone}</p>
                    </div>
                  )}

                  {application.candidateInfo?.national_id && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        TC Kimlik No
                      </label>
                      <p className="text-sm text-slate-900 font-mono">{application.candidateInfo?.national_id}</p>
                    </div>
                  )}

                  {application.candidateInfo?.email && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        E-posta
                      </label>
                      <p className="text-sm text-slate-900 break-all">{application.candidateInfo?.email}</p>
                    </div>
                  )}

                  {application.candidateInfo?.address && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Adres
                      </label>
                      <p className="text-sm text-slate-900 leading-relaxed">{application.candidateInfo?.address}</p>
                    </div>
                  )}

                  {application.candidateInfo?.education_level && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Eğitim Seviyesi
                      </label>
                      <p className="text-sm text-slate-900">{application.candidateInfo?.education_level}</p>
                    </div>
                  )}

                  {application.candidateInfo && application.candidateInfo.experience_years !== null && application.candidateInfo.experience_years !== undefined && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Deneyim Yılı
                      </label>
                      <p className="text-sm text-slate-900">{application.candidateInfo?.experience_years || 0} Yıl</p>
                    </div>
                  )}

                  {application.candidateInfo?.skills && Array.isArray(application.candidateInfo.skills) && application.candidateInfo.skills.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Beceriler
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {application.candidateInfo.skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ: Belgeler */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Belge Kontrolleri
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{approvedDocuments}</span> / {uploadedDocuments} / {totalDocuments} Onaylı
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
                        className={`border rounded-xl p-5 transition-all ${
                          isApproved
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : isRejected
                            ? 'border-red-200 bg-red-50/30'
                            : isPending
                            ? 'border-amber-200 bg-amber-50/30'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2.5 rounded-lg ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-700'
                                : isRejected
                                ? 'bg-red-100 text-red-700'
                                : isPending
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className="text-lg">{getDocumentTypeIcon(docType)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                                {getDocumentTypeLabel(docType)}
                              </h3>
                              {hasDocument && (
                                <p className="text-xs text-slate-600 truncate" title={document.file_name}>
                                  {document.file_name}
                                </p>
                              )}
                              {!hasDocument && (
                                <p className="text-xs text-slate-400">Belge yüklenmedi</p>
                              )}
                            </div>
                          </div>
                          {hasDocument && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isRejected
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {isApproved ? 'Onaylı' : isRejected ? 'Reddedildi' : 'Bekliyor'}
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
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-600">
            <div>
              © {currentYear} Tüm Hakları Saklıdır
            </div>
            <div>
              <span className="mx-1">-</span>
              <span>SoftAI</span>
              <span className="ml-1">Tarafından Geliştirilmiştir</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
