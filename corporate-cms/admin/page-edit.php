<?php
/**
 * Sayfa Düzenleme/Ekleme
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/PageModel.php';

require_once 'includes/header.php';

$pageModel = new PageModel();
$page = null;
$pageId = $_GET['id'] ?? null;

if ($pageId) {
    $page = $pageModel->getById($pageId);
    if (!$page) {
        setFlashMessage('Sayfa bulunamadı.', 'error');
        header('Location: pages.php');
        exit;
    }
    $pageTitle = 'Sayfa Düzenle: ' . $page['title'];
} else {
    $pageTitle = 'Yeni Sayfa Ekle';
}

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $slug = trim($_POST['slug'] ?? '');
    $title = trim($_POST['title'] ?? '');
    
    if (empty($slug) || empty($title)) {
        $error = 'Slug ve başlık gereklidir.';
    } else {
        $slug = slugify($slug);
        
        // Slug benzersizlik kontrolü
        $existingPage = $pageModel->getBySlug($slug);
        if ($existingPage && (!$page || $existingPage['id'] != $pageId)) {
            $error = 'Bu slug zaten kullanılıyor.';
        } else {
            $data = [
                'slug' => $slug,
                'title' => $title,
                'meta_title' => trim($_POST['meta_title'] ?? ''),
                'meta_description' => trim($_POST['meta_description'] ?? ''),
                'meta_keywords' => trim($_POST['meta_keywords'] ?? ''),
                'is_active' => isset($_POST['is_active']) ? 1 : 0,
                'sort_order' => intval($_POST['sort_order'] ?? 0)
            ];
            
            if ($page) {
                if ($pageModel->update($pageId, $data)) {
                    setFlashMessage('Sayfa başarıyla güncellendi.', 'success');
                    header('Location: pages.php');
                    exit;
                } else {
                    $error = 'Sayfa güncellenirken bir hata oluştu.';
                }
            } else {
                if ($pageModel->create($data)) {
                    setFlashMessage('Sayfa başarıyla oluşturuldu.', 'success');
                    header('Location: pages.php');
                    exit;
                } else {
                    $error = 'Sayfa oluşturulurken bir hata oluştu.';
                }
            }
        }
    }
}
?>

<h2><?= $page ? 'Sayfa Düzenle' : 'Yeni Sayfa Ekle' ?></h2>

<?php if ($error): ?>
<div class="alert alert-error">
    <?= escape($error) ?>
</div>
<?php endif; ?>

<form method="POST" action="">
    <div class="form-group">
        <label for="slug">Slug *</label>
        <input type="text" id="slug" name="slug" required 
               value="<?= escape($page['slug'] ?? '') ?>" 
               placeholder="ornek-sayfa">
        <small>URL'de görünecek kısım (örn: ornek-sayfa)</small>
    </div>
    
    <div class="form-group">
        <label for="title">Başlık *</label>
        <input type="text" id="title" name="title" required 
               value="<?= escape($page['title'] ?? '') ?>">
    </div>
    
    <div class="form-group">
        <label for="meta_title">Meta Başlık</label>
        <input type="text" id="meta_title" name="meta_title" 
               value="<?= escape($page['meta_title'] ?? '') ?>">
    </div>
    
    <div class="form-group">
        <label for="meta_description">Meta Açıklama</label>
        <textarea id="meta_description" name="meta_description" rows="3"><?= escape($page['meta_description'] ?? '') ?></textarea>
    </div>
    
    <div class="form-group">
        <label for="meta_keywords">Meta Anahtar Kelimeler</label>
        <input type="text" id="meta_keywords" name="meta_keywords" 
               value="<?= escape($page['meta_keywords'] ?? '') ?>">
    </div>
    
    <div class="form-group">
        <label for="sort_order">Sıra</label>
        <input type="number" id="sort_order" name="sort_order" 
               value="<?= $page['sort_order'] ?? 0 ?>">
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" name="is_active" value="1" 
                   <?= ($page['is_active'] ?? 1) ? 'checked' : '' ?>>
            Aktif
        </label>
    </div>
    
    <button type="submit" class="btn btn-primary">Kaydet</button>
    <a href="pages.php" class="btn btn-secondary">İptal</a>
</form>

<?php require_once 'includes/footer.php'; ?>
