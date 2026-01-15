# 🔧 MAMP "Not Found" Sorunu - Kesin Çözüm

## Sorun Tespiti

MAMP'te "Not Found" hatası genellikle şu nedenlerden kaynaklanır:
1. Document Root ayarı yanlış
2. Port ayarları farklı
3. .htaccess dosyası sorun çıkarıyor

## ✅ Çözüm Adımları

### Adım 1: MAMP Ayarlarını Kontrol Edin

1. **MAMP uygulamasını açın**
2. **Preferences** (Tercihler) butonuna tıklayın
3. **Ports** sekmesine gidin ve şunları kontrol edin:
   - Apache Port: **5555** (veya başka bir port)
   - MySQL Port: **8889** (veya başka bir port)

### Adım 2: Document Root'u Ayarlayın

**Yöntem A: MAMP Preferences ile (Önerilen)**

1. MAMP > Preferences > Web Server
2. **Document Root** bölümünde **Select...** butonuna tıklayın
3. Şu klasörü seçin:
   ```
   /Applications/MAMP/htdocs
   ```
4. **OK** butonuna tıklayın
5. MAMP'i yeniden başlatın (Stop Servers → Start Servers)

**Yöntem B: Manuel Ayarlama**

MAMP'in `httpd.conf` dosyasını düzenleyin:
```
/Applications/MAMP/conf/apache/httpd.conf
```

`DocumentRoot` satırını bulun ve şu şekilde ayarlayın:
```apache
DocumentRoot "/Applications/MAMP/htdocs"
<Directory "/Applications/MAMP/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

### Adım 3: Test Edin

Tarayıcıda şu adresleri sırayla deneyin:

1. **Test dosyası:**
   ```
   http://localhost:8888/test.php
   ```
   Eğer bu çalışıyorsa, PHP çalışıyor demektir.

2. **Kurulum sayfası:**
   ```
   http://localhost:8888/corporate-cms/test-access.php
   ```
   Bu sayfa PHP'nin çalıştığını ve dosyaların mevcut olduğunu gösterecek.

3. **Kurulum:**
   ```
   http://localhost:8888/corporate-cms/setup.php
   ```

### Adım 4: Port Kontrolü

Eğer 5555 portu çalışmıyorsa:

1. MAMP'in gösterdiği gerçek portu kontrol edin
2. `config/config.php` dosyasında BASE_URL'i güncelleyin:
   ```php
   define('BASE_URL', 'http://localhost:XXXX/corporate-cms/public');
   ```
   (XXXX yerine gerçek port numarası)

### Adım 5: Alternatif: Doğrudan htdocs'a Kopyalama

Eğer symlink çalışmıyorsa, projeyi doğrudan kopyalayın:

```bash
cp -r /Users/emir/Desktop/jobulai/corporate-cms /Applications/MAMP/htdocs/
```

Sonra:
```
http://localhost:8888/corporate-cms/setup.php
```

## 🎯 Hızlı Test Komutları

Terminal'de şunları çalıştırın:

```bash
# Symlink kontrolü
ls -la /Applications/MAMP/htdocs/corporate-cms

# Dosya kontrolü
test -f /Applications/MAMP/htdocs/corporate-cms/setup.php && echo "✅ Var" || echo "❌ Yok"

# PHP testi
/Applications/MAMP/bin/php/php/bin/php -v
```

## 📞 Hala Çalışmıyorsa

1. MAMP loglarını kontrol edin:
   ```
   /Applications/MAMP/logs/apache_error.log
   ```

2. Apache'nin çalıştığından emin olun (MAMP'te yeşil olmalı)

3. Tarayıcı cache'ini temizleyin (Cmd+Shift+R)

4. Farklı bir tarayıcı deneyin
