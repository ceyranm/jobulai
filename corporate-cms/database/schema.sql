-- =====================================================
-- KURUMSAL WEB SİTESİ - MySQL VERİTABANI ŞEMASI (DÜZELTİLMİŞ)
-- =====================================================
-- PHP 8.x uyumlu, PDO prepared statements kullanımı için hazırlanmıştır

-- 1. ADMIN KULLANICILAR TABLOSU
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SAYFALAR TABLOSU
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SAYFA İÇERİKLERİ TABLOSU
CREATE TABLE IF NOT EXISTS page_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    content_key VARCHAR(100) NOT NULL,
    content_type ENUM('text', 'textarea', 'html', 'image', 'url') DEFAULT 'text',
    content_value TEXT,
    description VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_page_content (page_id, content_key),
    INDEX idx_page_id (page_id),
    INDEX idx_content_key (content_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. HİZMETLER TABLOSU
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    icon VARCHAR(100),
    image VARCHAR(255),
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active),
    INDEX idx_is_featured (is_featured),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SLIDER/BANNER TABLOSU
CREATE TABLE IF NOT EXISTS sliders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    subtitle TEXT,
    image VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    link_text VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AYARLAR TABLOSU
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'textarea', 'image', 'url', 'email', 'phone') DEFAULT 'text',
    description VARCHAR(255),
    group_name VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_group_name (group_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. MEDYA/GÖRSEL TABLOSU
CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    mime_type VARCHAR(100),
    alt_text VARCHAR(255),
    description TEXT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_filename (filename),
    INDEX idx_file_type (file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. İLETİŞİM MESAJLARI TABLOSU
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    replied_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Varsayılan admin kullanıcı
INSERT INTO users (username, email, password, full_name) VALUES ('admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User') ON DUPLICATE KEY UPDATE username=username;

-- Varsayılan sayfalar
INSERT INTO pages (slug, title, meta_title, meta_description) VALUES ('home', 'Ana Sayfa', 'Ana Sayfa', 'Kurumsal web sitesi ana sayfası') ON DUPLICATE KEY UPDATE slug=slug;
INSERT INTO pages (slug, title, meta_title, meta_description) VALUES ('about', 'Hakkımızda', 'Hakkımızda', 'Şirketimiz hakkında bilgiler') ON DUPLICATE KEY UPDATE slug=slug;
INSERT INTO pages (slug, title, meta_title, meta_description) VALUES ('services', 'Hizmetlerimiz', 'Hizmetlerimiz', 'Sunduğumuz hizmetler') ON DUPLICATE KEY UPDATE slug=slug;
INSERT INTO pages (slug, title, meta_title, meta_description) VALUES ('contact', 'İletişim', 'İletişim', 'Bize ulaşın') ON DUPLICATE KEY UPDATE slug=slug;

-- Varsayılan ayarlar
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('site_name', 'Kurumsal Web Sitesi', 'text', 'Site adı', 'general') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('site_email', 'info@example.com', 'email', 'İletişim e-posta adresi', 'contact') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('site_phone', '+90 (212) 123 45 67', 'phone', 'İletişim telefonu', 'contact') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('site_address', 'İstanbul, Türkiye', 'text', 'Adres bilgisi', 'contact') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('site_logo', '', 'image', 'Site logosu', 'general') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('site_favicon', '', 'image', 'Site favicon', 'general') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('facebook_url', '', 'url', 'Facebook sayfası URL', 'social') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('twitter_url', '', 'url', 'Twitter sayfası URL', 'social') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('instagram_url', '', 'url', 'Instagram sayfası URL', 'social') ON DUPLICATE KEY UPDATE setting_key=setting_key;
INSERT INTO settings (setting_key, setting_value, setting_type, description, group_name) VALUES ('linkedin_url', '', 'url', 'LinkedIn sayfası URL', 'social') ON DUPLICATE KEY UPDATE setting_key=setting_key;
