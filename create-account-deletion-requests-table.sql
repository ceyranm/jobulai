-- Hesap Silme Talepleri Tablosu
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    confirmation_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index'ler
CREATE INDEX idx_account_deletion_requests_profile_id ON public.account_deletion_requests(profile_id);
CREATE INDEX idx_account_deletion_requests_status ON public.account_deletion_requests(status);
CREATE INDEX idx_account_deletion_requests_requested_at ON public.account_deletion_requests(requested_at DESC);

-- RLS Politikaları
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil (varsa)
DROP POLICY IF EXISTS "Kullanıcılar kendi silme taleplerini görebilir" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Kullanıcılar kendi silme taleplerini oluşturabilir" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Admin'ler tüm silme taleplerini görebilir" ON public.account_deletion_requests;
DROP POLICY IF EXISTS "Admin'ler silme taleplerini güncelleyebilir" ON public.account_deletion_requests;

-- Kullanıcılar kendi taleplerini görebilir
CREATE POLICY "Kullanıcılar kendi silme taleplerini görebilir"
    ON public.account_deletion_requests FOR SELECT
    USING (profile_id = auth.uid());

-- Kullanıcılar kendi silme taleplerini oluşturabilir
CREATE POLICY "Kullanıcılar kendi silme taleplerini oluşturabilir"
    ON public.account_deletion_requests FOR INSERT
    WITH CHECK (profile_id = auth.uid());

-- Admin'ler tüm talepleri görebilir
CREATE POLICY "Admin'ler tüm silme taleplerini görebilir"
    ON public.account_deletion_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Admin'ler talepleri güncelleyebilir
CREATE POLICY "Admin'ler silme taleplerini güncelleyebilir"
    ON public.account_deletion_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Profiller tablosuna deleted_at kolonu ekle (hesap silinme durumu için)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Deleted_at için index
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
