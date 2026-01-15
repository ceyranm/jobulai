<?php
/**
 * Sayfa İçerik Yönetimi
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/PageModel.php';

require_once 'includes/header.php';

$pageModel = new PageModel();
$pageId = $_GET['page_id'] ?? null;

if (!$pageId) {
    setFlashMessage('Sayfa ID belirtilmedi.', 'error');
    header('Location: pages.php');
    exit;
}

$page = $pageModel->getById($pageId);
if (!$page) {
    setFlashMessage('Sayfa bulunamadı.', 'error');
    header('Location: pages.php');
    exit;
}

$pageTitle = 'İçerik Düzenle: ' . $page['title'];
$contents = $pageModel->getContents($pageId);

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentKey = trim($_POST['content_key'] ?? '');
    $contentValue = $_POST['content_value'] ?? '';
    $contentType = $_POST['content_type'] ?? 'text';
    
    if (empty($contentKey)) {
        $error = 'İçerik anahtarı gereklidir.';
    } else {
        if ($pageModel->saveContent($pageId, $contentKey, $contentValue, $contentType)) {
            setFlashMessage('İçerik başarıyla kaydedildi.', 'success');
            header('Location: page-content.php?page_id=' . $pageId);
            exit;
        } else {
            $error = 'İçerik kaydedilirken bir hata oluştu.';
        }
    }
}

// İçerik silme
if (isset($_GET['delete_content'])) {
    // Silme işlemi için ayrı bir endpoint gerekebilir
    // Şimdilik basit bir yaklaşım
}
?>

<h2>İçerik Düzenle: <?= escape($page['title']) ?></h2>

<?php
$flash = getFlashMessage();
if ($flash):
?>
<div class="alert alert-<?= $flash['type'] === 'success' ? 'success' : 'error' ?>">
    <?= escape($flash['message']) ?>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div class="alert alert-error">
    <?= escape($error) ?>
</div>
<?php endif; ?>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
    <div>
        <h3>Yeni İçerik Ekle</h3>
        <form method="POST" action="">
            <div class="form-group">
                <label for="content_key">İçerik Anahtarı *</label>
                <input type="text" id="content_key" name="content_key" required 
                       placeholder="hero_title, hero_subtitle, vb.">
                <small>Örnek: hero_title, section_1_content, about_intro</small>
            </div>
            
            <div class="form-group">
                <label for="content_type">İçerik Tipi</label>
                <select id="content_type" name="content_type">
                    <option value="text">Metin</option>
                    <option value="textarea">Uzun Metin</option>
                    <option value="html">HTML</option>
                    <option value="image">Görsel</option>
                    <option value="url">URL</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="content_value">İçerik</label>
                <textarea id="content_value" name="content_value" rows="5"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary">Kaydet</button>
        </form>
    </div>
    
    <div>
        <h3>Mevcut İçerikler</h3>
        <?php if (!empty($contents)): ?>
        <table>
            <thead>
                <tr>
                    <th>Anahtar</th>
                    <th>Tip</th>
                    <th>Değer</th>
                    <th>İşlem</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($contents as $content): ?>
                <tr>
                    <td><?= escape($content['content_key']) ?></td>
                    <td><?= escape($content['content_type']) ?></td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                        <?= escape(substr($content['content_value'], 0, 50)) ?>...
                    </td>
                    <td>
                        <a href="page-content-edit.php?page_id=<?= $pageId ?>&content_id=<?= $content['id'] ?>" 
                           class="btn btn-sm btn-primary">Düzenle</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php else: ?>
        <p>Henüz içerik eklenmemiş.</p>
        <?php endif; ?>
    </div>
</div>

<a href="pages.php" class="btn btn-secondary" style="margin-top: 2rem;">← Sayfalara Dön</a>

<?php require_once 'includes/footer.php'; ?>
