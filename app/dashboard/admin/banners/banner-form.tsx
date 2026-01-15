/**
 * Banner Form Component
 * 
 * Banner ekleme ve düzenleme formu
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Banner {
  id?: string;
  logo_url?: string | null;
  title: string;
  description?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  is_active?: boolean;
  display_order?: number;
}

interface BannerFormProps {
  banner?: Banner;
}

export default function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const isEdit = !!banner;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(banner?.logo_url || null);
  const [title, setTitle] = useState(banner?.title || '');
  const [description, setDescription] = useState(banner?.description || '');
  const [buttonText, setButtonText] = useState(banner?.button_text || 'Hemen Başvur');
  const [buttonLink, setButtonLink] = useState(banner?.button_link || '/auth/register');
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);
  const [displayOrder, setDisplayOrder] = useState(banner?.display_order || 0);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Logo dosyasını yükle
      let logoUrl = banner?.logo_url || null;

      if (logo) {
        const formData = new FormData();
        formData.append('file', logo);
        formData.append('type', 'banner-logo');

        const uploadRes = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Logo yükleme başarısız');
        }

        const uploadData = await uploadRes.json();
        logoUrl = uploadData.url;
      }

      // Banner'ı kaydet
      const url = isEdit ? `/api/admin/banners?id=${banner.id}` : '/api/admin/banners';
      const method = isEdit ? 'PUT' : 'POST';

      const saveRes = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo_url: logoUrl,
          title,
          description,
          button_text: buttonText,
          button_link: buttonLink,
          is_active: isActive,
          display_order: displayOrder,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        const errorMessage = errorData.error || 'Banner kaydedilemedi';
        const errorDetails = errorData.details ? `\n\nDetay: ${errorData.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      setMessage({ type: 'success', text: `Banner ${isEdit ? 'güncellendi' : 'eklendi'}!` });
      setTimeout(() => {
        router.push('/dashboard/admin/banners');
      }, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
      </h2>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Logo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-input"
            />
            <label
              htmlFor="logo-input"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              {preview ? (
                <div className="relative w-full">
                  <img
                    src={preview}
                    alt="Logo Preview"
                    className="w-full h-32 object-contain rounded-lg"
                  />
                  <div className="mt-2 text-center">
                    <span className="text-sm text-blue-600 font-medium">
                      Logo değiştir
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Logo seç</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
            placeholder="Örn: Yapay Zeka Destekli İK Çözümleri"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Kısa Açıklama
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none resize-none"
            placeholder="Banner'da görünecek kısa açıklama metni"
          />
        </div>

        {/* Button Text */}
        <div>
          <label htmlFor="buttonText" className="block text-sm font-semibold text-gray-900 mb-2">
            Buton Metni
          </label>
          <input
            type="text"
            id="buttonText"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
            placeholder="Hemen Başvur"
          />
        </div>

        {/* Button Link */}
        <div>
          <label htmlFor="buttonLink" className="block text-sm font-semibold text-gray-900 mb-2">
            Buton Linki
          </label>
          <input
            type="text"
            id="buttonLink"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
            placeholder="/auth/register"
          />
        </div>

        {/* Display Order */}
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-semibold text-gray-900 mb-2">
            Görüntülenme Sırası
          </label>
          <input
            type="number"
            id="displayOrder"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Düşük sayı önce görünür</p>
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
            Aktif (Slider'da görünsün)
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
