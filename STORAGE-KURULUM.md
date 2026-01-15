# 📦 Supabase Storage Kurulum Rehberi

Logo yükleme özelliğinin çalışması için Supabase Storage bucket'ının oluşturulması gerekiyor.

## 🚀 Adım 1: Storage Bucket Oluşturma

1. **Supabase Dashboard'a gidin**: [https://app.supabase.com](https://app.supabase.com)
2. Projenizi seçin
3. Sol menüden **"Storage"** sekmesine tıklayın
4. **"New bucket"** butonuna tıklayın
5. Şu bilgileri girin:
   - **Name**: `public` (tam olarak bu isim olmalı)
   - **Public bucket**: ✅ **Evet** (önemli!)
   - **File size limit**: 5 MB (veya istediğiniz limit)
   - **Allowed MIME types**: `image/*` (veya boş bırakın)
6. **"Create bucket"** butonuna tıklayın

## 🔐 Adım 2: RLS (Row Level Security) Politikaları

Storage bucket'ı oluşturduktan sonra RLS politikalarını ayarlamanız gerekiyor.

### 2.1. SQL Editor'e Gidin

1. Sol menüden **"SQL Editor"** sekmesine tıklayın
2. **"New Query"** butonuna tıklayın

### 2.2. Aşağıdaki SQL'i Çalıştırın

```sql
-- Public bucket için okuma izni (herkes okuyabilir)
CREATE POLICY "Public logos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- Sadece admin'ler yükleyebilir
CREATE POLICY "Only admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- Sadece admin'ler güncelleyebilir
CREATE POLICY "Only admins can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);

-- Sadece admin'ler silebilir
CREATE POLICY "Only admins can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);
```

### 2.3. SQL'i Çalıştırın

1. SQL kodunu yapıştırın
2. **"Run"** butonuna tıklayın (veya `Ctrl + Enter`)
3. ✅ **"Success"** mesajını görmelisiniz

## ✅ Adım 3: Test Etme

1. Admin olarak giriş yapın
2. Dashboard → Sistem Ayarları'na gidin
3. Bir logo dosyası seçin
4. "Ayarları Kaydet" butonuna tıklayın

Eğer hala hata alıyorsanız, tarayıcının Developer Console'unu açın (F12) ve hata mesajını kontrol edin.

## 🐛 Sorun Giderme

### "Bucket not found" hatası
- ✅ Storage'da `public` adında bir bucket oluşturduğunuzdan emin olun
- ✅ Bucket adının tam olarak `public` olduğunu kontrol edin (büyük/küçük harf duyarlı)

### "new row violates row-level security" hatası
- ✅ RLS politikalarını yukarıdaki SQL ile oluşturduğunuzdan emin olun
- ✅ Admin olarak giriş yaptığınızdan emin olun

### "Unauthorized" hatası
- ✅ Admin rolünde bir kullanıcı ile giriş yaptığınızdan emin olun
- ✅ Profil tablosunda rolünüzün `ADMIN` olduğunu kontrol edin

### Logo görünmüyor
- ✅ Bucket'ın **Public** olarak işaretlendiğinden emin olun
- ✅ Logo URL'sinin doğru olduğunu kontrol edin
- ✅ Tarayıcı konsolunda (F12) hata mesajlarını kontrol edin

## 📝 Notlar

- Logo dosyaları `logos/` klasöründe saklanır
- Maksimum dosya boyutu: 5MB
- Desteklenen formatlar: PNG, JPG, SVG, GIF, WebP
- Logo URL'si otomatik olarak public URL olarak oluşturulur

Sorularınız varsa sorun! 😊
