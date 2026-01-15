/**
 * Banner Management API Endpoint
 * 
 * Banner CRUD işlemleri
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Banner listesi
export async function GET(request: Request) {
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

    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
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
    console.error('Error in GET /api/admin/banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Yeni banner ekle
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
    const { logo_url, title, description, button_text, button_link, is_active, display_order } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: banner, error } = await supabase
      .from('banners')
      .insert({
        logo_url: logo_url || null,
        title,
        description: description || null,
        button_text: button_text || 'Hemen Başvur',
        button_link: button_link || '/auth/register',
        is_active: is_active ?? true,
        display_order: display_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating banner:', error);
      return NextResponse.json(
        { error: 'Failed to create banner', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error in POST /api/admin/banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Banner güncelle
export async function PUT(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { logo_url, title, description, button_text, button_link, is_active, display_order } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: banner, error } = await supabase
      .from('banners')
      .update({
        logo_url: logo_url || null,
        title,
        description: description || null,
        button_text: button_text || 'Hemen Başvur',
        button_link: button_link || '/auth/register',
        is_active: is_active ?? true,
        display_order: display_order || 0,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner:', error);
      return NextResponse.json(
        { error: 'Failed to update banner', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error in PUT /api/admin/banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Banner durumu güncelle (is_active)
export async function PATCH(request: Request) {
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
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: banner, error } = await supabase
      .from('banners')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner status:', error);
      return NextResponse.json(
        { error: 'Failed to update banner status', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error in PATCH /api/admin/banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Banner sil
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting banner:', error);
      return NextResponse.json(
        { error: 'Failed to delete banner', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
