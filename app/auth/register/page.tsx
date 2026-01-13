/**
 * Register Sayfası
 * 
 * Yeni kullanıcı kaydı - SADECE CANDIDATE rolü ile kayıt yapılabilir
 * Middleman kullanıcıları manuel olarak DB'den eklenmelidir
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Ad Soyad alanı zorunludur');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // ÖNEMLİ: Kayıt sırasında metadata'ya rol ve ad bilgisi ekliyoruz
      // Trigger (handle_new_user) bu bilgileri kullanarak profiles tablosuna kayıt oluşturacak
      // NOT: Email konfirmasyonu devre dışı bırakıldığı için kullanıcı otomatik olarak authenticated olacak
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'CANDIDATE', // SADECE CANDIDATE rolü ile kayıt
          },
          emailRedirectTo: undefined, // Email konfirmasyonu devre dışı
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Kayıt olunamadı');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Email konfirmasyonu kapalıysa kullanıcı otomatik olarak authenticated olur
        // Dashboard'a yönlendir
        router.push('/dashboard/candidate');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <span className="text-2xl font-bold text-white">J</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Jobul<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-gray-600 mt-2">Yeni hesap oluşturun</p>
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-1 rounded-full inline-block">
            ⚠️ Sadece aday kaydı yapılabilir
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Adınız Soyadınız"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ornek@email.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="En az 6 karakter"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Şifre en az 6 karakter olmalıdır</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Şifrenizi tekrar girin"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">ℹ️ Bilgi</p>
              <p>Kayıt olduktan sonra hesabınız otomatik olarak aktif olacak ve dashboard'unuza yönlendirileceksiniz.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Zaten hesabınız var mı?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Giriş yapın
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
