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
import LogoutButton from '@/components/logout-button';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Jobul<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-sm text-gray-600">Consultant Dashboard</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz, {profile?.full_name || 'Consultant'}! 👋
          </h2>
          <p className="text-gray-600">
            Aday başvurularını yönetebilir, belgeleri inceleyebilir ve onaylayabilirsiniz.
          </p>
        </div>

        {/* Stats Cards - Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <button
            onClick={() => handleFilterClick('NEW_APPLICATION')}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
              activeFilter === 'NEW_APPLICATION' ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Yeni Başvuru</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newApplication}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🆕</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('EVALUATION')}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
              activeFilter === 'EVALUATION' ? 'border-yellow-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Değerlendirme</p>
                <p className="text-2xl font-bold text-gray-900">{stats.evaluation}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('APPROVED')}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
              activeFilter === 'APPROVED' ? 'border-green-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Onaylananlar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('REJECTED')}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
              activeFilter === 'REJECTED' ? 'border-red-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reddedilenler</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('UPDATE_REQUIRED')}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
              activeFilter === 'UPDATE_REQUIRED' ? 'border-orange-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Güncelleme</p>
                <p className="text-2xl font-bold text-gray-900">{stats.updateRequired}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterClick('ALL')}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
              activeFilter === 'ALL' ? 'border-gray-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Aday Başvuru Yönetimi
            </h3>
            <p className="text-sm text-gray-600">
              {filteredApplications.length} aday listeleniyor
            </p>
          </div>

          {/* Filtre/Alanı */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Ara (Ad Soyad, Telefon, E-posta, TC Kimlik, Aracı...)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 grid grid-cols-9 gap-4 text-sm font-semibold text-gray-700 min-w-[1200px]">
                <div className="col-span-1">AD SOYAD</div>
                <div className="col-span-1">TELEFON</div>
                <div className="col-span-1">TC KİMLİK</div>
                <div className="col-span-1">E-POSTA</div>
                <div className="col-span-1">ARAÇI</div>
                <div className="col-span-1">İLK BAŞVURU</div>
                <div className="col-span-1">SON İŞLEM</div>
                <div className="col-span-1">BELGELER</div>
                <div className="col-span-1">STATÜ</div>
              </div>

              {/* Applications Rows */}
              <div className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <ApplicationRow
                    key={app.profile.id}
                    application={app}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Bu filtreye uygun başvuru bulunmuyor.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Application Row Component
function ApplicationRow({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_APPLICATION':
        return (
          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
            YENİ BAŞVURU
          </span>
        );
      case 'EVALUATION':
        return (
          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
            DEĞERLENDİRME
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
            ONAYLANDI
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
            REDDEDİLDİ
          </span>
        );
      case 'UPDATE_REQUIRED':
        return (
          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
            GÜNCELLEME
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded">
            {status}
          </span>
        );
    }
  };

  const documentTypes: DocumentType[] = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK', 'DIPLOMA'];
  const totalDocuments = documentTypes.length;
  const uploadedDocuments = application.documents.length;
  const approvedDocuments = application.documents.filter((doc) => doc.status === 'APPROVED').length;

  const handleRowClick = () => {
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
    <div 
      className="px-6 py-4 grid grid-cols-9 gap-4 items-center hover:bg-gray-50 transition-colors cursor-pointer min-w-[1200px]"
      onClick={handleRowClick}
    >
      {/* Ad Soyad */}
      <div className="col-span-1">
        <div className="font-semibold text-gray-900 truncate">{application.profile.full_name || 'İsimsiz'}</div>
      </div>

      {/* Telefon */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm truncate">
          {application.candidateInfo?.phone || '-'}
        </div>
      </div>

      {/* TC Kimlik */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm truncate">
          {application.candidateInfo?.national_id || '-'}
        </div>
      </div>

      {/* E-posta */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm truncate">
          {application.candidateInfo?.email || '-'}
        </div>
      </div>

      {/* Aracı (Middleman) */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm truncate">
          {application.middleman?.full_name || '-'}
        </div>
      </div>

      {/* İlk Başvuru */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm">
          {formatDate(application.profile.created_at)}
        </div>
      </div>

      {/* Son İşlem */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm">
          {formatDate(application.profile.updated_at)}
        </div>
      </div>

      {/* Belgeler */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm font-medium">
          {approvedDocuments} / {uploadedDocuments} / {totalDocuments}
        </div>
      </div>

      {/* Statü */}
      <div className="col-span-1">
        {getStatusBadge(application.applicationStatus)}
      </div>
    </div>
  );
}
