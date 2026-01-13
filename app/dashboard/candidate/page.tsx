/**
 * Candidate Dashboard - Landing Page
 * 
 * Adayların ana sayfası - Hoş geldiniz ve özet bilgiler
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/logout-button';

export default async function CandidateDashboardPage() {
  const supabase = await createClient();

  // Kullanıcı bilgilerini al
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

  // Rol kontrolü
  if (!profile || profile.role !== 'CANDIDATE') {
    redirect('/');
  }

  // Aday bilgilerini al
  const { data: candidateInfo } = await supabase
    .from('candidate_info')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  // Belgeleri al
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('profile_id', user.id);

  // Profil tamamlama yüzdesini hesapla
  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 0;

    // Temel Bilgiler (20%)
    total += 20;
    if (profile.full_name) completed += 20;

    // Aday Bilgileri (50%)
    if (candidateInfo) {
      total += 10;
      if (candidateInfo.phone) completed += 10;

      total += 10;
      if (candidateInfo.address) completed += 10;

      total += 10;
      if (candidateInfo.education_level) completed += 10;

      total += 10;
      if (candidateInfo.experience_years !== null) completed += 10;

      total += 10;
      if (candidateInfo.skills && candidateInfo.skills.length > 0) completed += 10;
    } else {
      total += 50;
    }

    // Belgeler (30%)
    const requiredDocs = ['CV', 'POLICE', 'RESIDENCE', 'KIMLIK'];
    total += 30;
    const uploadedDocs = documents?.map((doc) => doc.document_type) || [];
    const completedDocs = requiredDocs.filter((docType) =>
      uploadedDocs.includes(docType)
    ).length;
    completed += Math.round((completedDocs / requiredDocs.length) * 30);

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const documentsCount = documents?.length || 0;
  const approvedDocumentsCount =
    documents?.filter((doc) => doc.status === 'APPROVED').length || 0;
  const pendingDocumentsCount =
    documents?.filter((doc) => doc.status === 'PENDING').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Jobul<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-sm text-gray-600">Ana Sayfa</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Profilim
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz, {profile.full_name || 'Aday'}! 👋
          </h2>
          <p className="text-gray-600">
            Aday dashboard'unuza hoş geldiniz. Profil bilgilerinizi yönetebilir, belgelerinizi yükleyebilir ve başvuru durumunuzu takip edebilirsiniz.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion */}
          <Link
            href="/profile"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profil Tamamlanma</p>
                <p className="text-2xl font-bold text-gray-900">%{profileCompletion}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </Link>

          {/* Documents */}
          <Link
            href="/profile"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Yüklenen Belgeler</p>
                <p className="text-2xl font-bold text-gray-900">{documentsCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </Link>

          {/* Approved Documents */}
          <Link
            href="/profile"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Onaylanan Belgeler</p>
                <p className="text-2xl font-bold text-gray-900">{approvedDocumentsCount}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Hızlı İşlemler</h3>
          <div className="flex justify-center">
            <Link
              href="/profile"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all block max-w-md"
            >
              <h4 className="font-semibold text-gray-900 mb-2">📝 Profil Bilgilerim</h4>
              <p className="text-sm text-gray-600">Profil bilgilerinizi görüntüleyin ve düzenleyin</p>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h4>
          <p className="text-sm text-blue-800">
            Profil bilgilerinizi tamamladıktan ve gerekli belgeleri yükledikten sonra,
            consultant'lar tarafından inceleneceksiniz. Onay sürecini profil sayfanızdan takip edebilirsiniz.
          </p>
        </div>
      </main>
    </div>
  );
}
