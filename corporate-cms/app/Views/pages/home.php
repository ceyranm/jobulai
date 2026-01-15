<?php
/**
 * Ana Sayfa
 */

$pageModel = new PageModel();
$page = $pageModel->getBySlug('home');
$contents = $page ? $pageModel->getContents($page['id']) : [];

// İçerikleri key-value çiftine dönüştür
$contentData = [];
foreach ($contents as $content) {
    $contentData[$content['content_key']] = $content['content_value'];
}

// Slider'ları getir
$sliderModel = new SliderModel();
$sliders = $sliderModel->getAll();

// Öne çıkan hizmetleri getir
$serviceModel = new ServiceModel();
$featuredServices = $serviceModel->getFeatured(6);
?>

<!-- Hero/Slider Section -->
<?php if (!empty($sliders)): ?>
<section class="hero-slider">
    <div class="slider-container">
        <?php foreach ($sliders as $slider): ?>
        <div class="slide">
            <img src="<?= escape($slider['image']) ?>" alt="<?= escape($slider['title'] ?? '') ?>">
            <?php if ($slider['title'] || $slider['subtitle']): ?>
            <div class="slide-content">
                <?php if ($slider['title']): ?>
                <h1><?= escape($slider['title']) ?></h1>
                <?php endif; ?>
                <?php if ($slider['subtitle']): ?>
                <p><?= escape($slider['subtitle']) ?></p>
                <?php endif; ?>
                <?php if ($slider['link_url'] && $slider['link_text']): ?>
                <a href="<?= escape($slider['link_url']) ?>" class="btn btn-primary">
                    <?= escape($slider['link_text']) ?>
                </a>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
</section>
<?php endif; ?>

<!-- Ana İçerik -->
<section class="intro-section">
    <div class="container">
        <?php if (isset($contentData['hero_title'])): ?>
        <h1><?= escape($contentData['hero_title']) ?></h1>
        <?php endif; ?>
        
        <?php if (isset($contentData['hero_subtitle'])): ?>
        <p class="lead"><?= escape($contentData['hero_subtitle']) ?></p>
        <?php endif; ?>
        
        <?php if (isset($contentData['hero_description'])): ?>
        <div class="content">
            <?= $contentData['hero_description'] ?>
        </div>
        <?php endif; ?>
        
        <?php if (isset($contentData['hero_button_text']) && isset($contentData['hero_button_link'])): ?>
        <a href="<?= escape($contentData['hero_button_link']) ?>" class="btn btn-primary">
            <?= escape($contentData['hero_button_text']) ?>
        </a>
        <?php endif; ?>
    </div>
</section>

<!-- Hizmetler Bölümü -->
<?php if (!empty($featuredServices)): ?>
<section class="services-section">
    <div class="container">
        <h2><?= isset($contentData['services_title']) ? escape($contentData['services_title']) : 'Hizmetlerimiz' ?></h2>
        
        <div class="services-grid">
            <?php foreach ($featuredServices as $service): ?>
            <div class="service-card">
                <?php if ($service['image']): ?>
                <div class="service-image">
                    <img src="<?= escape($service['image']) ?>" alt="<?= escape($service['title']) ?>">
                </div>
                <?php endif; ?>
                
                <div class="service-content">
                    <h3><?= escape($service['title']) ?></h3>
                    <?php if ($service['short_description']): ?>
                    <p><?= escape($service['short_description']) ?></p>
                    <?php endif; ?>
                    <a href="<?= BASE_URL ?>/?page=services&service=<?= escape($service['slug']) ?>" class="btn btn-link">
                        Detaylar →
                    </a>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Diğer İçerik Bölümleri -->
<?php if (isset($contentData['section_1_title'])): ?>
<section class="content-section">
    <div class="container">
        <h2><?= escape($contentData['section_1_title']) ?></h2>
        <?php if (isset($contentData['section_1_content'])): ?>
        <div class="content">
            <?= $contentData['section_1_content'] ?>
        </div>
        <?php endif; ?>
    </div>
</section>
<?php endif; ?>
