<?php
/**
 * Ana Giriş Noktası
 * Frontend sayfaları buradan yönetilir
 */

// Config dosyasını yükle
require_once dirname(__DIR__) . '/config/config.php';

// Veritabanı kontrolü - eğer yoksa kurulum sayfasına yönlendir
try {
    $db = Database::getInstance()->getConnection();
    $db->query("SELECT 1");
} catch (Exception $e) {
    // Veritabanı yok, kurulum sayfasına yönlendir
    header('Location: ../setup.php');
    exit;
}

// Model sınıflarını yükle
require_once APP_PATH . '/Models/PageModel.php';
require_once APP_PATH . '/Models/ServiceModel.php';
require_once APP_PATH . '/Models/SliderModel.php';
require_once APP_PATH . '/Models/SettingModel.php';
require_once APP_PATH . '/Models/ContactModel.php';

// Sayfa belirleme
$pageSlug = $_GET['page'] ?? 'home';

// Geçerli sayfa kontrolü
$pageModel = new PageModel();
$page = $pageModel->getBySlug($pageSlug);

if (!$page && $pageSlug !== 'home') {
    // Sayfa bulunamadı, 404
    http_response_code(404);
    $pageSlug = '404';
}

// Sayfa view dosyasını belirle
$viewFile = APP_PATH . '/Views/pages/' . $pageSlug . '.php';

// Eğer view dosyası yoksa home göster
if (!file_exists($viewFile)) {
    $viewFile = APP_PATH . '/Views/pages/home.php';
    $pageSlug = 'home';
}

// Header'ı include et
$currentPage = $pageSlug;
require_once APP_PATH . '/Views/layouts/header.php';

// Sayfa içeriğini include et
if (file_exists($viewFile)) {
    require_once $viewFile;
} else {
    echo '<div class="container"><h1>Sayfa bulunamadı</h1></div>';
}

// Footer'ı include et
require_once APP_PATH . '/Views/layouts/footer.php';
