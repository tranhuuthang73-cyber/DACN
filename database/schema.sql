-- ============================================================
-- TravelGo Database Schema
-- Phần mềm đặt lịch/đặt chỗ tích hợp dashboard cho du lịch
-- MySQL 8.0+ | InnoDB | utf8mb4
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa database cũ nếu tồn tại
DROP DATABASE IF EXISTS travelgo;
CREATE DATABASE travelgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travelgo;

-- ============================================================
-- 1. USERS - Tất cả tài khoản hệ thống
-- ============================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    role ENUM('customer', 'employee', 'admin', 'partner') NOT NULL DEFAULT 'customer',
    status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
    email_verified_at DATETIME DEFAULT NULL,
    last_login_at DATETIME DEFAULT NULL,
    login_attempts TINYINT UNSIGNED DEFAULT 0 COMMENT 'Đếm số lần đăng nhập sai',
    locked_until DATETIME DEFAULT NULL COMMENT 'Khóa tài khoản tạm thời',
    remember_token VARCHAR(100) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. PARTNERS - Thông tin chi tiết đối tác
-- ============================================================
CREATE TABLE partners (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    tax_code VARCHAR(20) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    logo VARCHAR(255) DEFAULT NULL,
    contact_person VARCHAR(100) DEFAULT NULL,
    contact_phone VARCHAR(20) DEFAULT NULL,
    contact_email VARCHAR(100) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'active', 'suspended') NOT NULL DEFAULT 'pending',
    approved_by INT UNSIGNED DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_partners_status (status),
    CONSTRAINT fk_partners_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_partners_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. LOCATIONS - Danh sách địa điểm
-- ============================================================
CREATE TABLE locations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    province VARCHAR(100) DEFAULT NULL,
    region ENUM('north', 'central', 'south') DEFAULT NULL COMMENT 'Miền Bắc/Trung/Nam',
    description TEXT DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    is_popular TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_locations_popular (is_popular),
    INDEX idx_locations_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. VEHICLE_TYPES - Loại phương tiện
-- ============================================================
CREATE TABLE vehicle_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(60) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT NULL COMMENT 'Lucide icon name',
    description VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TRIPS - Chuyến đi
