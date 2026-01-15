<?php
/**
 * Ayar Modeli
 */

class SettingModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Tüm ayarları getir
     */
    public function getAll($groupName = null) {
        $sql = "SELECT * FROM settings";
        if ($groupName) {
            $stmt = $this->db->prepare($sql . " WHERE group_name = ? ORDER BY setting_key ASC");
            $stmt->execute([$groupName]);
            return $stmt->fetchAll();
        }
        $sql .= " ORDER BY group_name ASC, setting_key ASC";
        return $this->db->query($sql)->fetchAll();
    }
    
    /**
     * Ayar değerini getir
     */
    public function get($key, $default = null) {
        $stmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        return $result ? $result['setting_value'] : $default;
    }
    
    /**
     * Ayar kaydet/güncelle
     */
    public function set($key, $value, $type = 'text', $description = null, $groupName = 'general') {
        $stmt = $this->db->prepare("
            INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                setting_type = VALUES(setting_type),
                description = VALUES(description),
                group_name = VALUES(group_name)
        ");
        return $stmt->execute([$key, $value, $type, $description, $groupName]);
    }
    
    /**
     * Ayar sil
     */
    public function delete($key) {
        $stmt = $this->db->prepare("DELETE FROM settings WHERE setting_key = ?");
        return $stmt->execute([$key]);
    }
}
