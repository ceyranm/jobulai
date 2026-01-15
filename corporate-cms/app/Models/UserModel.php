<?php
/**
 * Kullanıcı Modeli
 */

class UserModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Kullanıcı giriş kontrolü
     */
    public function login($username, $password) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            // Son giriş zamanını güncelle
            $updateStmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);
            
            return $user;
        }
        
        return false;
    }
    
    /**
     * ID'ye göre kullanıcı getir
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT id, username, email, full_name, is_active, last_login, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Şifre güncelle
     */
    public function updatePassword($id, $newPassword) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
        return $stmt->execute([$hashedPassword, $id]);
    }
}
