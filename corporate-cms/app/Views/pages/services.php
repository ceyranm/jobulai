<?php
/**
 * Hizmetler Sayfası
 */

$pageModel = new PageModel();
$page = $pageModel->getBySlug('services');
$contents = $page ? $pageModel->getContents($page['id']) : [];

$contentData = [];
foreach ($contents as $content) {
    $contentData[$content['content_key']] = $content['content_value'];
}

// Tüm hizmetleri getir
$serviceModel = new ServiceModel();
$services = $serviceModel->getAll();

// Tek bir hizmet detayı mı gösterilecek?
$serviceSlug = $_GET['service'] ?? null;
$selectedService = null;
if ($serviceSlug) {
    $selectedService = $serviceModel->getBySlug($serviceSlug);
}
?>

<?php if ($selectedService): ?>
    <!-- Tek Hizmet Detay Sayfası -->
    <section class="service-detail">
        <div class="container">
            <h1><?= escape($selectedService['title']) ?></h1>
            
            <?php if ($selectedService['image']): ?>
            <div class="service-image">
                <img src="<?= escape($selectedService['image']) ?>" alt="<?= escape($selectedService['title']) ?>">
            </div>
            <?php endif; ?>
            
            <?php if ($selectedService['full_description']): ?>
            <div class="service-content">
                <?= $selectedService['full_description'] ?>
            </div>
            <?php endif; ?>
            
            <a href="<?= BASE_URL ?>/?page=services" class="btn btn-secondary">← Hizmetlere Dön</a>
        </div>
    </section>
<?php else: ?>
    <!-- Tüm Hizmetler Listesi -->
    <section class="services-page">
        <div class="container">
            <h1><?= escape($page['title'] ?? 'Hizmetlerimiz') ?></h1>
            
            <?php if (isset($contentData['services_intro'])): ?>
            <div class="intro">
                <?= $contentData['services_intro'] ?>
            </div>
            <?php endif; ?>
            
            <?php if (!empty($services)): ?>
            <div class="services-list">
                <?php foreach ($services as $service): ?>
                <div class="service-item">
                    <?php if ($service['image']): ?>
                    <div class="service-image">
                        <img src="<?= escape($service['image']) ?>" alt="<?= escape($service['title']) ?>">
                    </div>
                    <?php endif; ?>
                    
                    <div class="service-info">
                        <h2><?= escape($service['title']) ?></h2>
                        <?php if ($service['short_description']): ?>
                        <p><?= escape($service['short_description']) ?></p>
                        <?php endif; ?>
                        <a href="<?= BASE_URL ?>/?page=services&service=<?= escape($service['slug']) ?>" class="btn btn-primary">
                            Detayları Gör
                        </a>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <p>Henüz hizmet eklenmemiş.</p>
            <?php endif; ?>
        </div>
    </section>
<?php endif; ?>
