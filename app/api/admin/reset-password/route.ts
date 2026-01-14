/**
 * Admin Şifre Sıfırlama API Route
 * 
 * Admin'lerin kullanıcı şifrelerini sıfırlaması için
 * Supabase Admin API kullanır (Service Role Key gerekli)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmamışsınız' }, { status: 401 });
    }

    // Admin rolü kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    // Request body'den userId ve newPassword al
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId ve newPassword gerekli' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Supabase Admin Client (Service Role Key ile)
    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseAdminUrl || !supabaseServiceRoleKey) {
      console.error('Supabase Admin credentials eksik');
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseAdminUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Kullanıcının var olduğunu kontrol et
    const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Şifreyi sıfırla
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      console.error('Password reset error:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Şifre sıfırlanamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
