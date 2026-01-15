-- Settings Tablosu Oluşturma
-- Logo URL'lerini ve diğer sistem ayarlarını saklamak için

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL, -- Ayar anahtarı (örn: 'header_logo_url', 'landing_logo_url')
    value TEXT, -- Ayar değeri (logo URL'si)
    description TEXT, -- Ayar açıklaması
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- RLS Politikaları
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Sadece ADMIN'ler settings'i görebilir ve değiştirebilir
CREATE POLICY "Admin'ler settings'i görebilir"
    ON public.settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admin'ler settings'i güncelleyebilir"
    ON public.settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admin'ler settings ekleyebilir"
    ON public.settings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- updated_at trigger'ı (eğer fonksiyon varsa)
-- Önce fonksiyonun var olup olmadığını kontrol et
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        -- Trigger'ı oluştur (eğer yoksa)
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'update_settings_updated_at'
        ) THEN
            CREATE TRIGGER update_settings_updated_at 
                BEFORE UPDATE ON public.settings
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- Varsayılan ayarları ekle (opsiyonel)
INSERT INTO public.settings (key, value, description) 
VALUES 
    ('logo_url', '', 'Sistem logosu - Hem header hem de landing page için kullanılır')
ON CONFLICT (key) DO NOTHING;
