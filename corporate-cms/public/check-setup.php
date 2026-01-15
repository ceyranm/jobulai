<?php
/**
 * Kurulum Kontrolü
 * Eğer veritabanı yoksa kurulum sayfasına yönlendir
 */

// Config dosyasını yükle
require_once dirname(__DIR__) . '/config/config.php';

// Veritabanı bağlantısını test et
try {
    $db = Database::getInstance()->getConnection();
    $db->query("SELECT 1");
    // Veritabanı mevcut, normal akışa devam et
    header('Location: index.php');
    exit;
} catch (Exception $e) {
    // Veritabanı yok veya bağlantı hatası, kurulum sayfasına yönlendir
    header('Location: ../setup.php');
    exit;
}
