<?php
/**
 * Sayfa Modeli
 */

class PageModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Tüm aktif sayfaları getir
     */
    public function getAll($activeOnly = true) {
        $sql = "SELECT * FROM pages";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY sort_order ASC, title ASC";
        return $this->db->query($sql)->fetchAll();
    }
    
    /**
     * Slug'a göre sayfa getir
     */
    public function getBySlug($slug) {
        $stmt = $this->db->prepare("SELECT * FROM pages WHERE slug = ? AND is_active = 1");
        $stmt->execute([$slug]);
        return $stmt->fetch();
    }
    
    /**
     * ID'ye göre sayfa getir
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM pages WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Sayfa oluştur
     */
    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO pages (slug, title, meta_title, meta_description, meta_keywords, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['slug'],
            $data['title'],
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['meta_keywords'] ?? null,
            $data['is_active'] ?? 1,
            $data['sort_order'] ?? 0
        ]);
    }
    
    /**
     * Sayfa güncelle
     */
    public function update($id, $data) {
        $stmt = $this->db->prepare("
            UPDATE pages 
            SET title = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, is_active = ?, sort_order = ?
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['title'],
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['meta_keywords'] ?? null,
            $data['is_active'] ?? 1,
            $data['sort_order'] ?? 0,
            $id
        ]);
    }
    
    /**
     * Sayfa sil
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM pages WHERE id = ?");
        return $stmt->execute([$id]);
    }
    
    /**
     * Sayfa içeriklerini getir
     */
    public function getContents($pageId) {
        $stmt = $this->db->prepare("
            SELECT * FROM page_contents 
            WHERE page_id = ? 
            ORDER BY sort_order ASC, content_key ASC
        ");
        $stmt->execute([$pageId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Sayfa içeriği kaydet/güncelle
     */
    public function saveContent($pageId, $contentKey, $contentValue, $contentType = 'text') {
        $stmt = $this->db->prepare("
            INSERT INTO page_contents (page_id, content_key, content_value, content_type)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE content_value = VALUES(content_value), content_type = VALUES(content_type)
        ");
        return $stmt->execute([$pageId, $contentKey, $contentValue, $contentType]);
    }
    
    /**
     * Sayfa içeriği getir
     */
    public function getContent($pageId, $contentKey) {
        $stmt = $this->db->prepare("
            SELECT content_value FROM page_contents 
            WHERE page_id = ? AND content_key = ?
        ");
        $stmt->execute([$pageId, $contentKey]);
        $result = $stmt->fetch();
        return $result ? $result['content_value'] : '';
    }
}
