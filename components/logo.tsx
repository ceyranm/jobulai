/**
 * Logo Component
 * 
 * Settings'ten logo URL'ini alır ve gösterir
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
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
    <div className={`flex items-center group flex-shrink-0 ${className}`}>
      <div className="relative h-20 w-auto min-w-[160px]">
        <Image
          src={displayLogoUrl}
          alt="Logo"
          fill
          className="object-contain object-left"
          sizes="(max-width: 768px) 160px, 240px"
          unoptimized
        />
      </div>
    </div>
  );
}
