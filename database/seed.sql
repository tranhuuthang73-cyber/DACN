-- ============================================================
-- TravelGo - Dữ liệu mẫu (Seed Data)
-- Chạy sau schema.sql
-- ============================================================

USE travelgo;

-- ============================================================
-- 1. SYSTEM SETTINGS
-- ============================================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'TravelGo', 'string', 'Tên website'),
('site_description', 'Nền tảng đặt chuyến đi và khách sạn du lịch', 'string', 'Mô tả website'),
('booking_hold_minutes', '15', 'number', 'Thời gian giữ chỗ (phút)'),
('currency', 'VND', 'string', 'Đơn vị tiền tệ'),
('contact_email', 'support@travelgo.vn', 'string', 'Email hỗ trợ'),
('contact_phone', '1900 1234', 'string', 'Hotline hỗ trợ'),
('vnpay_enabled', '1', 'boolean', 'Bật/tắt VNPay'),
('momo_enabled', '1', 'boolean', 'Bật/tắt MoMo'),
('max_passengers_per_booking', '10', 'number', 'Số người tối đa mỗi booking'),
('max_rooms_per_booking', '5', 'number', 'Số phòng tối đa mỗi booking');

-- ============================================================
-- 2. CANCELLATION POLICIES
-- ============================================================
INSERT INTO cancellation_policies (name, min_days_before, max_days_before, refund_percentage, description, sort_order) VALUES
('Hủy sớm (≥7 ngày)',     7,    NULL, 100.00, 'Hoàn 100% nếu hủy trước 7 ngày', 1),
('Hủy trung bình (3-6 ngày)', 3, 6,    50.00,  'Hoàn 50% nếu hủy trước 3-6 ngày', 2),
('Hủy muộn (1-2 ngày)',   1,    2,     20.00,  'Hoàn 20% nếu hủy trước 1-2 ngày', 3),
('Hủy sát ngày (<1 ngày)', 0,   0,      0.00,  'Không hoàn tiền nếu hủy trong ngày', 4);

-- ============================================================
-- 3. VEHICLE TYPES
-- ============================================================
INSERT INTO vehicle_types (name, slug, icon, description) VALUES
('Xe Limousine', 'xe-limousine', 'car', 'Xe limousine cao cấp, ghế ngồi rộng rãi'),
('Xe Giường Nằm', 'xe-giuong-nam', 'bed', 'Xe giường nằm thoải mái cho hành trình dài'),
('Máy Bay', 'may-bay', 'plane', 'Đi máy bay nhanh chóng và tiện lợi'),
('Tàu Hỏa', 'tau-hoa', 'train-front', 'Tàu hỏa ngắm cảnh, trải nghiệm thú vị');

-- ============================================================
-- 4. LOCATIONS
-- ============================================================
INSERT INTO locations (name, slug, province, region, description, is_popular, sort_order) VALUES
('TP. Hồ Chí Minh', 'tp-ho-chi-minh', 'TP. Hồ Chí Minh', 'south', 'Thành phố năng động, trung tâm kinh tế phía Nam', 1, 1),
('Đà Lạt', 'da-lat', 'Lâm Đồng', 'central', 'Thành phố ngàn hoa, khí hậu mát mẻ quanh năm', 1, 2),
('Nha Trang', 'nha-trang', 'Khánh Hòa', 'central', 'Thành phố biển xinh đẹp với bãi biển trải dài', 1, 3),
('Đà Nẵng', 'da-nang', 'Đà Nẵng', 'central', 'Thành phố đáng sống với cầu Rồng nổi tiếng', 1, 4),
('Phú Quốc', 'phu-quoc', 'Kiên Giang', 'south', 'Đảo ngọc với biển xanh cát trắng', 1, 5),
('Hà Nội', 'ha-noi', 'Hà Nội', 'north', 'Thủ đô ngàn năm văn hiến', 1, 6),
('Sapa', 'sapa', 'Lào Cai', 'north', 'Thị trấn trong sương, ruộng bậc thang tuyệt đẹp', 1, 7),
('Hội An', 'hoi-an', 'Quảng Nam', 'central', 'Phố cổ đèn lồng, Di sản văn hóa thế giới', 1, 8),
('Huế', 'hue', 'Thừa Thiên Huế', 'central', 'Cố đô với kiến trúc cung đình tráng lệ', 1, 9),
('Vũng Tàu', 'vung-tau', 'Bà Rịa - Vũng Tàu', 'south', 'Thành phố biển gần Sài Gòn', 1, 10),
('Quy Nhơn', 'quy-nhon', 'Bình Định', 'central', 'Biển đẹp hoang sơ, ẩm thực phong phú', 0, 11),
('Cần Thơ', 'can-tho', 'Cần Thơ', 'south', 'Thủ phủ miền Tây sông nước', 0, 12),
('Mũi Né', 'mui-ne', 'Bình Thuận', 'central', 'Đồi cát bay và biển xanh', 0, 13),
('Hạ Long', 'ha-long', 'Quảng Ninh', 'north', 'Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới', 1, 14),
('Ninh Bình', 'ninh-binh', 'Ninh Bình', 'north', 'Tràng An - Di sản thế giới kép', 0, 15);