-- ============================================================
CREATE TABLE trips (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_code VARCHAR(20) NOT NULL UNIQUE,
    partner_id INT UNSIGNED NOT NULL,
    departure_location_id INT UNSIGNED NOT NULL,
    arrival_location_id INT UNSIGNED NOT NULL,
    vehicle_type_id INT UNSIGNED NOT NULL,
    departure_datetime DATETIME NOT NULL,
    return_datetime DATETIME DEFAULT NULL,
    total_seats INT UNSIGNED NOT NULL,
    available_seats INT UNSIGNED NOT NULL,
    price_per_person DECIMAL(15,2) NOT NULL,
    description TEXT DEFAULT NULL,
    policies TEXT DEFAULT NULL COMMENT 'Chính sách chuyến đi',
    featured_image VARCHAR(255) DEFAULT NULL,
    status ENUM('draft', 'pending_approval', 'approved', 'rejected', 'active', 'departed', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    rejection_reason TEXT DEFAULT NULL,
    created_by INT UNSIGNED NOT NULL COMMENT 'Admin tạo chuyến',
    approved_by INT UNSIGNED DEFAULT NULL COMMENT 'Nhân viên duyệt',
    approved_at DATETIME DEFAULT NULL,
    departed_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_trips_status (status),
    INDEX idx_trips_departure (departure_location_id, departure_datetime),
    INDEX idx_trips_arrival (arrival_location_id),
    INDEX idx_trips_date (departure_datetime),
    INDEX idx_trips_price (price_per_person),
    INDEX idx_trips_partner (partner_id),
    INDEX idx_trips_available (status, available_seats),

    CONSTRAINT fk_trips_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_departure FOREIGN KEY (departure_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_arrival FOREIGN KEY (arrival_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_vehicle FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trips_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT chk_trips_seats CHECK (available_seats <= total_seats),
    CONSTRAINT chk_trips_price CHECK (price_per_person >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TRIP_SERVICES - Dịch vụ đi kèm chuyến
-- ============================================================
CREATE TABLE trip_services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    is_included TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=miễn phí, 0=phụ phí',
    extra_price DECIMAL(15,2) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_trip_services_trip (trip_id),
    CONSTRAINT fk_trip_services_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. HOTELS - Khách sạn
-- ============================================================
CREATE TABLE hotels (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partner_id INT UNSIGNED NOT NULL,
    location_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    star_rating TINYINT UNSIGNED DEFAULT NULL COMMENT '1-5 sao',
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    amenities TEXT DEFAULT NULL COMMENT 'JSON array: wifi, pool, parking...',
    featured_image VARCHAR(255) DEFAULT NULL,
    latitude DECIMAL(10,8) DEFAULT NULL,
    longitude DECIMAL(11,8) DEFAULT NULL,
    status ENUM('pending', 'approved', 'active', 'suspended') NOT NULL DEFAULT 'pending',
    approved_by INT UNSIGNED DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_hotels_location (location_id),
    INDEX idx_hotels_partner (partner_id),
    INDEX idx_hotels_status (status),
    INDEX idx_hotels_star (star_rating),

    CONSTRAINT fk_hotels_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT,
    CONSTRAINT fk_hotels_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_hotels_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT chk_hotels_star CHECK (star_rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. ROOM_TYPES - Loại phòng
-- ============================================================
CREATE TABLE room_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT 'Phòng Đơn, Phòng Đôi, Suite...',
    description TEXT DEFAULT NULL,
    max_occupancy TINYINT UNSIGNED NOT NULL DEFAULT 2,
    total_rooms INT UNSIGNED NOT NULL COMMENT 'Tổng số phòng loại này',
    price_per_night DECIMAL(15,2) NOT NULL,
    area_sqm DECIMAL(6,2) DEFAULT NULL COMMENT 'Diện tích m²',
    bed_type VARCHAR(50) DEFAULT NULL COMMENT 'Giường đơn, giường đôi...',
    amenities TEXT DEFAULT NULL COMMENT 'JSON: ac, tv, minibar...',
    featured_image VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_room_types_hotel (hotel_id),
    INDEX idx_room_types_price (price_per_night),

    CONSTRAINT fk_room_types_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT chk_room_types_price CHECK (price_per_night >= 0),
    CONSTRAINT chk_room_types_rooms CHECK (total_rooms > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. ORDERS - Đơn hàng (Giỏ hàng)
-- ============================================================
CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT UNSIGNED NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status ENUM('pending_payment', 'paid', 'confirmed', 'partially_cancelled', 'cancelled', 'completed', 'expired') NOT NULL DEFAULT 'pending_payment',
    payment_method ENUM('vnpay', 'momo') DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    expires_at DATETIME NOT NULL COMMENT 'Hết hạn giữ chỗ (15 phút)',
    paid_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_expires (status, expires_at),
    INDEX idx_orders_code (order_code),

    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. BOOKINGS - Booking chi tiết (chuyến / khách sạn)
-- ============================================================
CREATE TABLE bookings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    order_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    booking_type ENUM('trip', 'hotel') NOT NULL,

    -- Thông tin chuyến đi (NULL nếu booking_type = 'hotel')
    trip_id INT UNSIGNED DEFAULT NULL,
    num_passengers INT UNSIGNED DEFAULT NULL,

    -- Thông tin khách sạn (NULL nếu booking_type = 'trip')
    hotel_id INT UNSIGNED DEFAULT NULL,
    room_type_id INT UNSIGNED DEFAULT NULL,
    num_rooms INT UNSIGNED DEFAULT NULL,
    check_in_date DATE DEFAULT NULL,
    check_out_date DATE DEFAULT NULL,
    num_nights INT UNSIGNED DEFAULT NULL,

    -- Thông tin giá
    unit_price DECIMAL(15,2) NOT NULL COMMENT 'Giá/người hoặc giá/đêm',
    quantity INT UNSIGNED NOT NULL COMMENT 'Số người hoặc số phòng',
    subtotal DECIMAL(15,2) NOT NULL,

    -- Trạng thái
    status ENUM(
        'pending_payment',
        'paid',
        'confirmed',
        'in_progress',
        'completed',
        'cancel_requested',
        'cancelled',
        'refunded',
        'expired'
    ) NOT NULL DEFAULT 'pending_payment',

    -- QR & Vé
    qr_code_path VARCHAR(255) DEFAULT NULL,
    ticket_data TEXT DEFAULT NULL COMMENT 'JSON chứa thông tin vé điện tử',

    -- Timestamps trạng thái
    confirmed_at DATETIME DEFAULT NULL,
    started_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    cancelled_at DATETIME DEFAULT NULL,
    cancellation_reason TEXT DEFAULT NULL,
    cancelled_by INT UNSIGNED DEFAULT NULL COMMENT 'User thực hiện hủy',
    expires_at DATETIME NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_bookings_order (order_id),
    INDEX idx_bookings_customer (customer_id),
    INDEX idx_bookings_type (booking_type),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_trip (trip_id),
    INDEX idx_bookings_hotel (hotel_id, room_type_id),
    INDEX idx_bookings_dates (check_in_date, check_out_date),
    INDEX idx_bookings_code (booking_code),
    INDEX idx_bookings_expires (status, expires_at),

    CONSTRAINT fk_bookings_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT chk_bookings_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. PAYMENTS - Giao dịch thanh toán
-- ============================================================
CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    payment_method ENUM('vnpay', 'momo') NOT NULL,
    transaction_code VARCHAR(100) DEFAULT NULL COMMENT 'Mã giao dịch từ cổng',
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    gateway_request TEXT DEFAULT NULL COMMENT 'JSON request gửi đi',
    gateway_response TEXT DEFAULT NULL COMMENT 'JSON response nhận về',
    callback_data TEXT DEFAULT NULL COMMENT 'JSON callback/webhook data',
    ip_address VARCHAR(45) DEFAULT NULL,
    paid_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_transaction (transaction_code),

    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. REFUNDS - Hoàn tiền
-- ============================================================
CREATE TABLE refunds (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNSIGNED NOT NULL,
    payment_id INT UNSIGNED NOT NULL,
    original_amount DECIMAL(15,2) NOT NULL,
    refund_percentage DECIMAL(5,2) NOT NULL COMMENT 'Tỷ lệ hoàn %',
    refund_amount DECIMAL(15,2) NOT NULL,
    days_before_departure INT DEFAULT NULL COMMENT 'Số ngày trước khởi hành',
    reason TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'processed', 'rejected') NOT NULL DEFAULT 'pending',
    processed_by INT UNSIGNED DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_refunds_booking (booking_id),
    INDEX idx_refunds_status (status),

    CONSTRAINT fk_refunds_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT chk_refunds_percentage CHECK (refund_percentage BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. REVIEWS - Đánh giá
-- ============================================================
CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    booking_id INT UNSIGNED NOT NULL UNIQUE COMMENT 'Mỗi booking chỉ đánh giá 1 lần',
    reviewable_type ENUM('trip', 'hotel') NOT NULL,
    reviewable_id INT UNSIGNED NOT NULL COMMENT 'ID của trip hoặc hotel',
    rating TINYINT UNSIGNED NOT NULL COMMENT '1-5 sao',
    title VARCHAR(200) DEFAULT NULL,
    comment TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_reviews_customer (customer_id),
    INDEX idx_reviews_reviewable (reviewable_type, reviewable_id),
    INDEX idx_reviews_rating (rating),

    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,

    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. NOTIFICATIONS - Thông báo hệ thống
-- ============================================================
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'payment', 'trip', 'hotel', 'system', 'promotion') NOT NULL DEFAULT 'system',
    reference_type VARCHAR(50) DEFAULT NULL COMMENT 'booking, order, trip...',
    reference_id INT UNSIGNED DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notifications_user (user_id, is_read),
    INDEX idx_notifications_created (created_at),

    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. EMAIL_LOGS - Log email đã gửi
-- ============================================================
CREATE TABLE email_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    to_email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    template VARCHAR(100) DEFAULT NULL,
    status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    sent_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_email_logs_user (user_id),
    INDEX idx_email_logs_status (status),

    CONSTRAINT fk_email_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. IMAGES - Hình ảnh đa hình (trips, hotels, room_types)
-- ============================================================
CREATE TABLE images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    imageable_type ENUM('trip', 'hotel', 'room_type') NOT NULL,
    imageable_id INT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(200) DEFAULT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_images_target (imageable_type, imageable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. CANCELLATION_POLICIES - Chính sách hủy
-- ============================================================
CREATE TABLE cancellation_policies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_days_before INT UNSIGNED NOT NULL COMMENT 'Số ngày tối thiểu trước khởi hành',
    max_days_before INT UNSIGNED DEFAULT NULL COMMENT 'Số ngày tối đa (NULL = không giới hạn)',
    refund_percentage DECIMAL(5,2) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_cancel_policy_pct CHECK (refund_percentage BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. SYSTEM_SETTINGS - Cấu hình hệ thống
-- ============================================================
CREATE TABLE system_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    description VARCHAR(255) DEFAULT NULL,
    updated_by INT UNSIGNED DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. CSRF_TOKENS - Token chống CSRF
-- ============================================================
CREATE TABLE csrf_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    user_id INT UNSIGNED DEFAULT NULL,
    session_id VARCHAR(128) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_csrf_expires (expires_at),

    CONSTRAINT fk_csrf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. ACTIVITY_LOGS - Log hoạt động (audit trail)
-- ============================================================
CREATE TABLE activity_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    action VARCHAR(100) NOT NULL COMMENT 'login, create_trip, approve_booking...',
    target_type VARCHAR(50) DEFAULT NULL COMMENT 'trip, booking, hotel...',
    target_id INT UNSIGNED DEFAULT NULL,
    description TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_activity_user (user_id),
    INDEX idx_activity_action (action),
    INDEX idx_activity_target (target_type, target_id),
    INDEX idx_activity_created (created_at),

    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Thủ tục xử lý booking hết hạn (chạy bởi cron job mỗi phút)
DELIMITER //

CREATE PROCEDURE sp_expire_pending_bookings()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_booking_id INT UNSIGNED;
    DECLARE v_trip_id INT UNSIGNED;
    DECLARE v_num_passengers INT UNSIGNED;
    DECLARE v_room_type_id INT UNSIGNED;
    DECLARE v_booking_type VARCHAR(10);
    DECLARE v_order_id INT UNSIGNED;

    -- Cursor lấy các booking hết hạn
    DECLARE cur CURSOR FOR
        SELECT id, booking_type, trip_id, num_passengers, room_type_id, order_id
        FROM bookings
        WHERE status = 'pending_payment'
          AND expires_at < NOW();

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    START TRANSACTION;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_booking_id, v_booking_type, v_trip_id, v_num_passengers, v_room_type_id, v_order_id;

        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Đánh dấu booking hết hạn
        UPDATE bookings SET status = 'expired', updated_at = NOW() WHERE id = v_booking_id;

        -- Trả lại chỗ cho chuyến đi
        IF v_booking_type = 'trip' AND v_trip_id IS NOT NULL THEN
            UPDATE trips
            SET available_seats = available_seats + v_num_passengers,
                updated_at = NOW()
            WHERE id = v_trip_id;
        END IF;

        -- (Phòng khách sạn không cần trả vì kiểm tra realtime)
    END LOOP;

    CLOSE cur;

    -- Cập nhật order nếu tất cả bookings trong order đều expired
    UPDATE orders o
    SET o.status = 'expired', o.updated_at = NOW()
    WHERE o.status = 'pending_payment'
      AND o.expires_at < NOW()
      AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.order_id = o.id
            AND b.status != 'expired'
      );

    COMMIT;
END //

DELIMITER ;


-- ============================================================
-- VIEWS phục vụ Dashboard
-- ============================================================

-- View: Thống kê booking theo tháng
CREATE VIEW v_monthly_booking_stats AS
SELECT
    DATE_FORMAT(b.created_at, '%Y-%m') AS month,
    b.booking_type,
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
    SUM(CASE WHEN b.status IN ('confirmed', 'paid') THEN 1 ELSE 0 END) AS active,
    SUM(b.subtotal) AS total_revenue
FROM bookings b
GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), b.booking_type;

-- View: Chuyến phổ biến
CREATE VIEW v_popular_trips AS
SELECT
    t.id,
    t.trip_code,
    dl.name AS departure_name,
    al.name AS arrival_name,
    vt.name AS vehicle_name,
    t.price_per_person,
    t.total_seats,
    t.available_seats,
    (t.total_seats - t.available_seats) AS booked_seats,
    ROUND((t.total_seats - t.available_seats) / t.total_seats * 100, 1) AS fill_rate,
    COUNT(b.id) AS booking_count,
    t.departure_datetime,
    t.status
FROM trips t
JOIN locations dl ON t.departure_location_id = dl.id
JOIN locations al ON t.arrival_location_id = al.id
JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
LEFT JOIN bookings b ON b.trip_id = t.id AND b.status NOT IN ('expired', 'cancelled')
GROUP BY t.id
ORDER BY booking_count DESC;

-- View: Doanh thu theo đối tác
CREATE VIEW v_partner_revenue AS
SELECT
    p.id AS partner_id,
    p.company_name,
    u.full_name AS contact_name,
    COUNT(DISTINCT b.id) AS total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN b.subtotal ELSE 0 END) AS total_revenue,
    COUNT(DISTINCT t.id) AS total_trips,
    COUNT(DISTINCT h.id) AS total_hotels
FROM partners p
JOIN users u ON p.user_id = u.id
LEFT JOIN trips t ON t.partner_id = p.id
LEFT JOIN hotels h ON h.partner_id = p.id
LEFT JOIN bookings b ON (b.trip_id = t.id OR b.hotel_id = h.id)
GROUP BY p.id;


SET FOREIGN_KEY_CHECKS = 1;
