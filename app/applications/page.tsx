/**
 * Aday Başvuru Yönetimi Sayfası
 * 
 * Consultant'ların tüm başvuruları yönetebileceği sayfa
 * Liste görünümü, filtreleme, belge kontrolü ve başvuru kararı
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';
import DocumentControl from '@/components/document-control';
import ApplicationDecision from '@/components/application-decision';
import Footer from '@/components/footer';

type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MISSING' | 'ALL';
type DocumentType = 'CV' | 'POLICE' | 'RESIDENCE' | 'KIMLIK' | 'DIPLOMA';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  profile_id: string;
  mime_type: string | null;
}

interface CandidateInfo {
  id: string;
  profile_id: string;
  experience_years: number | null;
  phone: string | null;
  email: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Application {
  profile: Profile;
  candidateInfo: CandidateInfo | null;
  documents: Document[];
  applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MISSING';
}

export default function ApplicationsManagementPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus>('PENDING');
  const [error, setError] = useState<string | null>(null);

  // Tüm başvuruları yükle
  useEffect(() => {
    async function loadApplications() {
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

        // Tüm aday profillerini al
        const { data: candidates } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'CANDIDATE')
          .order('created_at', { ascending: false });

        if (!candidates) {
          setApplications([]);
          setFilteredApplications([]);
          setLoading(false);
          return;
        }

        // Her aday için bilgileri ve belgeleri al
        const applicationsData: Application[] = await Promise.all(
          candidates.map(async (candidate) => {
            // Aday bilgilerini al
            const { data: candidateInfo } = await supabase
              .from('candidate_info')
              .select('*')
              .eq('profile_id', candidate.id)
              .single();

            // Belgeleri al
            const { data: documents } = await supabase
              .from('documents')
              .select('*')
              .eq('profile_id', candidate.id)
              .order('created_at', { ascending: false });

            // Başvuru durumunu belirle (belgelerin durumuna göre)
            let applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MISSING' = 'PENDING';
            
            if (documents && documents.length > 0) {
              const allApproved = documents.every(doc => doc.status === 'APPROVED');
              const hasRejected = documents.some(doc => doc.status === 'REJECTED');
              const hasPending = documents.some(doc => doc.status === 'PENDING');
              
              if (hasRejected) {
                applicationStatus = 'REJECTED';
              } else if (allApproved && !hasPending) {
                applicationStatus = 'APPROVED';
              } else if (hasPending) {
                applicationStatus = 'PENDING';
              }
            } else {
              applicationStatus = 'MISSING';
            }

            return {
              profile: candidate,
              candidateInfo: candidateInfo || null,
              documents: documents || [],
              applicationStatus,
            };
          })
        );

        setApplications(applicationsData);
        filterApplications(applicationsData, activeFilter);
      } catch (err: any) {
        setError(err.message || 'Başvurular yüklenirken hata oluştu');
        console.error('Error loading applications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [router, supabase]);

  // Filtreleme
  const filterApplications = (apps: Application[], filter: ApplicationStatus) => {
    if (filter === 'ALL') {
      setFilteredApplications(apps);
    } else {
      setFilteredApplications(apps.filter(app => app.applicationStatus === filter));
    }
  };

  useEffect(() => {
    filterApplications(applications, activeFilter);
  }, [activeFilter, applications]);

  // Belge durumu güncellendiğinde listeyi yenile
  const handleDocumentUpdate = () => {
    router.refresh();
    window.location.reload(); // Geçici çözüm - daha iyi bir state management eklenebilir
  };

  // Başvuru durumu güncellendiğinde listeyi yenile
  const handleApplicationUpdate = () => {
    router.refresh();
    window.location.reload();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">
            ONAYLANDI
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded">
            REDDEDİLDİ
          </span>
        );
      case 'MISSING':
        return (
          <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
            GÜNCELLEME GEREKLİ
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
            ONAY BEKLİYOR
          </span>
        );
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

  // İstatistikleri hesapla
  const stats = {
    pending: applications.filter(app => app.applicationStatus === 'PENDING').length,
    approved: applications.filter(app => app.applicationStatus === 'APPROVED').length,
    rejected: applications.filter(app => app.applicationStatus === 'REJECTED').length,
    missing: applications.filter(app => app.applicationStatus === 'MISSING').length,
    total: applications.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 bg-grid-pattern">
      <ModernHeader 
        title="Başvuru Yönetimi"
        subtitle="Aday Başvuruları"
        backLink={{
          href: '/dashboard/consultant',
          label: "Dashboard'a Dön"
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIG9wYWNpdHk9IjAuMSI+PGcgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Aday Başvuru Yönetimi 👋
                </h1>
                <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                  Tüm aday başvurularını görüntüleyin, belgeleri kontrol edin ve karar verin.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Pending Card */}
          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
              activeFilter === 'PENDING' ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-100 hover:border-blue-200'
            } hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ${activeFilter === 'PENDING' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bekleyenler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </button>

          {/* Approved Card */}
          <button
            onClick={() => setActiveFilter('APPROVED')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
              activeFilter === 'APPROVED' ? 'border-green-500 shadow-green-500/20' : 'border-gray-100 hover:border-green-200'
            } hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg ${activeFilter === 'APPROVED' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Onaylananlar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </button>

          {/* Rejected Card */}
          <button
            onClick={() => setActiveFilter('REJECTED')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
              activeFilter === 'REJECTED' ? 'border-red-500 shadow-red-500/20' : 'border-gray-100 hover:border-red-200'
            } hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg ${activeFilter === 'REJECTED' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Reddedilenler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </button>

          {/* Missing Card */}
          <button
            onClick={() => setActiveFilter('MISSING')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
              activeFilter === 'MISSING' ? 'border-orange-500 shadow-orange-500/20' : 'border-gray-100 hover:border-orange-200'
            } hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg ${activeFilter === 'MISSING' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eksik Belgeler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.missing}</p>
              </div>
            </div>
          </button>

          {/* Total Card */}
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
              activeFilter === 'ALL' ? 'border-slate-500 shadow-slate-500/20' : 'border-gray-100 hover:border-slate-200'
            } hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg ${activeFilter === 'ALL' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Toplam</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Başvurular
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredApplications.length} aday listeleniyor
              </p>
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.profile.id}
                  application={app}
                  onDocumentUpdate={handleDocumentUpdate}
                  onApplicationUpdate={handleApplicationUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Bu filtreye uygun başvuru bulunmuyor.</p>
            </div>
          )}
        </div>
      </main>
      <Footer simple />
    </div>
  );
}

