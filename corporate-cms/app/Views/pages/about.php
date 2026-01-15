<?php
/**
 * Hakkımızda Sayfası
 */

$pageModel = new PageModel();
$page = $pageModel->getBySlug('about');
$contents = $page ? $pageModel->getContents($page['id']) : [];

$contentData = [];
foreach ($contents as $content) {
    $contentData[$content['content_key']] = $content['content_value'];
}
?>

<section class="page-content">
    <div class="container">
        <h1><?= escape($page['title'] ?? 'Hakkımızda') ?></h1>
        
        <?php if (isset($contentData['about_intro'])): ?>
        <div class="intro">
            <?= $contentData['about_intro'] ?>
        </div>
        <?php endif; ?>
        
        <?php if (isset($contentData['about_history'])): ?>
        <div class="section">
            <h2>Tarihçemiz</h2>
            <?= $contentData['about_history'] ?>
        </div>
        <?php endif; ?>
        
        <?php if (isset($contentData['about_mission'])): ?>
        <div class="section">
            <h2>Misyonumuz</h2>
            <?= $contentData['about_mission'] ?>
        </div>
        <?php endif; ?>
        
        <?php if (isset($contentData['about_vision'])): ?>
        <div class="section">
            <h2>Vizyonumuz</h2>
            <?= $contentData['about_vision'] ?>
        </div>
        <?php endif; ?>
        
        <?php if (isset($contentData['about_values'])): ?>
        <div class="section">
            <h2>Değerlerimiz</h2>
            <?= $contentData['about_values'] ?>
        </div>
        <?php endif; ?>
        
        <?php if (isset($contentData['about_team'])): ?>
        <div class="section">
            <h2>Ekibimiz</h2>
            <?= $contentData['about_team'] ?>
        </div>
        <?php endif; ?>
    </div>
</section>
