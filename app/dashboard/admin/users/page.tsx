/**
 * Admin Kullanıcı Yönetimi Sayfası
 * 
 * Admin'lerin tüm kullanıcıları görüntüleyip yönetebileceği sayfa
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
}

interface UserWithDetails extends UserProfile {
  candidateInfo: CandidateInfo | null;
  email: string | null; // auth.users'dan gelecek
}

export default function AdminUsersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Admin kontrolü
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        // Tüm profilleri al
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!profiles) {
          setUsers([]);
          setFilteredUsers([]);
          setLoading(false);
          return;
        }

        // Her profil için candidate_info ve email bilgisini al
        const usersWithDetails: UserWithDetails[] = await Promise.all(
          profiles.map(async (profile) => {
            let candidateInfo: CandidateInfo | null = null;
            let email: string | null = null;

            if (profile.role === 'CANDIDATE') {
              const { data: info } = await supabase
                .from('candidate_info')
                .select('*')
                .eq('profile_id', profile.id)
                .single();
              candidateInfo = info || null;
              email = info?.email || null;
            } else {
              // Diğer roller için auth.users'dan email al (sadece admin için)
              // Not: Supabase client ile auth.users'a direkt erişim yok, bu yüzden API route kullanmalıyız
              // Şimdilik candidate_info'dan email alıyoruz
            }

            return {
              ...profile,
              candidateInfo,
              email,
            };
          })
        );

        setUsers(usersWithDetails);
        filterUsers(usersWithDetails, searchQuery, roleFilter);
      } catch (err: any) {
        setError(err.message || 'Kullanıcılar yüklenirken hata oluştu');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [router, supabase]);

  const filterUsers = (usersList: UserWithDetails[], query: string, role: string) => {
    let filtered = usersList;

    // Rol filtresi
    if (role !== 'ALL') {
      filtered = filtered.filter((user) => user.role === role);
    }

    // Arama sorgusu
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery) ||
          user.candidateInfo?.phone?.toLowerCase().includes(lowerQuery) ||
          user.candidateInfo?.national_id?.includes(lowerQuery) ||
          user.id.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterUsers(users, searchQuery, roleFilter);
  }, [searchQuery, roleFilter, users]);

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
      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    const statusMap: Record<string, { label: string; color: string }> = {
      NEW_APPLICATION: { label: 'Yeni Başvuru', color: 'bg-blue-500 text-white' },
      EVALUATION: { label: 'Değerlendirme', color: 'bg-yellow-500 text-white' },
      APPROVED: { label: 'Onaylandı', color: 'bg-green-500 text-white' },
      REJECTED: { label: 'Reddedildi', color: 'bg-red-500 text-white' },
      UPDATE_REQUIRED: { label: 'Güncelleme Gerekli', color: 'bg-orange-500 text-white' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500 text-white' };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${statusInfo.color}`}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ModernHeader 
        title="Kullanıcı Yönetimi"
        subtitle={`${filteredUsers.length} kullanıcı listeleniyor`}
        backLink={{
          href: '/dashboard/admin',
          label: "Dashboard'a Dön"
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filtreler */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arama */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Arama
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim, email, telefon veya ID ile ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Rol Filtresi */}
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Rol Filtresi
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Tüm Roller</option>
                <option value="CANDIDATE">Aday</option>
                <option value="MIDDLEMAN">Aracı</option>
                <option value="CONSULTANT">Danışman</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kullanıcı Listesi */}
        {filteredUsers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'İsimsiz'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email || user.candidateInfo?.email || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.candidateInfo?.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.application_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/admin/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600">Kullanıcı bulunamadı.</p>
          </div>
        )}
      </main>
    </div>
  );
}
