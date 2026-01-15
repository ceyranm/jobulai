<?php
/**
 * Sayfa Yönetimi
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/PageModel.php';

require_once 'includes/header.php';

$pageModel = new PageModel();
$pageTitle = 'Sayfa Yönetimi';

// Sayfa silme
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    if ($pageModel->delete($_GET['delete'])) {
        setFlashMessage('Sayfa başarıyla silindi.', 'success');
    } else {
        setFlashMessage('Sayfa silinirken bir hata oluştu.', 'error');
    }
    header('Location: pages.php');
    exit;
}

$pages = $pageModel->getAll(false);
?>

<div class="page-header">
    <h2>Sayfa Yönetimi</h2>
    <a href="page-edit.php" class="btn btn-primary">Yeni Sayfa Ekle</a>
</div>

<?php
$flash = getFlashMessage();
if ($flash):
?>
<div class="alert alert-<?= $flash['type'] === 'success' ? 'success' : 'error' ?>">
    <?= escape($flash['message']) ?>
</div>
<?php endif; ?>

<table>
    <thead>
        <tr>
            <th>Başlık</th>
            <th>Slug</th>
            <th>Durum</th>
            <th>Sıra</th>
            <th>Güncelleme</th>
            <th>İşlemler</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($pages as $page): ?>
        <tr>
            <td><?= escape($page['title']) ?></td>
            <td><?= escape($page['slug']) ?></td>
            <td>
                <?php if ($page['is_active']): ?>
                <span style="color: #28a745;">Aktif</span>
                <?php else: ?>
                <span style="color: #dc3545;">Pasif</span>
                <?php endif; ?>
            </td>
            <td><?= $page['sort_order'] ?></td>
            <td><?= date('d.m.Y H:i', strtotime($page['updated_at'])) ?></td>
            <td>
                <a href="page-edit.php?id=<?= $page['id'] ?>" class="btn btn-sm btn-primary">Düzenle</a>
                <a href="page-content.php?page_id=<?= $page['id'] ?>" class="btn btn-sm btn-secondary">İçerik</a>
                <?php if ($page['slug'] !== 'home'): ?>
                <a href="pages.php?delete=<?= $page['id'] ?>" 
                   class="btn btn-sm btn-danger" 
                   onclick="return confirm('Bu sayfayı silmek istediğinize emin misiniz?')">Sil</a>
                <?php endif; ?>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php require_once 'includes/footer.php'; ?>
