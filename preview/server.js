/**
 * TravelGo - Standalone Ultra-Luxury Web Server & Runner
 * Aesthetic: Azure Riviera & Kinetic Glass (Ultra-Luxury Neo-Editorial Travel)
 * Includes: Multi-Service Combined Cart (Trip + Hotel), Atomic 15-min Booking & Phase 3 Live GPS Tracking
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function getFile(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }
    return null;
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

// In-Memory Shared State
let CART_ITEMS = [
    {
        key: 'trip_1',
        type: 'trip',
        id: 1,
        title: 'TP. Hồ Chí Minh → Đà Lạt',
        subtitle: 'Xe Limousine 9 chỗ VIP • Saigontourist',
        time: '05/09/2026 lúc 07:30',
        unit_price: 350000,
        quantity: 2,
        subtotal: 700000,
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    },
    {
        key: 'hotel_1_room_1',
        type: 'hotel',
        id: 1,
        title: 'Vinpearl Resort & Spa - Phòng Deluxe Hướng Biển',
        subtitle: '1 phòng • 2 đêm (05/09/2026 đến 07/09/2026)',
        time: 'Check-in: 05/09/2026 (14:00)',
        unit_price: 2450000,
        quantity: 1,
        nights: 2,
        subtotal: 4900000,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    }
];

const MOCK_DATA = {
    locations: [
        { id: 1, name: 'TP. Hồ Chí Minh', province: 'TP. HCM', count: '48 chuyến', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800' },
        { id: 2, name: 'Đà Lạt', province: 'Lâm Đồng', count: '32 chuyến', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' },
        { id: 3, name: 'Nha Trang', province: 'Khánh Hòa', count: '25 chuyến', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800' },
        { id: 4, name: 'Đà Nẵng', province: 'Đà Nẵng', count: '38 chuyến', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' },
        { id: 5, name: 'Hà Nội', province: 'Hà Nội', count: '42 chuyến', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800' },
        { id: 6, name: 'Phú Quốc', province: 'Kiên Giang', count: '19 chuyến', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800' },
    ],
    trips: [
        {
            id: 1,
            trip_code: 'SG-DL-01',
            type_tag: 'limousine',
            departure_name: 'TP. Hồ Chí Minh',
            arrival_name: 'Đà Lạt',
            departure_datetime: '2026-09-05 07:30:00',
            vehicle_name: 'Xe Limousine 9 chỗ VIP',
            price_per_person: 350000,
            available_seats: 6,
            total_seats: 9,
            rating: '4.9',
            reviews_count: 128,
            partner_name: 'Saigontourist Transport',
            featured_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            description: 'Chuyến xe Limousine VIP xuất phát từ Quận 1 đi thẳng trung tâm Đà Lạt, ghế massage cao cấp bọc da Conolly, wifi tốc độ cao, nước suối và khăn lạnh miễn phí.'
        },
        {
            id: 2,
            trip_code: 'SG-NT-02',
            type_tag: 'sleeper',
            departure_name: 'TP. Hồ Chí Minh',
            arrival_name: 'Nha Trang',
            departure_datetime: '2026-09-06 20:00:00',
            vehicle_name: 'Xe giường nằm 34 phòng VIP',
            price_per_person: 280000,
            available_seats: 12,
            total_seats: 34,
            rating: '4.8',
            reviews_count: 94,
            partner_name: 'Phương Trang FUTA',
            featured_image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800',
            description: 'Chuyến xe giường phòng riêng tư sang trọng, màn hình giải trí riêng, cổng sạc Type-C, rèm che cách biệt tuyệt đối, đưa đón tận nơi trong nội thành.'
        },
        {
            id: 3,
            trip_code: 'HN-DN-03',
            type_tag: 'flight',
            departure_name: 'Hà Nội',
            arrival_name: 'Đà Nẵng',
            departure_datetime: '2026-09-08 14:15:00',
            vehicle_name: 'Máy bay Vietnam Airlines',
            price_per_person: 1450000,
            available_seats: 25,
            total_seats: 180,
            rating: '5.0',
            reviews_count: 312,
            partner_name: 'Vietnam Airlines',
            featured_image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
            description: 'Chuyến bay thẳng Hà Nội - Đà Nẵng, bao gồm 20kg hành lý ký gửi, suất ăn nhẹ cao cấp trên máy bay, tiếp viên chuyên nghiệp.'
        }
    ],
    hotels: [
        {
            id: 1,
            name: 'Vinpearl Resort & Spa Nha Trang Bay',
            location_name: 'Nha Trang',
            address: 'Đảo Hòn Tre, Vĩnh Nguyên, Nha Trang',
            star_rating: 5,
            min_price: 2450000,
            rating: '4.9',
            reviews_count: 240,
            featured_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            description: 'Khu nghỉ dưỡng 5 sao đẳng cấp thế giới với bãi biển riêng tư tuyệt đẹp, công viên giải trí VinWonders và hồ bơi vô cực rộng 5000m².',
            room_name: 'Phòng Deluxe Hướng Biển',
            room_price: 2450000
        },
        {
            id: 2,
            name: 'Dalat Palace Heritage Luxury Hotel',
            location_name: 'Đà Lạt',
            address: '02 Trần Phú, Phường 3, Đà Lạt',
            star_rating: 5,
            min_price: 1850000,
            rating: '4.8',
            reviews_count: 180,
            featured_image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
            description: 'Khách sạn cổ kính bậc nhất Đông Dương hướng trọn tầm nhìn ra Hồ Xuân Hương thơ mộng, kiến trúc Pháp sang trọng quý phái.',
            room_name: 'Phòng Heritage Suite Cổ Điển',
            room_price: 1850000
        },
        {
            id: 3,
            name: 'InterContinental Danang Sun Peninsula',
            location_name: 'Đà Nẵng',
            address: 'Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng',
            star_rating: 5,
            min_price: 4200000,
            rating: '5.0',
            reviews_count: 420,
            featured_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
            description: 'Tuyệt tác kiến trúc của Bill Bensley ẩn mình trong rừng nguyên sinh Sơn Trà, bãi biển riêng tư và nhà hàng gắn sao Michelin.',
            room_name: 'Phòng Club Peninsula Ocean View',
            room_price: 4200000
        }
    ],
    reviews: [
        {
            id: 1,
            type: 'trip',
            item_id: 1,
            customer_name: 'Lê Anh Tuấn',
            rating: 5,
            title: 'Chuyến đi êm ái, dịch vụ đẳng cấp!',
            comment: 'Xe Limousine 9 chỗ rất rộng rãi, ghế massage bọc da êm ái. Bác tài Saigontourist chạy cực kỳ cẩn thận, đón đúng giờ tại Quận 1. Đầy đủ khăn lạnh, nước suối và wifi tốc độ cao.',
            created_at: '08/09/2026',
            partner_reply: 'Saigontourist Transport chân thành cảm ơn anh Tuấn đã tin tưởng lựa chọn dịch vụ. Rất mong được tiếp tục phục vụ anh trong những hành trình kế tiếp!',
            partner_replied_at: '08/09/2026 14:30'
        },
        {
            id: 2,
            type: 'hotel',
            item_id: 1,
            customer_name: 'Trần Thị Mai',
            rating: 5,
            title: 'Khách sạn view biển xuất sắc, nhân viên nhiệt tình',
            comment: 'Phòng Deluxe hướng trọn vịnh Nha Trang, ngắm bình minh từ ban công phòng ngủ quá đẹp. Buffet sáng rất phong phú món Á - Âu, hồ bơi vô cực sạch sẽ.',
            created_at: '07/09/2026',
            partner_reply: 'Vinpearl Resort & Spa Nha Trang xin cảm ơn chị Mai! Chúc chị và gia đình luôn có những chuyến du lịch trọn vẹn niềm vui.',
            partner_replied_at: '07/09/2026 16:00'
        },
        {
            id: 3,
            type: 'trip',
            item_id: 2,
            customer_name: 'Hoàng Minh Trí',
            rating: 4,
            title: 'Xe sạch đẹp, giường phòng riêng tư',
            comment: 'Xe giường nằm 34 phòng có rèm che riêng tư, máy lạnh mát mẻ. Đoạn qua đèo wifi có hơi chập chờn một chút nhưng tổng thể chuyến đi rất hài lòng.',
            created_at: '06/09/2026',
            partner_reply: null,
            partner_replied_at: null
        }
    ],
    notifications: [
        { id: 1, title: 'Thanh toán thành công 🎉', message: 'Đơn hàng #TG-2026-8899 đã được xác nhận. Chỗ ngồi được bảo lưu an toàn 100%!', type: 'payment', is_read: 0, created_at: '10/09/2026 00:15' },
        { id: 2, title: 'Nhắc nhở giờ khởi hành 🚌', message: 'Chuyến xe SG-DL-01 sẽ xuất bến lúc 07:30 ngày 05/09/2026. Quý khách vui lòng có mặt trước 15 phút.', type: 'trip', is_read: 0, created_at: '09/09/2026 20:00' },
        { id: 3, title: 'Ưu đãi thành viên mới 🎁', message: 'TravelGo tặng bạn voucher giảm 100.000₫ cho chuyến đi kế tiếp!', type: 'promotion', is_read: 1, created_at: '08/09/2026 14:00' },
        { id: 4, title: 'Duyệt yêu cầu hoàn tiền 💸', message: 'Yêu cầu hoàn tiền #RF-001 của bạn đã được phê duyệt thành công (350.000₫).', type: 'system', is_read: 1, created_at: '07/09/2026 11:30' }
    ]
};

function formatMoney(amount) {
    return Number(amount).toLocaleString('vi-VN') + '₫';
}

function calculateCartTotal() {
    return CART_ITEMS.reduce((sum, item) => sum + (item.subtotal || 0), 0);
}

function renderLayout(title, content, activeTab = '') {
    const css = getFile(path.join(PUBLIC_DIR, 'assets', 'css', 'style.css')) || '';
    const cartCount = CART_ITEMS.length;
    
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | TravelGo Luxury</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        ${css}
    </style>
</head>
<body>
    <!-- Top System Switcher Bar -->
    <div style="background:#050B14; color:#94A3B8; padding:8px 24px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); position:sticky; top:0; z-index:9999;">
        <div style="display:flex; align-items:center; gap:12px;">
            <span style="background:linear-gradient(135deg, var(--accent), #00B4D8); color:#050B14; font-weight:900; padding:3px 12px; border-radius:6px; font-size:0.72rem; letter-spacing:0.04em;">PRO LIVE RUNNER</span>
            <span style="color:#E2E8F0;">Đề tài: <strong>LV13-062 – Đặt chỗ Du lịch tích hợp Dashboard & Live GPS</strong></span>
        </div>
        <div style="display:flex; gap:18px; align-items:center; font-size:0.84rem;">
            <a href="/tracking" style="color:var(--accent); font-weight:800; text-decoration:none; display:flex; align-items:center; gap:5px;">
                <span class="live-pulse" style="display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--accent);"></span>
                📍 GPS Trực tiếp
            </a>
            <span style="color:#1E293B;">•</span>
            <a href="/admin" style="color:#38BDF8; font-weight:800; text-decoration:none; display:flex; align-items:center; gap:4px;">👑 Admin</a>
            <span style="color:#1E293B;">•</span>
            <a href="/partner" style="color:#FB923C; font-weight:800; text-decoration:none; display:flex; align-items:center; gap:4px;">🤝 Đối tác</a>
            <span style="color:#1E293B;">•</span>
            <a href="/employee" style="color:#A78BFA; font-weight:800; text-decoration:none; display:flex; align-items:center; gap:4px;">💼 Nhân viên</a>
            <span style="color:#1E293B;">•</span>
            <a href="/dashboard" style="color:#4ADE80; font-weight:800; text-decoration:none; display:flex; align-items:center; gap:4px;">👤 Khách hàng</a>
        </div>
    </div>

    <!-- Main Navigation Bar -->
    <nav class="navbar" style="position:sticky; top:37px; background:rgba(255,255,255,0.94); backdrop-filter:blur(20px); border-bottom:1px solid rgba(226,232,240,0.8); z-index:1000;">
        <div style="max-width:1260px; margin:0 auto; padding:0 24px; display:flex; justify-content:space-between; align-items:center; height:76px;">
            <a href="/" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
                <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, var(--primary) 0%, #00F5D4 100%); display:flex; align-items:center; justify-content:center; color:#050B14; box-shadow:0 6px 18px rgba(0,102,255,0.35);">
                    <i data-lucide="plane" style="width:24px;height:24px;stroke-width:2.5;"></i>
                </div>
                <div style="font-family:'Outfit',sans-serif; font-size:1.75rem; font-weight:900; letter-spacing:-0.03em; color:var(--gray-900);">
                    Travel<span style="color:var(--primary);">Go</span>
                </div>
            </a>

            <div style="display:flex; gap:36px; align-items:center;">
                <a href="/" style="text-decoration:none; color:${activeTab === 'home' ? 'var(--primary)' : 'var(--gray-700)'}; font-weight:800; font-size:0.96rem; display:flex; align-items:center; gap:6px; transition:color 0.2s;">
                    <i data-lucide="home" style="width:18px;height:18px;"></i> Trang chủ
                </a>
                <a href="/trips" style="text-decoration:none; color:${activeTab === 'trips' ? 'var(--primary)' : 'var(--gray-700)'}; font-weight:800; font-size:0.96rem; display:flex; align-items:center; gap:6px; transition:color 0.2s;">
                    <i data-lucide="map-pin" style="width:18px;height:18px;"></i> Chuyến đi
                </a>
                <a href="/hotels" style="text-decoration:none; color:${activeTab === 'hotels' ? 'var(--primary)' : 'var(--gray-700)'}; font-weight:800; font-size:0.96rem; display:flex; align-items:center; gap:6px; transition:color 0.2s;">
                    <i data-lucide="building-2" style="width:18px;height:18px;"></i> Khách sạn
                </a>
                <a href="/tracking" style="text-decoration:none; color:${activeTab === 'tracking' ? 'var(--primary)' : 'var(--gray-700)'}; font-weight:800; font-size:0.96rem; display:flex; align-items:center; gap:6px; transition:color 0.2s;">
                    <i data-lucide="navigation" style="width:18px;height:18px;color:var(--accent-dark);"></i> Định vị GPS xe
                </a>
            </div>

            <div style="display:flex; align-items:center; gap:16px;">
                <!-- Notification Bell with Dropdown -->
                <div style="position:relative;">
                    <button onclick="togglePreviewNotif()" id="btnPreviewNotif" title="Thông báo hệ thống" style="position:relative; width:46px; height:46px; border-radius:var(--radius-md); background:var(--gray-100); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--gray-800); transition:all 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--gray-100)'">
                        <i data-lucide="bell" style="width:20px;height:20px;"></i>
                        <span id="previewNotifBadge" style="position:absolute; top:-4px; right:-4px; background:var(--danger); color:white; width:22px; height:22px; border-radius:50%; font-size:0.72rem; font-weight:900; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 3px 8px rgba(239,68,68,0.4);">
                            ${MOCK_DATA.notifications.filter(n => !n.is_read).length}
                        </span>
                    </button>

                    <div id="previewNotifDropdown" style="display:none; position:absolute; right:0; top:54px; width:360px; background:white; border-radius:20px; box-shadow:var(--shadow-xl); border:1px solid var(--gray-200); z-index:9999; overflow:hidden;">
                        <div style="padding:14px 18px; border-bottom:1px solid var(--gray-100); display:flex; justify-content:space-between; align-items:center; background:#FAFAFA;">
                            <span style="font-weight:900; font-size:0.95rem; color:var(--gray-900);">🔔 Thông báo của bạn</span>
                            <button onclick="markAllPreviewNotifRead()" style="background:none; border:none; color:var(--primary); font-size:0.8rem; font-weight:700; cursor:pointer;">
                                Đọc tất cả
                            </button>
                        </div>
                        <div style="max-height:320px; overflow-y:auto; padding:6px 0;">
                            ${MOCK_DATA.notifications.map(n => `
                                <div style="padding:12px 16px; border-bottom:1px solid var(--gray-100); background:${n.is_read ? 'white' : '#F0F9FF'};">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                        <strong style="font-size:0.88rem; color:var(--gray-900);">${n.title}</strong>
                                        <span style="font-size:0.72rem; color:var(--gray-400);">${n.created_at.slice(-5)}</span>
                                    </div>
                                    <div style="font-size:0.82rem; color:var(--gray-600); margin-top:3px; line-height:1.4;">${n.message}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="padding:10px; border-top:1px solid var(--gray-100); text-align:center; background:#FAFAFA;">
                            <a href="/notifications" style="font-size:0.85rem; font-weight:800; color:var(--primary); text-decoration:none;">
                                Xem tất cả thông báo →
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Dark / Light Theme Toggle -->
                <button onclick="togglePreviewTheme()" id="btnPreviewTheme" title="Chuyển giao diện Sáng / Tối" style="width:46px; height:46px; border-radius:var(--radius-md); background:var(--gray-100); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--gray-800); transition:all 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--gray-100)'">
                    <i data-lucide="moon" id="previewThemeIcon" style="width:20px;height:20px;"></i>
                </button>

                <a href="/cart" style="position:relative; width:46px; height:46px; border-radius:var(--radius-md); background:var(--gray-100); display:flex; align-items:center; justify-content:center; color:var(--gray-800); text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--gray-100)'">
                    <i data-lucide="shopping-cart" style="width:20px;height:20px;"></i>
                    <span id="navCartBadge" style="position:absolute; top:-4px; right:-4px; background:var(--secondary); color:white; width:22px; height:22px; border-radius:50%; font-size:0.72rem; font-weight:900; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 3px 8px rgba(255,90,54,0.4);">${cartCount}</span>
                </a>

                <a href="/profile" style="display:flex; align-items:center; gap:8px; text-decoration:none; background:var(--gray-100); padding:6px 14px 6px 8px; border-radius:var(--radius-full);">
                    <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, var(--primary), #00F5D4); color:white; font-weight:900; display:flex; align-items:center; justify-content:center; font-size:0.85rem;">
                        A
                    </div>
                    <span style="font-size:0.88rem; font-weight:800; color:var(--gray-800);">Hồ sơ</span>
                </a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main>
        ${content}
    </main>

    <!-- Toast Notification Container -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- Footer -->
    <footer style="background:#050B14; color:#94A3B8; padding:90px 24px 36px; margin-top:120px; border-top:1px solid rgba(255,255,255,0.08);">
        <div style="max-width:1260px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr 1.3fr; gap:48px; padding-bottom:54px; border-bottom:1px solid #1E293B;">
            <div>
                <div style="display:flex; align-items:center; gap:12px; font-weight:900; font-size:1.6rem; color:white; margin-bottom:18px;">
                    <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, var(--accent), var(--primary)); display:flex; align-items:center; justify-content:center; color:#050B14;">
                        <i data-lucide="plane" style="width:20px;height:20px;stroke-width:2.5;"></i>
                    </div>
                    TravelGo
                </div>
                <p style="font-size:0.94rem; line-height:1.8; color:#64748B; max-width:380px;">Nền tảng đặt vé chuyến đi & khách sạn tự do hàng đầu Việt Nam. Tích hợp động cơ giữ chỗ 15 phút chống overbooking và Live GPS Tracking thời gian thực.</p>
            </div>
            <div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:24px;">Dịch vụ</h4>
                <div style="display:flex; flex-direction:column; gap:14px; font-size:0.92rem;">
                    <a href="/trips" style="color:#94A3B8; text-decoration:none;">Xe Limousine VIP</a>
                    <a href="/hotels" style="color:#94A3B8; text-decoration:none;">Khách sạn & Resort 5★</a>
                    <a href="/tracking" style="color:var(--accent); text-decoration:none; font-weight:800;">📍 Định vị GPS Xe thời gian thực</a>
                </div>
            </div>
            <div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:24px;">Bảng điều khiển</h4>
                <div style="display:flex; flex-direction:column; gap:14px; font-size:0.92rem;">
                    <a href="/admin" style="color:#94A3B8; text-decoration:none;">👑 Admin Quản trị GMV</a>
                    <a href="/partner" style="color:#94A3B8; text-decoration:none;">🤝 Cổng Đối tác Doanh thu</a>
                    <a href="/employee" style="color:#94A3B8; text-decoration:none;">💼 Nghiệp vụ Nhân viên</a>
                    <a href="/dashboard" style="color:#94A3B8; text-decoration:none;">👤 Khách hàng Thân thiết</a>
                </div>
            </div>
            <div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:24px;">Đồ án Chuyên ngành</h4>
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:20px; border-radius:16px; font-size:0.88rem; line-height:1.7;">
                    <div style="color:var(--accent); font-weight:800; margin-bottom:4px;">Mã đề tài: LV13-062</div>
                    <div>Công nghệ: PHP MVC + MySQL + Leaflet GPS</div>
                    <div style="color:#64748B; margin-top:6px;">Kiến trúc 5 Actors & 24 Use Cases</div>
                </div>
            </div>
        </div>
        <div style="max-width:1260px; margin:0 auto; padding-top:30px; text-align:center; font-size:0.85rem; color:#475569;">
            © 2026 TravelGo. Đồ án Chuyên ngành Công nghệ Phần mềm.
        </div>
    </footer>

    <script>
        lucide.createIcons();

        function showToast(message, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.style.borderColor = type === 'success' ? 'var(--accent)' : 'var(--secondary)';
            toast.innerHTML = \`
                <i data-lucide="\${type === 'success' ? 'check-circle-2' : 'alert-circle'}" style="width:20px;height:20px;color:\${type === 'success' ? 'var(--accent)' : 'var(--secondary)'};flex-shrink:0;"></i>
                <span>\${message}</span>
            \`;
            container.appendChild(toast);
            lucide.createIcons();

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        function togglePreviewNotif() {
            const dropdown = document.getElementById('previewNotifDropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            }
        }

        function markAllPreviewNotifRead() {
            const badge = document.getElementById('previewNotifBadge');
            if (badge) badge.style.display = 'none';
            showToast('Đã đánh dấu tất cả thông báo là đã đọc');
            setTimeout(() => {
                const dropdown = document.getElementById('previewNotifDropdown');
                if (dropdown) dropdown.style.display = 'none';
            }, 500);
        }

        document.addEventListener('click', (e) => {
            const btn = document.getElementById('btnPreviewNotif');
            const dropdown = document.getElementById('previewNotifDropdown');
            if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        function togglePreviewTheme() {
            const isDark = document.body.classList.toggle('dark-theme');
            localStorage.setItem('travelgo_theme', isDark ? 'dark' : 'light');
            const icon = document.getElementById('previewThemeIcon');
            if (icon) {
                icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
                lucide.createIcons();
            }
            showToast(isDark ? '🌙 Đã kích hoạt Dark Mode' : '☀️ Đã chuyển sang Light Mode');
        }

        if (localStorage.getItem('travelgo_theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }
    </script>
</body>
</html>`;
}

// 1. HOME PAGE
function handleHome() {
    const locCards = MOCK_DATA.locations.map(l => `
        <a href="/trips?arrival=${l.id}" class="card" style="text-decoration:none; overflow:hidden; border-radius:24px; position:relative; height:280px; border:none; box-shadow:var(--shadow-md);">
            <img src="${l.image}" alt="${l.name}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(5,11,20,0.92) 0%, rgba(5,11,20,0.2) 60%, transparent 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:28px; color:white;">
                <span class="badge badge-accent" style="width:fit-content; margin-bottom:8px; font-size:0.78rem; padding:4px 12px;">${l.count}</span>
                <h3 style="font-size:1.5rem; font-weight:900; margin-bottom:4px; color:white;">${l.name}</h3>
                <span style="font-size:0.88rem; color:var(--gray-300);">${l.province}</span>
            </div>
        </a>
    `).join('');

    const tripCards = MOCK_DATA.trips.map(t => `
        <div class="card card-luxury" style="overflow:hidden; background:white;">
            <div style="height:220px; position:relative; overflow:hidden;">
                <img src="${t.featured_image}" alt="${t.arrival_name}" style="width:100%; height:100%; object-fit:cover;">
                <span class="badge badge-primary" style="position:absolute; top:16px; left:16px; font-weight:800; font-size:0.8rem; box-shadow:var(--shadow-sm);">${t.vehicle_name}</span>
                <div style="position:absolute; bottom:14px; right:14px; background:rgba(5,11,20,0.8); backdrop-filter:blur(8px); color:#FBBF24; padding:5px 12px; border-radius:var(--radius-full); font-size:0.82rem; font-weight:800; display:flex; align-items:center; gap:4px;">
                    ★ ${t.rating} (${t.reviews_count})
                </div>
            </div>
            <div style="padding:28px;">
                <div style="font-size:0.84rem; color:var(--gray-500); margin-bottom:6px; font-weight:700;">${t.partner_name} • Mã: <span style="color:var(--primary); font-weight:800;">${t.trip_code}</span></div>
                <h3 style="font-size:1.35rem; font-weight:900; margin-bottom:10px;">${t.departure_name} → ${t.arrival_name}</h3>
                <div style="font-size:0.9rem; color:var(--primary); font-weight:800; margin-bottom:24px; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="clock" style="width:16px;height:16px;"></i> Khởi hành: ${t.departure_datetime}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--gray-100); padding-top:20px;">
                    <div>
                        <div style="font-size:0.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">GIÁ VÉ CHỈ TỪ</div>
                        <div style="font-size:1.55rem; font-weight:900; color:var(--secondary);">${formatMoney(t.price_per_person)}</div>
                    </div>
                    <a href="/cart/add-trip?id=${t.id}" class="btn btn-primary btn-sm" style="padding:11px 22px;">+ Đặt chuyến ngay</a>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <!-- Hero Section -->
        <section style="background:linear-gradient(135deg, #050B14 0%, #0A192F 45%, #0052CC 100%); color:white; padding:110px 24px 150px; text-align:center; position:relative; overflow:hidden;">
            <div style="position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle, rgba(0,245,212,0.18) 0%, transparent 70%); top:-150px; right:-150px; pointer-events:none;"></div>
            <div style="position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle, rgba(255,90,54,0.18) 0%, transparent 70%); bottom:-150px; left:-150px; pointer-events:none;"></div>

            <div style="max-width:1040px; margin:0 auto; position:relative; z-index:2;">
                <div class="animate-float" style="display:inline-flex; align-items:center; gap:10px; background:rgba(255,255,255,0.08); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.2); padding:8px 24px; border-radius:var(--radius-full); font-size:0.88rem; font-weight:800; margin-bottom:28px; color:var(--accent); box-shadow:0 8px 24px rgba(0,0,0,0.3);">
                    <i data-lucide="sparkles" style="width:18px;height:18px;"></i> NỀN TẢNG DU LỊCH ĐỘC QUYỀN THẾ HỆ MỚI
                </div>

                <h1 style="font-size:4rem; font-weight:900; line-height:1.15; margin-bottom:24px; color:white; letter-spacing:-0.03em;">
                    Khám phá Việt Nam theo cách <br><span class="text-gradient-cyan">Đẳng cấp & Tự do</span>
                </h1>
                
                <p style="font-size:1.25rem; color:#CBD5E1; margin-bottom:52px; line-height:1.7; max-width:760px; margin-left:auto; margin-right:auto; font-weight:400;">
                    Đặt xe Limousine thượng hạng, xe giường phòng VIP và khách sạn 5 sao trong cùng một đơn hàng với cơ chế giữ chỗ 15 phút nguyên tử & Live GPS Tracking.
                </p>

                <!-- Search Widget with Interactive Tabs -->
                <div class="card glass-panel" style="padding:32px; border-radius:28px; box-shadow:0 30px 70px -15px rgba(0, 0, 0, 0.5); text-align:left; border:1px solid rgba(255,255,255,0.9);">
                    <div style="display:flex; gap:10px; margin-bottom:24px; border-bottom:1px solid var(--gray-200); padding-bottom:16px;">
                        <button type="button" class="btn btn-primary btn-sm" style="border-radius:var(--radius-full); font-size:0.88rem;">
                            <i data-lucide="bus" style="width:16px;height:16px;"></i> Chuyến xe Limousine
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" style="border-radius:var(--radius-full); font-size:0.88rem;" onclick="window.location.href='/hotels'">
                            <i data-lucide="building" style="width:16px;height:16px;"></i> Khách sạn & Resort
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" style="border-radius:var(--radius-full); font-size:0.88rem;" onclick="window.location.href='/tracking'">
                            <i data-lucide="navigation" style="width:16px;height:16px;color:var(--accent-dark);"></i> Định vị GPS Trực tiếp
                        </button>
                    </div>

                    <form action="/trips" method="GET" style="display:grid; grid-template-columns:1.2fr 1.2fr 1fr auto; gap:20px; align-items:end;">
                        <div class="form-group" style="margin-bottom:0;">
                            <label style="font-size:0.82rem; font-weight:800; color:var(--gray-600); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;">
                                <i data-lucide="map-pin" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> ĐIỂM KHỞI HÀNH
                            </label>
                            <select class="form-control" style="height:54px; font-weight:700;">
                                <option>TP. Hồ Chí Minh</option>
                                <option>Hà Nội</option>
                                <option>Đà Nẵng</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label style="font-size:0.82rem; font-weight:800; color:var(--gray-600); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;">
                                <i data-lucide="navigation" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> ĐIỂM ĐẾN
                            </label>
                            <select class="form-control" style="height:54px; font-weight:700;">
                                <option>Đà Lạt</option>
                                <option>Nha Trang</option>
                                <option>Phú Quốc</option>
                                <option>Đà Nẵng</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                            <label style="font-size:0.82rem; font-weight:800; color:var(--gray-600); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;">
                                <i data-lucide="calendar" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> NGÀY ĐI
                            </label>
                            <input type="date" value="2026-09-05" class="form-control" style="height:54px; font-weight:700;">
                        </div>
                        <button type="submit" class="btn btn-secondary btn-lg" style="height:54px; padding:0 36px; font-size:1.05rem; font-weight:900;">
                            <i data-lucide="search" style="width:20px;height:20px;"></i> Tìm chuyến
                        </button>
                    </form>
                </div>
            </div>
        </section>

        <!-- Destinations Bento Grid -->
        <section style="max-width:1260px; margin:100px auto 0; padding:0 24px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px;">
                <div>
                    <span class="badge badge-primary" style="margin-bottom:10px;">ĐIỂM ĐẾN THỊNH HÀNH</span>
                    <h2 style="font-size:2.6rem; font-weight:900;">Khám phá <span class="text-gradient">Việt Nam</span></h2>
                    <p style="color:var(--gray-500); font-size:1.05rem; margin-top:4px;">Những địa danh thơ mộng được hàng triệu du khách bình chọn</p>
                </div>
                <a href="/trips" class="btn btn-outline btn-sm" style="font-weight:800;">Khám phá tất cả điểm đến →</a>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:28px;">
                ${locCards}
            </div>
        </section>

        <!-- Featured Trips -->
        <section style="max-width:1260px; margin:110px auto; padding:0 24px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px;">
                <div>
                    <span class="badge badge-secondary" style="margin-bottom:10px;">TUYẾN ĐƯỜNG CAO CẤP</span>
                    <h2 style="font-size:2.6rem; font-weight:900;">Chuyến đi <span class="text-gradient">Được yêu thích nhất</span></h2>
                    <p style="color:var(--gray-500); font-size:1.05rem; margin-top:4px;">Xe limousine và giường nằm chất lượng cao đã qua kiểm định chất lượng 5★</p>
                </div>
                <a href="/trips" class="btn btn-outline btn-sm" style="font-weight:800;">Xem tất cả chuyến đi →</a>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:32px;">
                ${tripCards}
            </div>
        </section>
    `;
}

// 2. TRIPS PAGE
function handleTrips() {
    const tripCards = MOCK_DATA.trips.map(t => `
        <div class="card card-luxury" data-trip-type="${t.type_tag}" style="overflow:hidden; background:white; margin-bottom:28px; display:grid; grid-template-columns:300px 1fr 240px; gap:28px; align-items:center; padding:24px;">
            <div style="height:200px; border-radius:16px; overflow:hidden; position:relative;">
                <img src="${t.featured_image}" alt="${t.arrival_name}" style="width:100%; height:100%; object-fit:cover;">
                <span class="badge badge-primary" style="position:absolute; top:12px; left:12px; font-weight:800;">${t.vehicle_name}</span>
            </div>
            <div>
                <div style="font-size:0.85rem; color:var(--gray-500); font-weight:700; margin-bottom:6px;">
                    ${t.partner_name} • Mã chuyến: <strong style="color:var(--primary);">${t.trip_code}</strong>
                </div>
                <h3 style="font-size:1.5rem; font-weight:900; margin-bottom:10px;">${t.departure_name} → ${t.arrival_name}</h3>
                <p style="font-size:0.9rem; color:var(--gray-600); margin-bottom:16px; line-height:1.6;">${t.description}</p>
                <div style="display:flex; gap:16px; align-items:center;">
                    <div style="font-size:0.92rem; color:var(--primary); font-weight:800; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="clock" style="width:16px;height:16px;"></i> Khởi hành: ${t.departure_datetime}
                    </div>
                    <a href="/tracking" style="font-size:0.85rem; color:var(--accent-dark); font-weight:800; text-decoration:none; display:flex; align-items:center; gap:4px;">
                        <span class="live-pulse" style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent-dark);"></span>
                        Xem GPS thời gian thực
                    </a>
                </div>
            </div>
            <div style="text-align:right; border-left:1px solid var(--gray-100); padding-left:28px;">
                <div style="font-size:0.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">GIÁ MỖI VÉ</div>
                <div style="font-size:1.85rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">${formatMoney(t.price_per_person)}</div>
                <div style="font-size:0.88rem; color:var(--success); font-weight:800; margin-bottom:18px;">Còn ${t.available_seats} chỗ trống</div>
                <a href="/cart/add-trip?id=${t.id}" class="btn btn-primary btn-full btn-sm" style="font-weight:900; padding:13px;">+ Thêm vào giỏ & Đặt chỗ</a>
            </div>
        </div>
    `).join('');

    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:36px;">
                <div>
                    <h1 style="font-size:2.6rem; font-weight:900; margin-bottom:6px;">Danh sách <span class="text-gradient">Chuyến đi & Tour Tự do</span></h1>
                    <p style="color:var(--gray-500); font-size:1.05rem;">Tìm thấy <strong>${MOCK_DATA.trips.length} chuyến xe</strong> chất lượng cao</p>
                </div>
                <!-- Filter Pills -->
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="filterTrips('all', this)">Tất cả (${MOCK_DATA.trips.length})</button>
                    <button class="btn btn-outline btn-sm" onclick="filterTrips('limousine', this)">Limousine</button>
                    <button class="btn btn-outline btn-sm" onclick="filterTrips('sleeper', this)">Giường phòng</button>
                    <button class="btn btn-outline btn-sm" onclick="filterTrips('flight', this)">Máy bay</button>
                </div>
            </div>
            <div id="tripListContainer">
                ${tripCards}
            </div>
        </div>

        <script>
            function filterTrips(type, btn) {
                document.querySelectorAll('.btn-sm').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-outline');
                });
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-primary');

                const cards = document.querySelectorAll('[data-trip-type]');
                cards.forEach(card => {
                    if (type === 'all' || card.getAttribute('data-trip-type') === type) {
                        card.style.display = 'grid';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        </script>
    `;
}

// 3. HOTELS PAGE
function handleHotels() {
    const hotelCards = MOCK_DATA.hotels.map(h => `
        <div class="card card-luxury" style="overflow:hidden; background:white; margin-bottom:32px; display:grid; grid-template-columns:340px 1fr 260px; gap:28px; align-items:center; padding:24px;">
            <div style="height:220px; border-radius:16px; overflow:hidden; position:relative;">
                <img src="${h.featured_image}" alt="${h.name}" style="width:100%; height:100%; object-fit:cover;">
                <div style="position:absolute; top:14px; left:14px; background:rgba(5,11,20,0.85); backdrop-filter:blur(8px); color:#FBBF24; padding:5px 14px; border-radius:var(--radius-full); font-size:0.82rem; font-weight:900;">
                    ★ ${h.star_rating} SAO LUXURY
                </div>
            </div>
            <div>
                <span class="badge badge-accent" style="margin-bottom:8px;">${h.location_name}</span>
                <h3 style="font-size:1.5rem; font-weight:900; margin-bottom:8px;">${h.name}</h3>
                <div style="font-size:0.88rem; color:var(--gray-500); margin-bottom:14px; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="map-pin" style="width:16px;height:16px;color:var(--primary);"></i> ${h.address}
                </div>
                <p style="font-size:0.9rem; color:var(--gray-600); line-height:1.7;">${h.description}</p>
                <div style="margin-top:10px; font-size:0.85rem; color:var(--primary); font-weight:700;">
                    Loại phòng: <strong>${h.room_name}</strong>
                </div>
            </div>
            <div style="text-align:right; border-left:1px solid var(--gray-100); padding-left:28px;">
                <div style="font-size:0.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">GIÁ MỖI ĐÊM TỪ</div>
                <div style="font-size:1.9rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">${formatMoney(h.min_price)}</div>
                <div style="font-size:0.88rem; color:var(--primary); font-weight:800; margin-bottom:18px;">Bao gồm ăn sáng 5★</div>
                <a href="/cart/add-hotel?id=${h.id}" class="btn btn-secondary btn-full btn-sm" style="font-weight:900; padding:13px;">+ Thêm phòng vào Giỏ</a>
            </div>
        </div>
    `).join('');

    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            <div style="margin-bottom:36px;">
                <h1 style="font-size:2.6rem; font-weight:900; margin-bottom:6px;">Khách sạn & <span class="text-gradient">Resort Cao cấp</span></h1>
                <p style="color:var(--gray-500); font-size:1.05rem;">Điểm lưu trú sang trọng nhất trên khắp danh thắng Việt Nam</p>
            </div>
            ${hotelCards}
        </div>
    `;
}

// 4. MULTI-SERVICE COMBINED CART (Trip + Hotel Together)
function handleCart() {
    const totalAmount = calculateCartTotal();

    if (CART_ITEMS.length === 0) {
        return `
            <div style="max-width:700px; margin:70px auto; padding:48px 24px; text-align:center;">
                <div style="width:80px; height:80px; border-radius:50%; background:var(--primary-50); color:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                    <i data-lucide="shopping-cart" style="width:40px;height:40px;"></i>
                </div>
                <h2 style="font-size:2rem; font-weight:900; margin-bottom:8px;">Giỏ hàng của bạn đang trống</h2>
                <p style="color:var(--gray-500); margin-bottom:32px;">Hãy chọn cho mình một chuyến xe Limousine và khách sạn yêu thích.</p>
                <div style="display:flex; justify-content:center; gap:16px;">
                    <a href="/trips" class="btn btn-primary">+ Khám phá Chuyến đi</a>
                    <a href="/hotels" class="btn btn-outline">+ Xem Khách sạn</a>
                </div>
            </div>
        `;
    }

    const itemsHtml = CART_ITEMS.map((item, index) => `
        <div class="card" style="padding:24px; display:grid; grid-template-columns:110px 1fr auto; gap:24px; align-items:center; margin-bottom:18px; background:white; border-radius:20px;">
            <div style="border-radius:14px; overflow:hidden; aspect-ratio:1/1;">
                <img src="${item.image}" alt="Item" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div>
                <span class="badge ${item.type === 'trip' ? 'badge-primary' : 'badge-success'}" style="margin-bottom:6px;">
                    ${item.type === 'trip' ? '🚗 VÉ CHUYẾN ĐI' : '🏨 PHÒNG KHÁCH SẠN'}
                </span>
                <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:4px;">${item.title}</h3>
                <p style="color:var(--gray-500); font-size:0.9rem; margin-bottom:4px;">${item.subtitle}</p>
                <div style="font-size:0.85rem; color:var(--primary); font-weight:800;">
                    <i data-lucide="calendar" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> ${item.time}
                </div>
                <div style="font-size:0.88rem; color:var(--gray-600); margin-top:6px;">
                    Đơn giá: <strong>${formatMoney(item.unit_price)}</strong> × ${item.quantity} ${item.type === 'trip' ? 'vé khách' : 'phòng'}
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:1.45rem; font-weight:900; color:var(--secondary); margin-bottom:10px;">
                    ${formatMoney(item.subtotal)}
                </div>
                <a href="/cart/remove?key=${item.key}" class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--gray-200); padding:6px 12px;" title="Xóa">
                    <i data-lucide="trash-2" style="width:16px;height:16px;"></i> Xóa
                </a>
            </div>
        </div>
    `).join('');

    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                <div>
                    <h1 style="font-size:2.4rem; font-weight:900; margin-bottom:4px;">🛒 Giỏ hàng <span class="text-gradient">Đa dịch vụ</span></h1>
                    <p style="color:var(--gray-500); font-size:1rem;">Bạn có thể gộp cả <strong>Chuyến xe Limousine</strong> và <strong>Khách sạn Resort</strong> trong cùng một đơn giữ chỗ 15 phút</p>
                </div>
                <a href="/cart/clear" class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--gray-200);">Xóa tất cả</a>
            </div>

            <div style="display:grid; grid-template-columns:1fr 380px; gap:36px; align-items:start;">
                
                <!-- Left: Items list -->
                <div>
                    ${itemsHtml}
                    <div style="display:flex; gap:16px; margin-top:24px;">
                        <a href="/trips" class="btn btn-outline btn-sm">+ Thêm chuyến đi khác</a>
                        <a href="/hotels" class="btn btn-outline btn-sm">+ Thêm khách sạn khác</a>
                    </div>
                </div>

                <!-- Right: Summary & Proceed to 15-min Lock -->
                <div style="position:sticky; top:120px;">
                    <div class="card" style="padding:32px; background:white; border-radius:24px; border:2px solid var(--primary-100); box-shadow:var(--shadow-xl);">
                        <h3 style="font-size:1.35rem; font-weight:900; margin-bottom:20px; border-bottom:1px solid var(--gray-100); padding-bottom:12px;">
                            Tóm tắt đơn đặt chỗ
                        </h3>

                        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.95rem; color:var(--gray-600);">
                            <span>Số lượng dịch vụ:</span>
                            <strong style="color:var(--gray-900);">${CART_ITEMS.length} dịch vụ</strong>
                        </div>

                        <div style="display:flex; justify-content:space-between; margin-bottom:18px; font-size:0.95rem; color:var(--gray-600);">
                            <span>Tạm tính:</span>
                            <strong id="cartPreviewSubtotal" style="color:var(--gray-900);">${formatMoney(totalAmount)}</strong>
                        </div>

                        <!-- Coupon Input Block -->
                        <div style="background:var(--gray-50); padding:16px; border-radius:16px; margin-bottom:18px; border:1px solid var(--gray-200);">
                            <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                                <i data-lucide="tag" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Mã khuyến mãi (Voucher)
                            </label>
                            
                            <div style="display:flex; gap:8px; margin-bottom:8px;">
                                <input type="text" id="previewCouponInput" class="form-control" placeholder="Nhập mã (VD: TRAVELGO100)..." style="text-transform:uppercase; font-weight:800; font-size:0.9rem; padding:8px 12px;">
                                <button type="button" onclick="applyPreviewCoupon()" class="btn btn-primary btn-sm" style="font-weight:800; padding:8px 14px; white-space:nowrap;">
                                    Áp dụng
                                </button>
                            </div>

                            <div id="previewCouponMsg" style="font-size:0.8rem; margin-bottom:6px;"></div>

                            <!-- Quick Badges -->
                            <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
                                <span style="font-size:0.75rem; color:var(--gray-500);">Gợi ý:</span>
                                <button type="button" onclick="document.getElementById('previewCouponInput').value='TRAVELGO100'; applyPreviewCoupon();" class="badge badge-primary" style="border:none; cursor:pointer; font-size:0.75rem; padding:2px 8px;">
                                    TRAVELGO100 (-100k)
                                </button>
                                <button type="button" onclick="document.getElementById('previewCouponInput').value='SUMMER20'; applyPreviewCoupon();" class="badge badge-secondary" style="border:none; cursor:pointer; font-size:0.75rem; padding:2px 8px;">
                                    SUMMER20 (-20%)
                                </button>
                            </div>
                        </div>

                        <!-- Discount Line -->
                        <div id="previewDiscountLine" style="display:none; justify-content:space-between; margin-bottom:14px; font-size:0.95rem; color:var(--success);">
                            <span style="font-weight:700;">Giảm giá voucher:</span>
                            <strong id="previewDiscountValue">-0₫</strong>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:16px; border-top:2px solid var(--gray-100); margin-bottom:24px;">
                            <span style="font-weight:800; font-size:1.1rem;">Tổng thanh toán:</span>
                            <span id="previewCartFinal" style="font-size:2rem; font-weight:900; color:var(--secondary);">
                                ${formatMoney(totalAmount)}
                            </span>
                        </div>

                        <a href="/booking/checkout" class="btn btn-primary btn-lg btn-full" style="font-weight:900; padding:15px; border-radius:16px; text-decoration:none; display:block; text-align:center;">
                            Tiến hành Giữ chỗ 15 phút →
                        </a>

                        <script>
                            const originalTotal = ${totalAmount};
                            function applyPreviewCoupon() {
                                const input = document.getElementById('previewCouponInput');
                                const msg = document.getElementById('previewCouponMsg');
                                const discLine = document.getElementById('previewDiscountLine');
                                const discVal = document.getElementById('previewDiscountValue');
                                const finalEl = document.getElementById('previewCartFinal');
                                const code = input.value.trim().toUpperCase();

                                if (!code) {
                                    msg.innerHTML = '<span style="color:var(--danger)">Vui lòng nhập mã voucher</span>';
                                    return;
                                }

                                let discount = 0;
                                if (code === 'TRAVELGO100') {
                                    discount = 100000;
                                } else if (code === 'SUMMER20') {
                                    discount = Math.min(200000, Math.round(originalTotal * 0.2));
                                } else if (code === 'VIPLUXURY') {
                                    discount = 300000;
                                } else {
                                    msg.innerHTML = '<span style="color:var(--danger)">✕ Mã voucher không hợp lệ hoặc đã hết hạn</span>';
                                    discLine.style.display = 'none';
                                    finalEl.textContent = originalTotal.toLocaleString('vi-VN') + '₫';
                                    return;
                                }

                                const finalAmt = Math.max(0, originalTotal - discount);
                                discLine.style.display = 'flex';
                                discVal.textContent = '-' + discount.toLocaleString('vi-VN') + '₫';
                                finalEl.textContent = finalAmt.toLocaleString('vi-VN') + '₫';
                                msg.innerHTML = '<span style="color:var(--success);font-weight:700;">✓ Áp dụng thành công mã ' + code + '! Tiết kiệm ' + discount.toLocaleString('vi-VN') + '₫</span>';
                                showToast('Đã áp dụng mã giảm giá ' + code + ' thành công!');
                            }
                        </script>

                        <div style="font-size:0.8rem; color:var(--gray-500); text-align:center; margin-top:16px; line-height:1.5;">
                            <i data-lucide="shield-check" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--success);"></i>
                            Khóa chỗ nguyên tử chống overbooking tự động.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

// 5. CHECKOUT PAGE (15-Minute Hold Confirmation)
function handleCheckout() {
    const totalAmount = calculateCartTotal();

    return `
        <div style="max-width:1000px; margin:40px auto; padding:0 24px;">
            <div style="margin-bottom:32px; text-align:center;">
                <span class="badge badge-primary" style="margin-bottom:8px;">XÁC NHẬN THÔNG TIN ĐẶT CHỖ</span>
                <h1 style="font-size:2.4rem; font-weight:900;">Khóa chỗ & <span class="text-gradient">Giữ vé 15 phút</span></h1>
                <p style="color:var(--gray-500);">Kiểm tra lại thông tin liên hệ nhận vé E-Ticket và mã QR</p>
            </div>

            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:36px; align-items:start;">
                
                <!-- Contact Form -->
                <div class="card" style="padding:36px; background:white; border-radius:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:20px;">👤 Thông tin Người liên hệ nhận vé</h3>

                    <form onsubmit="event.preventDefault(); window.location.href='/payment/checkout';">
                        <div class="form-group">
                            <label>Họ và tên hành khách</label>
                            <input type="text" class="form-control" value="Nguyễn Văn An" required>
                        </div>

                        <div class="grid grid-2" style="gap:16px;">
                            <div class="form-group">
                                <label>Số điện thoại</label>
                                <input type="tel" class="form-control" value="0901234567" required>
                            </div>
                            <div class="form-group">
                                <label>Email nhận vé điện tử</label>
                                <input type="email" class="form-control" value="an.nguyen@gmail.com" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Ghi chú cho nhà xe / khách sạn (Tùy chọn)</label>
                            <textarea class="form-control" rows="2" placeholder="Ví dụ: Đón tại ngã tư Thủ Đức, phòng tầng cao yên tĩnh..."></textarea>
                        </div>

                        <div style="background:var(--primary-50); padding:16px; border-radius:var(--radius-md); margin-bottom:20px; font-size:0.85rem; color:var(--gray-700); line-height:1.6;">
                            ⏱️ <strong>Cơ chế Giữ chỗ 15 phút:</strong> Khi bấm nút bên dưới, hệ thống sẽ tự động khóa ghế và phòng cho bạn trong 15 phút để bạn tiến hành thanh toán an toàn.
                        </div>

                        <button type="submit" class="btn btn-secondary btn-lg btn-full" style="font-weight:900; padding:16px;">
                            ⚡ Xác nhận Giữ chỗ 15 phút & Tiến hành Thanh toán
                        </button>
                    </form>
                </div>

                <!-- Order Review Box -->
                <div class="card" style="padding:32px; background:var(--gray-50); border-radius:24px; border:1px solid var(--gray-200);">
                    <h3 style="font-size:1.2rem; font-weight:900; margin-bottom:16px;">Chi tiết Đơn hàng (${CART_ITEMS.length} dịch vụ)</h3>

                    ${CART_ITEMS.map(item => `
                        <div style="padding:14px 0; border-bottom:1px solid var(--gray-200); display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:800; font-size:0.95rem;">${item.title}</div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">${item.subtitle}</div>
                            </div>
                            <div style="font-weight:900; color:var(--secondary);">${formatMoney(item.subtotal)}</div>
                        </div>
                    `).join('')}

                    <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:16px; border-top:2px solid var(--gray-300);">
                        <span style="font-size:1.1rem; font-weight:800;">Tổng thanh toán:</span>
                        <span style="font-size:1.8rem; font-weight:900; color:var(--secondary);">${formatMoney(totalAmount)}</span>
                    </div>
                </div>

            </div>
        </div>
    `;
}

// 6. E-TICKET & BOOKING DETAIL (With QR and GPS Tracking Link)
function handleBookingDetail(code = 'TG-2026-8899') {
    return `
        <div style="max-width:960px; margin:40px auto; padding:0 24px;">
            
            <!-- Booking Success Banner -->
            <div class="card" style="padding:32px; background:linear-gradient(135deg, #050B14 0%, #0F172A 100%); color:white; border-radius:28px; margin-bottom:32px; border:2px solid var(--accent);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                    <div>
                        <span class="badge badge-accent" style="margin-bottom:8px; font-size:0.85rem;">✓ ĐÃ KHÓA CHỖ THÀNH CÔNG (15 PHÚT)</span>
                        <div style="font-size:0.85rem; color:#94A3B8; text-transform:uppercase;">MÃ ĐƠN ĐẶT CHỖ CHÍNH THỨC</div>
                        <h1 style="color:white; font-size:2.8rem; font-weight:900; margin:4px 0 6px; letter-spacing:0.02em;">${code}</h1>
                        <p style="color:#CBD5E1; font-size:0.95rem; margin-bottom:0;">Khách hàng: <strong>Nguyễn Văn An</strong> (0901234567 • an.nguyen@gmail.com)</p>
                    </div>

                    <!-- Countdown Timer -->
                    <div style="background:rgba(255,255,255,0.06); padding:18px 24px; border-radius:20px; border:1px solid rgba(255,255,255,0.15); text-align:center;">
                        <div style="font-size:0.75rem; color:#94A3B8; text-transform:uppercase; font-weight:800;">THỜI GIAN GIỮ CHỖ CÒN LẠI</div>
                        <div style="font-size:2.4rem; font-weight:900; color:var(--accent); font-family:monospace;" id="countdownTimer">14:59</div>
                        <div style="font-size:0.75rem; color:#94A3B8;">Chống Overbooking 100%</div>
                    </div>
                </div>
            </div>

            <!-- E-Ticket Card -->
            <div style="display:grid; grid-template-columns:1fr 320px; gap:28px; margin-bottom:32px;">
                
                <div class="card" style="padding:32px; background:white; border-radius:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="ticket" style="width:20px;height:20px;color:var(--primary);"></i> Chi tiết Dịch vụ Đã đặt
                    </h3>

                    <!-- Trip Item -->
                    <div style="background:var(--gray-50); padding:20px; border-radius:18px; margin-bottom:16px; border-left:4px solid var(--primary);">
                        <span class="badge badge-primary" style="margin-bottom:6px;">🚗 CHUYẾN XE LIMOUSINE</span>
                        <h4 style="font-size:1.25rem; font-weight:900; margin-bottom:4px;">TP. Hồ Chí Minh → Đà Lạt</h4>
                        <div style="font-size:0.9rem; color:var(--gray-600); margin-bottom:4px;">Xe Limousine 9 chỗ VIP • Saigontourist Transport • Biển số: <strong>51B-888.99</strong></div>
                        <div style="font-size:0.92rem; color:var(--primary); font-weight:800;">Khởi hành: 05/09/2026 lúc 07:30 sáng (Bến xe Quận 1)</div>
                    </div>

                    <!-- Hotel Item -->
                    <div style="background:var(--gray-50); padding:20px; border-radius:18px; margin-bottom:20px; border-left:4px solid var(--success);">
                        <span class="badge badge-success" style="margin-bottom:6px;">🏨 PHÒNG KHÁCH SẠN</span>
                        <h4 style="font-size:1.25rem; font-weight:900; margin-bottom:4px;">Vinpearl Resort & Spa Nha Trang Bay</h4>
                        <div style="font-size:0.9rem; color:var(--gray-600); margin-bottom:4px;">Phòng Deluxe Hướng Biển (1 phòng • 2 đêm)</div>
                        <div style="font-size:0.92rem; color:var(--success); font-weight:800;">Nhận phòng: 05/09/2026 (14:00) • Trả phòng: 07/09/2026 (12:00)</div>
                    </div>

                    <div style="display:flex; gap:16px;">
                        <a href="/tracking" class="btn btn-primary btn-lg" style="flex:1; font-weight:900;">
                            <i data-lucide="navigation" style="width:20px;height:20px;"></i> 📍 Mở Live GPS Định vị xe
                        </a>
                        <button class="btn btn-outline btn-lg" onclick="showToast('Đã in hóa đơn E-Ticket!', 'success')">
                            <i data-lucide="printer" style="width:20px;height:20px;"></i> In vé
                        </button>
                    </div>
                </div>

                <!-- QR Soát vé -->
                <div class="card" style="padding:32px; background:white; border-radius:24px; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <div style="font-size:0.8rem; color:var(--gray-400); text-transform:uppercase; font-weight:800; margin-bottom:12px;">MÃ QR SOÁT VÉ NHANH</div>
                    
                    <!-- Real SVG QR Code Pattern -->
                    <div style="background:white; padding:16px; border:2px solid var(--gray-200); border-radius:16px; box-shadow:var(--shadow-sm); margin-bottom:14px;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TRAVELGO-ETICKET-TG-2026-8899" alt="QR Code" style="width:160px; height:160px; display:block;">
                    </div>

                    <div style="font-size:0.85rem; font-weight:900; color:var(--gray-900);">Quét để Soát vé lên xe</div>
                    <div style="font-size:0.75rem; color:var(--gray-500); margin-top:4px;">Áp dụng cho nhân viên soát vé và lễ tân</div>
                </div>

            </div>

        </div>

        <script>
            // Live 15-Minute Countdown
            let secondsLeft = 15 * 60;
            const timerEl = document.getElementById('countdownTimer');
            setInterval(() => {
                if (secondsLeft > 0) {
                    secondsLeft--;
                    const mins = Math.floor(secondsLeft / 60);
                    const secs = secondsLeft % 60;
                    timerEl.innerText = \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
                }
            }, 1000);
        </script>
    `;
}

// 7. PHASE 3: LIVE GPS VEHICLE TRACKING (Google Maps Domestic Vietnam Routes & Live Telemetry)
function handleTracking() {
    return `
        <!-- Header Banner -->
        <section style="background: linear-gradient(135deg, #050B14 0%, #0A192F 50%, #0052CC 100%); padding: 36px 0 36px; color:white; border-bottom:1px solid rgba(255,255,255,0.08); position:relative; overflow:hidden;">
            <div style="max-width:1260px; margin:0 auto; padding:0 24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                            <span class="badge" style="background:rgba(0,245,212,0.15); color:var(--accent); border:1px solid rgba(0,245,212,0.4); font-size:0.8rem; padding:4px 12px;">
                                <span class="live-pulse" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent); margin-right:6px;"></span>
                                GOOGLE MAPS LIVE GPS (NỘI ĐỊA VIỆT NAM)
                            </span>
                            <span style="color:#CBD5E1; font-size:0.88rem;">Phạm vi: <strong style="color:var(--accent);">100% Tuyến đường Việt Nam</strong></span>
                        </div>
                        <h1 style="color:white; font-size:2.3rem; font-weight:900; margin-bottom:4px;" id="mainRouteTitle">
                            TP. Hồ Chí Minh → Đà Lạt
                        </h1>
                        <p style="color:#94A3B8; font-size:0.95rem; margin-bottom:0;" id="mainRouteSubtitle">
                            Xe Limousine 9 chỗ VIP • Tuyến cao tốc & quốc lộ nội địa • Biển số: <strong style="color:var(--accent);">51B-888.99</strong>
                        </p>
                    </div>

                    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                        <a id="btnOpenGmap" href="https://www.google.com/maps/dir/?api=1&origin=TP+Ho+Chi+Minh&destination=Da+Lat&travelmode=driving" target="_blank" class="btn btn-secondary btn-sm" style="font-weight:900;">
                            <i data-lucide="map" style="width:16px;height:16px;"></i> Mở Google Maps thật ↗
                        </a>
                        <button class="btn btn-primary btn-sm" onclick="toggleSimSpeed()" id="btnSpeed">
                            <i data-lucide="fast-forward" style="width:16px;height:16px;"></i> Tốc độ: 1x
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Route Selector & Control Bar -->
        <section style="background:white; border-bottom:1px solid var(--gray-200); padding:16px 0; box-shadow:var(--shadow-sm); position:sticky; top:110px; z-index:990;">
            <div style="max-width:1260px; margin:0 auto; padding:0 24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                    
                    <!-- Quick Route Selector -->
                    <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                        <span style="font-size:0.85rem; font-weight:800; color:var(--gray-600); text-transform:uppercase;">
                            <i data-lucide="navigation" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Tuyến nội địa:
                        </span>
                        <select id="routeSelect" onchange="changeDomesticRoute(this.value)" class="form-control" style="font-weight:800; font-size:0.92rem; height:42px; width:auto; min-width:280px; border-color:var(--primary);">
                            <option value="sg_dl">TP. Hồ Chí Minh ⇄ Đà Lạt (308 km • 6h)</option>
                            <option value="sg_nt">TP. Hồ Chí Minh ⇄ Nha Trang (435 km • 8h)</option>
                            <option value="sg_vt">TP. Hồ Chí Minh ⇄ Vũng Tàu (95 km • 2h)</option>
                            <option value="sg_pt">TP. Hồ Chí Minh ⇄ Phan Thiết / Mũi Né (215 km • 3.5h)</option>
                            <option value="sg_ct">TP. Hồ Chí Minh ⇄ Cần Thơ (165 km • 3h)</option>
                            <option value="hn_sp">Hà Nội ⇄ Sapa / Fansipan (315 km • 5.5h)</option>
                            <option value="hn_hl">Hà Nội ⇄ Hạ Long / Bãi Cháy (160 km • 2.5h)</option>
                            <option value="hn_dn">Hà Nội ⇄ Đà Nẵng (765 km • 14h)</option>
                            <option value="dn_hue">Đà Nẵng ⇄ Cố đô Huế (100 km • 2h)</option>
                            <option value="dn_qn">Đà Nẵng ⇄ Quy Nhơn (320 km • 5.5h)</option>
                        </select>
                    </div>

                    <!-- Map Layer Switcher -->
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.82rem; color:var(--gray-500); font-weight:700;">Chế độ bản đồ:</span>
                        <div style="display:flex; background:var(--gray-100); padding:3px; border-radius:var(--radius-md);">
                            <button type="button" class="btn btn-sm" id="btnLayerGmap" onclick="switchMapLayer('gmap_street')" style="padding:4px 12px; font-size:0.8rem; font-weight:800; background:white; color:var(--primary); box-shadow:var(--shadow-sm); border:none;">
                                🗺️ Google Chuẩn
                            </button>
                            <button type="button" class="btn btn-sm" id="btnLayerSat" onclick="switchMapLayer('gmap_sat')" style="padding:4px 12px; font-size:0.8rem; font-weight:800; background:transparent; color:var(--gray-600); border:none;">
                                🛰️ Vệ tinh
                            </button>
                            <button type="button" class="btn btn-sm" id="btnLayerDark" onclick="switchMapLayer('carto_dark')" style="padding:4px 12px; font-size:0.8rem; font-weight:800; background:transparent; color:var(--gray-600); border:none;">
                                🌙 Dark Mode
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <!-- Main Tracking Content -->
        <section style="max-width:1260px; margin:28px auto 60px; padding:0 24px;">
            
            <!-- Telemetry HUD Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-bottom:24px;">
                <div class="card" style="padding:18px 22px; border-left:4px solid var(--accent); background:white;">
                    <div style="font-size:0.75rem; color:var(--gray-500); font-weight:800; text-transform:uppercase;">VẬN TỐC HIỆN TẠI</div>
                    <div style="font-size:1.8rem; font-weight:900; color:var(--gray-900); margin:4px 0;" id="hudSpeed">68 km/h</div>
                    <div style="font-size:0.82rem; color:var(--success); font-weight:700;">Hành trình nội địa Việt Nam</div>
                </div>

                <div class="card" style="padding:18px 22px; border-left:4px solid var(--primary); background:white;">
                    <div style="font-size:0.75rem; color:var(--gray-500); font-weight:800; text-transform:uppercase;">THỜI GIAN ĐẾN DỰ KIẾN (ETA)</div>
                    <div style="font-size:1.8rem; font-weight:900; color:var(--primary); margin:4px 0;" id="hudEta">2h 15m</div>
                    <div style="font-size:0.82rem; color:var(--gray-500);">Dự kiến đến: <strong id="hudEtaClock">11:45 AM</strong></div>
                </div>

                <div class="card" style="padding:18px 22px; border-left:4px solid var(--secondary); background:white;">
                    <div style="font-size:0.75rem; color:var(--gray-500); font-weight:800; text-transform:uppercase;">QUÃNG ĐƯỜNG ĐÃ ĐI</div>
                    <div style="font-size:1.8rem; font-weight:900; color:var(--secondary); margin:4px 0;" id="hudDistance">185 / 308 km</div>
                    <div style="font-size:0.82rem; color:var(--gray-500);">Tiến độ: <strong id="hudProgress">60%</strong></div>
                </div>

                <div class="card" style="padding:18px 22px; border-left:4px solid #8B5CF6; background:white;">
                    <div style="font-size:0.75rem; color:var(--gray-500); font-weight:800; text-transform:uppercase;">TÀI XẾ & HOTLINE XE</div>
                    <div style="font-size:1.15rem; font-weight:900; color:var(--gray-900); margin:4px 0;" id="hudDriver">Nguyễn Tuấn Kiệt (4.9★)</div>
                    <div style="font-size:0.82rem; color:var(--primary); font-weight:800;">
                        <i data-lucide="phone" style="width:13px;height:13px;display:inline-block;vertical-align:middle;"></i> 0908.123.456
                    </div>
                </div>
            </div>

            <!-- Main Map & Journey Timeline Split -->
            <div style="display:grid; grid-template-columns:1fr 380px; gap:24px; align-items:start;">
                
                <!-- Map Container -->
                <div class="card" style="padding:0; overflow:hidden; border-radius:24px; box-shadow:var(--shadow-xl); border:1px solid rgba(226,232,240,0.8); position:relative;">
                    
                    <!-- Map Top Overlay Bar -->
                    <div style="position:absolute; top:16px; left:16px; z-index:1000; background:rgba(5,11,20,0.92); backdrop-filter:blur(12px); color:white; padding:10px 18px; border-radius:14px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; gap:12px;">
                        <i data-lucide="compass" style="width:18px;height:18px;color:var(--accent);"></i>
                        <div>
                            <div style="font-weight:800; font-size:0.88rem;" id="currentLocationName">Đang qua TP. Bảo Lộc (QL20)</div>
                            <div style="font-size:0.75rem; color:#94A3B8;" id="currentCoords">11.5542° N, 107.8083° E (Việt Nam)</div>
                        </div>
                    </div>

                    <!-- Leaflet Map Div -->
                    <div id="map" style="width:100%; height:620px; z-index:1;"></div>
                </div>

                <!-- Right Timeline & Checkpoint Logs -->
                <div style="display:flex; flex-direction:column; gap:18px;">
                    
                    <div class="card" style="padding:24px; background:white; border-radius:24px;">
                        <h3 style="font-size:1.2rem; font-weight:900; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="milestone" style="width:20px;height:20px;color:var(--primary);"></i> Lộ trình Trạm dừng Nội địa
                        </h3>

                        <div id="timelineContainer" style="position:relative; padding-left:24px; display:flex; flex-direction:column; gap:20px;">
                            <!-- Injected via JS -->
                        </div>
                    </div>

                    <!-- Vietnam Boundary Notice -->
                    <div class="card" style="padding:22px; background:linear-gradient(135deg, var(--gray-900) 0%, #0F172A 100%); color:white; border-radius:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <span style="font-size:0.8rem; color:#94A3B8; font-weight:800; text-transform:uppercase;">PHẠM VI ĐỊNH VỊ</span>
                            <span class="badge badge-accent" style="font-size:0.75rem;">VIETNAM ONLY 🇻🇳</span>
                        </div>
                        <p style="font-size:0.85rem; color:#CBD5E1; line-height:1.6; margin-bottom:12px;">
                            Hệ thống tự động căn chỉnh tọa độ trong phạm vi lãnh thổ Việt Nam từ Móng Cái (Quảng Ninh) đến Mũi Cà Mau.
                        </p>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.82rem; color:#94A3B8;">
                            <div>📶 GPS 5G: <strong style="color:var(--accent);">Độ trễ 0.2s</strong></div>
                            <div>📡 Bản đồ: <strong style="color:white;">Google Maps</strong></div>
                        </div>
                    </div>

                </div>

            </div>

        </section>

        <script>
            const DOMESTIC_ROUTES = {
                sg_dl: {
                    title: "TP. Hồ Chí Minh → Đà Lạt",
                    totalKm: 308,
                    duration: "6 giờ",
                    gmapUrl: "https://www.google.com/maps/dir/?api=1&origin=TP+Ho+Chi+Minh&destination=Da+Lat&travelmode=driving",
                    stops: [
                        { name: "Bến xe Quận 1 (TP.HCM)", time: "07:30", status: "completed" },
                        { name: "Nút giao Dầu Giây (Đồng Nai)", time: "08:45", status: "completed" },
                        { name: "Trạm dừng Tâm Châu - Bảo Lộc", time: "10:15", status: "active" },
                        { name: "Đèo Prenn - Bến xe Đà Lạt", time: "11:45", status: "pending" }
                    ],
                    coords: [
                        { lat: 10.7769, lng: 106.7009, name: "Bến xe Quận 1 (TP.HCM)" },
                        { lat: 10.8500, lng: 106.7800, name: "Nút giao Thủ Đức" },
                        { lat: 10.9574, lng: 106.8427, name: "Biên Hòa - Đồng Nai" },
                        { lat: 10.9322, lng: 107.1350, name: "Cao tốc Long Thành - Dầu Giây" },
                        { lat: 11.2000, lng: 107.4500, name: "Định Quán (QL20)" },
                        { lat: 11.4167, lng: 107.5500, name: "Tân Phú - Madagui" },
                        { lat: 11.5542, lng: 107.8083, name: "Đèo Bảo Lộc" },
                        { lat: 11.5833, lng: 107.8667, name: "TP. Bảo Lộc (Trạm Tâm Châu)" },
                        { lat: 11.6667, lng: 108.0833, name: "Di Linh" },
                        { lat: 11.7500, lng: 108.3000, name: "Đức Trọng - Sân bay Liên Khương" },
                        { lat: 11.9000, lng: 108.4300, name: "Chân Đèo Prenn" },
                        { lat: 11.9404, lng: 108.4583, name: "Bến xe Liên tỉnh Đà Lạt" }
                    ]
                },
                sg_nt: {
                    title: "TP. Hồ Chí Minh → Nha Trang",
                    totalKm: 435,
                    duration: "8 giờ",
                    gmapUrl: "https://www.google.com/maps/dir/?api=1&origin=TP+Ho+Chi+Minh&destination=Nha+Trang&travelmode=driving",
                    stops: [
                        { name: "Bến xe Miền Đông Mới (TP.HCM)", time: "08:00", status: "completed" },
                        { name: "Nút giao Phan Thiết (Bình Thuận)", time: "10:30", status: "completed" },
                        { name: "Trạm dừng Cà Ná (Ninh Thuận)", time: "12:45", status: "active" },
                        { name: "Bến xe Phía Nam Nha Trang", time: "15:30", status: "pending" }
                    ],
                    coords: [
                        { lat: 10.7769, lng: 106.7009, name: "TP. Hồ Chí Minh" },
                        { lat: 10.9322, lng: 107.1350, name: "Cao tốc Long Thành - Dầu Giây" },
                        { lat: 10.9289, lng: 108.1021, name: "Phan Thiết - Bình Thuận" },
                        { lat: 11.3167, lng: 108.9000, name: "Phan Rí - Cà Ná" },
                        { lat: 11.5667, lng: 108.9833, name: "Phan Rang - Tháp Chàm" },
                        { lat: 11.9167, lng: 109.1500, name: "Cam Ranh" },
                        { lat: 12.2388, lng: 109.1967, name: "Bến xe Nha Trang" }
                    ]
                },
                sg_vt: {
                    title: "TP. Hồ Chí Minh → Vũng Tàu",
                    totalKm: 95,
                    duration: "2 giờ",
                    gmapUrl: "https://www.google.com/maps/dir/?api=1&origin=TP+Ho+Chi+Minh&destination=Vung+Tau&travelmode=driving",
                    stops: [
                        { name: "Trạm Quận 1 (TP.HCM)", time: "09:00", status: "completed" },
                        { name: "Trạm dừng Bò Sữa Long Thành", time: "09:45", status: "active" },
                        { name: "Bến xe Vũng Tàu (Bãi Sau)", time: "11:00", status: "pending" }
                    ],
                    coords: [
                        { lat: 10.7769, lng: 106.7009, name: "TP. Hồ Chí Minh" },
                        { lat: 10.7700, lng: 106.9500, name: "Long Thành" },
                        { lat: 10.5833, lng: 107.0833, name: "Bà Rịa" },
                        { lat: 10.3460, lng: 107.0843, name: "TP. Vũng Tàu" }
                    ]
                },
                hn_sp: {
                    title: "Hà Nội → Sapa (Lào Cai)",
                    totalKm: 315,
                    duration: "5.5 giờ",
                    gmapUrl: "https://www.google.com/maps/dir/?api=1&origin=Ha+Noi&destination=Sapa+Lao+Cai&travelmode=driving",
                    stops: [
                        { name: "Bến xe Mỹ Đình (Hà Nội)", time: "06:30", status: "completed" },
                        { name: "Nút giao IC6 Phú Thọ", time: "08:15", status: "completed" },
                        { name: "Trạm dừng Yên Bái (KM117)", time: "09:45", status: "active" },
                        { name: "Thị trấn Sapa - Nhà thờ Đá", time: "12:00", status: "pending" }
                    ],
                    coords: [
                        { lat: 21.0285, lng: 105.8542, name: "Hà Nội (Mỹ Đình)" },
                        { lat: 21.2833, lng: 105.3667, name: "Việt Trì - Phú Thọ" },
                        { lat: 21.7167, lng: 104.8833, name: "Yên Bái (Cao tốc Nội Bài - Lào Cai)" },
                        { lat: 22.3333, lng: 104.1667, name: "Bảo Thắng - Lào Cai" },
                        { lat: 22.4856, lng: 103.9707, name: "TP. Lào Cai" },
                        { lat: 22.3364, lng: 103.8438, name: "Thị trấn Sapa" }
                    ]
                },
                hn_dn: {
                    title: "Hà Nội → Đà Nẵng",
                    totalKm: 765,
                    duration: "14 giờ",
                    gmapUrl: "https://www.google.com/maps/dir/?api=1&origin=Ha+Noi&destination=Da+Nang&travelmode=driving",
                    stops: [
                        { name: "Bến xe Nước Ngầm (Hà Nội)", time: "06:00", status: "completed" },
                        { name: "Thanh Hóa (QL1A)", time: "08:30", status: "completed" },
                        { name: "TP. Vinh - Nghệ An", time: "11:00", status: "active" },
                        { name: "Đồng Hới - Quảng Bình", time: "14:30", status: "pending" },
                        { name: "Bến xe Trung tâm Đà Nẵng", time: "19:30", status: "pending" }
                    ],
                    coords: [
                        { lat: 21.0285, lng: 105.8542, name: "Hà Nội" },
                        { lat: 20.3000, lng: 105.9000, name: "Ninh Bình" },
                        { lat: 19.8000, lng: 105.7833, name: "Thanh Hóa" },
                        { lat: 18.6667, lng: 105.6667, name: "TP. Vinh" },
                        { lat: 17.4667, lng: 106.6000, name: "Đồng Hới" },
                        { lat: 16.4637, lng: 107.5909, name: "Huế" },
                        { lat: 16.0544, lng: 108.2022, name: "Đà Nẵng" }
                    ]
                }
            };

            let currentRouteKey = 'sg_dl';
            let map, busMarker, polyline, startMarker, endMarker;
            let baseLayers = {};
            let currentIndex = 3;
            let simSpeed = 1;
            let simInterval = null;

            setTimeout(() => {
                const gmapStreet = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    attribution: '© Google Maps (Việt Nam)',
                    maxZoom: 20
                });

                const gmapSat = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                    attribution: '© Google Satellite Hybrid',
                    maxZoom: 20
                });

                const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap contributors © CARTO',
                    maxZoom: 18
                });

                baseLayers = {
                    gmap_street: gmapStreet,
                    gmap_sat: gmapSat,
                    carto_dark: cartoDark
                };

                const vietnamBounds = L.latLngBounds(L.latLng(8.18, 102.14), L.latLng(23.39, 109.46));
                
                map = L.map('map', {
                    zoomControl: true,
                    scrollWheelZoom: true,
                    maxBounds: vietnamBounds,
                    maxBoundsViscosity: 0.8
                }).setView([11.5542, 107.8083], 9);

                gmapStreet.addTo(map);

                loadRoute('sg_dl');
            }, 100);

            function loadRoute(key) {
                currentRouteKey = key;
                const r = DOMESTIC_ROUTES[key] || DOMESTIC_ROUTES.sg_dl;

                document.getElementById('mainRouteTitle').innerText = r.title;
                document.getElementById('btnOpenGmap').href = r.gmapUrl;

                if (polyline) map.removeLayer(polyline);
                if (startMarker) map.removeLayer(startMarker);
                if (endMarker) map.removeLayer(endMarker);
                if (busMarker) map.removeLayer(busMarker);

                const latlngs = r.coords.map(c => [c.lat, c.lng]);
                polyline = L.polyline(latlngs, {
                    color: '#0066FF',
                    weight: 5,
                    opacity: 0.85,
                    dashArray: '8, 8'
                }).addTo(map);

                const startIcon = L.divIcon({
                    html: '<div style="background:#050B14; color:#00F5D4; font-weight:900; border:2px solid #00F5D4; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.4);">🏁</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                const endIcon = L.divIcon({
                    html: '<div style="background:#FF5A36; color:white; font-weight:900; border:2px solid white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(255,90,54,0.5);">📍</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                startMarker = L.marker([r.coords[0].lat, r.coords[0].lng], { icon: startIcon }).addTo(map).bindPopup("<b>Điểm đi (Xuất phát):</b> " + r.coords[0].name);
                endMarker = L.marker([r.coords[r.coords.length - 1].lat, r.coords[r.coords.length - 1].lng], { icon: endIcon }).addTo(map).bindPopup("<b>Điểm đến:</b> " + r.coords[r.coords.length - 1].name);

                const busIcon = L.divIcon({
                    html: \`
                        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
                            <div class="live-pulse" style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(0,245,212,0.4);"></div>
                            <div style="position:relative; z-index:2; background:#050B14; border:2.5px solid #00F5D4; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(0,102,255,0.5);">
                                🚐
                            </div>
                        </div>
                    \`,
                    iconSize: [44, 44],
                    iconAnchor: [22, 22]
                });

                currentIndex = Math.min(2, r.coords.length - 1);
                busMarker = L.marker([r.coords[currentIndex].lat, r.coords[currentIndex].lng], { icon: busIcon }).addTo(map);
                busMarker.bindPopup(\`<b>Xe Limousine 9 Chỗ VIP</b><br>Tuyến: \${r.title}<br>Tài xế: Nguyễn Tuấn Kiệt\`).openPopup();

                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                renderTimeline(r.stops);

                startSimulation();
            }

            function renderTimeline(stops) {
                const container = document.getElementById('timelineContainer');
                container.innerHTML = \`
                    <div style="position:absolute; left:7px; top:8px; bottom:8px; width:2px; background:var(--gray-200);"></div>
                    \${stops.map(s => \`
                        <div style="position:relative;">
                            <div style="position:absolute; left:-24px; top:2px; width:16px; height:16px; border-radius:50%; background:\${s.status === 'completed' ? 'var(--success)' : (s.status === 'active' ? 'var(--accent-dark)' : 'var(--gray-300)')}; border:3px solid white; box-shadow:0 0 0 2px \${s.status === 'active' ? 'rgba(0,245,212,0.4)' : 'transparent'};"></div>
                            <div style="font-size:0.92rem; font-weight:800; color:\${s.status === 'active' ? 'var(--primary)' : 'var(--gray-900)'};">\${s.name}</div>
                            <div style="font-size:0.78rem; color:\${s.status === 'active' ? 'var(--accent-dark)' : 'var(--gray-500)'}; font-weight:\${s.status === 'active' ? '700' : '400'};">
                                \${s.time} • \${s.status === 'completed' ? 'Đã hoàn thành' : (s.status === 'active' ? 'Đang di chuyển tới' : 'Dự kiến')}
                            </div>
                        </div>
                    \`).join('')}
                \`;
            }

            function startSimulation() {
                if (simInterval) clearInterval(simInterval);
                simInterval = setInterval(moveBus, 3000 / simSpeed);
            }

            function moveBus() {
                const r = DOMESTIC_ROUTES[currentRouteKey] || DOMESTIC_ROUTES.sg_dl;
                currentIndex = (currentIndex + 1) % r.coords.length;
                const pt = r.coords[currentIndex];

                busMarker.setLatLng([pt.lat, pt.lng]);

                const currentSpeed = Math.floor(58 + Math.random() * 15);
                document.getElementById('hudSpeed').innerText = \`\${currentSpeed} km/h\`;
                document.getElementById('currentLocationName').innerText = \`Đang qua: \${pt.name}\`;
                document.getElementById('currentCoords').innerText = \`\${pt.lat.toFixed(4)}° N, \${pt.lng.toFixed(4)}° E (Việt Nam)\`;

                const progressPercent = Math.round(((currentIndex + 1) / r.coords.length) * 100);
                document.getElementById('hudProgress').innerText = \`\${progressPercent}%\`;
                document.getElementById('hudDistance').innerText = \`\${Math.round((r.totalKm * progressPercent) / 100)} / \${r.totalKm} km\`;
            }

            function changeDomesticRoute(val) {
                loadRoute(val);
                showToast(\`Đã chuyển sang tuyến: \${DOMESTIC_ROUTES[val].title}\`, 'success');
            }

            function switchMapLayer(layerName) {
                Object.keys(baseLayers).forEach(k => {
                    if (map.hasLayer(baseLayers[k])) {
                        map.removeLayer(baseLayers[k]);
                    }
                });
                baseLayers[layerName].addTo(map);

                ['btnLayerGmap', 'btnLayerSat', 'btnLayerDark'].forEach(id => {
                    const btn = document.getElementById(id);
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--gray-600)';
                    btn.style.boxShadow = 'none';
                });

                if (layerName === 'gmap_street') {
                    document.getElementById('btnLayerGmap').style.background = 'white';
                    document.getElementById('btnLayerGmap').style.color = 'var(--primary)';
                    document.getElementById('btnLayerGmap').style.boxShadow = 'var(--shadow-sm)';
                } else if (layerName === 'gmap_sat') {
                    document.getElementById('btnLayerSat').style.background = 'white';
                    document.getElementById('btnLayerSat').style.color = 'var(--secondary)';
                    document.getElementById('btnLayerSat').style.boxShadow = 'var(--shadow-sm)';
                } else {
                    document.getElementById('btnLayerDark').style.background = 'white';
                    document.getElementById('btnLayerDark').style.color = 'var(--gray-900)';
                    document.getElementById('btnLayerDark').style.boxShadow = 'var(--shadow-sm)';
                }
            }

            function toggleSimSpeed() {
                simSpeed = simSpeed === 1 ? 2 : (simSpeed === 2 ? 4 : 1);
                document.getElementById('btnSpeed').innerHTML = \`<i data-lucide="fast-forward" style="width:16px;height:16px;"></i> Tốc độ: \${simSpeed}x\`;
                lucide.createIcons();
                startSimulation();
            }
        </script>
    `;
}

// 8. ADMIN DASHBOARD
function handleAdminDashboard() {
    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            <div style="margin-bottom:36px;">
                <span class="badge badge-primary" style="margin-bottom:8px;">HỆ THỐNG QUẢN TRỊ TOÀN CẦU</span>
                <h1 style="font-size:2.6rem; font-weight:900; margin-bottom:4px;">👑 Dashboard Quản trị <span class="text-gradient">Dữ liệu Du lịch</span></h1>
                <p style="color:var(--gray-500); font-size:1.05rem;">Báo cáo thời gian thực về GMV doanh thu toàn sàn, lượt booking và cơ cấu dịch vụ</p>
            </div>

            <!-- KPI Cards -->
            <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:36px;">
                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--primary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">TỔNG DOANH THU (GMV)</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--gray-900); margin-bottom:4px;">128.450.000₫</div>
                    <div style="font-size:0.85rem; color:var(--success); font-weight:800;"><i data-lucide="trending-up" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i> +18.4% tháng này</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--secondary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">TỔNG ĐƠN ĐẶT CHỖ</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--gray-900); margin-bottom:4px;">342 đơn</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Vé chuyến đi & khách sạn</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--accent-dark); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">KHÁCH HÀNG KÍCH HOẠT</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--gray-900); margin-bottom:4px;">1.250 user</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Tài khoản hoạt động</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid #8B5CF6; background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">ĐỐI TÁC VẬN HÀNH</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--gray-900); margin-bottom:4px;">18 đối tác</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">9 chuyến xe • 5 khách sạn</div>
                </div>
            </div>

            <!-- Charts Row -->
            <div style="display:grid; grid-template-columns:2fr 1fr; gap:28px; margin-bottom:36px;">
                <div class="card" style="padding:32px; background:white; border-radius:24px;">
                    <h3 style="font-size:1.3rem; margin-bottom:20px;"><i data-lucide="bar-chart-3" style="width:22px;height:22px;color:var(--primary);display:inline-block;vertical-align:middle;"></i> Doanh thu theo tháng (VND)</h3>
                    <div style="height:300px;">
                        <canvas id="adminRevenueChart"></canvas>
                    </div>
                </div>

                <div class="card" style="padding:32px; background:white; border-radius:24px;">
                    <h3 style="font-size:1.3rem; margin-bottom:20px;"><i data-lucide="pie-chart" style="width:22px;height:22px;color:var(--secondary);display:inline-block;vertical-align:middle;"></i> Cơ cấu Dịch vụ</h3>
                    <div style="height:300px; display:flex; align-items:center; justify-content:center;">
                        <canvas id="adminShareChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <script>
            setTimeout(() => {
                new Chart(document.getElementById('adminRevenueChart'), {
                    type: 'bar',
                    data: {
                        labels: ['Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9'],
                        datasets: [{
                            label: 'Doanh thu (VND)',
                            data: [18000000, 24500000, 31000000, 42000000, 68500000, 128450000],
                            backgroundColor: 'rgba(0, 102, 255, 0.85)',
                            borderRadius: 10
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });

                new Chart(document.getElementById('adminShareChart'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Vé Chuyến đi', 'Phòng Khách sạn'],
                        datasets: [{
                            data: [75000000, 53450000],
                            backgroundColor: ['#0066FF', '#00F5D4']
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }, 100);
        </script>
    `;
}

// 9. CUSTOMER DASHBOARD
function handleCustomerDashboard() {
    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            
            <!-- Greeting Banner -->
            <div class="card" style="padding:40px; background:linear-gradient(135deg, #050B14 0%, #0F1D33 60%, #0052CC 100%); color:white; border-radius:28px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                    <div style="display:flex; align-items:center; gap:24px;">
                        <div style="width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--accent)); display:flex; align-items:center; justify-content:center; font-size:2.4rem; font-weight:900; border:3px solid rgba(255,255,255,0.3); color:#050B14;">
                            A
                        </div>
                        <div>
                            <span style="font-size:0.88rem; color:#94A3B8; text-transform:uppercase; letter-spacing:0.04em;">XIN CHÀO BẠN,</span>
                            <h1 style="color:white; font-size:2.4rem; font-weight:900; margin-bottom:4px;">Nguyễn Văn An</h1>
                            <div style="color:var(--accent); font-weight:800; font-size:0.95rem;">⭐ Thành viên Bạc (Silver Member) • an.nguyen@gmail.com</div>
                        </div>
                    </div>

                    <div style="display:flex; gap:14px;">
                        <a href="/tracking" class="btn btn-accent btn-sm" style="font-weight:900;">📍 Mở GPS Xe Trực tiếp</a>
                        <a href="/trips" class="btn btn-primary btn-sm" style="font-weight:900;">+ Đặt chuyến mới</a>
                        <a href="/booking/detail/TG-2026-8899" class="btn btn-outline btn-sm" style="color:white; border-color:rgba(255,255,255,0.4);">Mở vé của tôi</a>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:36px;">
                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--secondary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px;">TỔNG CHI TIÊU DU LỊCH</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">5.600.000₫</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Đã thanh toán</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--success); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px;">CHUYẾN ĐI ĐÃ HOÀN THÀNH</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--success); margin-bottom:4px;">3 chuyến</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Hành trình đã đi</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--primary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px;">BOOKING ĐANG HIỆU LỰC</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--primary); margin-bottom:4px;">1 đơn</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Sắp khởi hành</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid #8B5CF6; background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px;">ĐIỂM THƯỞNG TRAVELGO</div>
                    <div style="font-size:2.2rem; font-weight:900; color:#8B5CF6; margin-bottom:4px;">250 pts</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Giảm 5% đơn kế tiếp</div>
                </div>
            </div>

            <!-- Upcoming trip card with Live GPS button -->
            <div class="card" style="padding:36px; background:white; border-radius:24px; border:2px solid var(--primary-100); margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.4rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="map-pin" style="color:var(--primary);width:22px;height:22px;"></i> Chuyến đi sắp tới gần nhất
                    </h3>
                    <span class="badge badge-success" style="font-size:0.88rem; padding:6px 18px;">Đã xác nhận chỗ</span>
                </div>

                <div style="display:grid; grid-template-columns:2fr 1.2fr; gap:36px; align-items:center; background:var(--gray-50); padding:28px; border-radius:20px;">
                    <div>
                        <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800;">HÀNH TRÌNH KHỞI HÀNH</div>
                        <h2 style="font-size:2rem; font-weight:900; margin:6px 0 10px;">TP. Hồ Chí Minh → Đà Lạt</h2>
                        <div style="font-size:1.05rem; color:var(--primary); font-weight:800;">
                            <i data-lucide="clock" style="width:18px;height:18px;display:inline-block;vertical-align:middle;"></i> Khởi hành: 05/09/2026 lúc 07:30 sáng
                        </div>
                        <div style="font-size:0.88rem; color:var(--gray-500); margin-top:8px;">Phương tiện: Xe Limousine 9 chỗ VIP • Biển số: <strong>51B-888.99</strong></div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px; text-align:right;">
                        <a href="/tracking" class="btn btn-accent btn-lg" style="font-weight:900;">
                            <i data-lucide="navigation" style="width:20px;height:20px;"></i> Định vị GPS Xe Trực tiếp
                        </a>
                        <a href="/booking/detail/TG-2026-8899" class="btn btn-outline btn-sm" style="font-weight:800;">
                            <i data-lucide="qr-code" style="width:16px;height:16px;"></i> Mở vé E-Ticket
                        </a>
                    </div>
                </div>
            </div>

        </div>
    `;
}

// 10. PARTNER DASHBOARD (Đối tác Xe & Khách sạn)
function handlePartnerDashboard() {
    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">

            <!-- Greeting Banner -->
            <div class="card" style="padding:40px; background:linear-gradient(135deg, #1A0A00 0%, #2D1600 40%, #CC6600 100%); color:white; border-radius:28px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                    <div style="display:flex; align-items:center; gap:24px;">
                        <div style="width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg, #FB923C, #FBBF24); display:flex; align-items:center; justify-content:center; font-size:2.4rem; font-weight:900; border:3px solid rgba(255,255,255,0.3); color:#1A0A00;">
                            S
                        </div>
                        <div>
                            <span style="font-size:0.88rem; color:#FDBA74; text-transform:uppercase; letter-spacing:0.04em;">CỔNG ĐỐI TÁC DOANH NGHIỆP</span>
                            <h1 style="color:white; font-size:2.4rem; font-weight:900; margin-bottom:4px;">Saigontourist Transport</h1>
                            <div style="color:#FED7AA; font-weight:700; font-size:0.95rem;">🤝 Đối tác Vàng (Gold Partner) • MST: 0301234567 • dt_saigontour@travelgo.vn</div>
                        </div>
                    </div>

                    <div style="display:flex; gap:14px;">
                        <button onclick="showToast('Đã gửi yêu cầu thêm chuyến mới đến Admin!')" class="btn btn-accent btn-sm" style="font-weight:900;">+ Thêm chuyến mới</button>
                        <button onclick="showToast('Đã cập nhật trạng thái phòng!')" class="btn btn-primary btn-sm" style="font-weight:900;">Cập nhật phòng trống</button>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:36px;">
                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid #FB923C; background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">DOANH THU THÁNG NÀY</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--gray-900); margin-bottom:4px;">45.650.000₫</div>
                    <div style="font-size:0.85rem; color:var(--success); font-weight:800;"><i data-lucide="trending-up" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i> +23.5% so tháng trước</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--primary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">VÉ ĐÃ BÁN</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--primary); margin-bottom:4px;">128 vé</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Trong tháng 09/2026</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--success); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">TỶ LỆ LẤP ĐẦY</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--success); margin-bottom:4px;">78.4%</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Trung bình các chuyến</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid #8B5CF6; background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">ĐÁNH GIÁ TRUNG BÌNH</div>
                    <div style="font-size:2.2rem; font-weight:900; color:#8B5CF6; margin-bottom:4px;">4.85 ⭐</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Từ 128 lượt đánh giá</div>
                </div>
            </div>

            <!-- Charts Row -->
            <div style="display:grid; grid-template-columns:2fr 1fr; gap:28px; margin-bottom:36px;">
                <div class="card" style="padding:32px; background:white; border-radius:24px;">
                    <h3 style="font-size:1.3rem; margin-bottom:20px;"><i data-lucide="bar-chart-3" style="width:22px;height:22px;color:#FB923C;display:inline-block;vertical-align:middle;"></i> Doanh thu theo tháng (VND)</h3>
                    <div style="height:280px;">
                        <canvas id="partnerRevenueChart"></canvas>
                    </div>
                </div>

                <div class="card" style="padding:32px; background:white; border-radius:24px;">
                    <h3 style="font-size:1.3rem; margin-bottom:20px;"><i data-lucide="pie-chart" style="width:22px;height:22px;color:#8B5CF6;display:inline-block;vertical-align:middle;"></i> Cơ cấu Doanh thu</h3>
                    <div style="height:280px; display:flex; align-items:center; justify-content:center;">
                        <canvas id="partnerShareChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Active Trips Table -->
            <div class="card" style="padding:32px; background:white; border-radius:24px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="bus" style="color:#FB923C;width:22px;height:22px;"></i> Chuyến xe đang hoạt động
                    </h3>
                    <span class="badge badge-primary">3 chuyến</span>
                </div>

                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                        <thead>
                            <tr style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.04em;">
                                <th style="padding:12px 16px; text-align:left;">Mã chuyến</th>
                                <th style="padding:12px 16px; text-align:left;">Tuyến đường</th>
                                <th style="padding:12px 16px; text-align:left;">Khởi hành</th>
                                <th style="padding:12px 16px; text-align:center;">Vé bán / Tổng</th>
                                <th style="padding:12px 16px; text-align:right;">Doanh thu</th>
                                <th style="padding:12px 16px; text-align:center;">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background:var(--gray-50); border-radius:16px;">
                                <td style="padding:16px; font-weight:800; color:var(--primary); border-radius:16px 0 0 16px;">SG-DL-01</td>
                                <td style="padding:16px;"><strong>TP. HCM → Đà Lạt</strong><br><span style="font-size:0.82rem; color:var(--gray-500);">Limousine 9 chỗ VIP</span></td>
                                <td style="padding:16px; font-size:0.92rem;">05/09/2026<br><span style="color:var(--primary); font-weight:700;">07:30</span></td>
                                <td style="padding:16px; text-align:center;">
                                    <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
                                        <div style="width:80px; height:8px; background:var(--gray-200); border-radius:8px; overflow:hidden;">
                                            <div style="width:33%; height:100%; background:var(--success); border-radius:8px;"></div>
                                        </div>
                                        <span style="font-weight:800; font-size:0.88rem;">3/9</span>
                                    </div>
                                </td>
                                <td style="padding:16px; text-align:right; font-weight:900; color:var(--gray-900);">1.050.000₫</td>
                                <td style="padding:16px; text-align:center; border-radius:0 16px 16px 0;"><span class="badge badge-success">Mở bán</span></td>
                            </tr>
                            <tr style="background:var(--gray-50); border-radius:16px;">
                                <td style="padding:16px; font-weight:800; color:var(--primary); border-radius:16px 0 0 16px;">SG-NT-02</td>
                                <td style="padding:16px;"><strong>TP. HCM → Nha Trang</strong><br><span style="font-size:0.82rem; color:var(--gray-500);">Giường nằm 34 phòng VIP</span></td>
                                <td style="padding:16px; font-size:0.92rem;">06/09/2026<br><span style="color:var(--primary); font-weight:700;">20:00</span></td>
                                <td style="padding:16px; text-align:center;">
                                    <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
                                        <div style="width:80px; height:8px; background:var(--gray-200); border-radius:8px; overflow:hidden;">
                                            <div style="width:65%; height:100%; background:var(--primary); border-radius:8px;"></div>
                                        </div>
                                        <span style="font-weight:800; font-size:0.88rem;">22/34</span>
                                    </div>
                                </td>
                                <td style="padding:16px; text-align:right; font-weight:900; color:var(--gray-900);">6.160.000₫</td>
                                <td style="padding:16px; text-align:center; border-radius:0 16px 16px 0;"><span class="badge badge-success">Mở bán</span></td>
                            </tr>
                            <tr style="background:var(--gray-50); border-radius:16px;">
                                <td style="padding:16px; font-weight:800; color:var(--gray-500); border-radius:16px 0 0 16px;">SG-PQ-04</td>
                                <td style="padding:16px;"><strong>TP. HCM → Phú Quốc</strong><br><span style="font-size:0.82rem; color:var(--gray-500);">Xe ghế ngồi 45 chỗ</span></td>
                                <td style="padding:16px; font-size:0.92rem;">10/09/2026<br><span style="color:var(--primary); font-weight:700;">06:00</span></td>
                                <td style="padding:16px; text-align:center;">
                                    <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
                                        <div style="width:80px; height:8px; background:var(--gray-200); border-radius:8px; overflow:hidden;">
                                            <div style="width:89%; height:100%; background:#FB923C; border-radius:8px;"></div>
                                        </div>
                                        <span style="font-weight:800; font-size:0.88rem; color:#FB923C;">40/45</span>
                                    </div>
                                </td>
                                <td style="padding:16px; text-align:right; font-weight:900; color:var(--gray-900);">8.000.000₫</td>
                                <td style="padding:16px; text-align:center; border-radius:0 16px 16px 0;"><span class="badge" style="background:rgba(251,146,60,0.12); color:#EA580C; font-weight:800;">Sắp đầy</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Hotel & Room Status -->
            <div class="card" style="padding:32px; background:white; border-radius:24px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="building-2" style="color:var(--primary);width:22px;height:22px;"></i> Khách sạn & Phòng trống
                    </h3>
                    <span class="badge badge-primary">2 khách sạn</span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                    <div style="background:var(--gray-50); border-radius:20px; padding:28px;">
                        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
                            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop" style="width:60px; height:60px; border-radius:16px; object-fit:cover;" alt="">
                            <div>
                                <h4 style="font-size:1.1rem; font-weight:800; margin-bottom:2px;">Vinpearl Resort Nha Trang</h4>
                                <div style="font-size:0.85rem; color:var(--gray-500);">⭐⭐⭐⭐⭐ 5 sao • Nha Trang</div>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div style="background:white; padding:16px; border-radius:14px; text-align:center;">
                                <div style="font-size:0.78rem; color:var(--gray-500); margin-bottom:4px;">Deluxe Biển</div>
                                <div style="font-size:1.6rem; font-weight:900; color:var(--success);">8</div>
                                <div style="font-size:0.75rem; color:var(--gray-500);">/ 15 phòng</div>
                            </div>
                            <div style="background:white; padding:16px; border-radius:14px; text-align:center;">
                                <div style="font-size:0.78rem; color:var(--gray-500); margin-bottom:4px;">Suite VIP</div>
                                <div style="font-size:1.6rem; font-weight:900; color:#FB923C;">2</div>
                                <div style="font-size:0.75rem; color:var(--gray-500);">/ 5 phòng</div>
                            </div>
                        </div>
                    </div>

                    <div style="background:var(--gray-50); border-radius:20px; padding:28px;">
                        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
                            <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=120&h=120&fit=crop" style="width:60px; height:60px; border-radius:16px; object-fit:cover;" alt="">
                            <div>
                                <h4 style="font-size:1.1rem; font-weight:800; margin-bottom:2px;">Dalat Palace Heritage</h4>
                                <div style="font-size:0.85rem; color:var(--gray-500);">⭐⭐⭐⭐⭐ 5 sao • Đà Lạt</div>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div style="background:white; padding:16px; border-radius:14px; text-align:center;">
                                <div style="font-size:0.78rem; color:var(--gray-500); margin-bottom:4px;">Heritage Suite</div>
                                <div style="font-size:1.6rem; font-weight:900; color:var(--success);">5</div>
                                <div style="font-size:0.75rem; color:var(--gray-500);">/ 10 phòng</div>
                            </div>
                            <div style="background:white; padding:16px; border-radius:14px; text-align:center;">
                                <div style="font-size:0.78rem; color:var(--gray-500); margin-bottom:4px;">Phòng Đôi</div>
                                <div style="font-size:1.6rem; font-weight:900; color:var(--success);">12</div>
                                <div style="font-size:0.75rem; color:var(--gray-500);">/ 20 phòng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Bookings -->
            <div class="card" style="padding:32px; background:white; border-radius:24px;">
                <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:24px; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="clipboard-list" style="color:var(--secondary);width:22px;height:22px;"></i> Đơn đặt chỗ mới nhất
                </h3>

                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                        <thead>
                            <tr style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.04em;">
                                <th style="padding:12px 16px; text-align:left;">Mã booking</th>
                                <th style="padding:12px 16px; text-align:left;">Khách hàng</th>
                                <th style="padding:12px 16px; text-align:left;">Dịch vụ</th>
                                <th style="padding:12px 16px; text-align:right;">Giá trị</th>
                                <th style="padding:12px 16px; text-align:center;">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background:var(--gray-50); border-radius:16px;">
                                <td style="padding:16px; font-weight:800; color:var(--primary); border-radius:16px 0 0 16px;">BK-20260905-001</td>
                                <td style="padding:16px;">Nguyễn Văn An<br><span style="font-size:0.82rem; color:var(--gray-500);">an.nguyen@gmail.com</span></td>
                                <td style="padding:16px;">SG-DL-01 • 2 vé<br><span style="font-size:0.82rem; color:var(--gray-500);">Limousine HCM→Đà Lạt</span></td>
                                <td style="padding:16px; text-align:right; font-weight:900;">700.000₫</td>
                                <td style="padding:16px; text-align:center; border-radius:0 16px 16px 0;"><span class="badge badge-success">Đã thanh toán</span></td>
                            </tr>
                            <tr style="background:var(--gray-50); border-radius:16px;">
                                <td style="padding:16px; font-weight:800; color:var(--primary); border-radius:16px 0 0 16px;">BK-20260905-002</td>
                                <td style="padding:16px;">Trần Thị Bích<br><span style="font-size:0.82rem; color:var(--gray-500);">bich.tran@gmail.com</span></td>
                                <td style="padding:16px;">Vinpearl Deluxe • 1 phòng<br><span style="font-size:0.82rem; color:var(--gray-500);">2 đêm (05-07/09)</span></td>
                                <td style="padding:16px; text-align:right; font-weight:900;">4.900.000₫</td>
                                <td style="padding:16px; text-align:center; border-radius:0 16px 16px 0;"><span class="badge badge-success">Đã xác nhận</span></td>
                            </tr>
                            <tr style="background:var(--gray-50); border-radius:16px;">
                                <td style="padding:16px; font-weight:800; color:var(--gray-500); border-radius:16px 0 0 16px;">BK-20260906-003</td>
                                <td style="padding:16px;">Lê Minh Tuấn<br><span style="font-size:0.82rem; color:var(--gray-500);">tuan.le@gmail.com</span></td>
                                <td style="padding:16px;">SG-NT-02 • 4 vé<br><span style="font-size:0.82rem; color:var(--gray-500);">Giường nằm HCM→Nha Trang</span></td>
                                <td style="padding:16px; text-align:right; font-weight:900;">1.120.000₫</td>
                                <td style="padding:16px; text-align:center; border-radius:0 16px 16px 0;"><span class="badge" style="background:rgba(251,146,60,0.12); color:#EA580C;">Chờ thanh toán</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <script>
            setTimeout(() => {
                new Chart(document.getElementById('partnerRevenueChart'), {
                    type: 'line',
                    data: {
                        labels: ['T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
                        datasets: [{
                            label: 'Doanh thu xe (VND)',
                            data: [8200000, 12500000, 18400000, 24300000, 35800000, 38500000],
                            borderColor: '#FB923C',
                            backgroundColor: 'rgba(251,146,60,0.08)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: '#FB923C'
                        }, {
                            label: 'Doanh thu phòng (VND)',
                            data: [2100000, 4800000, 3600000, 8200000, 5800000, 7150000],
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139,92,246,0.08)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: '#8B5CF6'
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });

                new Chart(document.getElementById('partnerShareChart'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Vé chuyến đi', 'Phòng khách sạn'],
                        datasets: [{
                            data: [38500000, 7150000],
                            backgroundColor: ['#FB923C', '#8B5CF6'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                });
            }, 100);
        </script>
    `;
}

// 11. EMPLOYEE DASHBOARD (Nhân viên Duyệt & Nghiệp vụ)
function handleEmployeeDashboard() {
    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">

            <!-- Greeting Banner -->
            <div class="card" style="padding:40px; background:linear-gradient(135deg, #0D0024 0%, #1E0040 40%, #7C3AED 100%); color:white; border-radius:28px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                    <div style="display:flex; align-items:center; gap:24px;">
                        <div style="width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg, #A78BFA, #E879F9); display:flex; align-items:center; justify-content:center; font-size:2.4rem; font-weight:900; border:3px solid rgba(255,255,255,0.3); color:#0D0024;">
                            H
                        </div>
                        <div>
                            <span style="font-size:0.88rem; color:#C4B5FD; text-transform:uppercase; letter-spacing:0.04em;">BẢNG ĐIỀU HÀNH NGHIỆP VỤ</span>
                            <h1 style="color:white; font-size:2.4rem; font-weight:900; margin-bottom:4px;">Nguyễn Thị Hoa</h1>
                            <div style="color:#DDD6FE; font-weight:700; font-size:0.95rem;">💼 Nhân viên Kiểm duyệt • ID: NV-003 • hoa.nguyen@travelgo.vn</div>
                        </div>
                    </div>

                    <div style="display:flex; gap:14px; align-items:center;">
                        <div style="background:rgba(255,255,255,0.15); padding:12px 24px; border-radius:16px; text-align:center;">
                            <div style="font-size:0.78rem; color:#C4B5FD;">Việc chờ xử lý</div>
                            <div style="font-size:2rem; font-weight:900; color:#FBBF24;">7</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:36px;">
                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid #FBBF24; background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">CHỜ DUYỆT CHUYẾN ĐI</div>
                    <div style="font-size:2.2rem; font-weight:900; color:#FBBF24; margin-bottom:4px;">3</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Cần xét duyệt ngay</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid #FB923C; background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">CHỜ DUYỆT KHÁCH SẠN</div>
                    <div style="font-size:2.2rem; font-weight:900; color:#FB923C; margin-bottom:4px;">2</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Đối tác mới gửi</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--secondary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">YÊU CẦU HOÀN TIỀN</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">2</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Đang chờ phê duyệt</div>
                </div>

                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--success); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px; text-transform:uppercase;">ĐÃ XỬ LÝ HÔM NAY</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--success); margin-bottom:4px;">12</div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">Duyệt + Hoàn tiền</div>
                </div>
            </div>

            <!-- Pending Trips Approval Queue -->
            <div class="card" style="padding:32px; background:white; border-radius:24px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="clock" style="color:#FBBF24;width:22px;height:22px;"></i> Hàng đợi Duyệt Chuyến đi
                    </h3>
                    <span class="badge" style="background:rgba(251,191,36,0.12); color:#B45309; font-weight:800;">3 chờ duyệt</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #FBBF24;">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--primary); font-size:1.05rem;">SG-HP-05</span>
                                <span class="badge" style="background:rgba(251,191,36,0.12); color:#B45309; font-size:0.72rem;">Chờ duyệt</span>
                            </div>
                            <div style="font-weight:700; font-size:1.05rem; margin-bottom:4px;">TP. HCM → Hải Phòng</div>
                            <div style="font-size:0.88rem; color:var(--gray-500);">Đối tác: <strong>Hoàng Long Express</strong> • Xe giường nằm 40 chỗ • 12/09/2026 lúc 19:00 • <strong>450.000₫/vé</strong></div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.closest('div[style*=gray-50]').style.borderLeftColor='var(--success)'; this.closest('div[style*=gray-50]').querySelector('.badge').textContent='✅ Đã duyệt'; this.closest('div[style*=gray-50]').querySelector('.badge').style.background='rgba(16,185,129,0.12)'; this.closest('div[style*=gray-50]').querySelector('.badge').style.color='#059669'; this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ Đã duyệt</span>'; showToast('Đã duyệt chuyến SG-HP-05 thành công!');" class="btn btn-primary btn-sm" style="font-weight:800; padding:10px 20px;">✓ Duyệt</button>
                            <button onclick="this.closest('div[style*=gray-50]').style.borderLeftColor='var(--secondary)'; this.closest('div[style*=gray-50]').querySelector('.badge').textContent='❌ Từ chối'; this.closest('div[style*=gray-50]').querySelector('.badge').style.background='rgba(239,68,68,0.12)'; this.closest('div[style*=gray-50]').querySelector('.badge').style.color='#DC2626'; this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900>❌ Từ chối</span>'; showToast('Đã từ chối chuyến SG-HP-05', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; padding:10px 20px; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>

                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #FBBF24;">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--primary); font-size:1.05rem;">HN-SPA-06</span>
                                <span class="badge" style="background:rgba(251,191,36,0.12); color:#B45309; font-size:0.72rem;">Chờ duyệt</span>
                            </div>
                            <div style="font-weight:700; font-size:1.05rem; margin-bottom:4px;">Hà Nội → Sa Pa</div>
                            <div style="font-size:0.88rem; color:var(--gray-500);">Đối tác: <strong>Sapa Express</strong> • Limousine 9 chỗ • 15/09/2026 lúc 06:30 • <strong>380.000₫/vé</strong></div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.closest('div[style*=gray-50]').style.borderLeftColor='var(--success)'; this.closest('div[style*=gray-50]').querySelector('.badge').textContent='✅ Đã duyệt'; this.closest('div[style*=gray-50]').querySelector('.badge').style.background='rgba(16,185,129,0.12)'; this.closest('div[style*=gray-50]').querySelector('.badge').style.color='#059669'; this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ Đã duyệt</span>'; showToast('Đã duyệt chuyến HN-SPA-06 thành công!');" class="btn btn-primary btn-sm" style="font-weight:800; padding:10px 20px;">✓ Duyệt</button>
                            <button onclick="this.closest('div[style*=gray-50]').style.borderLeftColor='var(--secondary)'; this.closest('div[style*=gray-50]').querySelector('.badge').textContent='❌ Từ chối'; this.closest('div[style*=gray-50]').querySelector('.badge').style.background='rgba(239,68,68,0.12)'; this.closest('div[style*=gray-50]').querySelector('.badge').style.color='#DC2626'; this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900>❌ Từ chối</span>'; showToast('Đã từ chối chuyến HN-SPA-06', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; padding:10px 20px; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>

                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #FBBF24;">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--primary); font-size:1.05rem;">DN-HUE-07</span>
                                <span class="badge" style="background:rgba(251,191,36,0.12); color:#B45309; font-size:0.72rem;">Chờ duyệt</span>
                            </div>
                            <div style="font-weight:700; font-size:1.05rem; margin-bottom:4px;">Đà Nẵng → Huế</div>
                            <div style="font-size:0.88rem; color:var(--gray-500);">Đối tác: <strong>Hội An Express</strong> • Xe 16 chỗ • 18/09/2026 lúc 08:00 • <strong>220.000₫/vé</strong></div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.closest('div[style*=gray-50]').style.borderLeftColor='var(--success)'; this.closest('div[style*=gray-50]').querySelector('.badge').textContent='✅ Đã duyệt'; this.closest('div[style*=gray-50]').querySelector('.badge').style.background='rgba(16,185,129,0.12)'; this.closest('div[style*=gray-50]').querySelector('.badge').style.color='#059669'; this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ Đã duyệt</span>'; showToast('Đã duyệt chuyến DN-HUE-07 thành công!');" class="btn btn-primary btn-sm" style="font-weight:800; padding:10px 20px;">✓ Duyệt</button>
                            <button onclick="this.closest('div[style*=gray-50]').style.borderLeftColor='var(--secondary)'; this.closest('div[style*=gray-50]').querySelector('.badge').textContent='❌ Từ chối'; this.closest('div[style*=gray-50]').querySelector('.badge').style.background='rgba(239,68,68,0.12)'; this.closest('div[style*=gray-50]').querySelector('.badge').style.color='#DC2626'; this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900>❌ Từ chối</span>'; showToast('Đã từ chối chuyến DN-HUE-07', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; padding:10px 20px; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending Hotels Approval Queue -->
            <div class="card" style="padding:32px; background:white; border-radius:24px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="building-2" style="color:#FB923C;width:22px;height:22px;"></i> Hàng đợi Duyệt Khách sạn
                    </h3>
                    <span class="badge" style="background:rgba(251,146,60,0.12); color:#EA580C; font-weight:800;">2 chờ duyệt</span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; border-left:4px solid #FB923C;">
                        <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                            <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=120&h=120&fit=crop" style="width:50px; height:50px; border-radius:14px; object-fit:cover;" alt="">
                            <div>
                                <h4 style="font-size:1rem; font-weight:800;">Mường Thanh Grand Đà Nẵng</h4>
                                <div style="font-size:0.82rem; color:var(--gray-500);">⭐⭐⭐⭐ 4 sao • Đà Nẵng • 45 phòng</div>
                            </div>
                        </div>
                        <div style="font-size:0.88rem; color:var(--gray-500); margin-bottom:14px;">Đối tác: <strong>Mường Thanh Group</strong> — Đăng ký: 07/09/2026</div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900;font-size:1.05rem>✅ Đã duyệt khách sạn</span>'; showToast('Đã duyệt Mường Thanh Grand Đà Nẵng!');" class="btn btn-primary btn-sm" style="font-weight:800; flex:1;">✓ Duyệt</button>
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900;font-size:1.05rem>❌ Từ chối</span>'; showToast('Đã từ chối Mường Thanh Grand Đà Nẵng', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; flex:1; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>

                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; border-left:4px solid #FB923C;">
                        <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=120&h=120&fit=crop" style="width:50px; height:50px; border-radius:14px; object-fit:cover;" alt="">
                            <div>
                                <h4 style="font-size:1rem; font-weight:800;">Sapa Jade Hill Resort</h4>
                                <div style="font-size:0.82rem; color:var(--gray-500);">⭐⭐⭐⭐⭐ 5 sao • Sa Pa • 28 phòng</div>
                            </div>
                        </div>
                        <div style="font-size:0.88rem; color:var(--gray-500); margin-bottom:14px;">Đối tác: <strong>Jade Hill Hospitality</strong> — Đăng ký: 08/09/2026</div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900;font-size:1.05rem>✅ Đã duyệt khách sạn</span>'; showToast('Đã duyệt Sapa Jade Hill Resort!');" class="btn btn-primary btn-sm" style="font-weight:800; flex:1;">✓ Duyệt</button>
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900;font-size:1.05rem>❌ Từ chối</span>'; showToast('Đã từ chối Sapa Jade Hill Resort', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; flex:1; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Refund Requests Queue -->
            <div class="card" style="padding:32px; background:white; border-radius:24px; margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="rotate-ccw" style="color:var(--secondary);width:22px;height:22px;"></i> Yêu cầu Hoàn tiền Vé
                    </h3>
                    <span class="badge" style="background:rgba(255,90,54,0.12); color:var(--secondary); font-weight:800;">2 yêu cầu</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--secondary);">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--secondary); font-size:1.05rem;">RF-20260908-001</span>
                                <span class="badge" style="background:rgba(255,90,54,0.12); color:var(--secondary); font-size:0.72rem;">Chờ xét duyệt</span>
                            </div>
                            <div style="font-size:0.95rem; margin-bottom:4px;"><strong>Phạm Hồng Đức</strong> — Mã booking: BK-20260901-015</div>
                            <div style="font-size:0.88rem; color:var(--gray-500);">SG-DL-01 • 1 vé • Lý do: <em>"Thay đổi kế hoạch cá nhân"</em></div>
                            <div style="font-size:0.88rem; color:var(--success); font-weight:700; margin-top:4px;">Hoàn tiền tự động: 100% (350.000₫) — Hủy trước 7+ ngày</div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ Đã duyệt hoàn 350.000₫</span>'; showToast('Đã phê duyệt hoàn tiền 350.000₫ cho Phạm Hồng Đức!');" class="btn btn-primary btn-sm" style="font-weight:800; padding:10px 20px;">✓ Duyệt hoàn</button>
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900>❌ Từ chối</span>'; showToast('Đã từ chối yêu cầu hoàn tiền', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; padding:10px 20px; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>

                    <div style="background:var(--gray-50); border-radius:20px; padding:24px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--secondary);">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--secondary); font-size:1.05rem;">RF-20260909-002</span>
                                <span class="badge" style="background:rgba(255,90,54,0.12); color:var(--secondary); font-size:0.72rem;">Chờ xét duyệt</span>
                            </div>
                            <div style="font-size:0.95rem; margin-bottom:4px;"><strong>Vũ Thanh Mai</strong> — Mã booking: BK-20260903-022</div>
                            <div style="font-size:0.88rem; color:var(--gray-500);">SG-NT-02 • 2 vé • Lý do: <em>"Bị ốm không đi được"</em></div>
                            <div style="font-size:0.88rem; color:#FB923C; font-weight:700; margin-top:4px;">Hoàn tiền bậc thang: 50% (280.000₫) — Hủy trước 3-6 ngày</div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ Đã duyệt hoàn 280.000₫</span>'; showToast('Đã phê duyệt hoàn tiền 280.000₫ cho Vũ Thanh Mai!');" class="btn btn-primary btn-sm" style="font-weight:800; padding:10px 20px;">✓ Duyệt hoàn</button>
                            <button onclick="this.parentElement.innerHTML='<span style=color:var(--secondary);font-weight:900>❌ Từ chối</span>'; showToast('Đã từ chối yêu cầu hoàn tiền', 'error');" class="btn btn-outline btn-sm" style="font-weight:800; padding:10px 20px; color:var(--secondary); border-color:var(--secondary);">✕ Từ chối</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Today's Activity Log -->
            <div class="card" style="padding:32px; background:white; border-radius:24px;">
                <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:24px; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="activity" style="color:var(--success);width:22px;height:22px;"></i> Lịch sử Xử lý Hôm nay
                </h3>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; align-items:center; gap:16px; padding:14px 20px; background:var(--gray-50); border-radius:14px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="check-circle" style="width:20px;height:20px;color:var(--success);"></i></div>
                        <div style="flex:1;"><strong>Duyệt chuyến SG-DL-01</strong> — TP. HCM → Đà Lạt (Saigontourist Transport)<br><span style="font-size:0.82rem; color:var(--gray-500);">09:15 sáng</span></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; padding:14px 20px; background:var(--gray-50); border-radius:14px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="check-circle" style="width:20px;height:20px;color:var(--success);"></i></div>
                        <div style="flex:1;"><strong>Duyệt chuyến SG-NT-02</strong> — TP. HCM → Nha Trang (Phương Trang FUTA)<br><span style="font-size:0.82rem; color:var(--gray-500);">09:22 sáng</span></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; padding:14px 20px; background:var(--gray-50); border-radius:14px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="building-2" style="width:20px;height:20px;color:var(--success);"></i></div>
                        <div style="flex:1;"><strong>Duyệt khách sạn Vinpearl Resort Nha Trang</strong> — 5 sao, 50 phòng<br><span style="font-size:0.82rem; color:var(--gray-500);">10:05 sáng</span></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; padding:14px 20px; background:var(--gray-50); border-radius:14px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(0,102,255,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="rotate-ccw" style="width:20px;height:20px;color:var(--primary);"></i></div>
                        <div style="flex:1;"><strong>Phê duyệt hoàn tiền RF-20260907-005</strong> — Hoàn 100% (350.000₫) cho Trần Văn Bình<br><span style="font-size:0.82rem; color:var(--gray-500);">11:30 sáng</span></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; padding:14px 20px; background:var(--gray-50); border-radius:14px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(239,68,68,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i data-lucide="x-circle" style="width:20px;height:20px;color:var(--secondary);"></i></div>
                        <div style="flex:1;"><strong>Từ chối chuyến HN-QB-08</strong> — Lý do: Thiếu giấy phép kinh doanh vận tải<br><span style="font-size:0.82rem; color:var(--gray-500);">14:18 chiều</span></div>
                    </div>
                </div>
            </div>

        </div>
    `;
}

// 12. PAYMENT CHECKOUT (Chọn phương thức & Đếm ngược 15 phút)
function handlePaymentCheckout() {
    const totalAmount = calculateCartTotal();
    return `
        <div style="max-width:960px; margin:40px auto; padding:0 24px;">
            <!-- 15-Minute Countdown Banner -->
            <div style="background:linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color:white; padding:24px 32px; border-radius:24px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; box-shadow:var(--shadow-lg);">
                <div style="display:flex; align-items:center; gap:16px;">
                    <div style="width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; color:#FBBF24;">
                        <i data-lucide="clock" style="width:26px;height:26px;"></i>
                    </div>
                    <div>
                        <div style="font-size:0.85rem; color:#C7D2FE; text-transform:uppercase; letter-spacing:0.04em;">THỜI GIAN GIỮ CHỖ CÒN LẠI</div>
                        <div style="font-size:1.1rem; font-weight:700;">Vui lòng hoàn tất thanh toán để nhận vé chính thức</div>
                    </div>
                </div>

                <div style="display:flex; align-items:baseline; gap:6px; background:rgba(0,0,0,0.3); padding:10px 24px; border-radius:16px; border:1px solid rgba(255,255,255,0.15);">
                    <span id="previewCountdownTimer" style="font-size:2.4rem; font-weight:900; color:#FBBF24; font-variant-numeric:tabular-nums;">
                        14:59
                    </span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:32px; align-items:start;">
                <!-- Payment Methods Form -->
                <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-sm);">
                    <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                        <i data-lucide="credit-card" style="color:var(--primary);width:22px;height:22px;"></i> Chọn Cổng thanh toán Trực tuyến
                    </h3>

                    <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:28px;">
                        <!-- VNPay Option -->
                        <label id="lblVnPay" onclick="selectGateway('vnpay')" style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border:2px solid var(--primary); background:#F0F7FF; border-radius:18px; cursor:pointer; transition:all 0.2s;">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <input type="radio" name="payment_gateway" value="vnpay" checked style="width:20px; height:20px; accent-color:var(--primary);">
                                <div>
                                    <div style="font-weight:900; font-size:1.1rem; color:#005BAA;">Cổng thanh toán VNPAY</div>
                                    <div style="font-size:0.85rem; color:var(--gray-500);">Quét mã VNPAY-QR, Thẻ ATM 40+ Ngân hàng, Internet Banking, Visa/Mastercard</div>
                                </div>
                            </div>
                            <span class="badge badge-primary" style="font-weight:800;">Khuyên dùng</span>
                        </label>

                        <!-- MoMo Option -->
                        <label id="lblMomo" onclick="selectGateway('momo')" style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border:2px solid var(--gray-200); background:white; border-radius:18px; cursor:pointer; transition:all 0.2s;">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <input type="radio" name="payment_gateway" value="momo" style="width:20px; height:20px; accent-color:#A50064;">
                                <div>
                                    <div style="font-weight:900; font-size:1.1rem; color:#A50064;">Ví điện tử MoMo</div>
                                    <div style="font-size:0.85rem; color:var(--gray-500);">Quét mã QR MoMo hoặc thanh toán qua App MoMo trên điện thoại</div>
                                </div>
                            </div>
                            <span class="badge" style="background:rgba(165,0,100,0.1); color:#A50064; font-weight:800;">Nhanh chóng</span>
                        </label>
                    </div>

                    <a id="btnProceedPayment" href="/payment/process?method=vnpay" class="btn btn-primary" style="display:block; text-align:center; padding:16px; font-size:1.15rem; font-weight:900; border-radius:16px; box-shadow:0 8px 24px rgba(0,102,255,0.25); text-decoration:none;">
                        Tiếp tục thanh toán ${formatMoney(totalAmount)} →
                    </a>
                </div>

                <!-- Order Summary -->
                <div class="card" style="padding:28px; background:var(--gray-50); border-radius:24px; border:1px solid var(--gray-200); position:sticky; top:100px;">
                    <h4 style="font-size:1.15rem; font-weight:800; margin-bottom:16px; border-bottom:1px solid var(--gray-200); padding-bottom:12px;">
                        Tóm tắt đơn hàng (#TG-2026-8899)
                    </h4>

                    <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:20px;">
                        ${CART_ITEMS.map(item => `
                            <div style="font-size:0.9rem; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                                <div style="font-weight:700;">${item.title}</div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">${item.subtitle} • SL: ${item.quantity}</div>
                                <div style="text-align:right; font-weight:800; color:var(--primary); margin-top:2px;">
                                    ${formatMoney(item.subtotal)}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.1rem; font-weight:900; color:var(--gray-900); padding-top:12px; border-top:2px solid var(--gray-300);">
                        <span>Tổng thanh toán:</span>
                        <span style="color:var(--secondary); font-size:1.4rem;">${formatMoney(totalAmount)}</span>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function selectGateway(method) {
                const btn = document.getElementById('btnProceedPayment');
                const lblVnpay = document.getElementById('lblVnPay');
                const lblMomo = document.getElementById('lblMomo');

                if (method === 'vnpay') {
                    lblVnpay.style.border = '2px solid var(--primary)';
                    lblVnpay.style.background = '#F0F7FF';
                    lblMomo.style.border = '2px solid var(--gray-200)';
                    lblMomo.style.background = 'white';
                    btn.href = '/payment/process?method=vnpay';
                } else {
                    lblMomo.style.border = '2px solid #A50064';
                    lblMomo.style.background = '#FDF2F8';
                    lblVnpay.style.border = '2px solid var(--gray-200)';
                    lblVnpay.style.background = 'white';
                    btn.href = '/payment/process?method=momo';
                }
            }

            let rem = 899;
            const timer = document.getElementById('previewCountdownTimer');
            if (timer) {
                setInterval(() => {
                    if (rem > 0) {
                        rem--;
                        const m = Math.floor(rem / 60);
                        const s = rem % 60;
                        timer.textContent = m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
                    }
                }, 1000);
            }
        </script>
    `;
}

// 13. PAYMENT PROCESS (Mô phỏng Cổng thanh toán)
function handlePaymentProcess(method = 'vnpay') {
    const totalAmount = calculateCartTotal();
    const isVnpay = method === 'vnpay';

    return `
        <div style="max-width:540px; margin:40px auto; padding:0 20px;">
            <div class="card" style="padding:40px; background:white; border-radius:28px; box-shadow:var(--shadow-xl); border:1px solid var(--gray-200); text-align:center;">
                
                ${isVnpay ? `
                    <div style="background:#005BAA; color:white; padding:14px 24px; border-radius:18px; margin-bottom:20px; display:inline-flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem; font-weight:900; letter-spacing:0.04em;">VNPAY</span>
                        <span style="font-size:0.85rem; opacity:0.85;">| Cổng thanh toán quốc gia</span>
                    </div>
                ` : `
                    <div style="background:#A50064; color:white; padding:14px 24px; border-radius:18px; margin-bottom:20px; display:inline-flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem; font-weight:900; letter-spacing:0.04em;">MoMo</span>
                        <span style="font-size:0.85rem; opacity:0.85;">| Ví điện tử tiện lợi</span>
                    </div>
                `}

                <div style="font-size:0.9rem; color:var(--gray-500); margin-bottom:4px;">Số tiền cần thanh toán</div>
                <div style="font-size:2.4rem; font-weight:900; color:var(--gray-900); margin-bottom:20px;">
                    ${formatMoney(totalAmount)}
                </div>

                <div style="background:var(--gray-50); padding:16px; border-radius:16px; margin-bottom:24px; font-size:0.88rem; text-align:left;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span style="color:var(--gray-500);">Mã đơn hàng:</span>
                        <strong style="color:var(--primary);">TG-2026-8899</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span style="color:var(--gray-500);">Đơn vị thụ hưởng:</span>
                        <strong>Công ty Cổ phần Du lịch TravelGo</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--gray-500);">Nội dung chuyển khoản:</span>
                        <strong>TG20268899 TT VE</strong>
                    </div>
                </div>

                <div style="background:white; padding:20px; border-radius:20px; display:inline-block; border:2px dashed var(--gray-300); margin-bottom:20px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TRAVELGO_PAY_TG20268899_${isVnpay ? 'VNPAY' : 'MOMO'}" 
                         alt="QR Code Thanh toán" style="width:190px; height:190px; display:block; border-radius:12px;">
                    <div style="font-size:0.82rem; color:var(--gray-500); margin-top:10px; font-weight:600;">
                        Mở App Ngân hàng hoặc ${isVnpay ? 'VNPAY' : 'MoMo'} để quét mã
                    </div>
                </div>

                <div style="background:#FEF3C7; border:1px solid #FCD34D; padding:14px; border-radius:14px; margin-bottom:20px; font-size:0.84rem; color:#92400E; text-align:left;">
                    💡 <strong>Môi trường Chấm điểm (Sandbox):</strong> Bạn có thể nhấn nút xác nhận bên dưới để mô phỏng khách hàng đã quét mã thanh toán thành công 100%.
                </div>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <a href="/payment/success" class="btn btn-success" style="padding:16px; font-size:1.1rem; font-weight:900; border-radius:16px; text-decoration:none; box-shadow:0 6px 18px rgba(16,185,129,0.35);">
                        ✓ MÔ PHỎNG: XÁC NHẬN ĐÃ THANH TOÁN
                    </a>

                    <a href="/payment/checkout" class="btn btn-ghost" style="color:var(--gray-500); font-weight:600; text-decoration:none;">
                        Quay lại chọn phương thức khác
                    </a>
                </div>
            </div>
        </div>
    `;
}

// 14. PAYMENT SUCCESS
function handlePaymentSuccess() {
    const totalAmount = calculateCartTotal();
    const transCode = 'VNP-' + Date.now().toString().slice(-8);

    return `
        <div style="max-width:760px; margin:40px auto; padding:0 24px; text-align:center;">
            <div class="card" style="padding:48px 36px; background:white; border-radius:32px; box-shadow:var(--shadow-xl); border:1px solid var(--gray-100);">
                
                <div style="width:84px; height:84px; border-radius:50%; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; color:var(--success);">
                    <i data-lucide="check-circle-2" style="width:52px; height:52px;"></i>
                </div>

                <span class="badge badge-success" style="font-size:0.9rem; padding:8px 20px; font-weight:800; margin-bottom:12px;">
                    GIAO DỊCH HOÀN TẤT
                </span>

                <h1 style="font-size:2.4rem; font-weight:900; color:var(--gray-900); margin-bottom:8px;">
                    Thanh toán Thành công!
                </h1>
                <p style="color:var(--gray-500); font-size:1.05rem; margin-bottom:32px;">
                    Hệ thống TravelGo đã xác nhận giao dịch. Chỗ của bạn đã được khóa giữ an toàn 100%.
                </p>

                <div style="background:var(--gray-50); border-radius:20px; padding:24px; text-align:left; margin-bottom:32px; font-size:0.95rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                        <span style="color:var(--gray-500);">Mã đơn hàng:</span>
                        <strong style="color:var(--primary); font-size:1.05rem;">TG-2026-8899</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                        <span style="color:var(--gray-500);">Mã giao dịch ngân hàng:</span>
                        <strong style="font-family:monospace; color:var(--gray-900);">${transCode}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                        <span style="color:var(--gray-500);">Phương thức:</span>
                        <strong style="color:#005BAA;">CỔNG THANH TOÁN VNPAY (QR-PAY)</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                        <span style="color:var(--gray-500);">Thời gian thanh toán:</span>
                        <strong>10/09/2026 - 00:15:30</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:var(--gray-500); font-weight:600;">Tổng tiền đã thanh toán:</span>
                        <span style="font-size:1.6rem; font-weight:900; color:var(--success);">${formatMoney(totalAmount)}</span>
                    </div>
                </div>

                <div style="margin-bottom:28px;">
                    <a href="/booking/detail/TG-2026-8899" class="btn btn-primary btn-lg" style="padding:18px 48px; font-size:1.2rem; font-weight:900; border-radius:20px; box-shadow:0 8px 28px rgba(0,102,255,0.35); text-decoration:none;">
                        🎟️ Xem Vé Điện Tử (E-Ticket) & Mã QR Ngay →
                    </a>
                </div>

                <div style="display:flex; justify-content:center; gap:16px;">
                    <a href="/dashboard" class="btn btn-outline btn-sm" style="font-weight:700;">
                        Về Dashboard của tôi
                    </a>
                    <a href="/" class="btn btn-ghost btn-sm" style="color:var(--gray-500);">
                        Về Trang chủ
                    </a>
                </div>
            </div>
        </div>
    `;
}

// 15. ADMIN USERS (Quản lý Tài khoản & Phân quyền)
function handleAdminUsers() {
    const users = [
        { id: 1, name: 'Nguyễn Quản Trị', user: 'admin', email: 'admin@travelgo.vn', phone: '0901000001', role: 'admin', status: 'active', orders: 12 },
        { id: 2, name: 'Trần Thị Hoa', user: 'nv_hoa', email: 'hoa.nv@travelgo.vn', phone: '0901000002', role: 'employee', status: 'active', orders: 5 },
        { id: 3, name: 'Lê Văn Minh', user: 'nv_minh', email: 'minh.nv@travelgo.vn', phone: '0901000003', role: 'employee', status: 'active', orders: 3 },
        { id: 4, name: 'Nguyễn Đối Tác A', user: 'dt_saigontour', email: 'saigontour@example.com', phone: '0901000004', role: 'partner', status: 'active', orders: 0, company: 'Saigontourist Transport' },
        { id: 5, name: 'Trần Đối Tác B', user: 'dt_havanhotel', email: 'havanhotel@example.com', phone: '0901000005', role: 'partner', status: 'active', orders: 0, company: 'Havan Hotel Group' },
        { id: 6, name: 'Nguyễn Văn An', user: 'kh_an', email: 'an.nguyen@gmail.com', phone: '0901000006', role: 'customer', status: 'active', orders: 4 },
        { id: 7, name: 'Trần Văn Bình', user: 'kh_binh', email: 'binh.tran@gmail.com', phone: '0901000007', role: 'customer', status: 'active', orders: 2 },
        { id: 8, name: 'Lê Hoàng Phạm', user: 'kh_baduser', email: 'baduser@gmail.com', phone: '0901000099', role: 'customer', status: 'banned', orders: 1 }
    ];

    return `
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            <!-- Subnav Bar -->
            <div style="display:flex; gap:12px; margin-bottom:28px; border-bottom:1px solid var(--gray-200); padding-bottom:12px;">
                <a href="/admin" class="btn btn-ghost btn-sm" style="font-weight:700;">📊 Tổng quan GMV</a>
                <a href="/admin/users" class="btn btn-primary btn-sm" style="font-weight:800;">👥 Tài khoản & Phân quyền</a>
                <a href="/admin/settings" class="btn btn-ghost btn-sm" style="font-weight:700;">⚙️ Cấu hình hệ thống</a>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-size:2rem; font-weight:900; display:flex; align-items:center; gap:10px;">
                        👥 Quản lý Tài khoản & Phân quyền (RBAC)
                    </h2>
                    <p style="color:var(--gray-500); font-size:0.95rem; margin-top:4px;">
                        Quản trị viên kiểm soát người dùng, thay đổi vai trò (Role) và khóa/mở tài khoản
                    </p>
                </div>
                <button onclick="showToast('Mở form tạo tài khoản nhân viên / đối tác mới!')" class="btn btn-primary" style="font-weight:800;">
                    + Thêm tài khoản mới
                </button>
            </div>

            <!-- Role Pills -->
            <div style="display:flex; gap:10px; margin-bottom:24px; flex-wrap:wrap;">
                <span class="badge" style="padding:10px 18px; font-size:0.88rem; background:var(--primary); color:white; font-weight:800;">Tất cả (8)</span>
                <span class="badge" style="padding:10px 18px; font-size:0.88rem; background:#38BDF8; color:#0B1120; font-weight:800;">👑 Quản trị viên (1)</span>
                <span class="badge" style="padding:10px 18px; font-size:0.88rem; background:#8B5CF6; color:white; font-weight:800;">💼 Nhân viên (2)</span>
                <span class="badge" style="padding:10px 18px; font-size:0.88rem; background:#FB923C; color:white; font-weight:800;">🤝 Đối tác (2)</span>
                <span class="badge" style="padding:10px 18px; font-size:0.88rem; background:var(--success); color:white; font-weight:800;">🧑 Khách hàng (3)</span>
            </div>

            <!-- Users Table -->
            <div class="card" style="padding:28px; background:white; border-radius:24px; box-shadow:var(--shadow-sm);">
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:separate; border-spacing:0 8px;">
                        <thead>
                            <tr style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.04em;">
                                <th style="padding:12px 16px; text-align:left;">ID</th>
                                <th style="padding:12px 16px; text-align:left;">Họ và tên</th>
                                <th style="padding:12px 16px; text-align:left;">Liên hệ</th>
                                <th style="padding:12px 16px; text-align:left;">Vai trò (Quyền hạn)</th>
                                <th style="padding:12px 16px; text-align:center;">Trạng thái</th>
                                <th style="padding:12px 16px; text-align:center;">Đơn hàng</th>
                                <th style="padding:12px 16px; text-align:right;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr style="background:var(--gray-50); border-radius:16px;">
                                    <td style="padding:16px; font-weight:800; color:var(--gray-400); border-radius:16px 0 0 16px;">#${u.id}</td>
                                    <td style="padding:16px;">
                                        <strong>${u.name}</strong><br>
                                        <span style="font-size:0.82rem; color:var(--gray-500);">@${u.user}</span>
                                    </td>
                                    <td style="padding:16px; font-size:0.9rem;">
                                        ${u.email}<br>
                                        <span style="color:var(--gray-500); font-size:0.82rem;">${u.phone}</span>
                                    </td>
                                    <td style="padding:16px;">
                                        <select onchange="showToast('Đã cập nhật quyền của @${u.user} sang: ' + this.value)" style="padding:6px 12px; border-radius:10px; font-weight:800; font-size:0.84rem; cursor:pointer; border:1px solid #CBD5E1; background:white;">
                                            <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>🧑 Khách hàng</option>
                                            <option value="partner" ${u.role === 'partner' ? 'selected' : ''}>🤝 Đối tác</option>
                                            <option value="employee" ${u.role === 'employee' ? 'selected' : ''}>💼 Nhân viên</option>
                                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 Quản trị viên</option>
                                        </select>
                                        ${u.company ? `<div style="font-size:0.75rem; color:var(--gray-500); margin-top:4px;">DN: ${u.company}</div>` : ''}
                                    </td>
                                    <td style="padding:16px; text-align:center;">
                                        <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}" style="font-size:0.8rem;">
                                            ${u.status === 'active' ? 'Đang hoạt động' : 'Đã bị khóa'}
                                        </span>
                                    </td>
                                    <td style="padding:16px; text-align:center; font-weight:800; color:var(--primary);">
                                        ${u.orders} đơn
                                    </td>
                                    <td style="padding:16px; text-align:right; border-radius:0 16px 16px 0;">
                                        ${u.id !== 1 ? `
                                            <button onclick="this.textContent = this.textContent.includes('Khóa') ? 'Mở khóa' : 'Khóa'; showToast('Đã thay đổi trạng thái tài khoản @${u.user}!')" class="btn btn-sm ${u.status === 'active' ? 'btn-outline' : 'btn-success'}" style="font-size:0.8rem; padding:6px 14px; font-weight:700;">
                                                ${u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                                            </button>
                                        ` : `<span style="color:var(--gray-400); font-size:0.8rem; font-style:italic;">(Bạn)</span>`}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 16. ADMIN SETTINGS
function handleAdminSettings() {
    return `
        <div style="max-width:960px; margin:40px auto; padding:0 24px;">
            <!-- Subnav Bar -->
            <div style="display:flex; gap:12px; margin-bottom:28px; border-bottom:1px solid var(--gray-200); padding-bottom:12px;">
                <a href="/admin" class="btn btn-ghost btn-sm" style="font-weight:700;">📊 Tổng quan GMV</a>
                <a href="/admin/users" class="btn btn-ghost btn-sm" style="font-weight:700;">👥 Tài khoản & Phân quyền</a>
                <a href="/admin/settings" class="btn btn-primary btn-sm" style="font-weight:800;">⚙️ Cấu hình hệ thống</a>
            </div>

            <div style="margin-bottom:28px;">
                <h2 style="font-size:2rem; font-weight:900; display:flex; align-items:center; gap:10px;">
                    ⚙️ Cấu hình Hệ thống TravelGo
                </h2>
                <p style="color:var(--gray-500); font-size:0.95rem; margin-top:4px;">
                    Thiết lập tham số nghiệp vụ trọng yếu: Khóa giữ chỗ 15 phút, cổng thanh toán VNPay/MoMo, chính sách hoàn tiền
                </p>
            </div>

            <form onsubmit="event.preventDefault(); showToast('Đã lưu và cập nhật cấu hình hệ thống thành công!');">
                <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
                    <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="clock" style="color:var(--primary);width:20px;height:20px;"></i> Quy định Giữ chỗ 15 phút
                    </h3>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Thời gian giữ chỗ tạm thời (Phút)</label>
                            <input type="number" value="15" min="5" max="60" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:1.05rem; font-weight:800; color:var(--primary);">
                            <small style="color:var(--gray-500); display:block; margin-top:6px;">Quá 15 phút đơn hàng chưa thanh toán sẽ tự động nhả ghế/phòng cho người khác.</small>
                        </div>
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Tên nền tảng</label>
                            <input type="text" value="TravelGo Luxury" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                        </div>
                    </div>
                </div>

                <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
                    <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="credit-card" style="color:var(--success);width:20px;height:20px;"></i> Bật / Tắt Cổng Thanh toán
                    </h3>

                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <label style="display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:var(--gray-50); border-radius:16px; cursor:pointer;">
                            <div>
                                <strong style="color:#005BAA; font-size:1.05rem;">Cổng thanh toán VNPAY (QR Pay / Thẻ ATM / Visa)</strong>
                                <div style="font-size:0.85rem; color:var(--gray-500);">Kích hoạt thanh toán quét mã QR qua ứng dụng ngân hàng</div>
                            </div>
                            <input type="checkbox" checked style="width:22px; height:22px; accent-color:var(--primary);">
                        </label>

                        <label style="display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:var(--gray-50); border-radius:16px; cursor:pointer;">
                            <div>
                                <strong style="color:#A50064; font-size:1.05rem;">Ví điện tử MoMo</strong>
                                <div style="font-size:0.85rem; color:var(--gray-500);">Kích hoạt thanh toán quét mã qua ứng dụng MoMo</div>
                            </div>
                            <input type="checkbox" checked style="width:22px; height:22px; accent-color:#A50064;">
                        </label>
                    </div>
                </div>

                <div style="text-align:right;">
                    <button type="submit" class="btn btn-primary" style="padding:14px 36px; font-weight:800; font-size:1.05rem;">
                        ✓ Lưu cấu hình hệ thống
                    </button>
                </div>
            </form>
        </div>
    `;
}

// 17. EMPLOYEE QR SCANNER
function handleEmployeeQr(searchCode = '') {
    const defaultCode = searchCode || 'BK-20260905-001';
    return `
        <div style="max-width:860px; margin:40px auto; padding:0 24px;">
            <!-- Subnav Bar -->
            <div style="display:flex; gap:12px; margin-bottom:28px; border-bottom:1px solid var(--gray-200); padding-bottom:12px;">
                <a href="/employee" class="btn btn-ghost btn-sm" style="font-weight:700;">📋 Hàng đợi Duyệt</a>
                <a href="/employee/qr" class="btn btn-primary btn-sm" style="font-weight:800;">🔍 Soát vé QR Check-in</a>
                <a href="/employee/refunds" class="btn btn-ghost btn-sm" style="font-weight:700;">💸 Xử lý Hoàn tiền</a>
            </div>

            <div style="text-align:center; margin-bottom:32px;">
                <h2 style="font-size:2rem; font-weight:900; display:flex; align-items:center; justify-content:center; gap:10px;">
                    <i data-lucide="qr-code" style="color:var(--primary);width:32px;height:32px;"></i> Soát vé & Quét QR Code Check-in
                </h2>
                <p style="color:var(--gray-500); font-size:0.95rem; margin-top:4px;">
                    Nhân viên bến xe / Lễ tân khách sạn kiểm tra tính hợp lệ của Vé điện tử và xác nhận khách lên xe
                </p>
            </div>

            <!-- Search Card -->
            <div class="card" style="padding:28px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
                <form method="GET" action="/employee/qr" style="display:flex; gap:12px; margin-bottom:14px;">
                    <div style="flex:1; position:relative;">
                        <i data-lucide="scan" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); width:20px; height:20px; color:var(--primary);"></i>
                        <input type="text" name="code" value="${defaultCode}" placeholder="Nhập hoặc quét mã vé (vd: BK-20260905-001)..." required style="width:100%; padding:14px 16px 14px 48px; border-radius:14px; border:2px solid var(--primary); font-size:1.05rem; font-weight:800;">
                    </div>
                    <button type="submit" class="btn btn-primary" style="padding:14px 28px; font-weight:800;">
                        Kiểm tra vé
                    </button>
                </form>

                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.85rem; color:var(--gray-500);">
                    <span>Mã vé mẫu test nhanh:</span>
                    <a href="/employee/qr?code=BK-20260905-001" class="badge badge-secondary" style="text-decoration:none;">BK-20260905-001</a>
                    <a href="/employee/qr?code=BK-20260905-002" class="badge badge-secondary" style="text-decoration:none;">BK-20260905-002</a>
                    <a href="/employee/qr?code=BK-20260906-003" class="badge badge-secondary" style="text-decoration:none;">BK-20260906-003</a>
                </div>
            </div>

            <!-- Ticket Card -->
            <div class="card" style="padding:36px; background:white; border-radius:28px; box-shadow:var(--shadow-xl); border:2px solid var(--primary); margin-bottom:40px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gray-100); padding-bottom:20px; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                    <div>
                        <span style="font-size:0.85rem; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.04em;">KẾT QUẢ XÁC THỰC VÉ</span>
                        <h3 style="font-size:1.6rem; font-weight:900; color:var(--primary); margin-top:2px;">
                            ${defaultCode}
                        </h3>
                    </div>

                    <div id="checkinBadgeContainer">
                        <div class="badge" style="background:rgba(0,102,255,0.12); color:var(--primary); padding:10px 20px; font-size:1rem; font-weight:900;">
                            🎫 VÉ HỢP LỆ - CHỜ CHECK-IN
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px;">
                    <div style="background:var(--gray-50); padding:20px; border-radius:18px;">
                        <div style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; margin-bottom:6px;">HÀNH KHÁCH</div>
                        <div style="font-size:1.2rem; font-weight:800; color:var(--gray-900);">Nguyễn Văn An</div>
                        <div style="font-size:0.9rem; color:var(--gray-600); margin-top:4px;">📞 0901234567</div>
                        <div style="font-size:0.85rem; color:var(--gray-500);">✉️ an.nguyen@gmail.com</div>
                    </div>

                    <div style="background:var(--gray-50); padding:20px; border-radius:18px;">
                        <div style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; margin-bottom:6px;">CHI TIẾT VÉ & DỊCH VỤ</div>
                        <div style="font-size:1.15rem; font-weight:800; color:var(--gray-900);">TP. HCM → Đà Lạt</div>
                        <div style="font-size:0.9rem; color:var(--primary); font-weight:700; margin-top:4px;">Khởi hành: 05/09/2026 lúc 07:30</div>
                        <div style="font-size:0.85rem; color:var(--gray-600); margin-top:2px;">Xe Limousine 9 chỗ VIP • <strong>2 vé (Ghế A1, A2)</strong></div>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; background:#F0FDF4; padding:18px 24px; border-radius:16px; border:1px solid #BBF7D0; margin-bottom:28px;">
                    <div>
                        <div style="font-size:0.82rem; color:#15803D; font-weight:700;">TRẠNG THÁI THANH TOÁN</div>
                        <div style="font-size:1.2rem; font-weight:900; color:#166534;">700.000₫ (Đã thanh toán VNPay)</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.82rem; color:var(--gray-500);">Trạng thái soát vé</div>
                        <div id="checkinStatusText" style="font-weight:800; color:var(--primary);">Chưa lên xe</div>
                    </div>
                </div>

                <div style="text-align:center;">
                    <button id="btnConfirmCheckin" onclick="confirmCheckin()" class="btn btn-success" style="padding:16px 48px; font-size:1.2rem; font-weight:900; border-radius:18px; box-shadow:0 8px 24px rgba(16,185,129,0.35);">
                        ✓ XÁC NHẬN CHO HÀNH KHÁCH LÊN XE
                    </button>
                </div>
            </div>
        </div>

        <script>
            function confirmCheckin() {
                document.getElementById('checkinBadgeContainer').innerHTML = '<div class="badge badge-success" style="padding:10px 20px; font-size:1rem; font-weight:900;">✅ ĐÃ CHECK-IN LÊN XE</div>';
                document.getElementById('checkinStatusText').innerHTML = '<span style="color:var(--success)">Đã lên xe (Vừa xong)</span>';
                document.getElementById('btnConfirmCheckin').style.display = 'none';
                showToast('✅ CHECK-IN THÀNH CÔNG! Đã xác nhận khách hàng lên xe.');
            }
        </script>
    `;
}

// 18. EMPLOYEE REFUNDS
function handleEmployeeRefunds() {
    return `
        <div style="max-width:1100px; margin:40px auto; padding:0 24px;">
            <!-- Subnav Bar -->
            <div style="display:flex; gap:12px; margin-bottom:28px; border-bottom:1px solid var(--gray-200); padding-bottom:12px;">
                <a href="/employee" class="btn btn-ghost btn-sm" style="font-weight:700;">📋 Hàng đợi Duyệt</a>
                <a href="/employee/qr" class="btn btn-ghost btn-sm" style="font-weight:700;">🔍 Soát vé QR Check-in</a>
                <a href="/employee/refunds" class="btn btn-primary btn-sm" style="font-weight:800;">💸 Xử lý Hoàn tiền</a>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-size:2rem; font-weight:900; display:flex; align-items:center; gap:10px;">
                        💸 Xử lý Hàng đợi Hoàn tiền Vé (Bậc thang)
                    </h2>
                    <p style="color:var(--gray-500); font-size:0.95rem; margin-top:4px;">
                        Tự động tính tỷ lệ hoàn tiền: ≥7 ngày hoàn 100%, 3-6 ngày hoàn 50%, 1-2 ngày hoàn 20%
                    </p>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:20px;">
                <!-- Item 1 -->
                <div class="card" style="padding:28px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); border-left:5px solid #FB923C;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px;">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--primary); font-size:1.15rem;">#RF-001</span>
                                <span class="badge" style="background:rgba(251,146,60,0.15); color:#EA580C; font-weight:800;">Chờ xét duyệt</span>
                                <span style="font-size:0.82rem; color:var(--gray-400);">Booking: <strong>BK-20260901-015</strong></span>
                            </div>
                            <div style="font-size:1.05rem; font-weight:700; margin-bottom:6px;">Phạm Hồng Đức — 0905123456</div>
                            <div style="background:var(--gray-50); padding:14px 18px; border-radius:12px; margin-bottom:12px; font-size:0.9rem;">
                                <strong>Dịch vụ:</strong> 🚌 SG-DL-01 (Limousine TP.HCM → Đà Lạt)<br>
                                <strong>Lý do khách gửi:</strong> <em>"Thay đổi kế hoạch cá nhân"</em>
                            </div>
                            <div style="display:flex; gap:24px; font-size:0.9rem; flex-wrap:wrap;">
                                <div>Giá gốc: <strong>350.000₫</strong></div>
                                <div>Thời gian trước khởi hành: <strong>8 ngày</strong></div>
                                <div>Mức hoàn: <span class="badge badge-success" style="font-weight:800;">100%</span></div>
                                <div>Số tiền hoàn: <strong style="color:var(--success); font-size:1.15rem;">350.000₫</strong></div>
                            </div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px; min-width:180px;">
                            <button onclick="this.closest('.card').style.borderLeftColor='var(--success)'; this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ ĐÃ DUYỆT HOÀN 350.000₫</span>'; showToast('Đã phê duyệt hoàn tiền 350.000₫!');" class="btn btn-success" style="font-weight:800; padding:12px 20px;">
                                ✓ Duyệt hoàn tiền
                            </button>
                            <button onclick="this.closest('.card').style.opacity='0.5'; this.parentElement.innerHTML='<span style=color:var(--danger);font-weight:900>❌ ĐÃ TỪ CHỐI</span>'; showToast('Đã từ chối hoàn tiền', 'error');" class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--danger); font-weight:700;">
                                ✕ Từ chối
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Item 2 -->
                <div class="card" style="padding:28px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); border-left:5px solid #FB923C;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px;">
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                                <span style="font-weight:900; color:var(--primary); font-size:1.15rem;">#RF-002</span>
                                <span class="badge" style="background:rgba(251,146,60,0.15); color:#EA580C; font-weight:800;">Chờ xét duyệt</span>
                                <span style="font-size:0.82rem; color:var(--gray-400);">Booking: <strong>BK-20260903-022</strong></span>
                            </div>
                            <div style="font-size:1.05rem; font-weight:700; margin-bottom:6px;">Vũ Thanh Mai — 0918765432</div>
                            <div style="background:var(--gray-50); padding:14px 18px; border-radius:12px; margin-bottom:12px; font-size:0.9rem;">
                                <strong>Dịch vụ:</strong> 🚌 SG-NT-02 (Giường nằm TP.HCM → Nha Trang, 2 vé)<br>
                                <strong>Lý do khách gửi:</strong> <em>"Bị ốm đột xuất không thể đi"</em>
                            </div>
                            <div style="display:flex; gap:24px; font-size:0.9rem; flex-wrap:wrap;">
                                <div>Giá gốc: <strong>560.000₫</strong></div>
                                <div>Thời gian trước khởi hành: <strong>4 ngày</strong></div>
                                <div>Mức hoàn: <span class="badge badge-warning" style="font-weight:800;">50%</span></div>
                                <div>Số tiền hoàn: <strong style="color:#D97706; font-size:1.15rem;">280.000₫</strong></div>
                            </div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px; min-width:180px;">
                            <button onclick="this.closest('.card').style.borderLeftColor='var(--success)'; this.parentElement.innerHTML='<span style=color:var(--success);font-weight:900>✅ ĐÃ DUYỆT HOÀN 280.000₫</span>'; showToast('Đã phê duyệt hoàn tiền 280.000₫!');" class="btn btn-success" style="font-weight:800; padding:12px 20px;">
                                ✓ Duyệt hoàn tiền
                            </button>
                            <button onclick="this.closest('.card').style.opacity='0.5'; this.parentElement.innerHTML='<span style=color:var(--danger);font-weight:900>❌ ĐÃ TỪ CHỐI</span>'; showToast('Đã từ chối hoàn tiền', 'error');" class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--danger); font-weight:700;">
                                ✕ Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 19. PARTNER TRIP CREATE
function handlePartnerTripCreate() {
    return `
        <div style="max-width:800px; margin:40px auto; padding:0 24px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:28px;">
                <a href="/partner" class="btn btn-ghost btn-sm">
                    <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Quay lại
                </a>
                <h2 style="font-size:1.8rem; font-weight:900;">Đăng ký Chuyến xe mới</h2>
            </div>

            <div class="card" style="padding:36px; background:white; border-radius:24px; box-shadow:var(--shadow-md);">
                <form onsubmit="event.preventDefault(); showToast('✅ Đã gửi yêu cầu đăng ký chuyến xe mới! Đang chờ Nhân viên phê duyệt.'); setTimeout(() => window.location.href='/partner', 1500);">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Điểm khởi hành <span style="color:var(--danger)">*</span></label>
                            <select class="form-control" required>
                                <option value="">-- Chọn điểm đi --</option>
                                <option value="1" selected>TP. Hồ Chí Minh</option>
                                <option value="2">Hà Nội</option>
                                <option value="3">Đà Nẵng</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Điểm đến <span style="color:var(--danger)">*</span></label>
                            <select class="form-control" required>
                                <option value="">-- Chọn điểm đến --</option>
                                <option value="4" selected>Đà Lạt</option>
                                <option value="5">Nha Trang</option>
                                <option value="6">Phú Quốc</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Loại xe <span style="color:var(--danger)">*</span></label>
                            <select class="form-control" required>
                                <option value="1" selected>Xe Limousine 9 chỗ VIP</option>
                                <option value="2">Xe Giường Nằm 34 phòng</option>
                                <option value="3">Máy Bay</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Thời gian khởi hành <span style="color:var(--danger)">*</span></label>
                            <input type="datetime-local" class="form-control" value="2026-09-15T08:00" required>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Tổng số ghế / chỗ <span style="color:var(--danger)">*</span></label>
                            <input type="number" class="form-control" value="9" min="1" required>
                        </div>
                        <div>
                            <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Giá vé (VND) <span style="color:var(--danger)">*</span></label>
                            <input type="number" class="form-control" value="380000" min="10000" step="10000" required>
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Mô tả tiện ích chuyến đi</label>
                        <textarea class="form-control" rows="3">Ghế massage da cao cấp, cổng sạc Type-C, wifi tốc độ cao, khăn lạnh và nước uống miễn phí.</textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; padding-top:16px; border-top:1px solid var(--gray-100);">
                        <a href="/partner" class="btn btn-ghost">Hủy bỏ</a>
                        <button type="submit" class="btn btn-primary" style="padding:12px 32px; font-weight:800;">
                            ✓ Gửi chuyến xe chờ duyệt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// 20. REVIEW & SOCIAL PROOF COMPONENT
function renderReviewSectionHtml(type, itemId) {
    const reviews = MOCK_DATA.reviews.filter(r => r.type === type && r.item_id === itemId);
    const displayReviews = reviews.length > 0 ? reviews : MOCK_DATA.reviews;

    return `
        <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-top:32px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px; border-bottom:1px solid var(--gray-200); padding-bottom:24px; margin-bottom:24px;">
                <div>
                    <div style="display:inline-flex; align-items:center; gap:6px; color:#F59E0B; font-weight:800; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.04em;">
                        <i data-lucide="star" style="width:16px;height:16px;fill:#F59E0B;"></i> ĐÁNH GIÁ TỪ HÀNH KHÁCH
                    </div>
                    <h3 style="font-size:1.7rem; font-weight:900; color:var(--gray-900); margin:4px 0 0;">
                        Trải nghiệm & Bình luận thực tế
                    </h3>
                </div>

                <div style="display:flex; align-items:center; gap:20px; background:var(--gray-50); padding:16px 24px; border-radius:18px; border:1px solid var(--gray-200);">
                    <div style="text-align:center;">
                        <div style="font-size:2.4rem; font-weight:900; color:var(--gray-900); line-height:1;">4.9</div>
                        <div style="color:#F59E0B; font-size:0.95rem; margin-top:4px;">★★★★★</div>
                    </div>
                    <div style="border-left:1px solid var(--gray-300); padding-left:16px; font-size:0.88rem; color:var(--gray-600);">
                        Dựa trên <strong>${displayReviews.length + 124}</strong> lượt đánh giá<br>
                        <span style="color:var(--success); font-weight:700;">100% Đã xác thực đặt chỗ</span>
                    </div>
                </div>
            </div>

            <!-- Star Breakdown Bars -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:32px; align-items:center;">
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; align-items:center; gap:12px; font-size:0.85rem;">
                        <span style="min-width:45px; font-weight:700; color:var(--gray-700);">5 sao</span>
                        <div style="flex:1; height:8px; background:var(--gray-100); border-radius:4px; overflow:hidden;">
                            <div style="width:85%; height:100%; background:linear-gradient(90deg, #F59E0B, #FBBF24); border-radius:4px;"></div>
                        </div>
                        <span style="min-width:35px; text-align:right; color:var(--gray-500); font-weight:600;">85%</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px; font-size:0.85rem;">
                        <span style="min-width:45px; font-weight:700; color:var(--gray-700);">4 sao</span>
                        <div style="flex:1; height:8px; background:var(--gray-100); border-radius:4px; overflow:hidden;">
                            <div style="width:12%; height:100%; background:linear-gradient(90deg, #F59E0B, #FBBF24); border-radius:4px;"></div>
                        </div>
                        <span style="min-width:35px; text-align:right; color:var(--gray-500); font-weight:600;">12%</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px; font-size:0.85rem;">
                        <span style="min-width:45px; font-weight:700; color:var(--gray-700);">3 sao</span>
                        <div style="flex:1; height:8px; background:var(--gray-100); border-radius:4px; overflow:hidden;">
                            <div style="width:3%; height:100%; background:linear-gradient(90deg, #F59E0B, #FBBF24); border-radius:4px;"></div>
                        </div>
                        <span style="min-width:35px; text-align:right; color:var(--gray-500); font-weight:600;">3%</span>
                    </div>
                </div>

                <div style="background:linear-gradient(135deg, rgba(0,102,255,0.06), rgba(0,245,212,0.08)); border:1px dashed var(--primary); padding:20px; border-radius:18px;">
                    <div style="font-weight:800; color:var(--primary); font-size:0.95rem; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="shield-check" style="width:18px;height:18px;"></i> Tiêu chuẩn Đánh giá Xác thực
                    </div>
                    <p style="font-size:0.86rem; color:var(--gray-600); margin:0; line-height:1.5;">
                        Chỉ hành khách có mã đặt chỗ hợp lệ đã thanh toán mới có thể viết đánh giá. Nhà xe có trách nhiệm phản hồi minh bạch các góp ý.
                    </p>
                </div>
            </div>

            <!-- Review Form -->
            <div style="background:var(--gray-50); padding:24px; border-radius:20px; margin-bottom:32px; border:1px solid var(--gray-200);">
                <h4 style="font-size:1.15rem; font-weight:800; color:var(--gray-900); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="edit-3" style="width:18px;height:18px;color:var(--primary);"></i> Viết đánh giá của bạn
                </h4>

                <form onsubmit="event.preventDefault(); submitPreviewReview(this);">
                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.88rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                            Mức độ hài lòng của bạn:
                        </label>
                        <select id="newReviewRating" class="form-control" style="max-width:220px; font-weight:800; color:#F59E0B;">
                            <option value="5" selected>★★★★★ Tuyệt vời (5/5)</option>
                            <option value="4">★★★★☆ Rất tốt (4/5)</option>
                            <option value="3">★★★☆☆ Hài lòng (3/5)</option>
                            <option value="2">★★☆☆☆ Tạm được (2/5)</option>
                            <option value="1">★☆☆☆☆ Không hài lòng (1/5)</option>
                        </select>
                    </div>

                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.88rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                            Tiêu đề tóm tắt:
                        </label>
                        <input type="text" id="newReviewTitle" class="form-control" placeholder="Ví dụ: Xe chạy rất êm, bác tài thân thiện và đón đúng giờ..." required>
                    </div>

                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.88rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                            Chi tiết trải nghiệm:
                        </label>
                        <textarea id="newReviewComment" rows="3" class="form-control" placeholder="Chia sẻ thêm về ghế ngồi, chất lượng phục vụ, tiện ích trên xe..." required></textarea>
                    </div>

                    <div style="text-align:right;">
                        <button type="submit" class="btn btn-primary" style="font-weight:800; padding:10px 28px;">
                            ✓ Gửi đánh giá ngay
                        </button>
                    </div>
                </form>
            </div>

            <!-- Reviews List Container -->
            <div id="previewReviewsList" style="display:flex; flex-direction:column; gap:20px;">
                ${displayReviews.map(r => `
                    <div class="card" style="padding:22px; background:white; border-radius:18px; border:1px solid var(--gray-200); box-shadow:var(--shadow-xs);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, var(--primary), #00F5D4); color:white; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:1.05rem;">
                                    ${r.customer_name ? r.customer_name[0] : 'K'}
                                </div>
                                <div>
                                    <div style="font-weight:800; color:var(--gray-900); font-size:0.98rem;">
                                        ${r.customer_name}
                                        <span class="badge badge-success" style="font-size:0.7rem; padding:2px 8px; margin-left:6px;">✓ Đã trải nghiệm</span>
                                    </div>
                                    <div style="font-size:0.8rem; color:var(--gray-400);">${r.created_at}</div>
                                </div>
                            </div>

                            <div style="color:#F59E0B; font-size:1.05rem; font-weight:800;">
                                ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                            </div>
                        </div>

                        <div style="font-weight:800; font-size:1.02rem; color:var(--gray-900); margin-bottom:6px;">
                            ${r.title}
                        </div>
                        <p style="color:var(--gray-700); font-size:0.92rem; line-height:1.6; margin:0 0 12px;">
                            ${r.comment}
                        </p>

                        ${r.partner_reply ? `
                            <div style="background:#F0FDF4; border-left:4px solid var(--success); padding:14px 18px; border-radius:0 14px 14px 0; margin-top:12px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <strong style="font-size:0.85rem; color:#166534; display:flex; align-items:center; gap:6px;">
                                        💬 Phản hồi từ Nhà cung cấp
                                    </strong>
                                    <span style="font-size:0.75rem; color:#15803D;">${r.partner_replied_at || 'Vừa xong'}</span>
                                </div>
                                <p style="font-size:0.88rem; color:#14532D; margin:0; line-height:1.5;">
                                    ${r.partner_reply}
                                </p>
                            </div>
                        ` : `
                            <div style="margin-top:10px; padding-top:10px; border-top:1px dashed var(--gray-200);">
                                <details style="font-size:0.86rem;">
                                    <summary style="color:var(--primary); font-weight:700; cursor:pointer;">
                                        💬 Phản hồi đánh giá này với tư cách Đối tác / Nhà xe...
                                    </summary>
                                    <div style="margin-top:10px;">
                                        <textarea id="replyText_${r.id}" rows="2" class="form-control" placeholder="Nhập lời cảm ơn hoặc giải đáp của nhà xe..." style="font-size:0.86rem; margin-bottom:8px;"></textarea>
                                        <button onclick="submitPartnerReply(${r.id})" class="btn btn-primary btn-sm" style="font-weight:700;">
                                            Gửi phản hồi
                                        </button>
                                    </div>
                                </details>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        </div>

        <script>
            function submitPreviewReview(form) {
                const title = document.getElementById('newReviewTitle').value;
                const comment = document.getElementById('newReviewComment').value;
                const rating = parseInt(document.getElementById('newReviewRating').value, 10);

                const list = document.getElementById('previewReviewsList');
                const newCard = document.createElement('div');
                newCard.className = 'card';
                newCard.style.cssText = 'padding:22px; background:white; border-radius:18px; border:2px solid var(--primary); box-shadow:var(--shadow-sm); animation:fadeIn 0.4s ease; margin-bottom:16px;';
                newCard.innerHTML = \`
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, var(--primary), #00F5D4); color:white; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:1.05rem;">
                                B
                            </div>
                            <div>
                                <div style="font-weight:800; color:var(--gray-900); font-size:0.98rem;">
                                    Bạn (Vừa xong)
                                    <span class="badge badge-success" style="font-size:0.7rem; padding:2px 8px; margin-left:6px;">✓ Đã trải nghiệm</span>
                                </div>
                                <div style="font-size:0.8rem; color:var(--gray-400);">Hôm nay</div>
                            </div>
                        </div>
                        <div style="color:#F59E0B; font-size:1.05rem; font-weight:800;">
                            \${'★'.repeat(rating)}\${'☆'.repeat(5 - rating)}
                        </div>
                    </div>
                    <div style="font-weight:800; font-size:1.02rem; color:var(--gray-900); margin-bottom:6px;">\${title}</div>
                    <p style="color:var(--gray-700); font-size:0.92rem; line-height:1.6; margin:0;">\${comment}</p>
                \`;
                list.prepend(newCard);
                form.reset();
                showToast('✅ Cảm ơn bạn! Đánh giá đã được đăng thành công.');
            }

            function submitPartnerReply(id) {
                const txt = document.getElementById('replyText_' + id);
                if (!txt || !txt.value.trim()) {
                    showToast('Vui lòng nhập nội dung phản hồi', 'error');
                    return;
                }
                showToast('✅ Đã đăng phản hồi từ Nhà xe thành công!');
                txt.closest('details').innerHTML = \`
                    <div style="background:#F0FDF4; border-left:4px solid var(--success); padding:14px 18px; border-radius:0 14px 14px 0; margin-top:12px;">
                        <strong style="font-size:0.85rem; color:#166534;">💬 Phản hồi từ Nhà cung cấp:</strong>
                        <p style="font-size:0.88rem; color:#14532D; margin:4px 0 0;">\${txt.value}</p>
                    </div>
                \`;
            }
        </script>
    `;
}

// 21. TRIP DETAIL PAGE (With Reviews & 15-min Booking)
function handleTripDetail(tripId = 1) {
    const trip = MOCK_DATA.trips.find(t => t.id === parseInt(tripId, 10)) || MOCK_DATA.trips[0];

    return `
        <!-- Trip Header -->
        <section style="background:linear-gradient(135deg, #050B14 0%, #0A192F 50%, #0052CC 100%); padding:48px 0 40px; color:white; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div style="max-width:1260px; margin:0 auto; padding:0 24px;">
                <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px;">
                    <span class="badge" style="background:rgba(255,255,255,0.15); color:white; border:1px solid rgba(255,255,255,0.2);">
                        #${trip.trip_code}
                    </span>
                    <span class="badge" style="background:rgba(0,245,212,0.2); color:#00F5D4; border:1px solid rgba(0,245,212,0.3); font-weight:800;">
                        ${trip.vehicle_name}
                    </span>
                </div>
                <h1 style="color:white; font-size:2.8rem; font-weight:900; margin-bottom:8px;">
                    ${trip.departure_name} <span style="color:var(--accent);">→</span> ${trip.arrival_name}
                </h1>
                <p style="color:#94A3B8; font-size:1.05rem; margin:0;">
                    Vận hành bởi đối tác: <strong style="color:white;">${trip.partner_name}</strong> • Đánh giá: <strong style="color:#FBBF24;">★ ${trip.rating} (${trip.reviews_count} đánh giá)</strong>
                </p>
            </div>
        </section>

        <!-- Body Layout -->
        <div style="max-width:1260px; margin:40px auto; padding:0 24px;">
            <div style="display:grid; grid-template-columns:1fr 380px; gap:40px; align-items:start;">
                
                <!-- Left Column -->
                <div>
                    <div style="border-radius:24px; overflow:hidden; margin-bottom:32px; box-shadow:var(--shadow-lg); height:420px;">
                        <img src="${trip.featured_image}" alt="${trip.arrival_name}" style="width:100%; height:100%; object-fit:cover;">
                    </div>

                    <!-- Hành trình -->
                    <div class="card" style="padding:28px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
                        <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="route" style="color:var(--primary);width:20px;height:20px;"></i> Lịch trình khởi hành
                        </h3>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                            <div style="background:var(--gray-50); padding:18px; border-radius:16px; border-left:4px solid var(--primary);">
                                <div style="font-size:0.82rem; color:var(--gray-500); margin-bottom:4px; text-transform:uppercase;">ĐIỂM ĐI</div>
                                <div style="font-weight:800; font-size:1.15rem; color:var(--gray-900);">${trip.departure_name}</div>
                                <div style="font-size:0.95rem; color:var(--primary); font-weight:700; margin-top:4px;">
                                    Khởi hành: ${trip.departure_datetime}
                                </div>
                            </div>

                            <div style="background:var(--gray-50); padding:18px; border-radius:16px; border-left:4px solid var(--secondary);">
                                <div style="font-size:0.82rem; color:var(--gray-500); margin-bottom:4px; text-transform:uppercase;">ĐIỂM ĐẾN</div>
                                <div style="font-weight:800; font-size:1.15rem; color:var(--gray-900);">${trip.arrival_name}</div>
                                <div style="font-size:0.95rem; color:var(--secondary); font-weight:700; margin-top:4px;">
                                    Thời gian xe chạy: ~6-8 giờ
                                </div>
                            </div>
                        </div>

                        <div style="margin-top:20px; padding-top:18px; border-top:1px solid var(--gray-100); font-size:0.94rem; color:var(--gray-700); line-height:1.7;">
                            ${trip.description}
                        </div>
                    </div>

                    <!-- Tiện ích đi kèm -->
                    <div class="card" style="padding:28px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
                        <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="sparkles" style="color:var(--accent-dark);width:20px;height:20px;"></i> Tiện ích VIP miễn phí
                        </h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div style="display:flex; align-items:center; gap:10px; background:var(--gray-50); padding:14px; border-radius:14px;">
                                <i data-lucide="wifi" style="width:20px;height:20px;color:var(--success);"></i>
                                <span style="font-weight:700; font-size:0.92rem;">Wifi 5G tốc độ cao</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px; background:var(--gray-50); padding:14px; border-radius:14px;">
                                <i data-lucide="zap" style="width:20px;height:20px;color:var(--success);"></i>
                                <span style="font-weight:700; font-size:0.92rem;">Cổng sạc Type-C & USB</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px; background:var(--gray-50); padding:14px; border-radius:14px;">
                                <i data-lucide="droplet" style="width:20px;height:20px;color:var(--success);"></i>
                                <span style="font-weight:700; font-size:0.92rem;">Nước khoáng & Khăn lạnh</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px; background:var(--gray-50); padding:14px; border-radius:14px;">
                                <i data-lucide="shield-check" style="width:20px;height:20px;color:var(--success);"></i>
                                <span style="font-weight:700; font-size:0.92rem;">Bảo hiểm hành khách đầy đủ</span>
                            </div>
                        </div>
                    </div>

                    <!-- REVIEW & SOCIAL PROOF SECTION -->
                    ${renderReviewSectionHtml('trip', trip.id)}
                </div>

                <!-- Right Column: Booking Box Sticky -->
                <div style="position:sticky; top:130px;">
                    <div class="card" style="padding:28px; background:white; border-radius:24px; box-shadow:var(--shadow-xl); border:2px solid var(--primary);">
                        <div style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; margin-bottom:4px;">GIÁ VÉ NIÊM YẾT</div>
                        <div style="display:flex; align-items:baseline; gap:4px; margin-bottom:16px;">
                            <span style="font-size:2.2rem; font-weight:900; color:var(--secondary);">
                                ${formatMoney(trip.price_per_person)}
                            </span>
                            <span style="color:var(--gray-500); font-size:0.9rem;">/người</span>
                        </div>

                        <div style="background:var(--gray-50); padding:14px; border-radius:14px; margin-bottom:20px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:6px;">
                                <span>Ghế còn trống:</span>
                                <strong style="color:var(--primary); font-size:1.05rem;">${trip.available_seats} / ${trip.total_seats}</strong>
                            </div>
                            <div style="height:6px; background:var(--gray-200); border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${Math.round(((trip.total_seats - trip.available_seats) / trip.total_seats) * 100)}%; background:linear-gradient(90deg, var(--primary), var(--secondary));"></div>
                            </div>
                        </div>

                        <a href="/cart/add-trip?id=${trip.id}" class="btn btn-primary btn-full btn-lg" style="font-weight:900; padding:16px; margin-bottom:12px; font-size:1.1rem; border-radius:16px; text-decoration:none; text-align:center; display:block;">
                            🎟️ Đặt chuyến & Giữ chỗ 15 phút
                        </a>

                        <a href="/tracking" class="btn btn-outline btn-full btn-sm" style="font-weight:800; padding:12px; border-radius:14px; text-decoration:none; text-align:center; display:block; color:var(--accent-dark); border-color:var(--accent-dark);">
                            <span class="live-pulse" style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent-dark); margin-right:4px;"></span>
                            Xem Live GPS Xe chạy
                        </a>

                        <div style="font-size:0.8rem; color:var(--gray-500); text-align:center; margin-top:14px;">
                            <i data-lucide="clock" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i>
                            Giữ chỗ tự động 15 phút trong thời gian thanh toán.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

// 22. NOTIFICATIONS CENTER PAGE
function handleNotifications() {
    return `
        <div style="max-width:960px; margin:40px auto; padding:0 24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; flex-wrap:wrap; gap:16px;">
                <div>
                    <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(0,102,255,0.1); color:var(--primary); padding:6px 14px; border-radius:30px; font-size:0.82rem; font-weight:800; margin-bottom:8px;">
                        <i data-lucide="bell" style="width:14px;height:14px;"></i> TRUNG TÂM THÔNG BÁO
                    </div>
                    <h2 style="font-size:2.2rem; font-weight:900; margin:0;">Thông báo của bạn</h2>
                    <p style="color:var(--gray-500); font-size:0.95rem; margin-top:4px;">Cập nhật tức thời đơn hàng, vé xe, khách sạn và thông tin thanh toán</p>
                </div>
                <button onclick="markAllPreviewNotifRead(); document.querySelectorAll('.notif-unread').forEach(el => el.classList.remove('notif-unread')); showToast('Đã đánh dấu tất cả đã đọc');" class="btn btn-outline btn-sm" style="font-weight:700;">
                    ✓ Đánh dấu tất cả đã đọc
                </button>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px;">
                ${MOCK_DATA.notifications.map(n => `
                    <div class="card ${!n.is_read ? 'notif-unread' : ''}" style="padding:20px 24px; background:${!n.is_read ? '#F0F9FF' : 'white'}; border-radius:20px; border:1px solid ${!n.is_read ? '#BAE6FD' : 'var(--gray-200)'}; display:flex; gap:18px; align-items:flex-start; transition:all 0.2s;">
                        <div style="width:46px; height:46px; border-radius:14px; background:${n.type === 'payment' ? 'rgba(16,185,129,0.15)' : 'rgba(0,102,255,0.15)'}; color:${n.type === 'payment' ? 'var(--success)' : 'var(--primary)'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i data-lucide="${n.type === 'payment' ? 'credit-card' : 'bell'}" style="width:22px;height:22px;"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <h4 style="font-size:1.05rem; font-weight:800; color:var(--gray-900); margin:0;">${n.title}</h4>
                                <span style="font-size:0.8rem; color:var(--gray-400);">${n.created_at}</span>
                            </div>
                            <p style="color:var(--gray-600); font-size:0.92rem; line-height:1.5; margin:0 0 10px;">${n.message}</p>
                            <div style="display:flex; gap:10px;">
                                <a href="/booking/detail/TG-2026-8899" class="btn btn-primary btn-sm" style="font-size:0.8rem; padding:4px 12px; border-radius:8px; text-decoration:none;">
                                    Xem vé E-Ticket →
                                </a>
                                <button onclick="this.closest('.card').style.background='white'; this.closest('.card').style.borderColor='var(--gray-200)'; this.style.display='none'; showToast('Đã đọc thông báo');" class="btn btn-ghost btn-sm" style="font-size:0.8rem; color:var(--gray-500);">
                                    Đánh dấu đã đọc
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 23. USER PROFILE & ACCOUNT SETTINGS
function handleProfile() {
    return `
        <div style="max-width:1100px; margin:40px auto; padding:0 24px;">
            <div style="display:grid; grid-template-columns:320px 1fr; gap:36px; align-items:start;">
                
                <!-- Left Column: User Card & Membership Tier -->
                <div>
                    <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); text-align:center; margin-bottom:24px;">
                        <div style="width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg, var(--primary), #00F5D4); color:white; font-size:2.4rem; font-weight:900; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 8px 24px rgba(0,102,255,0.3);">
                            A
                        </div>
                        <h3 style="font-size:1.4rem; font-weight:900; margin-bottom:4px; color:var(--gray-900);">Nguyễn Văn An</h3>
                        <p style="color:var(--gray-500); font-size:0.88rem; margin-bottom:16px;">@an_nguyen • an.nguyen@travelgo.vn</p>
                        
                        <div style="display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg, #FEF3C7, #FDE68A); color:#92400E; padding:8px 16px; border-radius:20px; font-weight:900; font-size:0.85rem; border:1px solid #FCD34D;">
                            🥇 HỘI VIÊN VÀNG (VIP GOLD)
                        </div>

                        <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--gray-100); text-align:left; font-size:0.9rem;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <span style="color:var(--gray-500);">Điểm tích lũy:</span>
                                <strong style="color:var(--primary); font-size:1.05rem;">1.250 Điểm</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <span style="color:var(--gray-500);">Chuyến xe đã đi:</span>
                                <strong>4 chuyến</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <span style="color:var(--gray-500);">Đêm nghỉ khách sạn:</span>
                                <strong>2 đêm</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:var(--gray-500);">Tiết kiệm Voucher:</span>
                                <strong style="color:var(--success);">520.000₫</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Navigation Links -->
                    <div class="card" style="padding:16px; background:white; border-radius:20px; box-shadow:var(--shadow-xs);">
                        <a href="/dashboard" class="btn btn-ghost btn-full" style="justify-content:flex-start; font-weight:700; gap:10px; margin-bottom:4px;">
                            <i data-lucide="ticket" style="width:18px;height:18px;color:var(--primary);"></i> Booking của tôi
                        </a>
                        <a href="/notifications" class="btn btn-ghost btn-full" style="justify-content:flex-start; font-weight:700; gap:10px; margin-bottom:4px;">
                            <i data-lucide="bell" style="width:18px;height:18px;color:#F59E0B;"></i> Trung tâm Thông báo
                        </a>
                        <a href="/tracking" class="btn btn-ghost btn-full" style="justify-content:flex-start; font-weight:700; gap:10px;">
                            <i data-lucide="navigation" style="width:18px;height:18px;color:var(--accent-dark);"></i> Live GPS Tracking xe
                        </a>
                    </div>
                </div>

                <!-- Right Column: Edit Forms -->
                <div class="card" style="padding:36px; background:white; border-radius:24px; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; gap:12px; border-bottom:2px solid var(--gray-100); padding-bottom:16px; margin-bottom:28px;">
                        <button class="btn btn-primary btn-sm" id="btnTabInfo" onclick="switchProfileTab('info')" style="font-weight:800;">
                            👤 Thông tin cá nhân
                        </button>
                        <button class="btn btn-outline btn-sm" id="btnTabPass" onclick="switchProfileTab('password')" style="font-weight:800;">
                            🔒 Đổi mật khẩu
                        </button>
                    </div>

                    <!-- Form 1: Personal Info -->
                    <div id="profileTabInfo">
                        <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:20px; color:var(--gray-900);">
                            Cập nhật thông tin hồ sơ
                        </h3>

                        <form onsubmit="event.preventDefault(); showToast('✅ Đã cập nhật hồ sơ cá nhân thành công!');">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div>
                                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Họ và tên <span style="color:var(--danger)">*</span></label>
                                    <input type="text" class="form-control" value="Nguyễn Văn An" required>
                                </div>
                                <div>
                                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Số điện thoại <span style="color:var(--danger)">*</span></label>
                                    <input type="tel" class="form-control" value="0901234567" required>
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                                <div>
                                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Email tài khoản</label>
                                    <input type="email" class="form-control" value="an.nguyen@travelgo.vn" disabled style="background:var(--gray-100); cursor:not-allowed;">
                                    <small style="color:var(--gray-500);">Email liên kết bảo mật tài khoản</small>
                                </div>
                                <div>
                                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Tên đăng nhập</label>
                                    <input type="text" class="form-control" value="an_nguyen" disabled style="background:var(--gray-100); cursor:not-allowed;">
                                    <small style="color:var(--gray-500);">Định danh tài khoản hệ thống</small>
                                </div>
                            </div>

                            <div style="margin-bottom:28px;">
                                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Địa chỉ liên hệ</label>
                                <input type="text" class="form-control" value="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh">
                            </div>

                            <div style="text-align:right;">
                                <button type="submit" class="btn btn-primary" style="padding:12px 32px; font-weight:800;">
                                    ✓ Lưu thay đổi hồ sơ
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Form 2: Change Password -->
                    <div id="profileTabPassword" style="display:none;">
                        <h3 style="font-size:1.3rem; font-weight:900; margin-bottom:20px; color:var(--gray-900);">
                            Thay đổi mật khẩu đăng nhập
                        </h3>

                        <form onsubmit="event.preventDefault(); showToast('✅ Đổi mật khẩu thành công! Hãy dùng mật khẩu mới trong lần đăng nhập tiếp theo.');">
                            <div style="margin-bottom:18px;">
                                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Mật khẩu hiện tại <span style="color:var(--danger)">*</span></label>
                                <input type="password" class="form-control" required placeholder="Nhập mật khẩu đang dùng...">
                            </div>

                            <div style="margin-bottom:18px;">
                                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Mật khẩu mới <span style="color:var(--danger)">*</span></label>
                                <input type="password" class="form-control" required minlength="6" placeholder="Tối thiểu 6 ký tự...">
                            </div>

                            <div style="margin-bottom:28px;">
                                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Xác nhận mật khẩu mới <span style="color:var(--danger)">*</span></label>
                                <input type="password" class="form-control" required minlength="6" placeholder="Nhập lại mật khẩu mới...">
                            </div>

                            <div style="text-align:right;">
                                <button type="submit" class="btn btn-primary" style="padding:12px 32px; font-weight:800;">
                                    ✓ Cập nhật mật khẩu mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>

        <script>
            function switchProfileTab(tab) {
                const info = document.getElementById('profileTabInfo');
                const pass = document.getElementById('profileTabPassword');
                const btnInfo = document.getElementById('btnTabInfo');
                const btnPass = document.getElementById('btnTabPass');

                if (tab === 'info') {
                    info.style.display = 'block';
                    pass.style.display = 'none';
                    btnInfo.className = 'btn btn-primary btn-sm';
                    btnPass.className = 'btn btn-outline btn-sm';
                } else {
                    info.style.display = 'none';
                    pass.style.display = 'block';
                    btnInfo.className = 'btn btn-outline btn-sm';
                    btnPass.className = 'btn btn-primary btn-sm';
                }
            }
        </script>
    `;
}

// Dispatcher
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname.startsWith('/assets/')) {
        const filePath = path.join(PUBLIC_DIR, pathname);
        const ext = path.extname(filePath);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
            return res.end(fs.readFileSync(filePath));
        }
    }

    // Dynamic Cart Operations
    if (pathname === '/cart/add-trip' || pathname === '/cart/addTrip') {
        const tripId = parseInt(query.id || 1, 10);
        const trip = MOCK_DATA.trips.find(t => t.id === tripId) || MOCK_DATA.trips[0];
        const key = `trip_${trip.id}`;

        const existing = CART_ITEMS.find(i => i.key === key);
        if (existing) {
            existing.quantity += 1;
            existing.subtotal = existing.unit_price * existing.quantity;
        } else {
            CART_ITEMS.push({
                key: key,
                type: 'trip',
                id: trip.id,
                title: `${trip.departure_name} → ${trip.arrival_name}`,
                subtitle: `${trip.vehicle_name} • ${trip.partner_name}`,
                time: `Khởi hành: ${trip.departure_datetime}`,
                unit_price: trip.price_per_person,
                quantity: 1,
                subtotal: trip.price_per_person,
                image: trip.featured_image
            });
        }
        res.writeHead(302, { 'Location': '/cart' });
        return res.end();
    }

    if (pathname === '/cart/add-hotel' || pathname === '/cart/addHotel') {
        const hotelId = parseInt(query.id || 1, 10);
        const hotel = MOCK_DATA.hotels.find(h => h.id === hotelId) || MOCK_DATA.hotels[0];
        const key = `hotel_${hotel.id}`;

        const existing = CART_ITEMS.find(i => i.key === key);
        if (existing) {
            existing.quantity += 1;
            existing.subtotal = existing.unit_price * existing.quantity * (existing.nights || 2);
        } else {
            CART_ITEMS.push({
                key: key,
                type: 'hotel',
                id: hotel.id,
                title: `${hotel.name} - ${hotel.room_name}`,
                subtitle: `1 phòng • 2 đêm (${hotel.location_name})`,
                time: `Check-in: 05/09/2026 (14:00)`,
                unit_price: hotel.room_price || hotel.min_price,
                quantity: 1,
                nights: 2,
                subtotal: (hotel.room_price || hotel.min_price) * 2,
                image: hotel.featured_image
            });
        }
        res.writeHead(302, { 'Location': '/cart' });
        return res.end();
    }

    if (pathname === '/cart/remove') {
        const key = query.key;
        CART_ITEMS = CART_ITEMS.filter(i => i.key !== key);
        res.writeHead(302, { 'Location': '/cart' });
        return res.end();
    }

    if (pathname === '/cart/clear') {
        CART_ITEMS = [];
        res.writeHead(302, { 'Location': '/cart' });
        return res.end();
    }

    let html = '';
    let pageTitle = 'Trang chủ';
    let activeTab = '';

    if (pathname === '/' || pathname === '/home') {
        pageTitle = 'Trang chủ Du lịch';
        activeTab = 'home';
        html = handleHome();
    } else if (pathname === '/trips') {
        pageTitle = 'Danh sách Chuyến đi';
        activeTab = 'trips';
        html = handleTrips();
    } else if (pathname.startsWith('/trips/detail')) {
        pageTitle = 'Chi tiết Chuyến đi & Đánh giá';
        activeTab = 'trips';
        const tripId = pathname.split('/')[3] || query.id || 1;
        html = handleTripDetail(tripId);
    } else if (pathname === '/hotels') {
        pageTitle = 'Danh sách Khách sạn';
        activeTab = 'hotels';
        html = handleHotels();
    } else if (pathname === '/cart') {
        pageTitle = 'Giỏ hàng Đa dịch vụ';
        html = handleCart();
    } else if (pathname === '/booking/checkout') {
        pageTitle = 'Xác nhận Đặt chỗ 15 phút';
        html = handleCheckout();
    } else if (pathname.startsWith('/booking/detail')) {
        pageTitle = 'Vé điện tử E-Ticket';
        html = handleBookingDetail();
    } else if (pathname === '/payment/checkout') {
        pageTitle = 'Thanh toán Đơn hàng';
        html = handlePaymentCheckout();
    } else if (pathname === '/payment/process') {
        pageTitle = 'Cổng thanh toán Trực tuyến';
        html = handlePaymentProcess(query.method || 'vnpay');
    } else if (pathname === '/payment/success') {
        pageTitle = 'Thanh toán Thành công';
        html = handlePaymentSuccess();
    } else if (pathname === '/tracking' || pathname === '/trips/tracking' || pathname.startsWith('/trips/tracking/')) {
        pageTitle = 'Theo dõi Định vị GPS Xe thời gian thực';
        activeTab = 'tracking';
        html = handleTracking();
    } else if (pathname === '/admin' || pathname === '/admin/dashboard') {
        pageTitle = 'Dashboard Admin';
        activeTab = 'admin';
        html = handleAdminDashboard();
    } else if (pathname === '/admin/users') {
        pageTitle = 'Quản lý Tài khoản & Phân quyền';
        activeTab = 'admin';
        html = handleAdminUsers();
    } else if (pathname === '/admin/settings') {
        pageTitle = 'Cấu hình Hệ thống';
        activeTab = 'admin';
        html = handleAdminSettings();
    } else if (pathname === '/dashboard') {
        pageTitle = 'Dashboard Khách hàng';
        html = handleCustomerDashboard();
    } else if (pathname === '/partner' || pathname === '/partner/dashboard') {
        pageTitle = 'Dashboard Đối tác';
        activeTab = 'partner';
        html = handlePartnerDashboard();
    } else if (pathname === '/partner/trips/create') {
        pageTitle = 'Đăng ký Chuyến xe mới';
        activeTab = 'partner';
        html = handlePartnerTripCreate();
    } else if (pathname === '/employee' || pathname === '/employee/dashboard') {
        pageTitle = 'Bảng điều hành Nhân viên';
        activeTab = 'employee';
        html = handleEmployeeDashboard();
    } else if (pathname === '/employee/qr') {
        pageTitle = 'Soát vé QR Code Check-in';
        activeTab = 'employee';
        html = handleEmployeeQr(query.code || '');
    } else if (pathname === '/employee/refunds') {
        pageTitle = 'Xử lý Hoàn tiền Bậc thang';
        activeTab = 'employee';
        html = handleEmployeeRefunds();
    } else if (pathname === '/auth/register' || pathname === '/auth/register-partner') {
        pageTitle = 'Đăng ký Tài khoản';
        html = handleRegister();
    } else if (pathname === '/auth/login') {
        pageTitle = 'Đăng nhập';
        html = handleLogin();
    } else if (pathname === '/notifications') {
        pageTitle = 'Trung tâm Thông báo';
        html = handleNotifications();
    } else if (pathname === '/profile' || pathname === '/auth/profile') {
        pageTitle = 'Hồ sơ cá nhân & Thành viên';
        html = handleProfile();
    } else {
        pageTitle = '404 Không tìm thấy';
        html = `<div style="text-align:center;padding:100px 24px;"><h1>404</h1><p>Trang không tồn tại.</p><a href="/" class="btn btn-primary">Về trang chủ</a></div>`;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLayout(pageTitle, html, activeTab));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 TravelGo Ultra-Luxury Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🌐 Mạng Wi-Fi / Điện thoại: http://192.168.10.107:${PORT}`);
    console.log(`📍 Live GPS Tracking: http://localhost:${PORT}/tracking`);
    console.log(`🛒 Giỏ hàng kết hợp: http://localhost:${PORT}/cart`);
    console.log(`==================================================\n`);
});
