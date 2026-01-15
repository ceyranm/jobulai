# Kurulum Kılavuzu

## Hızlı Başlangıç

### 1. Gereksinimler

- PHP 8.0 veya üzeri
- MySQL 5.7 veya üzeri
- Apache (mod_rewrite) veya Nginx
- Composer (opsiyonel)

### 2. Adım Adım Kurulum

#### Adım 1: Dosyaları Yerleştirin

Proje dosyalarını web sunucunuzun erişebileceği bir klasöre kopyalayın.

#### Adım 2: Veritabanı Oluşturun

MySQL'de yeni bir veritabanı oluşturun:

```sql
CREATE DATABASE corporate_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Adım 3: Veritabanı Şemasını Yükleyin

Terminal'de:

```bash
mysql -u root -p corporate_cms < database/schema.sql
```

Veya phpMyAdmin üzerinden `database/schema.sql` dosyasını import edin.

#### Adım 4: Yapılandırma

`config/database.php` dosyasını düzenleyin:

```php
private const DB_HOST = 'localhost';  // Veritabanı sunucusu
private const DB_NAME = 'corporate_cms';  // Veritabanı adı
private const DB_USER = 'root';  // Veritabanı kullanıcı adı
private const DB_PASS = '';  // Veritabanı şifresi
```

`config/config.php` dosyasında BASE_URL'i düzenleyin:

```php
define('BASE_URL', 'http://localhost/corporate-cms/public');
```

#### Adım 5: Klasör İzinleri

Upload klasörüne yazma izni verin:

```bash
chmod 755 public/uploads
```

#### Adım 6: Web Sunucusu Yapılandırması

**Apache için:**

DocumentRoot'u `public` klasörüne ayarlayın veya VirtualHost oluşturun:

```apache
<VirtualHost *:80>
    ServerName corporate-cms.local
    DocumentRoot /path/to/corporate-cms/public
    <Directory /path/to/corporate-cms/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Nginx için:**

```nginx
server {
    listen 80;
    server_name corporate-cms.local;
    root /path/to/corporate-cms/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 3. İlk Giriş

Tarayıcınızda admin paneline gidin:

```
http://localhost/corporate-cms/admin/login.php
```

Varsayılan bilgiler:
- **Kullanıcı Adı:** admin
- **Şifre:** admin123

⚠️ **ÖNEMLİ:** İlk girişten sonra mutlaka şifreyi değiştirin!

### 4. Template Entegrasyonu

HTML template'inizi entegre etmek için:

1. **CSS Dosyaları:** `public/assets/css/` klasörüne ekleyin
2. **JavaScript:** `public/assets/js/` klasörüne ekleyin  
3. **Görseller:** `public/assets/images/` klasörüne ekleyin
4. **Header/Footer:** `app/Views/layouts/header.php` ve `footer.php` dosyalarını düzenleyin
5. **Sayfa Görünümleri:** `app/Views/pages/` klasöründeki dosyaları template'inize göre güncelleyin

## Sorun Giderme

### Veritabanı Bağlantı Hatası

- Veritabanı bilgilerini kontrol edin
- MySQL servisinin çalıştığından emin olun
- Kullanıcının gerekli izinlere sahip olduğunu kontrol edin

### 404 Hatası

- `.htaccess` dosyasının mevcut olduğunu kontrol edin
- Apache'de `mod_rewrite` modülünün aktif olduğunu kontrol edin
- DocumentRoot'un doğru ayarlandığından emin olun

### Dosya Yükleme Hatası

- `public/uploads/` klasörünün yazılabilir olduğundan emin olun
- PHP `upload_max_filesize` ayarını kontrol edin
- `post_max_size` ayarını kontrol edin

## Sonraki Adımlar

1. Admin panelden site ayarlarını yapılandırın
2. Sayfaları oluşturun ve içerik ekleyin
3. Hizmetlerinizi ekleyin
4. Slider görsellerini yükleyin
5. Template'inizi entegre edin

## Destek

Sorularınız için README.md dosyasına bakabilir veya issue açabilirsiniz.
