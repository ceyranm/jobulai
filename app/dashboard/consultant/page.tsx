/**
 * Consultant Dashboard Sayfası
 * 
 * Consultant'ların dashboard'u - Aday Başvuru Yönetimi
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
  updated_at: string;
  application_status: string | null;
  middleman_id: string | null;
}

interface Application {
  profile: Profile;
  candidateInfo: CandidateInfo | null;
  documents: Document[];
  applicationStatus: 'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED';
  middleman: { id: string; full_name: string } | null;
}

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus>('EVALUATION');
  const [searchQuery, setSearchQuery] = useState<string>('');
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

        if (!profileData || !['CONSULTANT', 'ADMIN'].includes(profileData.role)) {
          router.push('/');
          return;
        }

        setProfile(profileData);

        // Tüm aday profillerini al (middleman_id ve updated_at dahil)
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
              .select('id, profile_id, phone, email, national_id, experience_years')
              .eq('profile_id', candidate.id)
              .single();

            // Belgeleri al
            const { data: documents } = await supabase
              .from('documents')
              .select('*')
              .eq('profile_id', candidate.id)
              .order('created_at', { ascending: false });

            // Middleman bilgisini al (varsa)
            let middleman = null;
            if (candidate.middleman_id) {
              const { data: middlemanProfile } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('id', candidate.middleman_id)
                .single();
              
              if (middlemanProfile) {
                middleman = {
                  id: middlemanProfile.id,
                  full_name: middlemanProfile.full_name,
                };
              }
            }

            // Başvuru durumunu profiles tablosundan al
            const applicationStatus = (candidate.application_status || 'NEW_APPLICATION') as 
              'NEW_APPLICATION' | 'EVALUATION' | 'APPROVED' | 'REJECTED' | 'UPDATE_REQUIRED';

            return {
              profile: candidate,
              candidateInfo: candidateInfo || null,
              documents: documents || [],
              applicationStatus,
              middleman,
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
        filterApplications(applicationsData, activeFilter, searchQuery);
      } catch (err: any) {
        setError(err.message || 'Veriler yüklenirken hata oluştu');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // Filtreleme ve arama
  const filterApplications = (apps: Application[], filter: ApplicationStatus, search: string = '') => {
    let filtered = apps;

    // Statü filtresi
    if (filter !== 'ALL') {
      filtered = filtered.filter((app) => app.applicationStatus === filter);
    }

    // Arama filtresi
    if (search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((app) => {
        const fullName = app.profile.full_name?.toLowerCase() || '';
        const phone = app.candidateInfo?.phone?.toLowerCase() || '';
        const email = app.candidateInfo?.email?.toLowerCase() || '';
        const nationalId = app.candidateInfo?.national_id?.toLowerCase() || '';
        const middlemanName = app.middleman?.full_name?.toLowerCase() || '';
        
        return (
          fullName.includes(searchLower) ||
          phone.includes(searchLower) ||
          email.includes(searchLower) ||
          nationalId.includes(searchLower) ||
          middlemanName.includes(searchLower)
        );
      });
    }

    setFilteredApplications(filtered);
  };

  const handleFilterClick = (filter: ApplicationStatus) => {
    setActiveFilter(filter);
    filterApplications(applications, filter, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterApplications(applications, activeFilter, query);
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
            BİLGİ/EVRAK GÜNCELLEME
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
        title="Consultant Dashboard"
        subtitle="Başvuru Yönetimi"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        {showWelcome && (
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white animate-fade-in">
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
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-100">
                  Hoş Geldiniz, {profile?.full_name || 'Consultant'}! 👋
                </h1>
                <p className="text-amber-100 text-lg md:text-xl max-w-2xl">
                  Aday başvurularını yönetebilir, belgeleri inceleyebilir ve onaylayabilirsiniz. 
                  Tüm başvuruları tek bir yerden takip edin.
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
        )}

        {/* Stats Cards - Clickable Filters */}
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
              <div className="flex items-center justify-center mb-4">
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
              <div className="flex items-center justify-center mb-4">
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
              <div className="flex items-center justify-center mb-4">
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
              <div className="flex items-center justify-center mb-4">
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
              <div className="flex items-center justify-center mb-4">
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

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
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
                Aday Başvuru Yönetimi
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredApplications.length} aday listeleniyor
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ara (Ad Soyad, Telefon, E-posta, TC Kimlik, Aracı...)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              />
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Aday</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">İletişim</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Durum</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Kayıt Tarihi</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Belgeler</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.profile.id}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/consultant/applications/${app.profile.id}`)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {app.profile.full_name?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{app.profile.full_name || 'İsimsiz Aday'}</div>
                            {app.candidateInfo?.experience_years && (
                              <div className="text-xs text-gray-500">{app.candidateInfo.experience_years} Yıl Deneyim</div>
                            )}
                            {app.middleman && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Aracı: {app.middleman.full_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {app.candidateInfo?.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate max-w-[200px]">{app.candidateInfo.email}</span>
                            </div>
                          )}
                          {app.candidateInfo?.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{app.candidateInfo.phone}</span>
                            </div>
                          )}
                          {!app.candidateInfo?.email && !app.candidateInfo?.phone && (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(app.applicationStatus)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">
                          {app.profile.created_at
                            ? new Date(app.profile.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })
                            : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">{app.documents.length}</span>
                            <span className="text-gray-500"> / 5</span>
                          </div>
                          <div className="flex -space-x-1">
                            {app.documents.slice(0, 3).map((doc) => (
                              <div
                                key={doc.id}
                                className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold ${
                                  doc.status === 'APPROVED'
                                    ? 'bg-green-500 text-white'
                                    : doc.status === 'REJECTED'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-yellow-500 text-white'
                                }`}
                                title={doc.document_type}
                              >
                                {doc.document_type[0]}
                              </div>
                            ))}
                            {app.documents.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                                +{app.documents.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/consultant/applications/${app.profile.id}`);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            Detay
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

