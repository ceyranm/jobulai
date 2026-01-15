<?php
/**
 * Admin Kullanıcısı Oluşturma Scripti
 * Eğer admin kullanıcısı yoksa oluşturur veya şifresini günceller
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/UserModel.php';

$db = Database::getInstance()->getConnection();

$username = 'admin';
$email = 'admin@example.com';
$password = 'admin123';
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$fullName = 'Admin User';

// Admin kullanıcısını kontrol et
$stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$existingUser = $stmt->fetch();

if ($existingUser) {
    // Kullanıcı var, şifresini güncelle
    try {
        $updateStmt = $db->prepare("UPDATE users SET password = ?, email = ?, full_name = ?, is_active = 1 WHERE username = ?");
        $updateStmt->execute([$hashedPassword, $email, $fullName, $username]);
        
        echo "<h1>✅ Admin Kullanıcısı Güncellendi!</h1>";
        echo "<p><strong>Kullanıcı Adı:</strong> admin</p>";
        echo "<p><strong>Şifre:</strong> admin123</p>";
        echo "<p><strong>E-posta:</strong> admin@example.com</p>";
        echo "<br>";
        echo "<a href='login.php' style='padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;'>Giriş Sayfasına Git</a>";
    } catch (PDOException $e) {
        echo "<h1>❌ Hata</h1>";
        echo "<p>Şifre güncellenirken hata oluştu: " . $e->getMessage() . "</p>";
        echo "<a href='login.php'>Giriş Sayfasına Dön</a>";
    }
} else {
    // Kullanıcı yok, oluştur
    try {
        $stmt = $db->prepare("INSERT INTO users (username, email, password, full_name, is_active) VALUES (?, ?, ?, ?, 1)");
        $stmt->execute([$username, $email, $hashedPassword, $fullName]);
        
        echo "<h1>✅ Admin Kullanıcısı Oluşturuldu!</h1>";
        echo "<p><strong>Kullanıcı Adı:</strong> admin</p>";
        echo "<p><strong>Şifre:</strong> admin123</p>";
        echo "<p><strong>E-posta:</strong> admin@example.com</p>";
        echo "<br>";
        echo "<a href='login.php' style='padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;'>Giriş Sayfasına Git</a>";
    } catch (PDOException $e) {
        echo "<h1>❌ Hata</h1>";
        echo "<p>Kullanıcı oluşturulurken hata oluştu: " . $e->getMessage() . "</p>";
        echo "<a href='login.php'>Giriş Sayfasına Dön</a>";
    }
}
?>
