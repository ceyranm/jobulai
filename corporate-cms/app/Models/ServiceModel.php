<?php
/**
 * Hizmet Modeli
 */

class ServiceModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Tüm hizmetleri getir
     */
    public function getAll($activeOnly = true) {
        $sql = "SELECT * FROM services";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY sort_order ASC, title ASC";
        return $this->db->query($sql)->fetchAll();
    }
    
    /**
     * Öne çıkan hizmetleri getir
     */
    public function getFeatured($limit = 6) {
        $stmt = $this->db->prepare("
            SELECT * FROM services 
            WHERE is_active = 1 AND is_featured = 1 
            ORDER BY sort_order ASC, title ASC 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
    
    /**
     * Slug'a göre hizmet getir
     */
    public function getBySlug($slug) {
        $stmt = $this->db->prepare("SELECT * FROM services WHERE slug = ? AND is_active = 1");
        $stmt->execute([$slug]);
        return $stmt->fetch();
    }
    
    /**
     * ID'ye göre hizmet getir
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM services WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Hizmet oluştur
     */
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO services (title, slug, short_description, full_description, icon, image, is_featured, is_active, sort_order, meta_title, meta_description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['short_description'] ?? null,
            $data['full_description'] ?? null,
            $data['icon'] ?? null,
            $data['image'] ?? null,
            $data['is_featured'] ?? 0,
            $data['is_active'] ?? 1,
            $data['sort_order'] ?? 0,
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null
        ]);
    }
    
    /**
     * Hizmet güncelle
     */
    public function update($id, $data) {
        $stmt = $this->db->prepare("
            UPDATE services 
            SET title = ?, slug = ?, short_description = ?, full_description = ?, 
                icon = ?, image = ?, is_featured = ?, is_active = ?, sort_order = ?, 
                meta_title = ?, meta_description = ?
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['short_description'] ?? null,
            $data['full_description'] ?? null,
            $data['icon'] ?? null,
            $data['image'] ?? null,
            $data['is_featured'] ?? 0,
            $data['is_active'] ?? 1,
            $data['sort_order'] ?? 0,
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $id
        ]);
    }
    
    /**
     * Hizmet sil
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM services WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
