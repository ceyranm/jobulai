<?php
/**
 * Veritabanı Bağlantı Yapılandırması
 * PDO kullanarak güvenli bağlantı
 */

class Database {
    private static $instance = null;
    private $connection;
    
    // Veritabanı ayarları - MAMP için yapılandırılmış
    private const DB_HOST = 'localhost';
    private const DB_NAME = 'corporate_cms';
    private const DB_USER = 'root';
    private const DB_PASS = 'root'; // MAMP varsayılan şifresi
    private const DB_CHARSET = 'utf8mb4';
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . self::DB_HOST . ";dbname=" . self::DB_NAME . ";charset=" . self::DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->connection = new PDO($dsn, self::DB_USER, self::DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            die("Veritabanı bağlantı hatası. Lütfen yöneticiye başvurun.");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Singleton pattern - clone ve unserialize engelle
    private function __clone() {}
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
