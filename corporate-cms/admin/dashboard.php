<?php
/**
 * Admin Dashboard
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/PageModel.php';
require_once APP_PATH . '/Models/ServiceModel.php';
require_once APP_PATH . '/Models/SliderModel.php';
require_once APP_PATH . '/Models/ContactModel.php';

require_once 'includes/header.php';

$pageModel = new PageModel();
$serviceModel = new ServiceModel();
$sliderModel = new SliderModel();
$contactModel = new ContactModel();

$totalPages = count($pageModel->getAll(false));
$totalServices = count($serviceModel->getAll(false));
$totalSliders = count($sliderModel->getAll(false));
$unreadMessages = $contactModel->getUnreadCount();
$recentMessages = $contactModel->getAll(null, 5);

$pageTitle = 'Dashboard';
?>

<div class="page-header">
    <h2>Dashboard</h2>
</div>

<?php
$flash = getFlashMessage();
if ($flash):
?>
<div class="alert alert-<?= $flash['type'] === 'success' ? 'success' : 'error' ?>">
    <?= escape($flash['message']) ?>
</div>
<?php endif; ?>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
    <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 0.5rem;">Sayfalar</h3>
        <p style="font-size: 2rem; font-weight: bold; color: #007bff;"><?= $totalPages ?></p>
        <a href="pages.php" class="btn btn-link">Yönet →</a>
    </div>
    
    <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 0.5rem;">Hizmetler</h3>
        <p style="font-size: 2rem; font-weight: bold; color: #28a745;"><?= $totalServices ?></p>
        <a href="services.php" class="btn btn-link">Yönet →</a>
    </div>
    
    <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 0.5rem;">Slider</h3>
        <p style="font-size: 2rem; font-weight: bold; color: #ffc107;"><?= $totalSliders ?></p>
        <a href="sliders.php" class="btn btn-link">Yönet →</a>
    </div>
    
    <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 0.5rem;">Mesajlar</h3>
        <p style="font-size: 2rem; font-weight: bold; color: #dc3545;">
            <?= $unreadMessages ?>
            <?php if ($unreadMessages > 0): ?>
            <span style="font-size: 1rem; color: #dc3545;">(okunmamış)</span>
            <?php endif; ?>
        </p>
        <a href="messages.php" class="btn btn-link">Yönet →</a>
    </div>
</div>

<?php if (!empty($recentMessages)): ?>
<div>
    <h3>Son Mesajlar</h3>
    <table>
        <thead>
            <tr>
                <th>Ad</th>
                <th>E-posta</th>
                <th>Konu</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>İşlemler</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($recentMessages as $message): ?>
            <tr>
                <td><?= escape($message['name']) ?></td>
                <td><?= escape($message['email']) ?></td>
                <td><?= escape($message['subject'] ?: '-') ?></td>
                <td><?= date('d.m.Y H:i', strtotime($message['created_at'])) ?></td>
                <td>
                    <?php if ($message['is_read']): ?>
                    <span style="color: #28a745;">Okundu</span>
                    <?php else: ?>
                    <span style="color: #dc3545; font-weight: bold;">Okunmadı</span>
                    <?php endif; ?>
                </td>
                <td>
                    <a href="messages.php?view=<?= $message['id'] ?>" class="btn btn-sm btn-primary">Görüntüle</a>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
