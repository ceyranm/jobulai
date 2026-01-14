/**
 * Admin Kullanıcı Detay Sayfası
 * 
 * Admin'lerin bir kullanıcının detaylarını görüntüleyip yönetebileceği sayfa
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ModernHeader from '@/components/modern-header';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'CANDIDATE' | 'MIDDLEMAN' | 'CONSULTANT' | 'ADMIN';
  created_at: string;
  updated_at: string;
  application_status: string | null;
  middleman_id: string | null;
}

interface CandidateInfo {
  id: string;
  profile_id: string;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  address: string | null;
  date_of_birth: string | null;
  education_level: string | null;
  experience_years: number | null;
  skills: string[] | null;
}

function AdminUserDetailContent() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  
  // userId'yi daha basit şekilde al
  const userId = params?.id ? (Array.isArray(params.id) ? params.id[0] : String(params.id)) : null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('Kullanıcı ID bulunamadı');
      return;
    }

    let cancelled = false;

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Admin kontrolü
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!adminProfile || adminProfile.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        // Kullanıcı profilini al
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!userProfile) {
          setError('Kullanıcı bulunamadı');
          setLoading(false);
          return;
        }

        if (cancelled) return;

        setProfile(userProfile);

        // Eğer aday ise candidate_info'yu al
        if (userProfile.role === 'CANDIDATE') {
          const { data: info } = await supabase
            .from('candidate_info')
            .select('*')
            .eq('profile_id', userId)
            .single();

          if (cancelled) return;

          if (info) {
            setCandidateInfo(info);
            setEmail(info.email);
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || 'Kullanıcı bilgileri yüklenirken hata oluştu');
        console.error('Error loading user:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (userId) {
      loadUser();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setResetPasswordLoading(true);
    setError(null);
    setResetPasswordSuccess(false);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şifre sıfırlanamadı');
      }

      setResetPasswordSuccess(true);
      setNewPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setResetPasswordSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlanırken hata oluştu');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      CANDIDATE: 'bg-green-100 text-green-800',
      MIDDLEMAN: 'bg-purple-100 text-purple-800',
      CONSULTANT: 'bg-yellow-100 text-yellow-800',
      ADMIN: 'bg-red-100 text-red-800',
    };

    const labels = {
      CANDIDATE: 'Aday',
      MIDDLEMAN: 'Aracı',
      CONSULTANT: 'Danışman',
      ADMIN: 'Admin',
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded bg-gray-100 text-gray-800">
          Durum Yok
        </span>
      );
    }

    const statusMap: Record<string, { label: string; color: string }> = {
      NEW_APPLICATION: { label: 'Yeni Başvuru', color: 'bg-blue-500 text-white' },
      EVALUATION: { label: 'Değerlendirme', color: 'bg-yellow-500 text-white' },
      APPROVED: { label: 'Onaylandı', color: 'bg-green-500 text-white' },
      REJECTED: { label: 'Reddedildi', color: 'bg-red-500 text-white' },
      UPDATE_REQUIRED: { label: 'Güncelleme Gerekli', color: 'bg-orange-500 text-white' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500 text-white' };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/dashboard/admin/users"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kullanıcı Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <ModernHeader 
        title="Kullanıcı Detayı"
        subtitle={profile.full_name || 'İsimsiz'}
        backLink={{
          href: '/dashboard/admin/users',
          label: 'Kullanıcı Listesine Dön'
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {resetPasswordSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ Şifre başarıyla sıfırlandı!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol: Kullanıcı Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temel Bilgiler */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Temel Bilgiler
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ad Soyad</label>
                  <p className="text-gray-900">{profile.full_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
                  <div>{getRoleBadge(profile.role)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kullanıcı ID</label>
                  <p className="text-gray-900 text-sm font-mono">{profile.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Başvuru Durumu</label>
                  <div>{getStatusBadge(profile.application_status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kayıt Tarihi</label>
                  <p className="text-gray-900">
                    {new Date(profile.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Son Güncelleme</label>
                  <p className="text-gray-900">
                    {new Date(profile.updated_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Aday Bilgileri (sadece CANDIDATE için) */}
            {profile.role === 'CANDIDATE' && candidateInfo && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Aday Bilgileri
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">E-posta</label>
                    <p className="text-gray-900">{candidateInfo.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Telefon</label>
                    <p className="text-gray-900">{candidateInfo.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">TC Kimlik No</label>
                    <p className="text-gray-900">{candidateInfo.national_id || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Eğitim Seviyesi</label>
                    <p className="text-gray-900">{candidateInfo.education_level || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Deneyim Yılı</label>
                    <p className="text-gray-900">
                      {candidateInfo.experience_years !== null ? `${candidateInfo.experience_years} yıl` : '-'}
                    </p>
                  </div>
                  {candidateInfo.address && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Adres</label>
                      <p className="text-gray-900">{candidateInfo.address}</p>
                    </div>
                  )}
                  {candidateInfo.skills && Array.isArray(candidateInfo.skills) && candidateInfo.skills.length > 0 && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Beceriler</label>
                      <div className="flex flex-wrap gap-2">
                        {candidateInfo.skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
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
          </div>

          {/* Sağ: Yönetim İşlemleri */}
          <div className="space-y-6">
            {/* Şifre Yönetimi */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Şifre Yönetimi
              </h2>
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Şifre Sıfırla
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetPassword}
                      disabled={resetPasswordLoading || !newPassword || newPassword.length < 6}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetPasswordLoading ? 'Sıfırlanıyor...' : 'Sıfırla'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setNewPassword('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Diğer İşlemler */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Diğer İşlemler
              </h2>
              <div className="space-y-2">
                {profile.role === 'CANDIDATE' && (
                  <Link
                    href={`/dashboard/consultant/applications/${profile.id}`}
                    className="block w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center"
                  >
                    Başvuruyu Görüntüle
                  </Link>
                )}
                <button
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled
                >
                  Rol Değiştir (Yakında)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminUserDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <AdminUserDetailContent />
    </Suspense>
  );
}
