/**
 * Admin Hesabı Oluşturma API Route
 * 
 * Bu route sadece bir kez çalıştırılmalı (ilk admin hesabı için)
 * Veya çok güvenli bir yerde saklanmalı
 * 
 * KULLANIM:
 * POST /api/admin/create-admin
 * Body: { email, password, fullName }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Güvenlik: Sadece belirli koşullarda çalışsın
    // İstersen bu endpoint'i production'da devre dışı bırakabilirsin
    const allowCreateAdmin = process.env.ALLOW_CREATE_ADMIN === 'true';

    if (!allowCreateAdmin) {
      return NextResponse.json(
        { error: 'Admin oluşturma devre dışı. ALLOW_CREATE_ADMIN=true ayarla.' },
        { status: 403 }
      );
    }

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'email, password ve fullName gerekli' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase yapılandırması eksik' },
        { status: 500 }
      );
    }

    // Admin client (Service Role Key ile)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Auth kullanıcısı oluştur
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email doğrulamasını atla
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Kullanıcı oluşturulamadı' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 2. Profile oluştur (ADMIN rolü ile)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        role: 'ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      // Hata olursa oluşturulan auth kullanıcısını sil
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: profileError.message || 'Profil oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin hesabı başarıyla oluşturuldu',
      userId,
      email,
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
