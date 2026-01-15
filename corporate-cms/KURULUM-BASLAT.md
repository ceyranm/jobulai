# 🚀 Hızlı Başlangıç - Otomatik Kurulum

## Tek Tıkla Kurulum

### 1. MAMP'i Başlatın
- MAMP uygulamasını açın
- "Start Servers" butonuna tıklayın
- Apache ve MySQL'in yeşil olduğundan emin olun

### 2. Otomatik Kurulumu Başlatın

Tarayıcınızda şu adrese gidin:

```
http://localhost:8888/corporate-cms/setup.php
```

Bu sayfa otomatik olarak:
- ✅ MySQL bağlantısını test eder
- ✅ Veritabanını oluşturur
- ✅ Tüm tabloları kurar
- ✅ Varsayılan verileri ekler
- ✅ Her adımı canlı olarak gösterir

### 3. Kurulum Tamamlandıktan Sonra

Kurulum başarılı olduğunda:

- **Admin Panel:** http://localhost:8888/corporate-cms/admin/login.php
  - Kullanıcı: `admin`
  - Şifre: `admin123`

- **Frontend:** http://localhost:8888/corporate-cms/public/

### 4. Otomatik Yönlendirme

Eğer veritabanı kurulu değilse, site otomatik olarak kurulum sayfasına yönlendirecektir.

## Sorun Giderme

### MySQL Bağlantı Hatası

Eğer "MySQL bağlantı hatası" alırsanız:

1. MAMP'in çalıştığından emin olun
2. `config/database.php` dosyasında şifreyi kontrol edin:
   ```php
   private const DB_PASS = 'root'; // MAMP varsayılan
   ```
   Eğer MAMP'te farklı bir şifre kullanıyorsanız, burayı güncelleyin.

### Port Sorunları

Eğer 5555 portu çalışmıyorsa:

1. MAMP Preferences > Ports bölümünden Apache portunu kontrol edin
2. `config/config.php` dosyasında BASE_URL'i güncelleyin:
   ```php
   define('BASE_URL', 'http://localhost:XXXX/corporate-cms/public');
   ```

## Sonraki Adımlar

1. ✅ Kurulum tamamlandı
2. 🔄 Admin panelden site ayarlarını yapılandırın
3. 🔄 Template'inizi entegre edin
4. 🔄 İçerik ekleyin

---

**Not:** Kurulum tamamlandıktan sonra `setup.php` dosyasını silebilir veya koruyabilirsiniz. Güvenlik için production ortamında silinmesi önerilir.
