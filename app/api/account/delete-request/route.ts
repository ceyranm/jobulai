/**
 * Hesap Silme Talebi Oluşturma API Route
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { confirmation_text } = body;

    const requiredText = 'Bilgilerimin tamamen silinmesini ve hesabımın kapatılmasını istiyorum.';

    if (confirmation_text?.trim() !== requiredText) {
      return NextResponse.json(
        { error: `Lütfen tam olarak şunu yazın: "${requiredText}"` },
        { status: 400 }
      );
    }

    // Profil kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    // Mevcut bekleyen talep var mı kontrol et
    const { data: existingRequest } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('profile_id', user.id)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Zaten bekleyen bir silme talebiniz var' },
        { status: 400 }
      );
    }

    // Silme talebi oluştur
    const { error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        profile_id: user.id,
        confirmation_text: confirmation_text.trim(),
        status: 'PENDING',
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || 'Talep oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
