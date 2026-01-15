/**
 * Admin - Hesap Silme Talepleri Sayfası
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ModernHeader from '@/components/modern-header';

interface DeletionRequest {
  id: string;
  profile_id: string;
  confirmation_text: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export default function AccountDeletionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        // Silme taleplerini al
        const { data: deletionRequests, error } = await supabase
          .from('account_deletion_requests')
          .select(`
            *,
            profiles!account_deletion_requests_profile_id_fkey (
              id,
              full_name,
              email,
              role
            )
          `)
          .order('requested_at', { ascending: false });

        if (error) throw error;

        setRequests((deletionRequests as any) || []);
      } catch (error) {
        console.error('Error loading deletion requests:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  const handleApprove = async (requestId: string, profileId: string) => {
    if (!confirm('Bu hesabı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    setProcessingId(requestId);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Giriş yapmamışsınız');
        return;
      }

      // Talebi onayla
      const { error: updateError } = await supabase
        .from('account_deletion_requests')
        .update({
          status: 'APPROVED',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Profili silindi olarak işaretle
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Auth kullanıcısını devre dışı bırak (Supabase Admin API gerekir)
      // Bu kısım için service role key gerekli, şimdilik sadece profil silindi olarak işaretleniyor

      // Listeyi yenile
      const { data: deletionRequests } = await supabase
        .from('account_deletion_requests')
        .select(`
          *,
          profiles!account_deletion_requests_profile_id_fkey (
            id,
            full_name,
            email,
            role
          )
        `)
        .order('requested_at', { ascending: false });

      setRequests((deletionRequests as any) || []);
    } catch (error: any) {
      alert(error.message || 'Hesap silinirken hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm('Bu talebi reddetmek istediğinize emin misiniz?')) {
      return;
    }

    setProcessingId(requestId);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Giriş yapmamışsınız');
        return;
      }

      const { error } = await supabase
        .from('account_deletion_requests')
        .update({
          status: 'REJECTED',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      // Listeyi yenile
      const { data: deletionRequests } = await supabase
        .from('account_deletion_requests')
        .select(`
          *,
          profiles!account_deletion_requests_profile_id_fkey (
            id,
            full_name,
            email,
            role
          )
        `)
        .order('requested_at', { ascending: false });

      setRequests((deletionRequests as any) || []);
    } catch (error: any) {
      alert(error.message || 'Talep reddedilirken hata oluştu');
    } finally {
      setProcessingId(null);
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

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const rejectedRequests = requests.filter((r) => r.status === 'REJECTED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernHeader
        title="Hesap Silme Talepleri"
        subtitle="Kullanıcı hesap silme taleplerini yönetin"
        backLink={{
          href: '/dashboard/admin',
          label: 'Dashboard',
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bekleyen Talepler</p>
                <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Onaylanan</p>
                <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Reddedilen</p>
                <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bekleyen Talepler */}
        {pendingRequests.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Bekleyen Talepler</h3>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-amber-200 rounded-xl p-6 bg-amber-50/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {(request.profiles as any)?.full_name || 'İsimsiz Kullanıcı'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {(request.profiles as any)?.email} • {(request.profiles as any)?.role}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Talep Tarihi: {new Date(request.requested_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                      Beklemede
                    </span>
                  </div>
                  <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 font-mono">{request.confirmation_text}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request.id, request.profile_id)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {processingId === request.id ? 'İşleniyor...' : 'Onayla ve Sil'}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onaylanan ve Reddedilen Talepler */}
        {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Geçmiş Talepler</h3>
            <div className="space-y-4">
              {[...approvedRequests, ...rejectedRequests].map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-xl p-6 ${
                    request.status === 'APPROVED'
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {(request.profiles as any)?.full_name || 'İsimsiz Kullanıcı'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {(request.profiles as any)?.email} • {(request.profiles as any)?.role}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Talep: {new Date(request.requested_at).toLocaleString('tr-TR')}
                        {request.reviewed_at && (
                          <> • İnceleme: {new Date(request.reviewed_at).toLocaleString('tr-TR')}</>
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz talep yok</h3>
            <p className="text-gray-600">Kullanıcılar hesap silme talebi oluşturduğunda burada görünecektir.</p>
          </div>
        )}
      </main>
    </div>
  );
}
