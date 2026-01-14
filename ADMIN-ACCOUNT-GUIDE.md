# Admin Hesabı Oluşturma Kılavuzu

Supabase'e manuel olarak admin hesabı eklemek için **3 yöntem** var. En kolay yöntem **Yöntem 1**.

---

## 🎯 Yöntem 1: Supabase Dashboard + SQL (ÖNERİLEN - En Kolay)

### Adım 1: Kullanıcı Oluştur (Authentication)
1. [Supabase Dashboard](https://app.supabase.com) → Projeni seç
2. Sol menüden **Authentication** → **Users**
3. Sağ üstte **"Add user"** → **"Create new user"**
4. Bilgileri doldur:
   ```
   Email: admin@jobulai.com
   Password: GüçlüBirŞifre123!
   ✅ Auto Confirm User (işaretle)
   ```
5. **"Create user"** tıkla

### Adım 2: Kullanıcı ID'sini Kopyala
1. Oluşturulan kullanıcıya tıkla
2. **UUID** değerini kopyala (örnek: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Adım 3: SQL Editor'de Profile Oluştur
1. Sol menüden **SQL Editor**
2. **New query** tıkla
3. Aşağıdaki SQL'i yapıştır (UUID'yi değiştir):

```sql
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
VALUES (
  'BURAYA-KULLANICI-UUID-GELECEK', -- ← Adım 2'de kopyaladığın UUID'yi buraya yapıştır
  'Admin User',                      -- İstediğin isim
  'ADMIN',
  NOW(),
  NOW()
);
```

4. **Run** (veya F5) tıkla

✅ **Tamamlandı!** Artık `admin@jobulai.com` ile giriş yapabilirsin.

---

## 🔧 Yöntem 2: API Route ile Otomatik (Gelişmiş)

### Adım 1: Environment Variable Ayarla
`.env.local` dosyasına ekle:
```env
ALLOW_CREATE_ADMIN=true
```

### Adım 2: API'yi Çağır
Terminal'de veya Postman'de:

```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jobulai.com",
    "password": "GüçlüBirŞifre123!",
    "fullName": "Admin User"
  }'
```

Veya Postman/Thunder Client kullan:
- **Method**: POST
- **URL**: `http://localhost:3000/api/admin/create-admin`
- **Body** (JSON):
```json
{
  "email": "admin@jobulai.com",
  "password": "GüçlüBirŞifre123!",
  "fullName": "Admin User"
}
```

### Adım 3: Güvenlik - Environment Variable'ı Kapat
İşlem bittikten sonra `.env.local`'den sil veya `false` yap:
```env
ALLOW_CREATE_ADMIN=false
```

✅ **Tamamlandı!**

---

## 📝 Yöntem 3: SQL Script ile (Hızlı)

Eğer zaten bir kullanıcın varsa, sadece rolünü değiştirmek için:

1. **SQL Editor** aç
2. Aşağıdaki script'i çalıştır (email'i kendi email'inle değiştir):

```sql
-- Email'e göre kullanıcıyı bul ve ADMIN yap
UPDATE public.profiles
SET 
  role = 'ADMIN',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'admin@jobulai.com'  -- ← Kendi email'ini yaz
);
```

✅ **Tamamlandı!**

---

## 🔍 Admin Hesabını Kontrol Et

1. Uygulamada giriş yap: `admin@jobulai.com` / şifre
2. `/dashboard/admin` sayfasına git
3. Eğer erişebiliyorsan, admin hesabın hazır! 🎉

---

## ⚠️ Önemli Notlar

- **İlk Admin**: İlk admin hesabını mutlaka **Yöntem 1** ile oluştur
- **Güvenlik**: Admin hesaplarını güçlü şifrelerle oluştur
- **Email Doğrulama**: Dashboard'da kullanıcının email'ini "confirm" et
- **Şifre Sıfırlama**: Dashboard > Authentication > Users > User > Reset password

---

## 🆘 Sorun mu yaşıyorsun?

### Problem: "Role violation" hatası
**Çözüm**: SQL script'inde `role = 'ADMIN'` doğru yazıldığından emin ol.

### Problem: Giriş yapamıyorum
**Çözüm**: 
1. Email'in doğru yazıldığından emin ol
2. Supabase Dashboard > Authentication > Users'da kullanıcının email'inin "confirmed" olduğunu kontrol et

### Problem: "Permission denied" hatası
**Çözüm**: Supabase Dashboard'da SQL Editor'ü çalıştırdığından emin ol (tarayıcıdan değil).
