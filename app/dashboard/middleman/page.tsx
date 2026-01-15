/**
 * Middleman Dashboard Sayfası
 * 
 * Middleman'lerin dashboard'u - Bağlı adaylarını görüntüleyip yönetebilirler
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';

type ApplicationStatus = 'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED' | 'ALL';
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
  national_id: string | null;
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

export default function MiddlemanDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus>('ALL');
  const [stats, setStats] = useState({
    newApplication: 0,
    evaluation: 0,
    approved: 0,
    rejected: 0,
    updateRequired: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Hoş geldiniz mesajını 7 saniye sonra kapat
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // Tüm başvuruları yükle
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileData || profileData.role !== 'MIDDLEMAN') {
          router.push('/');
          return;
        }

        setProfile(profileData);

        // Middleman'e bağlı aday profillerini al
        const { data: candidates } = await supabase
          .from('profiles')
          .select('*')
          .eq('middleman_id', user.id)
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
              .select('id, profile_id, phone, email, national_id, experience_years')
              .eq('profile_id', candidate.id)
              .single();

            // Belgeleri al
            const { data: documents } = await supabase
              .from('documents')
              .select('*')
              .eq('profile_id', candidate.id)
              .order('created_at', { ascending: false });

            // Başvuru durumunu profiles tablosundan al
            const applicationStatus = (candidate.application_status || 'NEW_APPLICATION') as
              'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED';

            return {
              profile: candidate,
              candidateInfo: candidateInfo || null,
              documents: documents || [],
              applicationStatus,
            };
          })
        );

        setApplications(applicationsData);

        // İstatistikleri hesapla
        const statsData = {
          newApplication: applicationsData.filter((app) => app.applicationStatus === 'NEW_APPLICATION').length,
          evaluation: applicationsData.filter((app) => app.applicationStatus === 'EVALUATION').length,
          approved: applicationsData.filter((app) => app.applicationStatus === 'APPROVED').length,
          rejected: applicationsData.filter((app) => app.applicationStatus === 'REJECTED').length,
          updateRequired: applicationsData.filter((app) => app.applicationStatus === 'UPDATE_REQUIRED').length,
          total: applicationsData.length,
        };
        setStats(statsData);

        // İlk filtreleme
        filterApplications(applicationsData, activeFilter);
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken hata oluştu');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // Filtreleme
  const filterApplications = (apps: Application[], filter: ApplicationStatus) => {
    if (filter === 'ALL') {
      setFilteredApplications(apps);
    } else {
      setFilteredApplications(apps.filter((app) => app.applicationStatus === filter));
    }
  };

  const handleFilterClick = (filter: ApplicationStatus) => {
    setActiveFilter(filter);
    filterApplications(applications, filter);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_APPLICATION':
        return (
          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
            YENİ BAŞVURU
          </span>
        );
      case 'EVALUATION':
        return (
          <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
            DEĞERLENDİRME
          </span>
        );
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
      case 'UPDATE_REQUIRED':
        return (
          <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
            GÜNCELLEME
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 bg-grid-pattern">
      <ModernHeader 
        title="Middleman Dashboard"
        subtitle="Aday Yönetimi"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        {showWelcome && (
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white animate-fade-in">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            aria-label="Kapat"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIG9wYWNpdHk9IjAuMSI+PGcgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                  Hoş Geldiniz, {profile?.full_name || 'Middleman'}! 👋
                </h1>
                <p className="text-purple-100 text-lg md:text-xl max-w-2xl">
                  Bağlı adaylarınızı görüntüleyebilir, yeni aday ekleyebilir ve aday adına işlem yapabilirsiniz.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          <button
            onClick={() => handleFilterClick('NEW_APPLICATION')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
              activeFilter === 'NEW_APPLICATION' ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-100 hover:border-blue-200'
            } hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent ${activeFilter === 'NEW_APPLICATION' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ${activeFilter === 'NEW_APPLICATION' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Yeni Başvuru</p>
                <p className="text-3xl font-bold text-gray-900">{stats.newApplication}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('EVALUATION')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
              activeFilter === 'EVALUATION' ? 'border-yellow-500 shadow-yellow-500/20' : 'border-gray-100 hover:border-yellow-200'
            } hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent ${activeFilter === 'EVALUATION' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg ${activeFilter === 'EVALUATION' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Değerlendirme</p>
                <p className="text-3xl font-bold text-gray-900">{stats.evaluation}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('APPROVED')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
              activeFilter === 'APPROVED' ? 'border-green-500 shadow-green-500/20' : 'border-gray-100 hover:border-green-200'
            } hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent ${activeFilter === 'APPROVED' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg ${activeFilter === 'APPROVED' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Onaylananlar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('REJECTED')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
              activeFilter === 'REJECTED' ? 'border-red-500 shadow-red-500/20' : 'border-gray-100 hover:border-red-200'
            } hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent ${activeFilter === 'REJECTED' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg ${activeFilter === 'REJECTED' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Reddedilenler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('UPDATE_REQUIRED')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
              activeFilter === 'UPDATE_REQUIRED' ? 'border-orange-500 shadow-orange-500/20' : 'border-gray-100 hover:border-orange-200'
            } hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent ${activeFilter === 'UPDATE_REQUIRED' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg ${activeFilter === 'UPDATE_REQUIRED' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Güncelleme</p>
                <p className="text-3xl font-bold text-gray-900">{stats.updateRequired}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('ALL')}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
              activeFilter === 'ALL' ? 'border-slate-500 shadow-slate-500/20' : 'border-gray-100 hover:border-slate-200'
            } hover:-translate-y-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent ${activeFilter === 'ALL' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg ${activeFilter === 'ALL' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-1">Toplam</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Applications Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bağlı Adaylar</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredApplications.length} aday listeleniyor
              </p>
            </div>
            <Link
              href="/dashboard/middleman/candidates/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Aday Ekle</span>
            </Link>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.profile.id}
                  application={app}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-4">Bu filtreye uygun başvuru bulunmuyor.</p>
              <Link
                href="/dashboard/middleman/candidates/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Yeni Aday Ekle</span>
              </Link>
            </div>
          )}
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

// Application Card Component
function ApplicationCard({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_APPLICATION':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            YENİ BAŞVURU
          </span>
        );
      case 'EVALUATION':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            DEĞERLENDİRME
          </span>
        );
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
      case 'UPDATE_REQUIRED':
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            GÜNCELLEME
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-semibold rounded-lg shadow-sm">
            {status}
          </span>
        );
    }
  };

  const documentTypes: DocumentType[] = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'];
  const totalDocuments = documentTypes.length;
  const uploadedDocuments = application.documents.length;
  const approvedDocuments = application.documents.filter((doc) => doc.status === 'APPROVED').length;

  const handleCardClick = () => {
    router.push(`/dashboard/middleman/candidates/${application.profile.id}`);
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
    <div 
      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
              {application.profile.full_name || 'İsimsiz'}
            </h3>
            <p className="text-sm text-gray-500">{application.candidateInfo?.email || '-'}</p>
          </div>
          <div className="ml-4">
            {getStatusBadge(application.applicationStatus)}
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-gray-700">{application.candidateInfo?.phone || '-'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span className="text-gray-700">TC: {application.candidateInfo?.national_id || '-'}</span>
          </div>
        </div>

        {/* Documents Progress */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Belge Durumu</span>
            <span className="text-xs font-bold text-gray-900">{approvedDocuments} / {uploadedDocuments} / {totalDocuments}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(approvedDocuments / totalDocuments) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>İlk: {formatDate(application.profile.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Son: {formatDate(application.profile.updated_at)}</span>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
