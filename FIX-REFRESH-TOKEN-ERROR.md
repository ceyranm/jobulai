# Invalid Refresh Token Hatası Çözümü

Bu hata genellikle tarayıcıda eski/geçersiz refresh token olduğunda oluşur.

## Hızlı Çözüm (Önerilen)

### Adım 1: Tarayıcı Cookie'lerini Temizle

**Chrome/Edge:**
1. `F12` (Developer Tools aç)
2. **Application** sekmesi
3. Sol menüden **Cookies** → `http://localhost:3000` (veya domain'in)
4. Tüm cookie'leri sil (veya sadece `sb-*` ile başlayanları)
5. Sayfayı yenile (`F5`)

**Alternatif:**
- `Ctrl+Shift+Delete` → Cookies → Clear

### Adım 2: LocalStorage Temizle (Gerekirse)

1. Developer Tools → **Application** → **Local Storage**
2. `http://localhost:3000` → **Clear All**
3. Sayfayı yenile

### Adım 3: Giriş Yap

1. Sayfayı yenile
2. `/auth/login` sayfasına git
3. Yeniden giriş yap

✅ **Sorun çözülmüş olmalı!**

---

## Kalıcı Çözüm (Kod)

Eğer bu hata sık tekrarlıyorsa, middleware ve client'ta daha iyi hata yönetimi eklenmiş durumda.

## Neden Oluşur?

1. **Süresi dolmuş token**: Refresh token 30 gün sonra expire olur
2. **Tarayıcı cookie'leri**: Eski/geçersiz cookie'ler
3. **Supabase ayarları**: Auth settings'de token expiry değişmiş olabilir
4. **Çoklu oturum**: Başka bir cihazdan logout yapılmış olabilir

## Önleme

- Düzenli olarak logout/login yap
- Cookie'leri periyodik temizle
- Production'da token expiry ayarlarını kontrol et
