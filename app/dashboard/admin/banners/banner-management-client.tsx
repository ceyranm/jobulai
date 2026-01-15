/**
 * Banner Management Client Component
 * 
 * Banner yönetimi için client component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Banner {
  id: string;
  logo_url: string | null;
  title: string;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
}

interface BannerManagementClientProps {
  initialBanners: Banner[];
}

export default function BannerManagementClient({ initialBanners }: BannerManagementClientProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !currentStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Banner durumu güncellenemedi');
      }

      setBanners(banners.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b));
      setMessage({ type: 'success', text: 'Banner durumu güncellendi!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Bir hata oluştu' });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
      return;
    }

    setLoading(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Banner silinemedi');
      }

      setBanners(banners.filter(b => b.id !== id));
      setMessage({ type: 'success', text: 'Banner başarıyla silindi!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Bir hata oluştu' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Ana sayfadaki slider kartlarını buradan yönetebilirsiniz.
          </p>
        </div>
        <Link
          href="/dashboard/admin/banners/new"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          + Yeni Banner Ekle
        </Link>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
              banner.is_active 
                ? 'border-green-200 hover:border-green-300' 
                : 'border-gray-200 opacity-60'
            }`}
          >
            {/* Banner Preview */}
            <div className="p-6 space-y-4">
              {/* Logo */}
              {banner.logo_url && (
                <div className="flex justify-center">
                  <img
                    src={banner.logo_url}
                    alt={banner.title}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center">
                {banner.title}
              </h3>

              {/* Description */}
              {banner.description && (
                <p className="text-sm text-gray-600 text-center line-clamp-3">
                  {banner.description}
                </p>
              )}

              {/* Button Preview */}
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                  disabled
                >
                  {banner.button_text || 'Hemen Başvur'}
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  banner.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {banner.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/banners/${banner.id}/edit`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleToggleActive(banner.id, banner.is_active)}
                  disabled={loading === banner.id}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    banner.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  {loading === banner.id ? '...' : banner.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  disabled={loading === banner.id}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading === banner.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-4">Henüz banner eklenmemiş</p>
          <Link
            href="/dashboard/admin/banners/new"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            İlk Banner'ı Ekle
          </Link>
        </div>
      )}
    </div>
  );
}
