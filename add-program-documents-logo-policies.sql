-- =====================================================
-- PROGRAM_DOCUMENTS BUCKET İÇİN LOGO RLS POLİTİKALARI
-- =====================================================
-- Admin'lerin logo yükleyebilmesi için (logo- ile başlayan dosyalar)

-- Önce mevcut politikaları kaldır (eğer varsa)
DROP POLICY IF EXISTS "Admin'ler logos yükleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Herkes logos görebilir" ON storage.objects;
DROP POLICY IF EXISTS "Admin'ler logos güncelleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Admin'ler logos silebilir" ON storage.objects;

-- 1. Admin'ler logo yükleyebilir (logo- ile başlayan dosyalar)
CREATE POLICY "Admin'ler logos yükleyebilir"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'program_documents' AND
  (name)::text LIKE 'logo-%' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 2. Herkes logo dosyalarını görebilir (logo- ile başlayan dosyalar)
CREATE POLICY "Herkes logos görebilir"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'program_documents' AND
  (name)::text LIKE 'logo-%'
);

-- 3. Admin'ler logo dosyalarını güncelleyebilir
CREATE POLICY "Admin'ler logos güncelleyebilir"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'program_documents' AND
  (name)::text LIKE 'logo-%' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- 4. Admin'ler logo dosyalarını silebilir
CREATE POLICY "Admin'ler logos silebilir"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'program_documents' AND
  (name)::text LIKE 'logo-%' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- =====================================================
-- TAMAMLANDI! ✅
-- =====================================================
-- Artık Admin'ler program_documents bucket'ının logos/ klasörüne
-- logo yükleyebilir, güncelleyebilir ve silebilir.
-- Herkes logos/ klasöründeki dosyaları görebilir.
-- =====================================================