-- ============================================================
-- 5. USERS
-- ============================================================
-- Mật khẩu mẫu: tất cả là "password123" (bcrypt hash)
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (username, email, password, full_name, phone, role, status, email_verified_at) VALUES
-- Admin
('admin', 'admin@travelgo.vn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Quản Trị', '0901000001', 'admin', 'active', NOW()),

-- Nhân viên
('nv_hoa', 'hoa.nv@travelgo.vn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị Hoa', '0901000002', 'employee', 'active', NOW()),
('nv_minh', 'minh.nv@travelgo.vn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Văn Minh', '0901000003', 'employee', 'active', NOW()),

-- Đối tác
('dt_saigontour', 'saigontour@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Đối Tác A', '0901000004', 'partner', 'active', NOW()),
('dt_havanhotel', 'havanhotel@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Đối Tác B', '0901000005', 'partner', 'active', NOW()),

-- Khách hàng
('kh_an', 'an.nguyen@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn An', '0901000006', 'customer', 'active', NOW()),
('kh_binh', 'binh.tran@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Văn Bình', '0901000007', 'customer', 'active', NOW()),
('kh_cam', 'cam.le@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Thị Cẩm', '0901000008', 'customer', 'active', NOW());

-- ============================================================
-- 6. PARTNERS
-- ============================================================
INSERT INTO partners (user_id, company_name, tax_code, address, description, contact_person, contact_phone, contact_email, status, approved_by, approved_at) VALUES
(4, 'Sài Gòn Tour', '0301234567', '123 Nguyễn Huệ, Q.1, TP.HCM', 'Công ty du lịch hàng đầu miền Nam, chuyên tổ chức các chuyến xe limousine và tàu hỏa đường dài.', 'Nguyễn Đối Tác A', '0901000004', 'saigontour@example.com', 'active', 1, NOW()),
(5, 'Havan Hotel Group', '0307654321', '456 Trần Phú, Nha Trang', 'Chuỗi khách sạn 3-5 sao tại các thành phố du lịch trên cả nước.', 'Trần Đối Tác B', '0901000005', 'havanhotel@example.com', 'active', 1, NOW());

-- ============================================================
-- 7. TRIPS (Chuyến đi mẫu)
-- ============================================================
INSERT INTO trips (trip_code, partner_id, departure_location_id, arrival_location_id, vehicle_type_id, departure_datetime, return_datetime, total_seats, available_seats, price_per_person, description, policies, status, created_by, approved_by, approved_at) VALUES
('TRIP-001', 1, 1, 2, 1, '2026-09-10 07:00:00', '2026-09-10 13:00:00', 40, 35, 350000, 'Chuyến xe limousine TP.HCM → Đà Lạt, khởi hành sáng sớm, đến nơi buổi trưa. Xe đời mới, có wifi, nước uống miễn phí.', 'Hành khách cần có mặt trước 15 phút. Mang theo CCCD/CMND. Trẻ em dưới 5 tuổi miễn phí (ngồi cùng người lớn).', 'active', 1, 2, NOW()),

('TRIP-002', 1, 2, 1, 1, '2026-09-12 14:00:00', '2026-09-12 20:00:00', 40, 40, 350000, 'Chuyến xe limousine Đà Lạt → TP.HCM, khởi hành buổi chiều.', 'Hành khách cần có mặt trước 15 phút.', 'active', 1, 2, NOW()),

