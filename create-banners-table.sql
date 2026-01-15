-- Banners Tablosu Oluşturma
-- Slider kartları için banner yönetimi

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT, -- Banner logosu
    title TEXT NOT NULL, -- Başlık
    description TEXT, -- Kısa açıklama
    button_text TEXT DEFAULT 'Hemen Başvur', -- Buton metni
    button_link TEXT DEFAULT '/auth/register', -- Buton linki
    is_active BOOLEAN DEFAULT true, -- Aktif/Pasif durumu
    display_order INTEGER DEFAULT 0, -- Görüntülenme sırası
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON public.banners(display_order);

-- RLS Politikaları
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Herkes aktif banner'ları görebilir (public)
CREATE POLICY "Herkes aktif banner'ları görebilir"
    ON public.banners FOR SELECT
    USING (is_active = true);

-- Sadece ADMIN'ler tüm banner'ları görebilir
CREATE POLICY "Admin'ler tüm banner'ları görebilir"
    ON public.banners FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Sadece ADMIN'ler banner ekleyebilir
CREATE POLICY "Admin'ler banner ekleyebilir"
    ON public.banners FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Sadece ADMIN'ler banner güncelleyebilir
CREATE POLICY "Admin'ler banner güncelleyebilir"
    ON public.banners FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Sadece ADMIN'ler banner silebilir
CREATE POLICY "Admin'ler banner silebilir"
    ON public.banners FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- updated_at trigger'ı
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'update_banners_updated_at'
        ) THEN
            CREATE TRIGGER update_banners_updated_at 
                BEFORE UPDATE ON public.banners
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- Demo banner'ları ekle
INSERT INTO public.banners (logo_url, title, description, button_text, button_link, is_active, display_order) 
VALUES 
    (
        'https://i.hizliresim.com/fug98qj.png',
        'Yapay Zeka Destekli İK Çözümleri',
        'İşe alım süreçlerinizi optimize edin ve en uygun adaylara ulaşın. Gelişmiş AI teknolojisi ile kariyerinizi bir üst seviyeye taşıyın.',
        'Hemen Başvur',
        '/auth/register',
        true,
        1
    ),
    (
        'https://i.hizliresim.com/fug98qj.png',
        'Profesyonel Danışman Ağı',
        'Sektörün önde gelen danışman ve aracı ağımızdan faydalanarak kapsamlı bir profesyonel ekosistemden faydalanın.',
        'Daha Fazla Bilgi',
        '/auth/register',
        true,
        2
    ),
    (
        'https://i.hizliresim.com/fug98qj.png',
        'Güvenli ve Uyumlu Platform',
        'Verileriniz en yüksek güvenlik standartlarıyla korunur. GDPR, KVKK ve ISO 27001 uyumlu platform ile güvenle ilerleyin.',
        'Hemen Başvur',
        '/auth/register',
        true,
        3
    )
ON CONFLICT DO NOTHING;
