<?php
/**
 * İletişim Mesajları Modeli
 */

class ContactModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Tüm mesajları getir
     */
    public function getAll($readOnly = null, $limit = null) {
        $sql = "SELECT * FROM contact_messages";
        $params = [];
        
        if ($readOnly !== null) {
            $sql .= " WHERE is_read = ?";
            $params[] = $readOnly ? 1 : 0;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
            $params[] = $limit;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    /**
     * ID'ye göre mesaj getir
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Mesaj oluştur
     */
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO contact_messages (name, email, phone, subject, message)
            VALUES (?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['subject'] ?? null,
            $data['message']
        ]);
    }
    
    /**
     * Mesajı okundu olarak işaretle
     */
    public function markAsRead($id) {
        $stmt = $this->db->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
        return $stmt->execute([$id]);
    }
    
    /**
     * Mesaj sil
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM contact_messages WHERE id = ?");
        return $stmt->execute([$id]);
    }
    
    /**
     * Okunmamış mesaj sayısı
     */
    public function getUnreadCount() {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['count'] ?? 0;
    }
}
