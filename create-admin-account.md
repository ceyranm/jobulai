# Admin Hesabı Oluşturma Kılavuzu

Supabase'e manuel olarak admin hesabı eklemek için iki yöntem var:

## Yöntem 1: Supabase Dashboard + SQL (Önerilen)

### Adım 1: Kullanıcı Oluştur
1. Supabase Dashboard'a git: https://app.supabase.com
2. Projeni seç
3. **Authentication** > **Users** sekmesine git
4. Sağ üstteki **"Add user"** butonuna tıkla
5. **"Create new user"** seçeneğini seç
6. Bilgileri doldur:
   - **Email**: admin@jobulai.com (veya istediğin email)
   - **Password**: Güçlü bir şifre
   - **Auto Confirm User**: ✅ İşaretle (email doğrulama gerektirmemesi için)
7. **"Create user"** butonuna tıkla

### Adım 2: Kullanıcı ID'sini Kopyala
1. Oluşturulan kullanıcıya tıkla
2. **UUID** değerini kopyala (örnek: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Adım 3: SQL Editor'de Profile Oluştur
1. Supabase Dashboard'da **SQL Editor** sekmesine git
2. Aşağıdaki SQL'i çalıştır (kendi bilgilerinle değiştir):

```sql
-- UUID'yi yukarıda kopyaladığın ID ile değiştir
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- Buraya kopyaladığın UUID'yi yapıştır
  'Admin User', -- İstediğin isim
  'ADMIN',
  NOW(),
  NOW()
);
```

3. **Run** butonuna tıkla

✅ **Tamamlandı!** Artık admin hesabıyla giriş yapabilirsin.

---

## Yöntem 2: Tam Otomatik SQL Script (İleri Seviye)

Bu yöntem hem auth.users hem de profiles tablosuna otomatik ekler, ama **SERVICE_ROLE_KEY** gerektirir.

### Adım 1: SQL Editor'de Çalıştır

```sql
-- Bu fonksiyon admin kullanıcısı oluşturur
-- NOT: Bu fonksiyon Supabase'de direkt çalışmaz, çünkü auth.users'a direkt INSERT yapamayız
-- Bu yüzden bu script'i Next.js API route'undan çalıştırmak daha iyi
```

**Daha iyi alternatif:** Aşağıdaki API route'u kullan:

---

## Yöntem 3: API Route ile Admin Oluştur (En Güvenli)

Bir admin oluşturma API route'u oluşturalım. Bu yöntem hem auth.users hem de profiles tablosuna otomatik ekler.
