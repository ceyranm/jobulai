'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/logo';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard/candidate';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // Giriş yap
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Giriş yapılamadı');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Session'ı yenile (cookie'lerin set edilmesi için)
        await supabase.auth.getSession();

        // Kısa bir bekleme (session cookie'lerinin set edilmesi için)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Kullanıcının profilini al
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, deleted_at')
          .eq('id', data.user.id)
          .maybeSingle();

        // Profil sorgusu hatası kontrolü
        if (profileError) {
          console.error('Profil sorgusu hatası:', profileError);
          // Daha detaylı hata mesajı göster
          const errorMessage = profileError.message || 'Bilinmeyen hata';
          const errorCode = profileError.code || 'UNKNOWN';
          setError(`Profil bilgileri alınırken hata oluştu (${errorCode}): ${errorMessage}. Lütfen sayfayı yenileyip tekrar deneyin.`);
          setLoading(false);
          return;
        }

        // Profil yoksa
        if (!profile) {
          console.error('Profil bulunamadı. User ID:', data.user.id);
          setError('Profil bulunamadı. Lütfen yönetici ile iletişime geçin.');
          setLoading(false);
          return;
        }

        // Hesap silinmiş mi kontrol et
        if (profile.deleted_at) {
          // Kullanıcıyı çıkış yaptır
          await supabase.auth.signOut();
          setError('Hesabınız kalıcı olarak silinmiştir.');
          setLoading(false);
          return;
        }

        // Rolüne göre yönlendir
        let targetRoute = redirect;
        if (profile.role) {
          switch (profile.role) {
            case 'ADMIN':
              targetRoute = '/dashboard/admin';
              break;
            case 'CONSULTANT':
              targetRoute = '/dashboard/consultant';
              break;
            case 'MIDDLEMAN':
              targetRoute = '/dashboard/middleman';
              break;
            case 'CANDIDATE':
              targetRoute = '/dashboard/candidate';
              break;
            default:
              targetRoute = redirect;
          }
        } else {
          // Rol yoksa hata ver
          setError('Kullanıcı rolü bulunamadı. Lütfen yönetici ile iletişime geçin.');
          setLoading(false);
          return;
        }

        // Başarılı! Yönlendir
        router.push(targetRoute);
        router.refresh(); // Sayfayı yenile
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Logo className="h-10 w-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Jobul<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>'ye Hoş Geldiniz
            </h1>
            <p className="text-slate-600">Güvenli admin dashboard'unuza erişmek için giriş yapın</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                placeholder="info@example.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-600">Beni Hatırla</span>
              </label>
              <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Şifremi Unuttum?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Hesabınız yok mu?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Buradan kayıt olun
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Veya Devam Et</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-semibold text-slate-700">Google ile Giriş Yap</span>
          </button>
        </div>
      </div>

      {/* Right Column - Image & Text */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8">
            <Image
              src="https://i.hizliresim.com/6h73pra.png"
              alt="JobulAI Dashboard"
              width={600}
              height={400}
              className="w-full h-auto mx-auto"
              unoptimized
            />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Tekrar Hoş Geldiniz!
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            JobulAI'ye hoş geldiniz, akıllı iş yönetimi için kapsamlı çözümünüz. İş akışlarınızı optimize edin, verimliliği artırın ve işletmenizi güvenle büyütün.
          </p>
        </div>
      </div>
    </div>
  );
}
