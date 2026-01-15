<?php
/**
 * Yardımcı Fonksiyonlar
 */

/**
 * XSS koruması - HTML çıktısını temizle
 */
function escape($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * URL'den slug oluştur
 */
function slugify($text) {
    $turkish = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'];
    $english = ['c', 'g', 'i', 'o', 's', 'u', 'C', 'G', 'I', 'O', 'S', 'U'];
    $text = str_replace($turkish, $english, $text);
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9-]/', '-', $text);
    $text = preg_replace('/-+/', '-', $text);
    return trim($text, '-');
}

/**
 * Admin giriş kontrolü
 */
function isAdminLoggedIn() {
    return isset($_SESSION[ADMIN_SESSION_KEY]) && $_SESSION[ADMIN_SESSION_KEY] === true;
}

/**
 * Admin giriş kontrolü ve yönlendirme
 */
function requireAdmin() {
    if (!isAdminLoggedIn()) {
        header('Location: ' . ADMIN_URL . '/login.php');
        exit;
    }
}

/**
 * Dosya yükleme kontrolü
 */
function validateUploadedFile($file, $allowedTypes = null, $maxSize = null) {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['success' => false, 'message' => 'Geçersiz dosya yükleme parametreleri.'];
    }
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'Dosya boyutu php.ini limitini aşıyor.',
            UPLOAD_ERR_FORM_SIZE => 'Dosya boyutu form limitini aşıyor.',
            UPLOAD_ERR_PARTIAL => 'Dosya kısmen yüklendi.',
            UPLOAD_ERR_NO_FILE => 'Dosya yüklenmedi.',
            UPLOAD_ERR_NO_TMP_DIR => 'Geçici klasör bulunamadı.',
            UPLOAD_ERR_CANT_WRITE => 'Dosya yazılamadı.',
            UPLOAD_ERR_EXTENSION => 'Bir PHP uzantısı dosya yüklemeyi durdurdu.',
        ];
        return ['success' => false, 'message' => $errors[$file['error']] ?? 'Bilinmeyen hata.'];
    }
    
    $maxSize = $maxSize ?? MAX_FILE_SIZE;
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'message' => 'Dosya boyutu çok büyük. Maksimum: ' . ($maxSize / 1024 / 1024) . 'MB'];
    }
    
    $allowedTypes = $allowedTypes ?? ALLOWED_IMAGE_TYPES;
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return ['success' => false, 'message' => 'İzin verilmeyen dosya tipi.'];
    }
    
    return ['success' => true, 'mime_type' => $mimeType];
}

/**
 * Güvenli dosya yükleme
 */
function uploadFile($file, $destinationDir, $prefix = '') {
    $validation = validateUploadedFile($file);
    if (!$validation['success']) {
        return $validation;
    }
    
    if (!is_dir($destinationDir)) {
        mkdir($destinationDir, 0755, true);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $prefix . uniqid() . '_' . time() . '.' . $extension;
    $filepath = $destinationDir . '/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => false, 'message' => 'Dosya yüklenemedi.'];
    }
    
    return [
        'success' => true,
        'filename' => $filename,
        'filepath' => $filepath,
        'url' => str_replace(PUBLIC_PATH, '', $filepath)
    ];
}

/**
 * Eski dosyayı sil
 */
function deleteFile($filepath) {
    if (file_exists($filepath)) {
        return unlink($filepath);
    }
    return false;
}

/**
 * JSON yanıt gönder
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Başarı mesajı
 */
function setFlashMessage($message, $type = 'success') {
    $_SESSION['flash_message'] = $message;
    $_SESSION['flash_type'] = $type;
}

/**
 * Flash mesajı al ve temizle
 */
function getFlashMessage() {
    if (isset($_SESSION['flash_message'])) {
        $message = $_SESSION['flash_message'];
        $type = $_SESSION['flash_type'] ?? 'success';
        unset($_SESSION['flash_message']);
        unset($_SESSION['flash_type']);
        return ['message' => $message, 'type' => $type];
    }
    return null;
}

/**
 * Sayfa başlığı ve meta bilgileri al
 */
function getPageMeta($slug) {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT meta_title, meta_description, meta_keywords FROM pages WHERE slug = ? AND is_active = 1");
    $stmt->execute([$slug]);
    return $stmt->fetch() ?: ['meta_title' => '', 'meta_description' => '', 'meta_keywords' => ''];
}
