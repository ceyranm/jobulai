-- =====================================================
-- Documents Tablosuna EVALUATION Status Ekleme
-- =====================================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- Belgelerin "Değerlendirmede" durumuna geçebilmesi için gerekli

-- 1. Mevcut check constraint'i kaldır
ALTER TABLE public.documents
DROP CONSTRAINT IF EXISTS documents_status_check;

-- 2. Yeni check constraint ekle (EVALUATION dahil)
ALTER TABLE public.documents
ADD CONSTRAINT documents_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EVALUATION'));

-- 3. Kontrol et
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.documents'::regclass
  AND conname = 'documents_status_check';
