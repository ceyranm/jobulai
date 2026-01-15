# MAMP "Not Found" Hatası Düzeltme

## Sorun
Tarayıcıda `http://localhost:8888/corporate-cms/setup.php` adresine gittiğinizde "Not Found" hatası alıyorsunuz.

## Çözüm 1: Symlink Oluşturma (Önerilen)

Terminal'de şu komutu çalıştırın:

```bash
ln -sf /Users/emir/Desktop/jobulai/corporate-cms /Applications/MAMP/htdocs/corporate-cms
```

Sonra tarayıcıda tekrar deneyin:
```
http://localhost:8888/corporate-cms/setup.php
```

## Çözüm 2: MAMP Document Root Ayarlama

1. MAMP uygulamasını açın
2. **Preferences** (Tercihler) butonuna tıklayın
3. **Web Server** sekmesine gidin
4. **Document Root** bölümünde **Select...** butonuna tıklayın
5. Şu klasörü seçin:
   ```
   /Users/emir/Desktop/jobulai/corporate-cms/public
   ```
6. **OK** butonuna tıklayın
7. MAMP'i yeniden başlatın (Stop Servers, sonra Start Servers)

Sonra tarayıcıda şu adrese gidin:
```
http://localhost:8888/
```

## Çözüm 3: Projeyi htdocs'a Kopyalama

Eğer yukarıdaki çözümler işe yaramazsa:

```bash
cp -r /Users/emir/Desktop/jobulai/corporate-cms /Applications/MAMP/htdocs/
```

Sonra:
```
http://localhost:8888/corporate-cms/setup.php
```

## Hangi Çözümü Kullanmalıyım?

- **Çözüm 1 (Symlink):** En pratik, proje orijinal konumunda kalır
- **Çözüm 2 (Document Root):** En temiz, sadece public klasörüne erişim
- **Çözüm 3 (Kopyalama):** En basit ama proje iki yerde olur

## Test

Kurulum sayfasına erişebildiğinizde:
```
http://localhost:8888/corporate-cms/setup.php
```

Başarılı olduğunu göreceksiniz! 🎉
