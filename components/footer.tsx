/**
 * Footer Component
 * 
 * Tüm sayfalarda kullanılacak footer komponenti
 */

'use client';

import Link from 'next/link';

interface FooterProps {
  simple?: boolean;
}

export default function Footer({ simple = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Basit footer (dashboard sayfaları için)
  if (simple) {
    return (
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-600">
            <div>
              © {currentYear} Tüm Hakları Saklıdır
            </div>
            <div>
              <span className="mx-1">-</span>
              <span>SoftAI</span>
              <span className="ml-1">Tarafından Geliştirilmiştir</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Tam footer (landing page için)
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">JobulAI</h3>
            <p className="text-slate-400 mb-4 leading-relaxed max-w-md">
              Yapay zeka destekli insan kaynakları danışmanlığı platformu. Doğru aday-şirket eşleştirmeleri için yenilikçi çözümler sunuyoruz.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>İstanbul, Türkiye</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#about" className="text-slate-400 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-slate-400 hover:text-white transition-colors">
                  Özellikler
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-slate-400 hover:text-white transition-colors">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Destek</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  İletişim
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  SSS
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Gizlilik Politikası
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              © {currentYear} JobulAI. Tüm hakları saklıdır.
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Geliştirilmiştir</span>
              <Link
                href="https://softai.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                SoftAI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
