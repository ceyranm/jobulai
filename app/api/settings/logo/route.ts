/**
 * Logo URL API Endpoint
 * 
 * Logo URL'lerini döndürür (public endpoint)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'logo_url')
      .single();

    // Varsayılan logo URL
    const defaultLogoUrl = 'https://i.hizliresim.com/fug98qj.png';
    const logoUrl = setting?.value || defaultLogoUrl;

    return NextResponse.json({ 
      url: logoUrl 
    });

  } catch (error) {
    console.error('Error fetching logo:', error);
    // Hata durumunda varsayılan logo döndür
    return NextResponse.json(
      { url: 'https://i.hizliresim.com/fug98qj.png' },
      { status: 200 }
    );
  }
}
