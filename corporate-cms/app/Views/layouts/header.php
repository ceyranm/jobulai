<?php
/**
 * Site Header
 * Bu dosya tüm frontend sayfalarında include edilecek
 */

$settingModel = new SettingModel();
$siteName = $settingModel->get('site_name', 'Kurumsal Web Sitesi');
$siteLogo = $settingModel->get('site_logo', '');
$pageModel = new PageModel();
$pages = $pageModel->getAll();

// Mevcut sayfa bilgisi
$currentPage = $currentPage ?? 'home';
$pageMeta = getPageMeta($currentPage);
$pageTitle = $pageMeta['meta_title'] ?: $siteName;
$pageDescription = $pageMeta['meta_description'] ?? '';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= escape($pageTitle) ?></title>
    <meta name="description" content="<?= escape($pageDescription) ?>">
    <meta name="keywords" content="<?= escape($pageMeta['meta_keywords'] ?? '') ?>">
    
    <!-- Favicon -->
    <?php if ($favicon = $settingModel->get('site_favicon')): ?>
    <link rel="icon" type="image/x-icon" href="<?= escape($favicon) ?>">
    <?php endif; ?>
    
    <!-- CSS -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    
    <!-- Template'inizin CSS dosyalarını buraya ekleyin -->
    <!-- <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/template.css"> -->
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <?php if ($siteLogo): ?>
                        <a href="<?= BASE_URL ?>">
                            <img src="<?= escape($siteLogo) ?>" alt="<?= escape($siteName) ?>">
                        </a>
                    <?php else: ?>
                        <a href="<?= BASE_URL ?>"><?= escape($siteName) ?></a>
                    <?php endif; ?>
                </div>
                
                <nav class="main-nav">
                    <ul>
                        <li><a href="<?= BASE_URL ?>" class="<?= $currentPage === 'home' ? 'active' : '' ?>">Ana Sayfa</a></li>
                        <?php foreach ($pages as $page): ?>
                            <?php if ($page['slug'] !== 'home'): ?>
                            <li>
                                <a href="<?= BASE_URL ?>/?page=<?= escape($page['slug']) ?>" 
                                   class="<?= $currentPage === $page['slug'] ? 'active' : '' ?>">
                                    <?= escape($page['title']) ?>
                                </a>
                            </li>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </ul>
                </nav>
                
                <div class="header-actions">
                    <a href="<?= BASE_URL ?>/?page=contact" class="btn btn-primary">İletişim</a>
                </div>
            </div>
        </div>
    </header>
    
    <main class="main-content">
