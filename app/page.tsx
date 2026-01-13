export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <span className="text-3xl font-bold text-white">J</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            Jobul<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
          </h1>
        </div>

        {/* Main Heading */}
        <h2 className="mb-6 text-3xl font-semibold text-gray-800 dark:text-gray-100 sm:text-4xl md:text-5xl">
          Hoş Geldiniz Murat! 👋
        </h2>

        {/* Description */}
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl">
          Yapay zeka destekli kariyer platformuna hoş geldiniz. İş bulma sürecinizi 
          kolaylaştırmak ve kariyerinizi bir üst seviyeye taşımak için buradayız.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/auth/register"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-center"
          >
            <span className="relative z-10">Kayıt Ol</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </a>
          <a
            href="/auth/login"
            className="rounded-xl border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 text-center"
          >
            Giriş Yap
          </a>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800/60">
            <div className="mb-4 text-4xl">🤖</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              AI Destekli Eşleştirme
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Profilinize uygun iş ilanlarını yapay zeka ile bulun
            </p>
          </div>
          <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800/60">
            <div className="mb-4 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Hızlı ve Kolay
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Kısa sürede iş arama sürecinizi tamamlayın
            </p>
          </div>
          <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800/60">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Kişiselleştirilmiş
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Size özel öneriler ve kariyer rehberliği
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
