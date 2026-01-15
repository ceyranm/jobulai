<?php
/**
 * Hizmet Yönetimi
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/ServiceModel.php';

require_once 'includes/header.php';

$serviceModel = new ServiceModel();
$pageTitle = 'Hizmet Yönetimi';

// Hizmet silme
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    if ($serviceModel->delete($_GET['delete'])) {
        setFlashMessage('Hizmet başarıyla silindi.', 'success');
    } else {
        setFlashMessage('Hizmet silinirken bir hata oluştu.', 'error');
    }
    header('Location: services.php');
    exit;
}

$services = $serviceModel->getAll(false);
?>

<div class="page-header">
    <h2>Hizmet Yönetimi</h2>
    <a href="service-edit.php" class="btn btn-primary">Yeni Hizmet Ekle</a>
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
            <th>Öne Çıkan</th>
            <th>Durum</th>
            <th>Sıra</th>
            <th>İşlemler</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($services as $service): ?>
        <tr>
            <td><?= escape($service['title']) ?></td>
            <td><?= escape($service['slug']) ?></td>
            <td>
                <?php if ($service['is_featured']): ?>
                <span style="color: #ffc107;">★</span>
                <?php else: ?>
                -
                <?php endif; ?>
            </td>
            <td>
                <?php if ($service['is_active']): ?>
                <span style="color: #28a745;">Aktif</span>
                <?php else: ?>
                <span style="color: #dc3545;">Pasif</span>
                <?php endif; ?>
            </td>
            <td><?= $service['sort_order'] ?></td>
            <td>
                <a href="service-edit.php?id=<?= $service['id'] ?>" class="btn btn-sm btn-primary">Düzenle</a>
                <a href="services.php?delete=<?= $service['id'] ?>" 
                   class="btn btn-sm btn-danger" 
                   onclick="return confirm('Bu hizmeti silmek istediğinize emin misiniz?')">Sil</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php require_once 'includes/footer.php'; ?>
