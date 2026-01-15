<?php
echo "<h1>✅ PHP Çalışıyor!</h1>";
echo "<p>Dosya yolu: " . __FILE__ . "</p>";
echo "<p>Mevcut dizin: " . __DIR__ . "</p>";
echo "<p>Setup.php mevcut: " . (file_exists(__DIR__ . '/setup.php') ? '✅ Evet' : '❌ Hayır') . "</p>";
echo "<hr>";
echo "<h2>Test Linkleri:</h2>";
echo "<ul>";
echo "<li><a href='setup.php'>Kurulum Sayfası (setup.php)</a></li>";
echo "<li><a href='test-access.php'>Test Erişim (test-access.php)</a></li>";
echo "<li><a href='public/'>Public Klasörü</a></li>";
echo "<li><a href='admin/login.php'>Admin Login</a></li>";
echo "</ul>";
phpinfo();
?>
