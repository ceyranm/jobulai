<?php
/**
 * İletişim Sayfası
 */

$pageModel = new PageModel();
$page = $pageModel->getBySlug('contact');
$contents = $page ? $pageModel->getContents($page['id']) : [];

$contentData = [];
foreach ($contents as $content) {
    $contentData[$content['content_key']] = $content['content_value'];
}

$settingModel = new SettingModel();
$siteEmail = $settingModel->get('site_email', '');
$sitePhone = $settingModel->get('site_phone', '');
$siteAddress = $settingModel->get('site_address', '');

// Form gönderildi mi?
$formSubmitted = false;
$formError = '';
$formSuccess = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['contact_form'])) {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');
    
    if (empty($name) || empty($email) || empty($message)) {
        $formError = 'Lütfen tüm zorunlu alanları doldurun.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $formError = 'Geçerli bir e-posta adresi girin.';
    } else {
        $contactModel = new ContactModel();
        if ($contactModel->create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'subject' => $subject,
            'message' => $message
        ])) {
            $formSuccess = true;
            // Formu temizle
            $name = $email = $phone = $subject = $message = '';
        } else {
            $formError = 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
        }
    }
    $formSubmitted = true;
}
?>

<section class="contact-page">
    <div class="container">
        <h1><?= escape($page['title'] ?? 'İletişim') ?></h1>
        
        <?php if (isset($contentData['contact_intro'])): ?>
        <div class="intro">
            <?= $contentData['contact_intro'] ?>
        </div>
        <?php endif; ?>
        
        <div class="contact-wrapper">
            <div class="contact-info">
                <h2>İletişim Bilgileri</h2>
                
                <?php if ($siteAddress): ?>
                <div class="info-item">
                    <strong>Adres:</strong>
                    <p><?= escape($siteAddress) ?></p>
                </div>
                <?php endif; ?>
                
                <?php if ($sitePhone): ?>
                <div class="info-item">
                    <strong>Telefon:</strong>
                    <p><a href="tel:<?= escape($sitePhone) ?>"><?= escape($sitePhone) ?></a></p>
                </div>
                <?php endif; ?>
                
                <?php if ($siteEmail): ?>
                <div class="info-item">
                    <strong>E-posta:</strong>
                    <p><a href="mailto:<?= escape($siteEmail) ?>"><?= escape($siteEmail) ?></a></p>
                </div>
                <?php endif; ?>
            </div>
            
            <div class="contact-form-wrapper">
                <h2>Bize Ulaşın</h2>
                
                <?php if ($formSuccess): ?>
                <div class="alert alert-success">
                    Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                </div>
                <?php endif; ?>
                
                <?php if ($formError): ?>
                <div class="alert alert-error">
                    <?= escape($formError) ?>
                </div>
                <?php endif; ?>
                
                <form method="POST" action="" class="contact-form">
                    <input type="hidden" name="contact_form" value="1">
                    
                    <div class="form-group">
                        <label for="name">Ad Soyad *</label>
                        <input type="text" id="name" name="name" required 
                               value="<?= isset($name) ? escape($name) : '' ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">E-posta *</label>
                        <input type="email" id="email" name="email" required
                               value="<?= isset($email) ? escape($email) : '' ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Telefon</label>
                        <input type="tel" id="phone" name="phone"
                               value="<?= isset($phone) ? escape($phone) : '' ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Konu</label>
                        <input type="text" id="subject" name="subject"
                               value="<?= isset($subject) ? escape($subject) : '' ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Mesaj *</label>
                        <textarea id="message" name="message" rows="5" required><?= isset($message) ? escape($message) : '' ?></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Gönder</button>
                </form>
            </div>
        </div>
    </div>
</section>