('TRIP-003', 1, 1, 3, 2, '2026-09-15 20:00:00', '2026-09-16 06:00:00', 35, 35, 280000, 'Chuyến xe giường nằm TP.HCM → Nha Trang ban đêm. Giường nằm thoải mái, chăn gối sạch sẽ.', 'Không mang theo đồ ăn có mùi. Giữ trật tự sau 22h.', 'active', 1, 2, NOW()),

('TRIP-004', 1, 3, 1, 2, '2026-09-18 20:00:00', '2026-09-19 06:00:00', 35, 35, 280000, 'Chuyến xe giường nằm Nha Trang → TP.HCM ban đêm.', 'Không mang theo đồ ăn có mùi.', 'active', 1, 2, NOW()),

('TRIP-005', 1, 6, 7, 4, '2026-09-20 06:00:00', '2026-09-20 14:00:00', 200, 200, 450000, 'Tàu hỏa Hà Nội → Sapa, ngắm cảnh đồng quê và núi non Tây Bắc tuyệt đẹp.', 'Mang theo giấy tờ tùy thân. Trẻ em dưới 6 tuổi miễn phí.', 'active', 1, 2, NOW()),

('TRIP-006', 1, 1, 4, 3, '2026-09-22 08:00:00', '2026-09-22 09:30:00', 180, 180, 1200000, 'Bay TP.HCM → Đà Nẵng, thời gian bay khoảng 1h20p.', 'Có mặt tại sân bay trước 2 tiếng. Hành lý xách tay 7kg, ký gửi 20kg.', 'active', 1, 2, NOW()),

('TRIP-007', 1, 4, 1, 3, '2026-09-25 18:00:00', '2026-09-25 19:30:00', 180, 180, 1200000, 'Bay Đà Nẵng → TP.HCM, chuyến tối.', 'Có mặt tại sân bay trước 2 tiếng.', 'active', 1, 2, NOW()),

-- Chuyến chưa duyệt (để test luồng duyệt)
('TRIP-008', 1, 1, 5, 3, '2026-10-01 10:00:00', '2026-10-01 11:30:00', 150, 150, 980000, 'Bay TP.HCM → Phú Quốc.', 'Có mặt tại sân bay trước 2 tiếng.', 'pending_approval', 1, NULL, NULL),

-- Chuyến nháp
('TRIP-009', 1, 6, 14, 4, '2026-10-05 08:00:00', '2026-10-05 14:00:00', 200, 200, 500000, 'Tàu hỏa Hà Nội → Hạ Long (dự kiến).', NULL, 'draft', 1, NULL, NULL);

-- ============================================================
-- 8. TRIP_SERVICES
-- ============================================================
INSERT INTO trip_services (trip_id, name, description, is_included, extra_price) VALUES
-- TRIP-001 (Limousine HCM->Đà Lạt)
(1, 'Wifi miễn phí', 'Kết nối internet tốc độ cao trên xe', 1, 0),
(1, 'Nước uống', 'Nước suối và khăn lạnh', 1, 0),
(1, 'Bảo hiểm hành khách', 'Bảo hiểm tai nạn trong suốt hành trình', 1, 0),
(1, 'Bữa ăn nhẹ', 'Bánh mì hoặc xôi tại trạm dừng', 0, 30000),

-- TRIP-003 (Giường nằm HCM->Nha Trang)
(3, 'Chăn gối sạch', 'Chăn gối được giặt sạch mỗi chuyến', 1, 0),
(3, 'Nước uống', 'Nước suối miễn phí', 1, 0),
(3, 'Bảo hiểm', 'Bảo hiểm tai nạn hành khách', 1, 0),

-- TRIP-005 (Tàu hỏa HN->Sapa)
(5, 'Bữa sáng', 'Phở hoặc bún tại toa ăn', 0, 50000),
(5, 'Chăn gối', 'Chăn gối cho giường nằm', 1, 0),
(5, 'Bảo hiểm', 'Bảo hiểm hành khách', 1, 0),

-- TRIP-006 (Bay HCM->Đà Nẵng)
(6, 'Hành lý ký gửi 20kg', 'Miễn phí hành lý ký gửi 20kg', 1, 0),
(6, 'Bữa ăn trên máy bay', 'Bữa ăn nhẹ và nước uống', 1, 0),
(6, 'Chọn chỗ ngồi', 'Chọn chỗ ngồi ưu tiên', 0, 80000);

