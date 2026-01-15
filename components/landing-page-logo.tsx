/**
 * Landing Page Logo Component
 * 
 * Ana sayfada büyük logo gösterimi için
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LandingPageLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/logo')
      .then(res => res.json())
      .then(data => {
        setLogoUrl(data.url);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Varsayılan logo URL
  const defaultLogoUrl = 'https://i.hizliresim.com/fug98qj.png';
  const displayLogoUrl = (!loading && logoUrl) ? logoUrl : defaultLogoUrl;

  return (
    <div className="relative group">
      <div className="relative h-32 w-auto min-w-[200px] max-w-[300px] mx-auto">
        <Image
          src={displayLogoUrl}
          alt="Logo"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 200px, 300px"
          unoptimized
        />
      </div>
    </div>
  );
}
