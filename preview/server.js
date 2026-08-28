/**
 * TravelGo - Standalone Ultra-Luxury Web Server & Runner
 * Aesthetic: Azure Riviera & Kinetic Glass (Ultra-Luxury Neo-Editorial Travel)
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
            vehicle_icon: 'bus',
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
            vehicle_icon: 'bus',
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
            vehicle_icon: 'plane',
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
            description: 'Khu nghỉ dưỡng 5 sao đẳng cấp thế giới với bãi biển riêng tư tuyệt đẹp, công viên giải trí VinWonders và hồ bơi vô cực rộng 5000m².'
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
            description: 'Khách sạn cổ kính bậc nhất Đông Dương hướng trọn tầm nhìn ra Hồ Xuân Hương thơ mộng, kiến trúc Pháp sang trọng quý phái.'
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
            description: 'Tuyệt tác kiến trúc của Bill Bensley ẩn mình trong rừng nguyên sinh Sơn Trà, bãi biển riêng tư và nhà hàng gắn sao Michelin.'
        }
    ]
};

function formatMoney(amount) {
    return Number(amount).toLocaleString('vi-VN') + '₫';
}

function renderLayout(title, content, activeTab = '') {
    const css = getFile(path.join(PUBLIC_DIR, 'assets', 'css', 'style.css')) || '';
    
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | TravelGo Luxury</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${css}
    </style>
</head>
<body>
    <!-- Top System Switcher Bar -->
    <div style="background:#050B14; color:#94A3B8; padding:8px 24px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); position:sticky; top:0; z-index:9999;">
        <div style="display:flex; align-items:center; gap:12px;">
            <span style="background:linear-gradient(135deg, var(--accent), #00B4D8); color:#050B14; font-weight:900; padding:3px 12px; border-radius:6px; font-size:0.72rem; letter-spacing:0.04em;">PRO LIVE RUNNER</span>
            <span style="color:#E2E8F0;">Đề tài: <strong>LV13-062 – Đặt chỗ Du lịch tích hợp Dashboard</strong></span>
        </div>
        <div style="display:flex; gap:18px; align-items:center; font-size:0.84rem;">
            <span style="color:#64748B;">Chuyển nhanh Dashboard:</span>
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
            </div>

            <div style="display:flex; align-items:center; gap:16px;">
                <a href="/cart" style="position:relative; width:46px; height:46px; border-radius:var(--radius-md); background:var(--gray-100); display:flex; align-items:center; justify-content:center; color:var(--gray-800); text-decoration:none; transition:all 0.2s;" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='var(--gray-100)'">
                    <i data-lucide="shopping-cart" style="width:20px;height:20px;"></i>
                    <span style="position:absolute; top:-4px; right:-4px; background:var(--secondary); color:white; width:22px; height:22px; border-radius:50%; font-size:0.72rem; font-weight:900; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 3px 8px rgba(255,90,54,0.4);">2</span>
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
                <p style="font-size:0.94rem; line-height:1.8; color:#64748B; max-width:380px;">Nền tảng đặt vé chuyến đi & khách sạn tự do hàng đầu Việt Nam. Tích hợp động cơ giữ chỗ 15 phút chống overbooking và Dashboard phân tích dữ liệu chuyên sâu.</p>
            </div>
            <div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:24px;">Dịch vụ</h4>
                <div style="display:flex; flex-direction:column; gap:14px; font-size:0.92rem;">
                    <a href="/trips" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">Xe Limousine VIP</a>
                    <a href="/trips" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">Xe Giường Phòng 34 Phòng</a>
                    <a href="/hotels" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">Khách sạn & Resort 5★</a>
                </div>
            </div>
            <div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:24px;">Bảng điều khiển</h4>
                <div style="display:flex; flex-direction:column; gap:14px; font-size:0.92rem;">
                    <a href="/admin" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">👑 Admin Quản trị GMV</a>
                    <a href="/partner" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">🤝 Cổng Đối tác Doanh thu</a>
                    <a href="/employee" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">💼 Nghiệp vụ Nhân viên</a>
                    <a href="/dashboard" style="color:#94A3B8; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='#94A3B8'">👤 Khách hàng Thân thiết</a>
                </div>
            </div>
            <div>
                <h4 style="color:white; font-size:1.1rem; margin-bottom:24px;">Đồ án Chuyên ngành</h4>
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:20px; border-radius:16px; font-size:0.88rem; line-height:1.7;">
                    <div style="color:var(--accent); font-weight:800; margin-bottom:4px;">Mã đề tài: LV13-062</div>
                    <div>Công nghệ: PHP MVC + MySQL + Design System</div>
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
                    <a href="/trips/detail/${t.id}" class="btn btn-primary btn-sm" style="padding:11px 22px;">Đặt chỗ ngay</a>
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
                    Đặt xe Limousine thượng hạng, xe giường phòng VIP và khách sạn 5 sao trong cùng một đơn hàng với cơ chế giữ chỗ 15 phút nguyên tử.
                </p>

                <!-- Search Widget with Interactive Tabs -->
                <div class="card glass-panel" style="padding:32px; border-radius:28px; box-shadow:0 30px 70px -15px rgba(0, 0, 0, 0.5); text-align:left; border:1px solid rgba(255,255,255,0.9);">
                    
                    <!-- Search Tabs -->
                    <div style="display:flex; gap:10px; margin-bottom:24px; border-bottom:1px solid var(--gray-200); padding-bottom:16px;">
                        <button type="button" class="btn btn-primary btn-sm" style="border-radius:var(--radius-full); font-size:0.88rem;">
                            <i data-lucide="bus" style="width:16px;height:16px;"></i> Chuyến xe Limousine
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" style="border-radius:var(--radius-full); font-size:0.88rem;" onclick="window.location.href='/hotels'">
                            <i data-lucide="building" style="width:16px;height:16px;"></i> Khách sạn & Resort
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" style="border-radius:var(--radius-full); font-size:0.88rem;" onclick="window.location.href='/trips'">
                            <i data-lucide="zap" style="width:16px;height:16px;"></i> Combo Siêu Tiết Kiệm
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

// 2. REGISTER PAGE (With Live Password Strength & 1-Click Autofill)
function handleRegister() {
    return `
        <div style="min-height:85vh; padding:70px 24px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%);">
            <div class="card" style="width:100%; max-width:580px; padding:44px; border-radius:28px; box-shadow:var(--shadow-xl); border:1px solid rgba(226,232,240,0.8); background:white;">
                
                <div style="text-align:center; margin-bottom:28px;">
                    <div style="width:58px; height:58px; border-radius:18px; background:linear-gradient(135deg, var(--primary), #00F5D4); display:inline-flex; align-items:center; justify-content:center; color:#050B14; margin-bottom:14px; box-shadow:0 10px 24px rgba(0,102,255,0.35);">
                        <i data-lucide="user-plus" style="width:28px;height:28px;stroke-width:2.5;"></i>
                    </div>
                    <h1 style="font-size:2.2rem; font-weight:900; margin-bottom:6px;">Tạo tài khoản TravelGo</h1>
                    <p style="color:var(--gray-500); font-size:0.98rem;">Gia nhập cộng đồng du lịch tự do và nhận ưu đãi độc quyền</p>
                </div>

                <!-- 1-Click Autofill Tester Box -->
                <div style="background:var(--primary-50); border:1.5px dashed var(--primary-100); padding:16px; border-radius:var(--radius-md); margin-bottom:24px; text-align:center;">
                    <div style="font-size:0.78rem; font-weight:800; color:var(--primary); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.04em;">
                        ⚡ 1-CLICK TỰ ĐỘNG ĐIỀN THỬ NGHIỆM ĐỒ ÁN
                    </div>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="autoFillCustomer()" style="background:white; font-size:0.8rem; padding:6px 14px; border-color:var(--primary); color:var(--primary);">
                            👤 Điền mẫu Khách hàng
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="autoFillPartner()" style="background:white; font-size:0.8rem; padding:6px 14px; border-color:var(--secondary); color:var(--secondary);">
                            🤝 Điền mẫu Doanh nghiệp
                        </button>
                    </div>
                </div>

                <!-- Role Selection Tabs -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:var(--gray-100); padding:6px; border-radius:var(--radius-md); margin-bottom:28px;">
                    <button type="button" id="tabCustomerBtn" onclick="switchTab('customer')" style="padding:12px; border-radius:var(--radius-sm); border:none; font-weight:900; font-size:0.92rem; cursor:pointer; background:white; color:var(--primary); box-shadow:var(--shadow-sm); transition:all 0.2s;">
                        👤 Khách du lịch
                    </button>
                    <button type="button" id="tabPartnerBtn" onclick="switchTab('partner')" style="padding:12px; border-radius:var(--radius-sm); border:none; font-weight:900; font-size:0.92rem; cursor:pointer; background:transparent; color:var(--gray-600); transition:all 0.2s;">
                        🤝 Doanh nghiệp Đối tác
                    </button>
                </div>

                <!-- Customer Form -->
                <form id="customerForm" onsubmit="event.preventDefault(); submitRegister('customer');">
                    <div class="form-group">
                        <label><i data-lucide="user" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Họ và tên của bạn</label>
                        <input type="text" id="custName" class="form-control" placeholder="Ví dụ: Nguyễn Văn An" required>
                    </div>

                    <div class="grid grid-2" style="gap:16px;">
                        <div class="form-group">
                            <label><i data-lucide="mail" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Email</label>
                            <input type="email" id="custEmail" class="form-control" placeholder="an.nguyen@gmail.com" required>
                        </div>
                        <div class="form-group">
                            <label><i data-lucide="phone" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Số điện thoại</label>
                            <input type="tel" id="custPhone" class="form-control" placeholder="0901234567" required>
                        </div>
                    </div>

                    <div class="grid grid-2" style="gap:16px;">
                        <div class="form-group">
                            <label><i data-lucide="lock" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Mật khẩu</label>
                            <input type="password" id="custPass" class="form-control" placeholder="Ít nhất 6 ký tự" minlength="6" oninput="checkStrength(this.value)" required>
                        </div>
                        <div class="form-group">
                            <label><i data-lucide="shield-check" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Nhập lại mật khẩu</label>
                            <input type="password" id="custPassConfirm" class="form-control" placeholder="Xác nhận mật khẩu" minlength="6" required>
                        </div>
                    </div>

                    <!-- Password Strength Meter -->
                    <div style="margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:800; margin-bottom:4px;">
                            <span style="color:var(--gray-500);">Độ mạnh mật khẩu:</span>
                            <span id="strengthText" style="color:var(--gray-400);">Chưa nhập</span>
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; height:5px;">
                            <div id="bar1" style="background:var(--gray-200); border-radius:var(--radius-full); transition:all 0.3s;"></div>
                            <div id="bar2" style="background:var(--gray-200); border-radius:var(--radius-full); transition:all 0.3s;"></div>
                            <div id="bar3" style="background:var(--gray-200); border-radius:var(--radius-full); transition:all 0.3s;"></div>
                            <div id="bar4" style="background:var(--gray-200); border-radius:var(--radius-full); transition:all 0.3s;"></div>
                        </div>
                    </div>

                    <div style="margin-bottom:24px; font-size:0.88rem; color:var(--gray-600); display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" id="termsCheck" required style="width:18px; height:18px; accent-color:var(--primary);">
                        <label for="termsCheck">Tôi đồng ý với <a href="#" style="color:var(--primary); font-weight:800;">Điều khoản dịch vụ</a> và <a href="#" style="color:var(--primary); font-weight:800;">Chính sách bảo mật</a>.</label>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg btn-full" style="font-weight:900;">
                        Hoàn tất Đăng ký Khách hàng
                    </button>
                </form>

                <!-- Partner Form -->
                <form id="partnerForm" onsubmit="event.preventDefault(); submitRegister('partner');" style="display:none;">
                    <div class="form-group">
                        <label><i data-lucide="building" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> Tên công ty / Doanh nghiệp</label>
                        <input type="text" id="partCompany" class="form-control" placeholder="Công ty TNHH Du lịch Vận tải Sài Gòn" required>
                    </div>

                    <div class="grid grid-2" style="gap:16px;">
                        <div class="form-group">
                            <label><i data-lucide="file-text" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> Mã số thuế</label>
                            <input type="text" id="partTax" class="form-control" placeholder="0312345678" required>
                        </div>
                        <div class="form-group">
                            <label><i data-lucide="user-check" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> Người đại diện</label>
                            <input type="text" id="partContact" class="form-control" placeholder="Trần Minh Khang" required>
                        </div>
                    </div>

                    <div class="grid grid-2" style="gap:16px;">
                        <div class="form-group">
                            <label><i data-lucide="mail" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> Email doanh nghiệp</label>
                            <input type="email" id="partEmail" class="form-control" placeholder="contact@saigontour.vn" required>
                        </div>
                        <div class="form-group">
                            <label><i data-lucide="phone" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> Hotline</label>
                            <input type="tel" id="partPhone" class="form-control" placeholder="02838222333" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label><i data-lucide="tag" style="width:15px;height:15px;display:inline-block;vertical-align:middle;color:var(--secondary);"></i> Loại hình dịch vụ cung cấp</label>
                        <select class="form-control" required>
                            <option>Đội xe vận chuyển hành khách (Limousine / Giường nằm)</option>
                            <option>Khách sạn & Khu nghỉ dưỡng (Resort / Hotel)</option>
                            <option>Cung cấp cả Xe vận chuyển và Khách sạn</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-secondary btn-lg btn-full" style="font-weight:900;">
                        Gửi hồ sơ Đăng ký Đối tác
                    </button>
                </form>

                <div style="text-align:center; margin-top:28px; padding-top:24px; border-top:1px solid var(--gray-100); font-size:0.92rem; color:var(--gray-600);">
                    Đã có tài khoản? <a href="/auth/login" style="color:var(--primary); font-weight:900; text-decoration:none;">Đăng nhập ngay</a>
                </div>

            </div>
        </div>

        <script>
            function switchTab(tab) {
                const custForm = document.getElementById('customerForm');
                const partForm = document.getElementById('partnerForm');
                const custBtn = document.getElementById('tabCustomerBtn');
                const partBtn = document.getElementById('tabPartnerBtn');

                if (tab === 'customer') {
                    custForm.style.display = 'block';
                    partForm.style.display = 'none';
                    custBtn.style.background = 'white';
                    custBtn.style.color = 'var(--primary)';
                    custBtn.style.boxShadow = 'var(--shadow-sm)';
                    partBtn.style.background = 'transparent';
                    partBtn.style.color = 'var(--gray-600)';
                    partBtn.style.boxShadow = 'none';
                } else {
                    custForm.style.display = 'none';
                    partForm.style.display = 'block';
                    partBtn.style.background = 'white';
                    partBtn.style.color = 'var(--secondary)';
                    partBtn.style.boxShadow = 'var(--shadow-sm)';
                    custBtn.style.background = 'transparent';
                    custBtn.style.color = 'var(--gray-600)';
                    custBtn.style.boxShadow = 'none';
                }
                lucide.createIcons();
            }

            function checkStrength(pass) {
                let score = 0;
                if (pass.length >= 6) score++;
                if (pass.length >= 8) score++;
                if (/[0-9]/.test(pass)) score++;
                if (/[^A-Za-z0-9]/.test(pass)) score++;

                const bars = [document.getElementById('bar1'), document.getElementById('bar2'), document.getElementById('bar3'), document.getElementById('bar4')];
                const text = document.getElementById('strengthText');

                bars.forEach((b, i) => {
                    if (i < score) {
                        b.style.background = score <= 1 ? 'var(--danger)' : (score <= 3 ? 'var(--warning)' : 'var(--success)');
                    } else {
                        b.style.background = 'var(--gray-200)';
                    }
                });

                if (score === 0) text.textContent = 'Chưa nhập';
                else if (score <= 1) { text.textContent = 'Yếu'; text.style.color = 'var(--danger)'; }
                else if (score <= 3) { text.textContent = 'Khá'; text.style.color = 'var(--warning)'; }
                else { text.textContent = 'Rất mạnh'; text.style.color = 'var(--success)'; }
            }

            function autoFillCustomer() {
                switchTab('customer');
                document.getElementById('custName').value = 'Nguyễn Hoàng Khang';
                document.getElementById('custEmail').value = 'khang.nguyen@gmail.com';
                document.getElementById('custPhone').value = '0918889999';
                document.getElementById('custPass').value = 'password123';
                document.getElementById('custPassConfirm').value = 'password123';
                document.getElementById('termsCheck').checked = true;
                checkStrength('password123');
                showToast('Đã điền thông tin khách hàng mẫu!', 'success');
            }

            function autoFillPartner() {
                switchTab('partner');
                document.getElementById('partCompany').value = 'Saigontourist Transport JSC';
                document.getElementById('partTax').value = '0301234567';
                document.getElementById('partContact').value = 'Nguyễn Thị Hoa';
                document.getElementById('partEmail').value = 'contact@saigontourist.vn';
                document.getElementById('partPhone').value = '02838225566';
                showToast('Đã điền thông tin doanh nghiệp đối tác mẫu!', 'success');
            }

            function submitRegister(type) {
                if (type === 'customer') {
                    const pass = document.getElementById('custPass').value;
                    const confirm = document.getElementById('custPassConfirm').value;
                    if (pass !== confirm) {
                        showToast('Lỗi: Mật khẩu xác nhận không khớp!', 'error');
                        return;
                    }
                    showToast('🎉 Đăng ký thành công! Đang chuyển đến Dashboard...', 'success');
                    setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
                } else {
                    showToast('✨ Hồ sơ đăng ký Đối tác đã gửi thành công! Admin sẽ duyệt.', 'success');
                    setTimeout(() => { window.location.href = '/partner'; }, 1200);
                }
            }
        </script>
    `;
}

// 3. LOGIN PAGE
function handleLogin() {
    return `
        <div style="min-height:85vh; padding:70px 24px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%);">
            <div class="card" style="width:100%; max-width:500px; padding:44px; border-radius:28px; box-shadow:var(--shadow-xl); border:1px solid rgba(226,232,240,0.8); background:white;">
                
                <div style="text-align:center; margin-bottom:28px;">
                    <div style="width:58px; height:58px; border-radius:18px; background:linear-gradient(135deg, var(--primary), var(--secondary)); display:inline-flex; align-items:center; justify-content:center; color:white; margin-bottom:14px; box-shadow:0 10px 24px rgba(0,102,255,0.35);">
                        <i data-lucide="log-in" style="width:28px;height:28px;stroke-width:2.5;"></i>
                    </div>
                    <h1 style="font-size:2.2rem; font-weight:900; margin-bottom:6px;">Đăng nhập</h1>
                    <p style="color:var(--gray-500); font-size:0.98rem;">Truy cập vào tài khoản và quản lý chuyến đi của bạn</p>
                </div>

                <!-- 1-Click Quick Autofill Sandbox -->
                <div style="background:var(--primary-50); border:1.5px dashed var(--primary-100); padding:18px; border-radius:var(--radius-md); margin-bottom:24px;">
                    <div style="font-size:0.8rem; font-weight:900; color:var(--primary); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.04em;">
                        ⚡ 1-CLICK ĐĂNG NHẬP THỬ NGHIỆM ĐỒ ÁN
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <a href="/admin" class="btn btn-outline btn-sm" style="background:white; border-color:#93C5FD; color:var(--primary); font-weight:800;">
                            👑 Quyền Admin
                        </a>
                        <a href="/partner" class="btn btn-outline btn-sm" style="background:white; border-color:#FDBA74; color:#EA580C; font-weight:800;">
                            🤝 Quyền Đối tác
                        </a>
                        <a href="/employee" class="btn btn-outline btn-sm" style="background:white; border-color:#C4B5FD; color:#7C3AED; font-weight:800;">
                            💼 Quyền Nhân viên
                        </a>
                        <a href="/dashboard" class="btn btn-outline btn-sm" style="background:white; border-color:#86EFAC; color:#16A34A; font-weight:800;">
                            👤 Quyền Khách hàng
                        </a>
                    </div>
                </div>

                <form onsubmit="event.preventDefault(); showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success'); setTimeout(() => { window.location.href='/dashboard'; }, 1000);">
                    <div class="form-group">
                        <label>Tên đăng nhập hoặc Email</label>
                        <input type="text" class="form-control" value="kh_an" required>
                    </div>

                    <div class="form-group">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <label style="margin-bottom:0;">Mật khẩu</label>
                            <a href="#" style="font-size:0.82rem; color:var(--primary); font-weight:800;">Quên mật khẩu?</a>
                        </div>
                        <input type="password" class="form-control" value="password123" required>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg btn-full" style="font-weight:900; margin-top:12px;">
                        Đăng nhập
                    </button>
                </form>

                <div style="text-align:center; margin-top:28px; padding-top:24px; border-top:1px solid var(--gray-100); font-size:0.92rem; color:var(--gray-600);">
                    Chưa có tài khoản? <a href="/auth/register" style="color:var(--primary); font-weight:900; text-decoration:none;">Đăng ký miễn phí</a>
                </div>

            </div>
        </div>
    `;
}

// 4. TRIPS PAGE (With Dynamic Filter Pills)
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
                <div style="font-size:0.92rem; color:var(--primary); font-weight:800; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="clock" style="width:16px;height:16px;"></i> Khởi hành: ${t.departure_datetime}
                </div>
            </div>
            <div style="text-align:right; border-left:1px solid var(--gray-100); padding-left:28px;">
                <div style="font-size:0.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">GIÁ MỖI VÉ</div>
                <div style="font-size:1.85rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">${formatMoney(t.price_per_person)}</div>
                <div style="font-size:0.88rem; color:var(--success); font-weight:800; margin-bottom:18px;">Còn ${t.available_seats} chỗ trống</div>
                <a href="/cart" class="btn btn-primary btn-full btn-sm" style="font-weight:900; padding:13px;">Đặt vé ngay</a>
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

// 5. HOTELS PAGE
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
            </div>
            <div style="text-align:right; border-left:1px solid var(--gray-100); padding-left:28px;">
                <div style="font-size:0.75rem; color:var(--gray-400); text-transform:uppercase; font-weight:800;">GIÁ MỖI ĐÊM TỪ</div>
                <div style="font-size:1.9rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">${formatMoney(h.min_price)}</div>
                <div style="font-size:0.88rem; color:var(--primary); font-weight:800; margin-bottom:18px;">Bao gồm ăn sáng 5★</div>
                <a href="/cart" class="btn btn-secondary btn-full btn-sm" style="font-weight:900; padding:13px;">Đặt phòng ngay</a>
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

// 6. ADMIN DASHBOARD
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
            document.addEventListener("DOMContentLoaded", () => {
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
            });
        </script>
    `;
}

// 7. CUSTOMER DASHBOARD
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
                        <a href="/trips" class="btn btn-accent btn-sm" style="font-weight:900;">+ Đặt chuyến mới</a>
                        <a href="/booking/detail/TG-2026-0001" class="btn btn-outline btn-sm" style="color:white; border-color:rgba(255,255,255,0.4);">Mở vé của tôi</a>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:36px;">
                <div class="stat-card" style="padding:26px; text-align:left; border-left:4px solid var(--secondary); background:white; border-radius:20px; box-shadow:var(--shadow-md);">
                    <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800; margin-bottom:6px;">TỔNG CHI TIÊU DU LỊCH</div>
                    <div style="font-size:2.2rem; font-weight:900; color:var(--secondary); margin-bottom:4px;">2.550.000₫</div>
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

            <!-- Upcoming trip card -->
            <div class="card" style="padding:36px; background:white; border-radius:24px; border:2px solid var(--primary-100); margin-bottom:36px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h3 style="font-size:1.4rem; font-weight:900; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="map-pin" style="color:var(--primary);width:22px;height:22px;"></i> Chuyến đi sắp tới gần nhất
                    </h3>
                    <span class="badge badge-success" style="font-size:0.88rem; padding:6px 18px;">Đã xác nhận chỗ</span>
                </div>

                <div style="display:grid; grid-template-columns:2fr 1fr; gap:36px; align-items:center; background:var(--gray-50); padding:28px; border-radius:20px;">
                    <div>
                        <div style="font-size:0.85rem; color:var(--gray-500); font-weight:800;">HÀNH TRÌNH KHỞI HÀNH</div>
                        <h2 style="font-size:2rem; font-weight:900; margin:6px 0 10px;">TP. Hồ Chí Minh → Đà Lạt</h2>
                        <div style="font-size:1.05rem; color:var(--primary); font-weight:800;">
                            <i data-lucide="clock" style="width:18px;height:18px;display:inline-block;vertical-align:middle;"></i> Khởi hành: 05/09/2026 lúc 07:30 sáng
                        </div>
                        <div style="font-size:0.88rem; color:var(--gray-500); margin-top:8px;">Phương tiện: Xe Limousine 9 chỗ VIP • 2 hành khách</div>
                    </div>
                    <div style="text-align:right;">
                        <a href="/booking/detail/TG-2026-0001" class="btn btn-primary btn-lg" style="font-weight:900;">
                            <i data-lucide="qr-code" style="width:20px;height:20px;"></i> Mở vé & Soát vé QR
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

    if (pathname.startsWith('/assets/')) {
        const filePath = path.join(PUBLIC_DIR, pathname);
        const ext = path.extname(filePath);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
            return res.end(fs.readFileSync(filePath));
        }
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
        pageTitle = 'Giỏ hàng của bạn';
        html = `<div style="max-width:1000px;margin:40px auto;padding:0 24px;"><h1>🛒 Giỏ hàng Đa dịch vụ</h1><p style="color:var(--gray-500);margin-bottom:24px;">Bạn có 2 dịch vụ (Chuyến đi + Khách sạn) trong đơn đặt chỗ</p><a href="/booking/detail/TG-2026-0001" class="btn btn-secondary btn-lg">Tiến hành Giữ chỗ 15 phút</a></div>`;
    } else if (pathname.startsWith('/booking/detail')) {
        pageTitle = 'Vé điện tử E-Ticket';
        html = `<div style="max-width:900px;margin:40px auto;padding:0 24px;"><div class="card" style="padding:36px;border-radius:24px;border:2px solid var(--primary-100);"><div style="font-size:0.8rem;color:var(--gray-400);text-transform:uppercase;">MÃ ĐẶT CHỖ</div><div style="font-size:2rem;font-weight:900;color:var(--primary);margin-bottom:16px;">TG-2026-0001</div><p>Vé điện tử xác thực thành công. Tích hợp mã QR soát vé.</p></div></div>`;
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
    console.log(`==================================================\n`);
});
