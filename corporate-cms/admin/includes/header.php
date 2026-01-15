<?php
/**
 * Admin Panel Header
 */

require_once dirname(__DIR__) . '/../config/config.php';
require_once APP_PATH . '/Models/UserModel.php';
require_once APP_PATH . '/Models/PageModel.php';
require_once APP_PATH . '/Models/ServiceModel.php';
require_once APP_PATH . '/Models/SliderModel.php';
require_once APP_PATH . '/Models/SettingModel.php';
require_once APP_PATH . '/Models/ContactModel.php';

requireAdmin();

$userModel = new UserModel();
$currentUser = $userModel->getById($_SESSION[ADMIN_USER_ID_KEY]);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel<?= isset($pageTitle) ? ' - ' . escape($pageTitle) : '' ?></title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    <style>
        .admin-header {
            background: #2c3e50;
            color: #fff;
            padding: 1rem 0;
            margin-bottom: 2rem;
        }
        .admin-header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .admin-nav {
            display: flex;
            gap: 1rem;
        }
        .admin-nav a {
            color: #fff;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: background 0.3s;
        }
        .admin-nav a:hover,
        .admin-nav a.active {
            background: #34495e;
        }
        .admin-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
        }
        table th,
        table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }
        .btn-danger {
            background: #dc3545;
            color: #fff;
        }
        .btn-danger:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <header class="admin-header">
        <div class="admin-content">
            <div class="admin-header-content">
                <h1>Admin Panel</h1>
                <nav class="admin-nav">
                    <a href="dashboard.php" class="<?= basename($_SERVER['PHP_SELF']) === 'dashboard.php' ? 'active' : '' ?>">Dashboard</a>
                    <a href="pages.php" class="<?= basename($_SERVER['PHP_SELF']) === 'pages.php' ? 'active' : '' ?>">Sayfalar</a>
                    <a href="services.php" class="<?= basename($_SERVER['PHP_SELF']) === 'services.php' ? 'active' : '' ?>">Hizmetler</a>
                    <a href="sliders.php" class="<?= basename($_SERVER['PHP_SELF']) === 'sliders.php' ? 'active' : '' ?>">Slider</a>
                    <a href="settings.php" class="<?= basename($_SERVER['PHP_SELF']) === 'settings.php' ? 'active' : '' ?>">Ayarlar</a>
                    <a href="messages.php" class="<?= basename($_SERVER['PHP_SELF']) === 'messages.php' ? 'active' : '' ?>">Mesajlar</a>
                    <a href="logout.php">Çıkış</a>
                </nav>
            </div>
        </div>
    </header>
    
    <div class="admin-content">
