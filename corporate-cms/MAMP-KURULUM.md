# MAMP Kurulum Kılavuzu

## Hızlı Kurulum

### 1. MAMP'i Başlatın

- MAMP uygulamasını açın
- "Start Servers" butonuna tıklayın
- Apache ve MySQL'in çalıştığından emin olun
- Port ayarları: Apache: 5555, MySQL: 8889 (varsayılan)

### 2. Veritabanı Oluşturma

#### Yöntem 1: Otomatik Kurulum (Önerilen)

1. Tarayıcınızda şu adrese gidin:
   ```
   http://localhost:8888/corporate-cms/install.php?key=install2024
   ```

2. Kurulum otomatik olarak:
   - Veritabanını oluşturacak
   - Tabloları oluşturacak
   - Varsayılan verileri ekleyecek

#### Yöntem 2: Manuel Kurulum

1. phpMyAdmin'e gidin:
   ```
   http://localhost:8888/phpMyAdmin
   ```
   (veya MAMP'in gösterdiği phpMyAdmin linkine)

2. Yeni veritabanı oluşturun:
   - Veritabanı adı: `corporate_cms`
   - Karakter seti: `utf8mb4_unicode_ci`

3. SQL sekmesine gidin ve `database/schema.sql` dosyasının içeriğini yapıştırın

4. "Go" butonuna tıklayın

### 3. Yapılandırma Kontrolü

`config/database.php` dosyası MAMP için hazır:
```php
DB_HOST = 'localhost'
DB_NAME = 'corporate_cms'
DB_USER = 'root'
DB_PASS = 'root'  // MAMP varsayılan şifresi
```

Eğer MAMP'te MySQL şifresi farklıysa, `config/database.php` dosyasında güncelleyin.

### 4. Klasör İzinleri

Terminal'de:
```bash
chmod 755 /Users/emir/Desktop/jobulai/corporate-cms/public/uploads
```

### 5. Document Root Ayarlama

MAMP'te Document Root'u `corporate-cms/public` klasörüne ayarlayın:

1. MAMP > Preferences > Web Server
2. Document Root'u şu şekilde ayarlayın:
   ```
   /Users/emir/Desktop/jobulai/corporate-cms/public
   ```

VEYA

MAMP'in varsayılan htdocs klasörüne symlink oluşturun:
```bash
ln -s /Users/emir/Desktop/jobulai/corporate-cms/public /Applications/MAMP/htdocs/corporate-cms
```

### 6. Siteye Erişim

- **Frontend:** http://localhost:8888/corporate-cms/public/
- **Admin Panel:** http://localhost:8888/corporate-cms/admin/login.php

### 7. İlk Giriş

- **Kullanıcı Adı:** admin
- **Şifre:** admin123

⚠️ **ÖNEMLİ:** İlk girişten sonra mutlaka şifreyi değiştirin!

## Sorun Giderme

### Veritabanı Bağlantı Hatası

1. MAMP'in çalıştığından emin olun
2. MySQL şifresini kontrol edin (genellikle 'root')
3. `config/database.php` dosyasındaki bilgileri kontrol edin

### 404 Hatası

1. Document Root'un doğru ayarlandığından emin olun
2. `.htaccess` dosyasının `public` klasöründe olduğunu kontrol edin
3. Apache'de `mod_rewrite` modülünün aktif olduğunu kontrol edin

### Port Sorunları

MAMP'te portlar farklıysa:
- Apache portu: `config/config.php` dosyasında BASE_URL'i güncelleyin
- MySQL portu: `config/database.php` dosyasında `localhost:8889` şeklinde belirtin

## Sonraki Adımlar

1. ✅ Veritabanı kuruldu
2. ✅ Yapılandırma tamamlandı
3. 🔄 Admin panelden site ayarlarını yapılandırın
4. 🔄 Template'inizi entegre edin
5. 🔄 İçerik ekleyin

## Güvenlik Notu

Kurulum tamamlandıktan sonra `install.php` dosyasını silin veya koruyun:
```bash
rm /Users/emir/Desktop/jobulai/corporate-cms/install.php
```
