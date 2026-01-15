/**
 * Meta Title ve Description Kaydetme API Endpoint
 * 
 * Meta bilgilerini kaydeder
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
    const { meta_title, meta_description } = body;

    // Her bir ayarı ayrı ayrı kaydet
    const settingsToSave = [
      {
        key: 'meta_title',
        value: meta_title || '',
        description: 'Site meta title - SEO ve tarayıcı sekmesi için',
      },
      {
        key: 'meta_description',
        value: meta_description || '',
        description: 'Site meta description - SEO ve arama sonuçları için',
      },
    ];

    // Her bir ayarı sırayla kaydet
    for (const setting of settingsToSave) {
      // Önce mevcut kaydı kontrol et
      const { data: existing, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .eq('key', setting.key)
        .maybeSingle();

      if (checkError && !checkError.message?.includes('does not exist') && !checkError.message?.includes('schema cache')) {
        console.error(`Error checking setting ${setting.key}:`, checkError);
      }

      if (existing) {
        // Güncelle
        const { error } = await supabase
          .from('settings')
          .update({
            value: setting.value,
            description: setting.description,
          })
          .eq('key', setting.key);

        if (error) {
          if (error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
            return NextResponse.json({
              error: 'Settings tablosu bulunamadı',
              details: 'Lütfen veritabanında settings tablosunu oluşturun. create-settings-table.sql dosyasını Supabase SQL Editor\'de çalıştırın.',
              code: 'TABLE_NOT_FOUND'
            }, { status: 500 });
          }

          console.error(`Error updating setting ${setting.key}:`, error);
          return NextResponse.json(
            { 
              error: 'Failed to save meta settings',
              details: error.message,
              setting: setting.key
            },
            { status: 500 }
          );
        }
      } else {
        // Yeni kayıt ekle
        const { error } = await supabase
          .from('settings')
          .insert({
            key: setting.key,
            value: setting.value,
            description: setting.description,
          });

        if (error) {
          if (error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
            return NextResponse.json({
              error: 'Settings tablosu bulunamadı',
              details: 'Lütfen veritabanında settings tablosunu oluşturun. create-settings-table.sql dosyasını Supabase SQL Editor\'de çalıştırın.',
              code: 'TABLE_NOT_FOUND'
            }, { status: 500 });
          }

          console.error(`Error inserting setting ${setting.key}:`, error);
          return NextResponse.json(
            { 
              error: 'Failed to save meta settings',
              details: error.message,
              setting: setting.key
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving meta settings:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
