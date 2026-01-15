<?php
/**
 * İletişim Mesajları
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/ContactModel.php';

require_once 'includes/header.php';

$contactModel = new ContactModel();
$pageTitle = 'İletişim Mesajları';

// Mesaj görüntüleme
$viewId = $_GET['view'] ?? null;
$viewMessage = null;
if ($viewId) {
    $viewMessage = $contactModel->getById($viewId);
    if ($viewMessage && !$viewMessage['is_read']) {
        $contactModel->markAsRead($viewId);
    }
}

// Mesaj silme
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    if ($contactModel->delete($_GET['delete'])) {
        setFlashMessage('Mesaj başarıyla silindi.', 'success');
    } else {
        setFlashMessage('Mesaj silinirken bir hata oluştu.', 'error');
    }
    header('Location: messages.php');
    exit;
}

$messages = $contactModel->getAll();
?>

<?php if ($viewMessage): ?>
    <!-- Mesaj Detay Görünümü -->
    <div class="page-header">
        <h2>Mesaj Detayı</h2>
        <a href="messages.php" class="btn btn-secondary">← Mesajlara Dön</a>
    </div>
    
    <div style="background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 1rem;">
            <strong>Gönderen:</strong> <?= escape($viewMessage['name']) ?>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>E-posta:</strong> <a href="mailto:<?= escape($viewMessage['email']) ?>"><?= escape($viewMessage['email']) ?></a>
        </div>
        <?php if ($viewMessage['phone']): ?>
        <div style="margin-bottom: 1rem;">
            <strong>Telefon:</strong> <a href="tel:<?= escape($viewMessage['phone']) ?>"><?= escape($viewMessage['phone']) ?></a>
        </div>
        <?php endif; ?>
        <?php if ($viewMessage['subject']): ?>
        <div style="margin-bottom: 1rem;">
            <strong>Konu:</strong> <?= escape($viewMessage['subject']) ?>
        </div>
        <?php endif; ?>
        <div style="margin-bottom: 1rem;">
            <strong>Tarih:</strong> <?= date('d.m.Y H:i', strtotime($viewMessage['created_at'])) ?>
        </div>
        <div style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 4px;">
            <strong>Mesaj:</strong><br>
            <?= nl2br(escape($viewMessage['message'])) ?>
        </div>
        <div>
            <a href="mailto:<?= escape($viewMessage['email']) ?>?subject=Re: <?= escape($viewMessage['subject'] ?: 'Mesajınız') ?>" 
               class="btn btn-primary">Yanıtla</a>
            <a href="messages.php?delete=<?= $viewMessage['id'] ?>" 
               class="btn btn-danger" 
               onclick="return confirm('Bu mesajı silmek istediğinize emin misiniz?')">Sil</a>
        </div>
    </div>
<?php else: ?>
    <!-- Mesaj Listesi -->
    <div class="page-header">
        <h2>İletişim Mesajları</h2>
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
                <th>Ad</th>
                <th>E-posta</th>
                <th>Konu</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>İşlemler</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($messages)): ?>
                <?php foreach ($messages as $message): ?>
                <tr style="<?= !$message['is_read'] ? 'background: #fff3cd;' : '' ?>">
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
                        <a href="messages.php?delete=<?= $message['id'] ?>" 
                           class="btn btn-sm btn-danger" 
                           onclick="return confirm('Bu mesajı silmek istediğinize emin misiniz?')">Sil</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            <?php else: ?>
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    Henüz mesaj bulunmuyor.
                </td>
            </tr>
            <?php endif; ?>
        </tbody>
    </table>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
