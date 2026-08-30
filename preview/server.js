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
                <a href="/cart" style="position:relative; width:46px; height:46px; border-radius:var(--radius-md); background:var(--gray-100); display:flex; align-items:center; justify-content:center; color:var(--gray-800); text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--gray-100)'">
                    <i data-lucide="shopping-cart" style="width:20px;height:20px;"></i>
                    <span id="navCartBadge" style="position:absolute; top:-4px; right:-4px; background:var(--secondary); color:white; width:22px; height:22px; border-radius:50%; font-size:0.72rem; font-weight:900; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 3px 8px rgba(255,90,54,0.4);">${cartCount}</span>
                </a>
                <a href="/auth/login" class="btn btn-outline btn-sm">Đăng nhập</a>
                <a href="/auth/register" class="btn btn-primary btn-sm">Đăng ký</a>
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
                            <strong style="color:var(--gray-900);">${formatMoney(totalAmount)}</strong>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:16px; border-top:2px solid var(--gray-100); margin-bottom:24px;">
                            <span style="font-weight:800; font-size:1.1rem;">Tổng thanh toán:</span>
                            <span style="font-size:2rem; font-weight:900; color:var(--secondary);">
                                ${formatMoney(totalAmount)}
                            </span>
                        </div>

                        <a href="/booking/checkout" class="btn btn-primary btn-lg btn-full" style="font-weight:900; padding:15px;">
                            Tiến hành Giữ chỗ 15 phút →
                        </a>

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

                    <form onsubmit="event.preventDefault(); window.location.href='/booking/detail/TG-2026-8899';">
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
                            ⏱️ <strong>Cơ chế Giữ chỗ 15 phút:</strong> Khi bấm nút bên dưới, hệ thống sẽ tự động khóa ghế và phòng cho bạn trong 15 phút. Bạn có thể thanh toán hoặc mở vé ngay.
                        </div>

                        <button type="submit" class="btn btn-secondary btn-lg btn-full" style="font-weight:900; padding:16px;">
                            ⚡ Xác nhận Đặt chỗ & Khóa vé 15 phút
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
        pageTitle = 'Chi tiết Chuyến đi';
        activeTab = 'trips';
        html = handleTrips();
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
    } else if (pathname === '/tracking' || pathname === '/trips/tracking' || pathname.startsWith('/trips/tracking/')) {
        pageTitle = 'Theo dõi Định vị GPS Xe thời gian thực';
        activeTab = 'tracking';
        html = handleTracking();
    } else if (pathname === '/admin' || pathname === '/admin/dashboard') {
        pageTitle = 'Dashboard Admin';
        html = handleAdminDashboard();
    } else if (pathname === '/dashboard') {
        pageTitle = 'Dashboard Khách hàng';
        html = handleCustomerDashboard();
    } else if (pathname === '/partner') {
        pageTitle = 'Dashboard Đối tác';
        html = `<div style="max-width:1200px;margin:40px auto;padding:0 24px;"><div class="card" style="padding:40px;border-radius:28px;"><h1>🤝 Dashboard Doanh thu Đối tác</h1><p style="color:var(--gray-500);margin-top:8px;">Báo cáo doanh thu riêng và quản lý dịch vụ vận tải / phòng khách sạn.</p></div></div>`;
    } else if (pathname === '/employee') {
        pageTitle = 'Bảng điều hành Nhân viên';
        html = `<div style="max-width:1200px;margin:40px auto;padding:0 24px;"><div class="card" style="padding:40px;border-radius:28px;"><h1>💼 Bảng điều hành Nghiệp vụ Nhân viên</h1><p style="color:var(--gray-500);margin-top:8px;">Hàng đợi xét duyệt chuyến đi và xử lý yêu cầu hoàn tiền vé.</p></div></div>`;
    } else if (pathname === '/auth/register' || pathname === '/auth/register-partner') {
        pageTitle = 'Đăng ký Tài khoản';
        html = handleRegister();
    } else if (pathname === '/auth/login') {
        pageTitle = 'Đăng nhập';
        html = handleLogin();
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
