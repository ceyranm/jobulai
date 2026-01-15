/**
 * Settings Form Component
 * 
 * Logo yükleme ve ayarları yönetmek için form
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
  logoUrl: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function SettingsForm({ logoUrl, metaTitle = '', metaDescription = '' }: SettingsFormProps) {
  const router = useRouter();
  
  // Logo için ayrı state'ler
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoMessage, setLogoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(logoUrl || null);
  
  // Meta için ayrı state'ler
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaMessage, setMetaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [title, setTitle] = useState(metaTitle);
  const [description, setDescription] = useState(metaDescription);

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

  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoLoading(true);
    setLogoMessage(null);

    try {
      // Logo dosyasını yükle
      let newLogoUrl = logoUrl;

      if (logo) {
        const formData = new FormData();
        formData.append('file', logo);
        formData.append('type', 'logo');

        const uploadRes = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          const errorMessage = errorData.error || 'Logo yükleme başarısız';
          const errorDetails = errorData.details ? `\n\nDetay: ${errorData.details}` : '';
          throw new Error(`${errorMessage}${errorDetails}`);
        }

        const uploadData = await uploadRes.json();
        newLogoUrl = uploadData.url;
      }

      // Logo URL'ini kaydet
      const saveRes = await fetch('/api/admin/save-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo_url: newLogoUrl,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        const errorMessage = errorData.error || 'Logo kaydedilemedi';
        const errorDetails = errorData.details ? `\n\nDetay: ${errorData.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      setLogoMessage({ type: 'success', text: 'Logo başarıyla kaydedildi!' });
      setLogo(null); // Yüklenen dosyayı temizle
      router.refresh();
    } catch (error) {
      setLogoMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Bir hata oluştu' 
      });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleMetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMetaLoading(true);
    setMetaMessage(null);

    try {
      // Meta bilgilerini kaydet
      const saveRes = await fetch('/api/admin/save-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta_title: title,
          meta_description: description,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        const errorMessage = errorData.error || 'Meta bilgileri kaydedilemedi';
        const errorDetails = errorData.details ? `\n\nDetay: ${errorData.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      setMetaMessage({ type: 'success', text: 'Meta bilgileri başarıyla kaydedildi!' });
      router.refresh();
    } catch (error) {
      setMetaMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Bir hata oluştu' 
      });
    } finally {
      setMetaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sistem Ayarları</h2>
        <p className="text-gray-600">
          Logo, SEO ve diğer sistem ayarlarını buradan yönetebilirsiniz.
        </p>
      </div>

      {/* Logo Ayarları Kartı */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
        <form onSubmit={handleLogoSubmit} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logo Ayarları</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bu logo hem dashboard'larda sol üst köşede hem de ana sayfada görünecektir.
            </p>
          </div>

          {logoMessage && (
            <div className={`p-4 rounded-lg ${
              logoMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {logoMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sistem Logosu
              </label>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-input"
                      disabled={logoLoading}
                    />
                    <label
                      htmlFor="logo-input"
                      className={`cursor-pointer flex flex-col items-center justify-center ${logoLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={logoLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {logoLoading ? 'Kaydediliyor...' : 'Logoyu Kaydet'}
            </button>
          </div>
        </form>
      </div>

      {/* SEO Ayarları Kartı */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
        <form onSubmit={handleMetaSubmit} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">SEO Ayarları</h3>
            <p className="text-sm text-gray-600 mb-6">
              Arama motorları ve sosyal medya paylaşımları için site meta bilgilerini yönetin.
            </p>
          </div>

          {metaMessage && (
            <div className={`p-4 rounded-lg ${
              metaMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {metaMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="meta-title" className="block text-sm font-semibold text-gray-900 mb-2">
                Meta Title
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Tarayıcı sekmesinde ve arama sonuçlarında görünecek başlık (önerilen: 50-60 karakter)
              </p>
              <input
                type="text"
                id="meta-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: JobulAI - Yapay Zeka Destekli İK Çözümleri"
                maxLength={60}
                disabled={metaLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/60 karakter</p>
            </div>

            <div>
              <label htmlFor="meta-description" className="block text-sm font-semibold text-gray-900 mb-2">
                Meta Description
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Arama sonuçlarında görünecek açıklama metni (önerilen: 150-160 karakter)
              </p>
              <textarea
                id="meta-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Yapay zeka destekli algoritmalarımız ile işe alım süreçlerinizi optimize edin, en uygun adaylara ulaşın ve iş gücü verimliliğinizi artırın."
                maxLength={160}
                rows={4}
                disabled={metaLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/160 karakter</p>
            </div>
          </div>

          {/* Meta Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={metaLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {metaLoading ? 'Kaydediliyor...' : 'Meta Bilgilerini Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
