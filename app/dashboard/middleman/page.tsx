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
              <p className="text-sm text-gray-600">Middleman Dashboard</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz, {profile?.full_name || 'Middleman'}! 👋
          </h2>
          <p className="text-gray-600">
            Bağlı adaylarınızı görüntüleyebilir, yeni aday ekleyebilir ve aday adına işlem yapabilirsiniz.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div
            onClick={() => handleFilterClick('NEW_APPLICATION')}
            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'NEW_APPLICATION' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Yeni Başvuru</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newApplication}</p>
              </div>
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">NEW</span>
            </div>
          </div>

          <div
            onClick={() => handleFilterClick('EVALUATION')}
            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'EVALUATION' ? 'ring-2 ring-yellow-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Değerlendirme</p>
                <p className="text-2xl font-bold text-gray-900">{stats.evaluation}</p>
              </div>
              <span className="text-2xl">⏳</span>
            </div>
          </div>

          <div
            onClick={() => handleFilterClick('APPROVED')}
            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'APPROVED' ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Onaylananlar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>

          <div
            onClick={() => handleFilterClick('REJECTED')}
            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'REJECTED' ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Reddedilenler</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <span className="text-2xl">❌</span>
            </div>
          </div>

          <div
            onClick={() => handleFilterClick('UPDATE_REQUIRED')}
            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'UPDATE_REQUIRED' ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Güncelleme</p>
                <p className="text-2xl font-bold text-gray-900">{stats.updateRequired}</p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>

          <div
            onClick={() => handleFilterClick('ALL')}
            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'ALL' ? 'ring-2 ring-gray-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Toplam</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Aday Başvuru Yönetimi</h2>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/middleman/candidates/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Yeni Aday Ekle
              </Link>
              <p className="text-sm text-gray-600">
                {filteredApplications.length} aday listeleniyor
              </p>
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700">
                <div className="col-span-1">AD SOYAD</div>
                <div className="col-span-1">TELEFON</div>
                <div className="col-span-1">TC KİMLİK</div>
                <div className="col-span-1">E-POSTA</div>
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
              <p className="text-gray-600 mb-4">Bu filtreye uygun başvuru bulunmuyor.</p>
              <Link
                href="/dashboard/middleman/candidates/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                + Yeni Aday Ekle
              </Link>
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
    router.push(`/dashboard/middleman/candidates/${application.profile.id}`);
  };

  return (
    <div 
      className="px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      {/* Ad Soyad */}
      <div className="col-span-1">
        <div className="font-semibold text-gray-900">{application.profile.full_name || 'İsimsiz'}</div>
      </div>

      {/* Telefon */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm">
          {application.candidateInfo?.phone || '-'}
        </div>
      </div>

      {/* TC Kimlik */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm">
          {application.candidateInfo?.national_id || '-'}
        </div>
      </div>

      {/* E-posta */}
      <div className="col-span-1">
        <div className="text-gray-900 text-sm">
          {application.candidateInfo?.email || '-'}
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
