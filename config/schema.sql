-- ALRUYAH ALBAYDAA Database Schema
-- Run this SQL to set up your MySQL database

CREATE DATABASE IF NOT EXISTS alruyah_db;
USE alruyah_db;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(50) DEFAULT 'Wrench',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pages Table (for About, etc.)
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    content_en TEXT,
    content_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Highlights Table (Why Choose Us)
CREATE TABLE IF NOT EXISTS highlights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text_en VARCHAR(255) NOT NULL,
    text_ar VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT 'CheckCircle',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO pages (slug, title_en, title_ar, content_en, content_ar) VALUES
('about', 'About Us', 'عن الشركة', 
 'ALRUYAH ALBAYDAA Technical Services L.L.C is a premier provider of comprehensive technical solutions in the UAE. With over 15 years of industry experience, we have established ourselves as a trusted partner for residential, commercial, and industrial clients.',
 'شركة الرؤية البيضاء للخدمات الفنية ذ.م.م هي مزود رائد للحلول التقنية الشاملة في الإمارات العربية المتحدة. مع أكثر من 15 عامًا من الخبرة في الصناعة، أثبتنا أنفسنا كشريك موثوق للعملاء.')
ON DUPLICATE KEY UPDATE id = id;


INSERT INTO services (title_en, title_ar, description_en, description_ar, icon, sort_order) VALUES
('Electrical Works', 'أعمال الكهرباء', 'Complete electrical installation, maintenance, and repair services.', 'خدمات التركيب والصيانة والإصلاح الكهربائية الكاملة.', 'Zap', 1),
('Plumbing Services', 'خدمات السباكة', 'Professional plumbing solutions including installation and repair.', 'حلول السباكة الاحترافية بما في ذلك التركيب والإصلاح.', 'Wrench', 2),
('HVAC Systems', 'أنظمة التكييف', 'Heating, ventilation, and air conditioning services.', 'خدمات التدفئة والتهوية وتكييف الهواء.', 'Cog', 3),
('Civil Works', 'الأعمال المدنية', 'Construction, renovation, and structural engineering.', 'خدمات البناء والتجديد والهندسة الإنشائية.', 'Hammer', 4),
('Mechanical Services', 'الخدمات الميكانيكية', 'Industrial and commercial mechanical systems.', 'الأنظمة الميكانيكية الصناعية والتجارية.', 'Settings', 5),
('Maintenance Contracts', 'عقود الصيانة', 'Comprehensive annual maintenance contracts.', 'عقود صيانة سنوية شاملة.', 'Shield', 6)
ON DUPLICATE KEY UPDATE title_en = VALUES(title_en);

INSERT INTO highlights (text_en, text_ar, sort_order) VALUES
('Licensed & Certified Professionals', 'محترفون مرخصون ومعتمدون', 1),
('24/7 Emergency Services Available', 'خدمات الطوارئ متاحة على مدار الساعة', 2),
('Competitive Pricing Guaranteed', 'أسعار تنافسية مضمونة', 3),
('Quality Workmanship & Materials', 'جودة العمل والمواد', 4),
('Fast Response & Reliable Service', 'استجابة سريعة وخدمة موثوقة', 5),
('Customer Satisfaction Priority', 'أولوية رضا العملاء', 6)
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

INSERT INTO settings (setting_key, setting_value) VALUES
('whatsapp_number', '+9807411570'),
('company_phone', '+971 50 123 4567'),
('company_email', 'info@alruyah.ae'),
('company_address', 'Dubai, UAE')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
