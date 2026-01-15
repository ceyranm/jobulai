/**
 * Banner Slider Component
 * 
 * Ana sayfada kullanılacak slider component - 3 kart yan yana
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  id: string;
  logo_url: string | null;
  title: string;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Otomatik slider - 3 kart birlikte kayacak
  useEffect(() => {
    if (banners.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 3;
        // Eğer sona geldiysek başa dön
        if (next >= banners.length) {
          return 0;
        }
        return next;
      });
    }, 5000); // 5 saniyede bir değiş

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  // Görüntülenecek banner'ları belirle (3 kart)
  const getVisibleBanners = () => {
    if (banners.length <= 3) {
      return banners;
    }
    
    const visible: Banner[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % banners.length;
      visible.push(banners[index]);
    }
    return visible;
  };

  const visibleBanners = getVisibleBanners();

  return (
    <section className="relative w-full">
      {/* Slider Container */}
      <div className="relative">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {visibleBanners.map((banner, index) => (
            <div
              key={banner.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100/50 hover:-translate-y-1 hover:border-blue-200/50"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-indigo-50/0 to-purple-50/0 group-hover:from-blue-50 group-hover:via-indigo-50 group-hover:to-purple-50 transition-all duration-300"></div>
              
              {/* Card Content */}
              <div className="relative z-10 h-full min-h-[320px] flex flex-col p-6">
                {/* Content */}
                <div className="relative z-20 flex flex-col h-full">
                  {/* Logo with Modern Frame */}
                  {banner.logo_url && (
                    <div className="flex justify-center mb-5">
                      <div className="relative h-16 w-auto min-w-[120px] max-w-[160px] p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-sm group-hover:shadow-md">
                        <div className="relative h-full w-full">
                          <Image
                            src={banner.logo_url}
                            alt={banner.title}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 120px, 160px"
                            unoptimized
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title with Modern Typography */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300 leading-tight">
                    {banner.title}
                  </h3>

                  {/* Description with Better Spacing */}
                  {banner.description && (
                    <p className="text-sm md:text-base text-gray-600 text-center mb-5 flex-grow leading-relaxed group-hover:text-gray-700 transition-colors">
                      {banner.description}
                    </p>
                  )}

                  {/* Modern Button */}
                  <div className="mt-auto pt-4">
                    <Link
                      href={banner.button_link || '/auth/register'}
                      className="group/btn relative block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden"
                    >
                      {/* Button Shine Effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {banner.button_text || 'Hemen Başvur'}
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Modern Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/8 via-indigo-400/8 to-purple-400/8 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-400/8 via-blue-400/8 to-cyan-400/8 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        {banners.length > 3 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(banners.length / 3) }).map((_, index) => {
              const pageIndex = index * 3;
              const isActive = currentIndex === pageIndex || 
                             (currentIndex > pageIndex && currentIndex < pageIndex + 3);
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(pageIndex)}
                  className={`h-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                  aria-label={`Page ${index + 1}`}
                />
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