// Application Card Component
function ApplicationCard({
  application,
  onDocumentUpdate,
  onApplicationUpdate,
}: {
  application: Application;
  onDocumentUpdate: () => void;
  onApplicationUpdate: () => void;
}) {
  const router = useRouter();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            ONAYLANDI
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            REDDEDİLDİ
          </span>
        );
      case 'MISSING':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            GÜNCELLEME GEREKLİ
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            ONAY BEKLİYOR
          </span>
        );
    }
  };

  const documentTypes: DocumentType[] = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'];
  const totalDocuments = documentTypes.length;
  const uploadedDocuments = application.documents.length;
  const approvedDocuments = application.documents.filter((doc) => doc.status === 'APPROVED').length;
  const pendingDocuments = application.documents.filter((doc) => doc.status === 'PENDING').length;
  const rejectedDocuments = application.documents.filter((doc) => doc.status === 'REJECTED').length;

  const handleCardClick = () => {
    router.push(`/dashboard/consultant/applications/${application.profile.id}`);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
              {application.profile.full_name || 'İsimsiz'}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {application.candidateInfo?.email || '-'}
            </p>
            <div className="flex items-center gap-2">
              {getStatusBadge(application.applicationStatus)}
              {application.candidateInfo?.experience_years !== null && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                  {application.candidateInfo.experience_years || 0} Yıl Deneyim
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleCardClick}
            className="ml-4 p-2 rounded-lg hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Detayları görüntüle"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Documents Progress */}
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700">Belge Durumu</span>
            <span className="text-xs font-bold text-gray-900">
              {approvedDocuments} / {uploadedDocuments} / {totalDocuments}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(approvedDocuments / totalDocuments) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Onaylanan: {approvedDocuments}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Bekleyen: {pendingDocuments}</span>
            </div>
            {rejectedDocuments > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Reddedilen: {rejectedDocuments}</span>
              </div>
            )}
          </div>
        </div>

        {/* Document Types Grid */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Belgeler</p>
          <div className="grid grid-cols-5 gap-2">
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
                  className={`p-2 rounded-lg border-2 text-center transition-all ${
                    isApproved
                      ? 'border-green-400 bg-green-50'
                      : isRejected
                      ? 'border-red-400 bg-red-50'
                      : isPending
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  title={docType}
                >
                  <div className="text-xs font-semibold text-gray-700 mb-1">{docType}</div>
                  {hasDocument ? (
                    <div className={`text-xs font-bold ${
                      isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {isApproved ? '✓' : isRejected ? '✗' : '⏳'}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              {application.candidateInfo?.phone && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="truncate max-w-[100px]">{application.candidateInfo.phone}</span>
                </div>
              )}
              {application.candidateInfo?.national_id && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span className="truncate max-w-[80px]">{application.candidateInfo.national_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Kayıt: {formatDate(application.profile.created_at)}</span>
          </div>
          <button
            onClick={handleCardClick}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <span>Detaylar</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
