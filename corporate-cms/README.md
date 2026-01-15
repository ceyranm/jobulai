# Kurumsal Web Sitesi - PHP CMS

Statik HTML template'den dönüştürülmüş, yönetilebilir PHP tabanlı kurumsal web sitesi.

## Özellikler

- ✅ MVC benzeri klasör yapısı
- ✅ MySQL veritabanı desteği
- ✅ PDO + Prepared Statements (SQL Injection koruması)
- ✅ XSS koruması
- ✅ Admin panel ile içerik yönetimi
- ✅ Sayfa yönetimi (CRUD)
- ✅ Hizmet yönetimi (CRUD)
- ✅ Slider/Banner yönetimi
- ✅ İletişim formu ve mesaj yönetimi
- ✅ SEO ayarları (her sayfa için ayrı meta bilgileri)
- ✅ Responsive admin panel
- ✅ Güvenli dosya yükleme kontrolleri

## Kurulum

### 1. Veritabanı Kurulumu

1. MySQL'de yeni bir veritabanı oluşturun:
```sql
CREATE DATABASE corporate_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. `database/schema.sql` dosyasını çalıştırın:
```bash
mysql -u root -p corporate_cms < database/schema.sql
```

### 2. Yapılandırma

`config/database.php` dosyasını düzenleyin:
```php
private const DB_HOST = 'localhost';
private const DB_NAME = 'corporate_cms';
private const DB_USER = 'root';
private const DB_PASS = '';
```

`config/config.php` dosyasında BASE_URL'i düzenleyin:
```php
define('BASE_URL', 'http://localhost/corporate-cms/public');
```

### 3. Klasör İzinleri

Upload klasörüne yazma izni verin:
```bash
chmod 755 public/uploads
```

### 4. Web Sunucusu Yapılandırması

#### Apache (.htaccess kullanarak)

`public/.htaccess` dosyası zaten mevcut. DocumentRoot'u `public` klasörüne ayarlayın:

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

#### Nginx

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

## Varsayılan Admin Bilgileri

- **Kullanıcı Adı:** admin
- **E-posta:** admin@example.com
- **Şifre:** admin123

⚠️ **ÖNEMLİ:** Production ortamında mutlaka şifreyi değiştirin!

## Klasör Yapısı

```
corporate-cms/
├── admin/              # Admin panel dosyaları
│   ├── includes/       # Header, footer
│   ├── dashboard.php
│   ├── pages.php
│   ├── services.php
│   ├── sliders.php
│   ├── settings.php
│   ├── messages.php
│   └── login.php
├── app/
│   ├── Models/         # Veritabanı modelleri
│   ├── Views/          # Frontend görünümleri
│   │   ├── layouts/   # Header, footer
│   │   └── pages/     # Sayfa görünümleri
│   └── helpers/        # Yardımcı fonksiyonlar
├── config/             # Yapılandırma dosyaları
├── database/           # SQL şema dosyaları
├── public/             # Web kök dizini
│   ├── assets/         # CSS, JS, görseller
│   ├── uploads/        # Yüklenen dosyalar
│   └── index.php       # Ana giriş noktası
└── README.md
```

## Template Entegrasyonu

HTML template'inizi entegre etmek için:

1. **CSS Dosyaları:** `public/assets/css/` klasörüne ekleyin
2. **JavaScript Dosyaları:** `public/assets/js/` klasörüne ekleyin
3. **Görseller:** `public/assets/images/` klasörüne ekleyin
4. **Header/Footer:** `app/Views/layouts/header.php` ve `footer.php` dosyalarını template'inize göre düzenleyin
5. **Sayfa Görünümleri:** `app/Views/pages/` klasöründeki dosyaları template yapınıza göre güncelleyin

## Kullanım

### Frontend Sayfaları

- Ana Sayfa: `http://localhost/corporate-cms/public/`
- Hakkımızda: `http://localhost/corporate-cms/public/?page=about`
- Hizmetler: `http://localhost/corporate-cms/public/?page=services`
- İletişim: `http://localhost/corporate-cms/public/?page=contact`

### Admin Panel

- Admin Giriş: `http://localhost/corporate-cms/admin/login.php`
- Dashboard: `http://localhost/corporate-cms/admin/dashboard.php`

## Sayfa İçerik Yönetimi

Her sayfa için dinamik içerik alanları ekleyebilirsiniz:

1. Admin panelden "Sayfalar" > "İçerik" bölümüne gidin
2. İçerik anahtarı belirleyin (örn: `hero_title`, `section_1_content`)
3. İçerik tipini seçin (text, textarea, html, image, url)
4. İçeriği girin ve kaydedin
5. View dosyalarında `$contentData['content_key']` ile kullanın

Örnek:
```php
<?php if (isset($contentData['hero_title'])): ?>
<h1><?= escape($contentData['hero_title']) ?></h1>
<?php endif; ?>
```

## Güvenlik

- ✅ PDO Prepared Statements (SQL Injection koruması)
- ✅ `htmlspecialchars()` ile XSS koruması
- ✅ Dosya yükleme validasyonu (tip, boyut kontrolü)
- ✅ Session tabanlı admin girişi
- ✅ Şifre hash'leme (password_hash)

## Geliştirme

### Yeni Sayfa Ekleme

1. Admin panelden "Sayfalar" > "Yeni Sayfa Ekle"
2. `app/Views/pages/` klasörüne yeni view dosyası ekleyin (örn: `blog.php`)
3. `public/index.php` dosyasında sayfa routing'i otomatik çalışır

### Yeni Model Ekleme

`app/Models/` klasörüne yeni model sınıfı ekleyin:
```php
class NewModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    // Metodlarınız...
}
```

## Sorun Giderme

### Veritabanı Bağlantı Hatası

- `config/database.php` dosyasındaki bilgileri kontrol edin
- MySQL servisinin çalıştığından emin olun
- Veritabanı kullanıcısının gerekli izinlere sahip olduğunu kontrol edin

### Sayfa Bulunamadı Hatası

- `.htaccess` dosyasının doğru yapılandırıldığından emin olun
- Apache'de `mod_rewrite` modülünün aktif olduğunu kontrol edin

### Dosya Yükleme Hatası

- `public/uploads/` klasörünün yazılabilir olduğundan emin olun
- PHP `upload_max_filesize` ve `post_max_size` ayarlarını kontrol edin

## Lisans

Bu proje özel kullanım içindir.

## Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.
