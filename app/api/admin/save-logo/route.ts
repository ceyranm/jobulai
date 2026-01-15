/**
 * Logo URL Kaydetme API Endpoint
 * 
 * Logo URL'ini kaydeder (settings tablosu olmadan)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Kullanıcı kontrolü
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { logo_url } = body;

    if (!logo_url) {
      return NextResponse.json({ error: 'Logo URL is required' }, { status: 400 });
    }

    // Settings tablosunu kontrol et ve oluştur (yoksa)
    // Önce tabloyu kontrol et
    const { data: tableExists } = await supabase
      .rpc('check_table_exists', { table_name: 'settings' })
      .catch(() => ({ data: false }));

    // Eğer settings tablosu yoksa, oluşturmayı dene
    // Ancak bu işlem için admin yetkisi gerekir, bu yüzden direkt SQL çalıştıramayız
    // Bunun yerine, settings tablosunu kullanmaya çalışalım, yoksa hata verelim

    // Settings tablosuna logo URL'ini kaydet
    const { error: upsertError } = await supabase
      .from('settings')
      .upsert({
        key: 'logo_url',
        value: logo_url,
        description: 'Sistem logosu - Hem header hem de landing page için kullanılır',
      }, {
        onConflict: 'key',
      });

    if (upsertError) {
      // Eğer tablo yoksa, kullanıcıya bilgi ver
      if (upsertError.message?.includes('does not exist') || upsertError.message?.includes('schema cache')) {
        return NextResponse.json({
          error: 'Settings tablosu bulunamadı',
          details: 'Lütfen veritabanında settings tablosunu oluşturun. create-settings-table.sql dosyasını Supabase SQL Editor\'de çalıştırın.',
          code: 'TABLE_NOT_FOUND'
        }, { status: 500 });
      }

      console.error('Error saving logo:', upsertError);
      return NextResponse.json(
        { 
          error: 'Failed to save logo',
          details: upsertError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, logo_url });

  } catch (error) {
    console.error('Error saving logo:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