-- ============================================================
-- 9. HOTELS
-- ============================================================
INSERT INTO hotels (partner_id, location_id, name, slug, address, description, star_rating, check_in_time, check_out_time, amenities, status, approved_by, approved_at) VALUES
(2, 2, 'Dalat Palace Heritage Hotel', 'dalat-palace-heritage', '02 Trần Phú, Phường 3, Đà Lạt', 'Khách sạn lịch sử 5 sao nằm bên hồ Xuân Hương, kiến trúc Pháp cổ điển sang trọng. Tầm nhìn tuyệt đẹp ra hồ và đồi thông.', 5, '14:00:00', '12:00:00', '["wifi","pool","spa","restaurant","bar","parking","gym","room_service","laundry","conference"]', 'active', 2, NOW()),

(2, 3, 'Havan Nha Trang Hotel', 'havan-nha-trang', '88 Trần Phú, Nha Trang', 'Khách sạn 4 sao mặt biển Trần Phú, view biển tuyệt đẹp, hồ bơi tràn bờ, nhà hàng hải sản.', 4, '14:00:00', '12:00:00', '["wifi","pool","restaurant","bar","beach_access","parking","spa","gym"]', 'active', 2, NOW()),

(2, 4, 'Havan Danang Resort', 'havan-danang-resort', '120 Võ Nguyên Giáp, Đà Nẵng', 'Resort 4 sao bên bãi biển Mỹ Khê, hồ bơi vô cực nhìn ra biển.', 4, '15:00:00', '11:00:00', '["wifi","pool","restaurant","beach_access","spa","gym","kids_club","shuttle"]', 'active', 2, NOW()),

(2, 5, 'Havan Phu Quoc Beach Resort', 'havan-phu-quoc', '56 Trần Hưng Đạo, Dương Đông, Phú Quốc', 'Resort 5 sao trên bãi Dài Phú Quốc với villa riêng tư, hồ bơi cá nhân.', 5, '14:00:00', '12:00:00', '["wifi","pool","private_beach","restaurant","bar","spa","gym","water_sports","shuttle"]', 'active', 2, NOW()),

(2, 7, 'Sapa Mountain Lodge', 'sapa-mountain-lodge', '15 Fansipan, TT. Sa Pa', 'Lodge 3 sao giữa núi rừng Sapa, view ruộng bậc thang, không khí trong lành.', 3, '14:00:00', '12:00:00', '["wifi","restaurant","trekking","fireplace","mountain_view","parking"]', 'active', 2, NOW());

-- ============================================================
-- 10. ROOM_TYPES
-- ============================================================
INSERT INTO room_types (hotel_id, name, description, max_occupancy, total_rooms, price_per_night, area_sqm, bed_type, amenities, status) VALUES
-- Dalat Palace (hotel_id=1)
(1, 'Phòng Superior', 'Phòng tiêu chuẩn view vườn, trang bị đầy đủ tiện nghi.', 2, 30, 1800000, 28, 'Giường đôi', '["ac","tv","minibar","safe","hairdryer","bathtub"]', 'active'),
(1, 'Phòng Deluxe Lake View', 'Phòng cao cấp view hồ Xuân Hương tuyệt đẹp.', 2, 20, 2800000, 35, 'Giường đôi king', '["ac","tv","minibar","safe","hairdryer","bathtub","balcony","lake_view"]', 'active'),
(1, 'Suite Hoàng Gia', 'Suite rộng rãi với phòng khách riêng, view panorama.', 4, 5, 5500000, 65, 'Giường king + sofa bed', '["ac","tv","minibar","safe","hairdryer","jacuzzi","balcony","lake_view","living_room"]', 'active'),

-- Havan Nha Trang (hotel_id=2)
(2, 'Phòng Standard City View', 'Phòng tiêu chuẩn view thành phố.', 2, 40, 900000, 24, 'Giường đôi', '["ac","tv","minibar","safe","hairdryer"]', 'active'),
(2, 'Phòng Deluxe Sea View', 'Phòng cao cấp view biển Nha Trang.', 2, 25, 1500000, 30, 'Giường đôi king', '["ac","tv","minibar","safe","hairdryer","balcony","sea_view"]', 'active'),
(2, 'Phòng Family', 'Phòng gia đình rộng rãi, 2 giường.', 4, 10, 2200000, 42, '2 giường đôi', '["ac","tv","minibar","safe","hairdryer","balcony","sea_view"]', 'active'),

