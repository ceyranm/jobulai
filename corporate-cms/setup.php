<?php
/**
 * Otomatik Kurulum Scripti - TAMAMEN YENİDEN YAZILDI
 * Bu dosya veritabanını oluşturur ve tüm tabloları kurar
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Veritabanı ayarları
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = 'root'; // MAMP varsayılan
$dbName = 'corporate_cms';

$steps = [];
$errors = [];

// Adım 1: Veritabanı bağlantısını test et
$steps[] = ['status' => 'info', 'message' => 'MySQL bağlantısı test ediliyor...'];
try {
    $pdo = new PDO("mysql:host=$dbHost;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $steps[] = ['status' => 'success', 'message' => '✅ MySQL bağlantısı başarılı'];
} catch (PDOException $e) {
    $error = "❌ MySQL bağlantı hatası: " . $e->getMessage();
    $steps[] = ['status' => 'error', 'message' => $error];
    $errors[] = $error;
}

// Adım 2: Veritabanını oluştur
if (empty($errors)) {
    $steps[] = ['status' => 'info', 'message' => "Veritabanı '$dbName' oluşturuluyor..."];
    try {
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $steps[] = ['status' => 'success', 'message' => "✅ Veritabanı '$dbName' oluşturuldu"];
    } catch (PDOException $e) {
        $error = "❌ Veritabanı oluşturma hatası: " . $e->getMessage();
        $steps[] = ['status' => 'error', 'message' => $error];
        $errors[] = $error;
    }
}

// Adım 3: Veritabanını seç
if (empty($errors)) {
    try {
        $pdo->exec("USE `$dbName`");
        $steps[] = ['status' => 'success', 'message' => "✅ Veritabanı seçildi"];
    } catch (PDOException $e) {
        $error = "❌ Veritabanı seçme hatası: " . $e->getMessage();
        $steps[] = ['status' => 'error', 'message' => $error];
        $errors[] = $error;
    }
}

// Adım 4: SQL şemasını yükle - TAMAMEN YENİ PARSER
if (empty($errors)) {
    $sqlFile = __DIR__ . '/database/schema.sql';
    $steps[] = ['status' => 'info', 'message' => 'SQL şema dosyası okunuyor...'];
    
    if (!file_exists($sqlFile)) {
        $error = "❌ SQL dosyası bulunamadı: $sqlFile";
        $steps[] = ['status' => 'error', 'message' => $error];
        $errors[] = $error;
    } else {
        $sql = file_get_contents($sqlFile);
        
        // Yorum satırlarını temizle
        $lines = explode("\n", $sql);
        $cleanedLines = [];
        foreach ($lines as $line) {
            $line = trim($line);
            // Boş satırları ve yorum satırlarını atla
            if (empty($line) || preg_match('/^--/', $line)) {
                continue;
            }
            $cleanedLines[] = $line;
        }
        $sql = implode("\n", $cleanedLines);
        
        // SQL komutlarını satır satır parse et
        $statements = [];
        $currentStatement = '';
        $inCreateTable = false;
        $inInsert = false;
        
        $lines = explode("\n", $sql);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // CREATE TABLE başladı mı?
            if (preg_match('/^CREATE TABLE/i', $line)) {
                if (!empty($currentStatement)) {
                    $statements[] = trim($currentStatement);
                }
                $currentStatement = $line;
                $inCreateTable = true;
                $inInsert = false;
                continue;
            }
            
            // INSERT başladı mı?
            if (preg_match('/^INSERT INTO/i', $line)) {
                if (!empty($currentStatement)) {
                    $statements[] = trim($currentStatement);
                }
                $currentStatement = $line;
                $inCreateTable = false;
                $inInsert = true;
                continue;
            }
            
            // Mevcut statement'a ekle
            if (!empty($currentStatement)) {
                $currentStatement .= "\n" . $line;
            }
            
            // CREATE TABLE için ENGINE ile bitiyor mu kontrol et
            if ($inCreateTable && preg_match('/ENGINE.*?;/i', $line)) {
                $statements[] = trim($currentStatement);
                $currentStatement = '';
                $inCreateTable = false;
                continue;
            }
            
            // INSERT için noktalı virgül ile bitiyor mu kontrol et
            if ($inInsert && preg_match('/;[\s]*$/', $line)) {
                $statements[] = trim($currentStatement);
                $currentStatement = '';
                $inInsert = false;
                continue;
            }
        }
        
        // Son kalan statement'ı ekle
        if (!empty(trim($currentStatement))) {
            $statements[] = trim($currentStatement);
        }
        
        // Boş statement'ları temizle
        $statements = array_filter($statements, function($stmt) {
            $stmt = trim($stmt);
            return !empty($stmt) && 
                   !preg_match('/^CREATE DATABASE/i', $stmt) &&
                   !preg_match('/^USE/i', $stmt);
        });
        
        $statements = array_values($statements); // Index'leri düzelt
        
        $steps[] = ['status' => 'info', 'message' => count($statements) . ' SQL komutu bulundu, çalıştırılıyor...'];
        
        $successCount = 0;
        $skipCount = 0;
        $errorDetails = [];
        
        foreach ($statements as $index => $statement) {
            $statement = trim($statement);
            if (empty($statement)) continue;
            
            // Statement'ı temizle (fazladan boşluklar, newline'lar)
            $statement = preg_replace('/\s+/', ' ', $statement);
            $statement = trim($statement);
            
            try {
                $pdo->exec($statement);
                $successCount++;
            } catch (PDOException $e) {
                // Bazı hatalar normal (örn: tablo zaten varsa)
                if (strpos($e->getMessage(), 'already exists') !== false || 
                    strpos($e->getMessage(), 'Duplicate') !== false ||
                    strpos($e->getMessage(), '1062') !== false) {
                    $skipCount++;
                } else {
                    $errorMsg = $e->getMessage();
                    $errorDetails[] = [
                        'index' => $index + 1,
                        'message' => substr($errorMsg, 0, 200),
                        'statement_preview' => substr($statement, 0, 150)
                    ];
                    $errors[] = "SQL Hatası (komut " . ($index + 1) . "): " . substr($errorMsg, 0, 150);
                    $steps[] = ['status' => 'warning', 'message' => "⚠️ Komut " . ($index + 1) . " hatası: " . substr($errorMsg, 0, 100)];
                }
            }
        }
        
        if (!empty($errorDetails)) {
            $steps[] = ['status' => 'info', 'message' => 'Hata detayları kaydedildi'];
        }
        
        $steps[] = ['status' => 'success', 'message' => "✅ $successCount komut başarıyla çalıştırıldı" . ($skipCount > 0 ? " ($skipCount atlandı - zaten mevcut)" : "")];
    }
}

// Adım 5: Tabloları kontrol et
if (empty($errors)) {
    $steps[] = ['status' => 'info', 'message' => 'Oluşturulan tablolar kontrol ediliyor...'];
    try {
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $steps[] = ['status' => 'success', 'message' => '✅ ' . count($tables) . ' tablo bulundu: ' . implode(', ', $tables)];
    } catch (PDOException $e) {
        $steps[] = ['status' => 'warning', 'message' => '⚠️ Tablo kontrolü yapılamadı: ' . $e->getMessage()];
    }
}

// Adım 6: Admin kullanıcısını kontrol et
if (empty($errors)) {
    $steps[] = ['status' => 'info', 'message' => 'Admin kullanıcısı kontrol ediliyor...'];
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE username = 'admin'");
        $count = $stmt->fetchColumn();
        if ($count > 0) {
            $steps[] = ['status' => 'success', 'message' => '✅ Admin kullanıcısı mevcut'];
        } else {
            $steps[] = ['status' => 'warning', 'message' => '⚠️ Admin kullanıcısı bulunamadı'];
        }
    } catch (PDOException $e) {
        $steps[] = ['status' => 'warning', 'message' => '⚠️ Kullanıcı kontrolü yapılamadı'];
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Otomatik Kurulum - Corporate CMS</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .step {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #ddd;
            background: #f8f9fa;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .step.success {
            background: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        .step.error {
            background: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        .step.warning {
            background: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .step.info {
            background: #d1ecf1;
            border-left-color: #17a2b8;
            color: #0c5460;
        }
        .step-message {
            font-weight: 500;
            line-height: 1.6;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            border-radius: 8px;
            background: #f8f9fa;
        }
        .summary h3 {
            margin-bottom: 15px;
            color: #333;
        }
        .btn-group {
            margin-top: 30px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .btn-success {
            background: #28a745;
        }
        .btn-success:hover {
            background: #218838;
        }
        .error-details {
            margin-top: 15px;
            padding: 15px;
            background: #fff;
            border-radius: 6px;
            border: 1px solid #dc3545;
            max-height: 400px;
            overflow-y: auto;
        }
        .error-details pre {
            font-size: 0.85rem;
            overflow-x: auto;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Corporate CMS - Otomatik Kurulum</h1>
            <p>Veritabanı kurulumu ve yapılandırma</p>
        </div>
        
        <div class="content">
            <h2 style="margin-bottom: 20px; color: #333;">Kurulum Adımları</h2>
            
            <?php foreach ($steps as $step): ?>
            <div class="step <?= $step['status'] ?>">
                <div class="step-message"><?= htmlspecialchars($step['message']) ?></div>
            </div>
            <?php endforeach; ?>
            
            <div class="summary">
                <h3>📊 Kurulum Özeti</h3>
                <?php if (empty($errors)): ?>
                    <p style="color: #28a745; font-size: 1.1rem; font-weight: 600;">
                        ✅ Kurulum başarıyla tamamlandı!
                    </p>
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px;">
                        <p><strong>Varsayılan Admin Bilgileri:</strong></p>
                        <ul style="margin-top: 10px; margin-left: 20px;">
                            <li><strong>Kullanıcı Adı:</strong> admin</li>
                            <li><strong>Şifre:</strong> admin123</li>
                        </ul>
                        <p style="margin-top: 15px; color: #dc3545; font-size: 0.9rem;">
                            ⚠️ <strong>Güvenlik:</strong> İlk girişten sonra mutlaka şifreyi değiştirin!
                        </p>
                    </div>
                <?php else: ?>
                    <p style="color: #dc3545; font-size: 1.1rem; font-weight: 600;">
                        ❌ Kurulum sırasında hatalar oluştu
                    </p>
                    <div style="margin-top: 15px;">
                        <strong>Hatalar:</strong>
                        <ul style="margin-top: 10px; margin-left: 20px; color: #721c24;">
                            <?php foreach ($errors as $error): ?>
                            <li><?= htmlspecialchars($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <?php if (!empty($errorDetails)): ?>
                    <div class="error-details">
                        <strong>Hata Detayları:</strong>
                        <pre><?= htmlspecialchars(json_encode($errorDetails, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre>
                    </div>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
            
            <?php if (empty($errors)): ?>
            <div class="btn-group">
                <a href="admin/login.php" class="btn btn-success">🔐 Admin Panele Git</a>
                <a href="public/index.php" class="btn">🌐 Siteye Git</a>
                <a href="setup.php" class="btn" style="background: #6c757d;">🔄 Tekrar Çalıştır</a>
            </div>
            <?php else: ?>
            <div class="btn-group">
                <a href="setup.php" class="btn">🔄 Tekrar Dene</a>
                <a href="MAMP-KURULUM.md" class="btn" style="background: #17a2b8;">📖 Manuel Kurulum Kılavuzu</a>
            </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
