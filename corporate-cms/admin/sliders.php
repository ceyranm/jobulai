<?php
/**
 * Slider Yönetimi
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/SliderModel.php';

require_once 'includes/header.php';

$sliderModel = new SliderModel();
$pageTitle = 'Slider Yönetimi';

// Slider silme
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    if ($sliderModel->delete($_GET['delete'])) {
        setFlashMessage('Slider başarıyla silindi.', 'success');
    } else {
        setFlashMessage('Slider silinirken bir hata oluştu.', 'error');
    }
    header('Location: sliders.php');
    exit;
}

$sliders = $sliderModel->getAll(false);
?>

<div class="page-header">
    <h2>Slider Yönetimi</h2>
    <a href="slider-edit.php" class="btn btn-primary">Yeni Slider Ekle</a>
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
            <th>Görsel</th>
            <th>Durum</th>
            <th>Sıra</th>
            <th>İşlemler</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($sliders as $slider): ?>
        <tr>
            <td><?= escape($slider['title'] ?: '-') ?></td>
            <td>
                <?php if ($slider['image']): ?>
                <img src="<?= escape($slider['image']) ?>" alt="" style="max-width: 100px; height: auto;">
                <?php else: ?>
                -
                <?php endif; ?>
            </td>
            <td>
                <?php if ($slider['is_active']): ?>
                <span style="color: #28a745;">Aktif</span>
                <?php else: ?>
                <span style="color: #dc3545;">Pasif</span>
                <?php endif; ?>
            </td>
            <td><?= $slider['sort_order'] ?></td>
            <td>
                <a href="slider-edit.php?id=<?= $slider['id'] ?>" class="btn btn-sm btn-primary">Düzenle</a>
                <a href="sliders.php?delete=<?= $slider['id'] ?>" 
                   class="btn btn-sm btn-danger" 
                   onclick="return confirm('Bu slider\'ı silmek istediğinize emin misiniz?')">Sil</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php require_once 'includes/footer.php'; ?>
