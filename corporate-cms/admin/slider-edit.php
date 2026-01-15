<?php
/**
 * Slider Düzenleme/Ekleme
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/SliderModel.php';

require_once 'includes/header.php';

$sliderModel = new SliderModel();
$slider = null;
$sliderId = $_GET['id'] ?? null;

if ($sliderId) {
    $slider = $sliderModel->getById($sliderId);
    if (!$slider) {
        setFlashMessage('Slider bulunamadı.', 'error');
        header('Location: sliders.php');
        exit;
    }
    $pageTitle = 'Slider Düzenle';
} else {
    $pageTitle = 'Yeni Slider Ekle';
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $image = trim($_POST['image'] ?? '');
    
    if (empty($image)) {
        $error = 'Görsel URL gereklidir.';
    } else {
        $data = [
            'title' => trim($_POST['title'] ?? ''),
            'subtitle' => trim($_POST['subtitle'] ?? ''),
            'image' => $image,
            'link_url' => trim($_POST['link_url'] ?? ''),
            'link_text' => trim($_POST['link_text'] ?? ''),
            'is_active' => isset($_POST['is_active']) ? 1 : 0,
            'sort_order' => intval($_POST['sort_order'] ?? 0)
        ];
        
        if ($slider) {
            if ($sliderModel->update($sliderId, $data)) {
                setFlashMessage('Slider başarıyla güncellendi.', 'success');
                header('Location: sliders.php');
                exit;
            } else {
                $error = 'Slider güncellenirken bir hata oluştu.';
            }
        } else {
            if ($sliderModel->create($data)) {
                setFlashMessage('Slider başarıyla oluşturuldu.', 'success');
                header('Location: sliders.php');
                exit;
            } else {
                $error = 'Slider oluşturulurken bir hata oluştu.';
            }
        }
    }
}
?>

<h2><?= $slider ? 'Slider Düzenle' : 'Yeni Slider Ekle' ?></h2>

<?php if ($error): ?>
<div class="alert alert-error">
    <?= escape($error) ?>
</div>
<?php endif; ?>

<form method="POST" action="">
    <div class="form-group">
        <label for="title">Başlık</label>
        <input type="text" id="title" name="title" 
               value="<?= escape($slider['title'] ?? '') ?>">
    </div>
    
    <div class="form-group">
        <label for="subtitle">Alt Başlık</label>
        <textarea id="subtitle" name="subtitle" rows="2"><?= escape($slider['subtitle'] ?? '') ?></textarea>
    </div>
    
    <div class="form-group">
        <label for="image">Görsel URL *</label>
        <input type="text" id="image" name="image" required 
               value="<?= escape($slider['image'] ?? '') ?>" 
               placeholder="/uploads/sliders/image.jpg">
        <small>Görsel yükleme özelliği eklenecek</small>
    </div>
    
    <div class="form-group">
        <label for="link_url">Link URL</label>
        <input type="url" id="link_url" name="link_url" 
               value="<?= escape($slider['link_url'] ?? '') ?>" 
               placeholder="https://example.com">
    </div>
    
    <div class="form-group">
        <label for="link_text">Link Metni</label>
        <input type="text" id="link_text" name="link_text" 
               value="<?= escape($slider['link_text'] ?? '') ?>" 
               placeholder="Daha Fazla Bilgi">
    </div>
    
    <div class="form-group">
        <label for="sort_order">Sıra</label>
        <input type="number" id="sort_order" name="sort_order" 
               value="<?= $slider['sort_order'] ?? 0 ?>">
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="is_active" value="1" 
                   <?= ($slider['is_active'] ?? 1) ? 'checked' : '' ?>>
            Aktif
        </label>
    </div>
    
    <button type="submit" class="btn btn-primary">Kaydet</button>
    <a href="sliders.php" class="btn btn-secondary">İptal</a>
</form>

<?php require_once 'includes/footer.php'; ?>
