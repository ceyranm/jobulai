<?php
/**
 * Admin Çıkış
 */

require_once dirname(__DIR__) . '/config/config.php';

session_destroy();
header('Location: login.php');
exit;
