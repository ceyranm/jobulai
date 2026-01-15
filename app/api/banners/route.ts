/**
 * Public Banners API Endpoint
 * 
 * Aktif banner'ları döndürür (public)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Sadece aktif banner'ları al
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching banners:', error);
      return NextResponse.json(
        { error: 'Failed to fetch banners' },
        { status: 500 }
      );
    }

    return NextResponse.json({ banners: banners || [] });
  } catch (error) {
    console.error('Error in GET /api/banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
