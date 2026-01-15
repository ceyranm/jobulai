<?php
/**
 * Slider/Banner Modeli
 */

class SliderModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Tüm aktif slider'ları getir
     */
    public function getAll($activeOnly = true) {
        $sql = "SELECT * FROM sliders";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY sort_order ASC, id ASC";
        return $this->db->query($sql)->fetchAll();
    }
    
    /**
     * ID'ye göre slider getir
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM sliders WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Slider oluştur
     */
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO sliders (title, subtitle, image, link_url, link_text, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['title'] ?? null,
            $data['subtitle'] ?? null,
            $data['image'],
            $data['link_url'] ?? null,
            $data['link_text'] ?? null,
            $data['is_active'] ?? 1,
            $data['sort_order'] ?? 0
        ]);
    }
    
    /**
     * Slider güncelle
     */
    public function update($id, $data) {
        $stmt = $this->db->prepare("
            UPDATE sliders 
            SET title = ?, subtitle = ?, image = ?, link_url = ?, link_text = ?, is_active = ?, sort_order = ?
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['title'] ?? null,
            $data['subtitle'] ?? null,
            $data['image'],
            $data['link_url'] ?? null,
            $data['link_text'] ?? null,
            $data['is_active'] ?? 1,
            $data['sort_order'] ?? 0,
            $id
        ]);
    }
    
    /**
     * Slider sil
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM sliders WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
