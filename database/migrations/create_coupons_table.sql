-- Migration: Tạo bảng Coupons & Coupon Usages
-- Phục vụ Giai đoạn 5: Hệ thống Mã khuyến mãi & Giảm giá

CREATE TABLE IF NOT EXISTS coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã giảm giá (viết hoa, không dấu)',
    description VARCHAR(255) DEFAULT NULL,
    discount_type ENUM('fixed', 'percent') NOT NULL DEFAULT 'fixed' COMMENT 'fixed: số tiền cố định, percent: phần trăm',
    discount_value DECIMAL(12,2) NOT NULL COMMENT 'Giá trị giảm (VD: 100000 hoặc 20)',
    min_order_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Giá trị đơn tối thiểu để áp dụng',
    max_discount_amount DECIMAL(12,2) DEFAULT NULL COMMENT 'Mức giảm tối đa nếu là percent',
    usage_limit INT DEFAULT NULL COMMENT 'Số lần dùng tối đa toàn hệ thống',
    used_count INT DEFAULT 0,
    start_date DATETIME DEFAULT NULL,
    end_date DATETIME DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_coupons_code (code),
    INDEX idx_coupons_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupon_usages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    order_id INT UNSIGNED DEFAULT NULL,
    discount_applied DECIMAL(12,2) NOT NULL,
    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_coupon_usages_coupon (coupon_id),
    INDEX idx_coupon_usages_user (user_id),

    CONSTRAINT fk_usages_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    CONSTRAINT fk_usages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu ban đầu
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, is_active)
VALUES 
('TRAVELGO100', 'Giảm trực tiếp 100.000₫ cho mọi đơn hàng từ 300.000₫', 'fixed', 100000, 300000, 1),
('SUMMER20', 'Giảm 20% tối đa 200.000₫ chào hè', 'percent', 20, 500000, 1),
('VIPLUXURY', 'Giảm ngay 300.000₫ cho đơn đặt phòng khách sạn & xe Limousine từ 1.500.000₫', 'fixed', 300000, 1500000, 1)
ON DUPLICATE KEY UPDATE code=code;
