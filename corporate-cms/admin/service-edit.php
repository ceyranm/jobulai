<?php
/**
 * Hizmet Düzenleme/Ekleme
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/ServiceModel.php';

require_once 'includes/header.php';

$serviceModel = new ServiceModel();
$service = null;
$serviceId = $_GET['id'] ?? null;

if ($serviceId) {
    $service = $serviceModel->getById($serviceId);
    if (!$service) {
        setFlashMessage('Hizmet bulunamadı.', 'error');
        header('Location: services.php');
        exit;
    }
    $pageTitle = 'Hizmet Düzenle: ' . $service['title'];
} else {
    $pageTitle = 'Yeni Hizmet Ekle';
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    
    if (empty($title) || empty($slug)) {
        $error = 'Başlık ve slug gereklidir.';
    } else {
        $slug = slugify($slug);
        
        // Slug benzersizlik kontrolü
        $existingService = $serviceModel->getBySlug($slug);
        if ($existingService && (!$service || $existingService['id'] != $serviceId)) {
            $error = 'Bu slug zaten kullanılıyor.';
        } else {
            $data = [
                'title' => $title,
                'slug' => $slug,
                'short_description' => trim($_POST['short_description'] ?? ''),
                'full_description' => trim($_POST['full_description'] ?? ''),
                'icon' => trim($_POST['icon'] ?? ''),
                'image' => trim($_POST['image'] ?? ''),
                'is_featured' => isset($_POST['is_featured']) ? 1 : 0,
                'is_active' => isset($_POST['is_active']) ? 1 : 0,
                'sort_order' => intval($_POST['sort_order'] ?? 0),
                'meta_title' => trim($_POST['meta_title'] ?? ''),
                'meta_description' => trim($_POST['meta_description'] ?? '')
            ];
            
            if ($service) {
                if ($serviceModel->update($serviceId, $data)) {
                    setFlashMessage('Hizmet başarıyla güncellendi.', 'success');
                    header('Location: services.php');
                    exit;
                } else {
                    $error = 'Hizmet güncellenirken bir hata oluştu.';
                }
            } else {
                if ($serviceModel->create($data)) {
                    setFlashMessage('Hizmet başarıyla oluşturuldu.', 'success');
                    header('Location: services.php');
                    exit;
                } else {
                    $error = 'Hizmet oluşturulurken bir hata oluştu.';
                }
            }
        }
    }
}
?>

<h2><?= $service ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle' ?></h2>

<?php if ($error): ?>
<div class="alert alert-error">
    <?= escape($error) ?>
</div>
<?php endif; ?>

<form method="POST" action="">
    <div class="form-group">
        <label for="title">Başlık *</label>
        <input type="text" id="title" name="title" required 
               value="<?= escape($service['title'] ?? '') ?>">
    </div>
    
    <div class="form-group">
        <label for="slug">Slug *</label>
        <input type="text" id="slug" name="slug" required 
               value="<?= escape($service['slug'] ?? '') ?>" 
               placeholder="ornek-hizmet">
    </div>
    
    <div class="form-group">
        <label for="short_description">Kısa Açıklama</label>
        <textarea id="short_description" name="short_description" rows="3"><?= escape($service['short_description'] ?? '') ?></textarea>
    </div>
    
    <div class="form-group">
        <label for="full_description">Detaylı Açıklama</label>
        <textarea id="full_description" name="full_description" rows="8"><?= escape($service['full_description'] ?? '') ?></textarea>
    </div>
    
    <div class="form-group">
        <label for="icon">İkon (CSS class veya emoji)</label>
        <input type="text" id="icon" name="icon" 
               value="<?= escape($service['icon'] ?? '') ?>" 
               placeholder="fa fa-icon veya 📱">
    </div>
    
    <div class="form-group">
        <label for="image">Görsel URL</label>
        <input type="text" id="image" name="image" 
               value="<?= escape($service['image'] ?? '') ?>" 
               placeholder="/uploads/services/image.jpg">
        <small>Görsel yükleme özelliği eklenecek</small>
    </div>
    
    <div class="form-group">
        <label for="meta_title">Meta Başlık</label>
        <input type="text" id="meta_title" name="meta_title" 
               value="<?= escape($service['meta_title'] ?? '') ?>">
    </div>
    
    <div class="form-group">
        <label for="meta_description">Meta Açıklama</label>
        <textarea id="meta_description" name="meta_description" rows="3"><?= escape($service['meta_description'] ?? '') ?></textarea>
    </div>
    
    <div class="form-group">
        <label for="sort_order">Sıra</label>
        <input type="number" id="sort_order" name="sort_order" 
               value="<?= $service['sort_order'] ?? 0 ?>">
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="is_featured" value="1" 
                   <?= ($service['is_featured'] ?? 0) ? 'checked' : '' ?>>
            Öne Çıkan
        </label>
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="is_active" value="1" 
                   <?= ($service['is_active'] ?? 1) ? 'checked' : '' ?>>
            Aktif
        </label>
    </div>
    
    <button type="submit" class="btn btn-primary">Kaydet</button>
    <a href="services.php" class="btn btn-secondary">İptal</a>
</form>

<?php require_once 'includes/footer.php'; ?>