-- Havan Danang (hotel_id=3)
(3, 'Phòng Garden View', 'Phòng view vườn nhiệt đới.', 2, 35, 1100000, 28, 'Giường đôi', '["ac","tv","minibar","safe","hairdryer","pool_access"]', 'active'),
(3, 'Phòng Ocean View', 'Phòng view biển Mỹ Khê.', 2, 20, 1800000, 32, 'Giường đôi king', '["ac","tv","minibar","safe","hairdryer","balcony","sea_view","pool_access"]', 'active'),
(3, 'Villa Bể Bơi Riêng', 'Villa độc lập với bể bơi riêng.', 4, 5, 6000000, 85, 'Giường king + extra bed', '["ac","tv","minibar","safe","hairdryer","private_pool","garden","living_room","kitchen"]', 'active'),

-- Havan Phu Quoc (hotel_id=4)
(4, 'Bungalow Garden', 'Bungalow view vườn nhiệt đới.', 2, 20, 2000000, 35, 'Giường đôi king', '["ac","tv","minibar","safe","outdoor_shower","garden"]', 'active'),
(4, 'Villa Beach Front', 'Villa sát biển với hồ bơi riêng.', 4, 8, 8000000, 120, 'Giường king + extra bed', '["ac","tv","minibar","safe","private_pool","beach_access","outdoor_shower","butler"]', 'active'),

-- Sapa Lodge (hotel_id=5)
(5, 'Phòng Valley View', 'Phòng view thung lũng Mường Hoa.', 2, 15, 800000, 22, 'Giường đôi', '["heater","tv","hot_water","mountain_view"]', 'active'),
(5, 'Phòng Deluxe Terrace', 'Phòng có ban công rộng, view ruộng bậc thang.', 2, 10, 1200000, 28, 'Giường đôi king', '["heater","tv","hot_water","balcony","mountain_view","fireplace"]', 'active');

-- ============================================================
-- 11. IMAGES mẫu (placeholder paths)
-- ============================================================
INSERT INTO images (imageable_type, imageable_id, file_path, alt_text, sort_order) VALUES
-- Trip images
('trip', 1, '/assets/images/trips/hcm-dalat-limo-1.jpg', 'Xe Limousine TP.HCM - Đà Lạt', 1),
('trip', 1, '/assets/images/trips/hcm-dalat-limo-2.jpg', 'Nội thất xe Limousine', 2),
('trip', 3, '/assets/images/trips/hcm-nhatrang-giuong-1.jpg', 'Xe giường nằm TP.HCM - Nha Trang', 1),
('trip', 5, '/assets/images/trips/hn-sapa-train-1.jpg', 'Tàu hỏa Hà Nội - Sapa', 1),
('trip', 6, '/assets/images/trips/hcm-danang-plane-1.jpg', 'Bay TP.HCM - Đà Nẵng', 1),

-- Hotel images
('hotel', 1, '/assets/images/hotels/dalat-palace-1.jpg', 'Dalat Palace Heritage Hotel', 1),
('hotel', 1, '/assets/images/hotels/dalat-palace-2.jpg', 'Hồ bơi Dalat Palace', 2),
('hotel', 2, '/assets/images/hotels/havan-nhatrang-1.jpg', 'Havan Nha Trang Hotel', 1),
('hotel', 3, '/assets/images/hotels/havan-danang-1.jpg', 'Havan Danang Resort', 1),
('hotel', 4, '/assets/images/hotels/havan-phuquoc-1.jpg', 'Havan Phu Quoc Resort', 1),
('hotel', 5, '/assets/images/hotels/sapa-lodge-1.jpg', 'Sapa Mountain Lodge', 1),

-- Room type images
('room_type', 1, '/assets/images/rooms/dalat-superior-1.jpg', 'Phòng Superior Dalat Palace', 1),
('room_type', 2, '/assets/images/rooms/dalat-deluxe-1.jpg', 'Phòng Deluxe Lake View', 1),
('room_type', 3, '/assets/images/rooms/dalat-suite-1.jpg', 'Suite Hoàng Gia Dalat Palace', 1);
