import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getDefaultRoute } from '@/lib/auth/roles';
import type { UserRole } from '@/types/database';
import Link from 'next/link';
import LandingHeader from '@/components/landing-header';
import LandingPageLogo from '@/components/landing-page-logo';
import Footer from '@/components/footer';
import BannerSlider from '@/components/banner-slider';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }> | { view?: string };
}) {
  const supabase = await createClient();

  // searchParams Promise ise await et
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  
  // Eğer "view" parametresi varsa (Siteyi Görüntüle), yönlendirme yapma
  const shouldShowLanding = params?.view === 'true';

  // Kullanıcı giriş yapmışsa ve view parametresi yoksa kendi dashboard'una yönlendir
  if (!shouldShowLanding) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        const defaultRoute = getDefaultRoute(profile.role as UserRole);
        redirect(defaultRoute);
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      {/* Banner Slider */}
      <section className="w-full bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-cyan-50/20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BannerSlider />
        </div>
      </section>
      

      {/* Trust Section - Stats */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>GÜVENİLİR PLATFORM</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
              Rakamlarla{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JobulAI</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Binlerce memnun müşteri ve başarılı eşleştirme ile sektörde öncüyüz
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">1000+</div>
                <div className="text-base font-bold text-slate-900 mb-2">Aktif Aday</div>
                <p className="text-sm text-slate-500">Profesyonel profiller</p>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-base font-bold text-slate-900 mb-2">Başarılı Eşleşme</div>
                <p className="text-sm text-slate-500">Tamamlanan başvurular</p>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">98%</div>
                <div className="text-base font-bold text-slate-900 mb-2">Müşteri Memnuniyeti</div>
                <p className="text-sm text-slate-500">Yüksek memnuniyet oranı</p>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-base font-bold text-slate-900 mb-2">Yapay Zeka Desteği</div>
                <p className="text-sm text-slate-500">Kesintisiz hizmet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Corporate Modern */}
      <section id="about" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              {/* Features List */}
              <div className="space-y-6">
                <div className="group flex items-start gap-5 p-5 rounded-xl hover:bg-slate-50 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Yapay Zeka Teknolojisi</h3>
                    <p className="text-slate-600 leading-relaxed">Gelişmiş makine öğrenmesi algoritmaları ile aday profillerini derinlemesine analiz ederek en uygun eşleştirmeleri sağlıyoruz.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-5 rounded-xl hover:bg-slate-50 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Güvenli ve Uyumlu Platform</h3>
                    <p className="text-slate-600 leading-relaxed">Verileriniz en yüksek güvenlik standartlarıyla korunur. GDPR, KVKK ve ISO 27001 uyumludur.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-5 rounded-xl hover:bg-slate-50 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Geniş Profesyonel Ağ</h3>
                    <p className="text-slate-600 leading-relaxed">Sektörün önde gelen danışman ve aracı ağımızdan faydalanarak kapsamlı bir ekosistem sunuyoruz.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-5 rounded-xl hover:bg-slate-50 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">7/24 Teknik Destek</h3>
                    <p className="text-slate-600 leading-relaxed">Uzman destek ekibimiz her zaman yanınızda. Hızlı yanıt süreleri ile sorunlarınızı çözüyoruz.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm font-semibold mb-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>HAKKIMIZDA</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                Geleceğin{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">İK Teknolojisi</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                İnsan kaynakları yönetiminde yapay zeka teknolojisinin gücünü kullanarak işe alım süreçlerini optimize eden ve doğru aday-şirket eşleştirmelerini sağlayan yenilikçi bir platformuz.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Danışman ve aracı ağımız sayesinde kapsamlı bir profesyonel ekosistem sunuyoruz ve kariyer gelişimini destekliyoruz. Sektördeki lider konumumuzu sürekli geliştirerek müşterilerimize en iyi hizmeti sunmaya devam ediyoruz.
              </p>
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
              >
                <span>Daha Fazla Bilgi Al</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Corporate Modern */}
      <section id="features" className="py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>ÖZELLİKLERİMİZ</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Neden{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JobulAI?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Modern İK teknolojisi ve geniş profesyonel ağımız sayesinde işe alım süreçlerinizi optimize edin ve verimliliğinizi artırın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Destekli Eşleştirme</h3>
              <p className="text-slate-600 leading-relaxed">
                Gelişmiş yapay zeka algoritmaları aday profillerini derinlemesine analiz ederek en uygun iş fırsatlarını bulur.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/25">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hızlı ve Verimli Süreç</h3>
              <p className="text-slate-600 leading-relaxed">
                Otomatik belge kontrolü ve akıllı değerlendirme sistemi ile işe alım süreçlerinizi %70 oranında hızlandırın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-xl p-8 border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Güvenli ve Uyumlu</h3>
              <p className="text-slate-600 leading-relaxed">
                Verileriniz en yüksek güvenlik standartlarıyla korunur. GDPR, KVKK ve ISO 27001 sertifikalı platform.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-xl p-8 border border-slate-200 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/25">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geniş Profesyonel Ağ</h3>
              <p className="text-slate-600 leading-relaxed">
                Sektörün önde gelen danışman ve aracı ağımız ile kapsamlı bir profesyonel ekosistemden faydalanın.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white rounded-xl p-8 border border-slate-200 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/25">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Detaylı Analitik ve Raporlama</h3>
              <p className="text-slate-600 leading-relaxed">
                Kapsamlı raporlama ve analitik araçları ile süreçlerinizi izleyin, performansı ölçün ve optimize edin.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white rounded-xl p-8 border border-slate-200 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Anlık Bildirimler</h3>
              <p className="text-slate-600 leading-relaxed">
                Başvuru durumları, önemli güncellemeler ve sistem bildirimleri için gerçek zamanlı bildirimler alın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Corporate Modern */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>NASIL ÇALIŞIR?</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Üç Basit{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Adım</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Basit ve etkili bir süreçle işe alım deneyiminizi başlatın. Sadece birkaç dakika içinde platforma katılın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="relative text-center group">
              {/* Connecting Line */}
              <div className="absolute left-1/2 top-28 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-blue-300 via-indigo-300 to-transparent hidden md:block"></div>
              
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform"></div>
                <span className="relative text-4xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Kayıt Olun</h3>
              <p className="text-slate-600 leading-relaxed">
                Hızlı ve kolay kayıt işlemi ile platforma katılın. Profil bilgilerinizi tamamlayarak başlayın.
              </p>
            </div>

            <div className="relative text-center group">
              {/* Connecting Line */}
              <div className="absolute left-1/2 top-28 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-indigo-300 via-purple-300 to-transparent hidden md:block"></div>
              
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform"></div>
                <span className="relative text-4xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Belgelerinizi Yükleyin</h3>
              <p className="text-slate-600 leading-relaxed">
                CV, kimlik, diploma gibi belgeleri güvenli bir şekilde yükleyin. Otomatik kontrol sistemi devreye girer.
              </p>
            </div>

            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform"></div>
                <span className="relative text-4xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Eşleşin ve Başlayın</h3>
              <p className="text-slate-600 leading-relaxed">
                AI ve danışmanlar tarafından değerlendirilip, ideal iş fırsatlarıyla eşleştirilme yapılır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 text-green-700 rounded-lg text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>MÜŞTERİ YORUMLARI</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Müşterilerimiz{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Ne Diyor?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Binlerce memnun müşterimizin deneyimlerini keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                "JobulAI sayesinde işe alım süreçlerimiz %60 daha hızlı hale geldi. Yapay zeka destekli eşleştirme sistemi gerçekten işe yarıyor."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Ahmet Kaya</div>
                  <div className="text-sm text-slate-500">İK Müdürü, Teknoloji Şirketi</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                "Platformun güvenliği ve kullanıcı dostu arayüzü gerçekten etkileyici. Belgelerin otomatik kontrolü büyük zaman tasarrufu sağlıyor."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  SY
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Selin Yılmaz</div>
                  <div className="text-sm text-slate-500">İnsan Kaynakları Uzmanı</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                "Profesyonel danışman ağı sayesinde doğru adaylara çok daha hızlı ulaşıyoruz. Kesinlikle tavsiye ederim."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  MD
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Mehmet Demir</div>
                  <div className="text-sm text-slate-500">CEO, Finans Şirketi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Corporate Modern */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            <span className="block">Kariyerinizi Dönüştürmeye</span>
            <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hazır mısınız?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Binlerce profesyonelle birlikte olmak, doğru iş fırsatlarını keşfetmek ve hayalinizdeki kariyere ulaşmak için şimdi başlayın. Ücretsiz deneme ile hemen başlayabilirsiniz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-slate-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.02]"
            >
              <span>Ücretsiz Başlayın</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300"
            >
              Zaten Hesabınız Var mı?
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>14 gün ücretsiz deneme</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>İstediğiniz zaman iptal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
