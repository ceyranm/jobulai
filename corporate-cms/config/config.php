<?php
/**
 * Genel Yapılandırma Dosyası
 */

// Hata raporlama (production'da kapatılmalı)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Zaman dilimi
date_default_timezone_set('Europe/Istanbul');

// Session başlat
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Proje kök dizini
define('ROOT_PATH', dirname(__DIR__));
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('APP_PATH', ROOT_PATH . '/app');
define('ADMIN_PATH', ROOT_PATH . '/admin');
define('UPLOAD_PATH', PUBLIC_PATH . '/uploads');
define('UPLOAD_URL', '/uploads');

// URL yapılandırması
define('BASE_URL', 'http://localhost:8888/corporate-cms/public');
define('ADMIN_URL', 'http://localhost:8888/corporate-cms/admin');

// Güvenlik
define('ADMIN_SESSION_KEY', 'admin_logged_in');
define('ADMIN_USER_ID_KEY', 'admin_user_id');

// Dosya yükleme ayarları
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_IMAGE_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Veritabanı bağlantısını yükle
require_once ROOT_PATH . '/config/database.php';

// Helper fonksiyonları yükle
require_once APP_PATH . '/helpers/functions.php';
