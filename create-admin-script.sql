-- =====================================================
-- MANUEL ADMIN HESABI OLUŞTURMA SCRIPT'İ
-- =====================================================
-- 
-- KULLANIM:
-- 1. Önce Supabase Dashboard > Authentication > Users'dan kullanıcı oluştur
-- 2. Oluşturulan kullanıcının UUID'sini kopyala
-- 3. Bu script'te UUID'yi değiştir
-- 4. SQL Editor'de çalıştır
--
-- =====================================================

-- ADIM 1: UUID'yi kendi kullanıcı ID'nle değiştir
-- Örnek: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- (Bu ID'yi Supabase Dashboard > Authentication > Users'dan kopyalayacaksın)

INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
VALUES (
  'BURAYA-KULLANICI-UUID-GELECEK', -- ← Supabase Auth'dan kopyaladığın UUID'yi buraya yapıştır
  'Admin User',                      -- İstediğin isim
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'ADMIN',
  full_name = 'Admin User',
  updated_at = NOW();

-- =====================================================
-- NOTLAR:
-- =====================================================
-- - Eğer kullanıcı zaten varsa, ON CONFLICT ile güncellenecek
-- - Email doğrulaması için: Supabase Dashboard > Authentication > Users > User'a tıkla > Email'i confirm et
-- - Şifre sıfırlamak için: Dashboard > Authentication > Users > User'a tıkla > Reset password
