<?php
/**
 * Site Ayarları
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/SettingModel.php';

require_once 'includes/header.php';

$settingModel = new SettingModel();
$pageTitle = 'Site Ayarları';

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $settings = $_POST['settings'] ?? [];
    
    foreach ($settings as $key => $value) {
        $settingModel->set($key, $value);
    }
    
    setFlashMessage('Ayarlar başarıyla güncellendi.', 'success');
    header('Location: settings.php');
    exit;
}

$allSettings = $settingModel->getAll();
$settingsByGroup = [];

foreach ($allSettings as $setting) {
    $group = $setting['group_name'] ?? 'general';
    if (!isset($settingsByGroup[$group])) {
        $settingsByGroup[$group] = [];
    }
    $settingsByGroup[$group][] = $setting;
}
?>

<h2>Site Ayarları</h2>

<?php
$flash = getFlashMessage();
if ($flash):
?>
<div class="alert alert-<?= $flash['type'] === 'success' ? 'success' : 'error' ?>">
    <?= escape($flash['message']) ?>
</div>
<?php endif; ?>

<form method="POST" action="">
    <?php foreach ($settingsByGroup as $groupName => $settings): ?>
    <div style="margin-bottom: 3rem;">
        <h3 style="margin-bottom: 1rem; text-transform: uppercase; color: #666;">
            <?= escape(ucfirst($groupName)) ?>
        </h3>
        
        <?php foreach ($settings as $setting): ?>
        <div class="form-group">
            <label for="setting_<?= escape($setting['setting_key']) ?>">
                <?= escape($setting['description'] ?: $setting['setting_key']) ?>
            </label>
            
            <?php if ($setting['setting_type'] === 'textarea'): ?>
            <textarea id="setting_<?= escape($setting['setting_key']) ?>" 
                      name="settings[<?= escape($setting['setting_key']) ?>]" 
                      rows="4"><?= escape($setting['setting_value'] ?? '') ?></textarea>
            <?php else: ?>
            <input type="<?= escape($setting['setting_type'] === 'email' ? 'email' : ($setting['setting_type'] === 'url' ? 'url' : 'text')) ?>" 
                   id="setting_<?= escape($setting['setting_key']) ?>" 
                   name="settings[<?= escape($setting['setting_key']) ?>]" 
                   value="<?= escape($setting['setting_value'] ?? '') ?>">
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endforeach; ?>
    
    <button type="submit" class="btn btn-primary">Ayarları Kaydet</button>
</form>

<?php require_once 'includes/footer.php'; ?>
