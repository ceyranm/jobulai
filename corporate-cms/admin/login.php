<?php
/**
 * Admin Giriş Sayfası
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once APP_PATH . '/Models/UserModel.php';

// Zaten giriş yapılmışsa dashboard'a yönlendir
if (isAdminLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Kullanıcı adı ve şifre gereklidir.';
    } else {
        $userModel = new UserModel();
        $user = $userModel->login($username, $password);
        
        if ($user) {
            $_SESSION[ADMIN_SESSION_KEY] = true;
            $_SESSION[ADMIN_USER_ID_KEY] = $user['id'];
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Kullanıcı adı veya şifre hatalı.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Girişi</title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f5f5;
        }
        .login-container {
            background: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        .login-container h1 {
            text-align: center;
            margin-bottom: 2rem;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        .btn-block {
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>Admin Girişi</h1>
        
        <?php if ($error): ?>
        <div class="alert alert-error">
            <?= escape($error) ?>
        </div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <div class="form-group">
                <label for="username">Kullanıcı Adı veya E-posta</label>
                <input type="text" id="username" name="username" required autofocus>
            </div>
            
            <div class="form-group">
                <label for="password">Şifre</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">Giriş Yap</button>
        </form>
        
        <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem; color: #666;">
            <a href="<?= BASE_URL ?>">← Siteye Dön</a>
        </p>
    </div>
</body>
</html>
