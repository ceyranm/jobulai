/**
 * Logo Yükleme API Endpoint
 * 
 * Supabase Storage'a logo yükler
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Dosya adı oluştur
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Dosyayı ArrayBuffer'a dönüştür
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Supabase Storage'a yükle (program_documents bucket'ına)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('program_documents')
      .upload(filePath, uint8Array, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Logo yükleme başarısız';
      if (uploadError.message?.includes('Bucket not found')) {
        errorMessage = 'Storage bucket bulunamadı. Lütfen Supabase Storage\'da "program_documents" bucket\'ının mevcut olduğundan emin olun.';
      } else if (uploadError.message?.includes('new row violates row-level security')) {
        errorMessage = 'RLS politikası hatası. Lütfen Storage RLS politikalarını kontrol edin.';
      } else if (uploadError.message) {
        errorMessage = uploadError.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: uploadError.message 
      }, { status: 500 });
    }

    // URL al (public veya signed)
    // Önce public URL dene
    const { data: publicUrlData } = supabase.storage
      .from('program_documents')
      .getPublicUrl(filePath);

    // Eğer bucket private ise signed URL kullan
    let finalUrl = publicUrlData.publicUrl;
    
    // Signed URL oluştur (1 yıl geçerli)
    const { data: signedUrlData } = await supabase.storage
      .from('program_documents')
      .createSignedUrl(filePath, 31536000); // 1 yıl

    // Signed URL varsa onu kullan (daha güvenilir)
    if (signedUrlData?.signedUrl) {
      finalUrl = signedUrlData.signedUrl;
    }

    return NextResponse.json({ 
      url: finalUrl,
      path: filePath 
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
