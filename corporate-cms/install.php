<?php
/**
 * Kurulum Scripti
 * Bu dosyayı tarayıcıdan çalıştırarak veritabanını otomatik oluşturabilirsiniz
 * http://localhost:8888/corporate-cms/install.php
 */

// Güvenlik: Production'da bu dosyayı silin veya koruyun
$installKey = $_GET['key'] ?? '';
$expectedKey = 'install2024'; // Güvenlik için değiştirin

if ($installKey !== $expectedKey) {
    die('Geçersiz kurulum anahtarı. URL: ?key=install2024');
}

// Veritabanı ayarları
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = 'root'; // MAMP varsayılan şifresi
$dbName = 'corporate_cms';

$errors = [];
$success = [];

try {
    // Veritabanı bağlantısı (veritabanı olmadan)
    $pdo = new PDO("mysql:host=$dbHost;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Veritabanını oluştur
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $success[] = "Veritabanı '$dbName' oluşturuldu.";
    
    // Veritabanını seç
    $pdo->exec("USE `$dbName`");
    
    // SQL dosyasını oku ve çalıştır
    $sqlFile = __DIR__ . '/database/schema.sql';
    if (!file_exists($sqlFile)) {
        $errors[] = "SQL dosyası bulunamadı: $sqlFile";
    } else {
        $sql = file_get_contents($sqlFile);
        
        // SQL dosyasını satırlara böl ve çalıştır
        // CREATE DATABASE ve USE komutlarını atla
        $sql = preg_replace('/CREATE DATABASE.*?;/i', '', $sql);
        $sql = preg_replace('/USE.*?;/i', '', $sql);
        
        // Her komutu ayrı ayrı çalıştır
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function($stmt) {
                return !empty($stmt) && !preg_match('/^--/', $stmt);
            }
        );
        
        foreach ($statements as $statement) {
            if (!empty(trim($statement))) {
                try {
                    $pdo->exec($statement);
                } catch (PDOException $e) {
                    // Bazı hatalar normal olabilir (örn: tablo zaten varsa)
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        $errors[] = "SQL Hatası: " . $e->getMessage();
                    }
                }
            }
        }
        
        $success[] = "Veritabanı şeması yüklendi.";
    }
    
} catch (PDOException $e) {
    $errors[] = "Veritabanı hatası: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kurulum - Corporate CMS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 15px;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 15px;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Corporate CMS - Kurulum</h1>
        
        <?php if (!empty($success)): ?>
            <?php foreach ($success as $msg): ?>
            <div class="success">✅ <?= htmlspecialchars($msg) ?></div>
            <?php endforeach; ?>
        <?php endif; ?>
        
        <?php if (!empty($errors)): ?>
            <?php foreach ($errors as $error): ?>
            <div class="error">❌ <?= htmlspecialchars($error) ?></div>
            <?php endforeach; ?>
        <?php endif; ?>
        
        <?php if (empty($errors) && !empty($success)): ?>
            <div class="info">
                <h3>🎉 Kurulum Tamamlandı!</h3>
                <p><strong>Varsayılan Admin Bilgileri:</strong></p>
                <ul>
                    <li>Kullanıcı Adı: <strong>admin</strong></li>
                    <li>Şifre: <strong>admin123</strong></li>
                </ul>
                <p style="margin-top: 15px;">
                    <a href="../admin/login.php" class="btn">Admin Panele Git →</a>
                    <a href="public/index.php" class="btn" style="background: #28a745;">Siteye Git →</a>
                </p>
                <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    ⚠️ <strong>Güvenlik:</strong> Bu kurulum dosyasını (install.php) production ortamında silin!
                </p>
            </div>
        <?php else: ?>
            <div class="info">
                <p>Kurulum başlatılıyor...</p>
                <p>Eğer hata alıyorsanız:</p>
                <ul>
                    <li>MAMP'in çalıştığından emin olun</li>
                    <li>MySQL şifresinin 'root' olduğunu kontrol edin</li>
                    <li>Manuel olarak veritabanını oluşturup <code>database/schema.sql</code> dosyasını çalıştırabilirsiniz</li>
                </ul>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
