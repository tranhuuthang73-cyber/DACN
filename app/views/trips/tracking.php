<?php
/**
 * TravelGo - Giai đoạn 3: Bản đồ Google Maps & Định vị Tuyến đường Nội địa Việt Nam
 * Hỗ trợ chọn điểm đi / điểm đến toàn quốc (TP.HCM, Hà Nội, Đà Lạt, Nha Trang, Đà Nẵng, Vũng Tàu, Sapa, v.v.)
 * Tích hợp Google Maps Tiles (Streets / Satellite), Leaflet, Lộ trình thông minh & Mở Google Maps Native
 */
use App\Core\Helper;
?>

<!-- Leaflet CSS & JS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Header Banner -->
<section style="background: linear-gradient(135deg, #050B14 0%, #0A192F 50%, #0052CC 100%); padding: calc(var(--header-height) + 24px) 0 36px; color:white; border-bottom:1px solid rgba(255,255,255,0.08); position:relative; overflow:hidden;">
    <div class="container" style="position:relative; z-index:2;">
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
<section style="background:white; border-bottom:1px solid var(--gray-200); padding:16px 0; box-shadow:var(--shadow-sm); position:sticky; top:calc(var(--header-height) - 1px); z-index:990;">
    <div class="container">
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
<section class="section" style="padding-top:24px; padding-bottom:60px;">
    <div class="container">
        
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
                        <!-- Injected via JavaScript based on selected route -->
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

    </div>
</section>

<script>
    // 10 DOMESTIC ROUTES IN VIETNAM
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
    let currentLayerName = 'gmap_street';
    let currentIndex = 3;
    let simSpeed = 1;
    let simInterval = null;

    document.addEventListener("DOMContentLoaded", () => {
        // Tile Layers
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

        // Init map restricted to Vietnam bounds
        const vietnamBounds = L.latLngBounds(L.latLng(8.18, 102.14), L.latLng(23.39, 109.46));
        
        map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            maxBounds: vietnamBounds,
            maxBoundsViscosity: 0.8
        }).setView([11.5542, 107.8083], 9);

        gmapStreet.addTo(map);

        loadRoute('sg_dl');
    });

    function loadRoute(key) {
        currentRouteKey = key;
        const r = DOMESTIC_ROUTES[key] || DOMESTIC_ROUTES.sg_dl;

        // Update Title & Google Maps link
        document.getElementById('mainRouteTitle').innerText = r.title;
        document.getElementById('btnOpenGmap').href = r.gmapUrl;

        // Remove old elements
        if (polyline) map.removeLayer(polyline);
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker) map.removeLayer(endMarker);
        if (busMarker) map.removeLayer(busMarker);

        // Draw Route Polyline
        const latlngs = r.coords.map(c => [c.lat, c.lng]);
        polyline = L.polyline(latlngs, {
            color: '#0066FF',
            weight: 5,
            opacity: 0.85,
            dashArray: '8, 8'
        }).addTo(map);

        // Departure & Arrival Pins
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

        // Custom Bus Marker
        const busIcon = L.divIcon({
            html: `
                <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
                    <div class="live-pulse" style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(0,245,212,0.4);"></div>
                    <div style="position:relative; z-index:2; background:#050B14; border:2.5px solid #00F5D4; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(0,102,255,0.5);">
                        🚐
                    </div>
                </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22]
        });

        currentIndex = Math.min(2, r.coords.length - 1);
        busMarker = L.marker([r.coords[currentIndex].lat, r.coords[currentIndex].lng], { icon: busIcon }).addTo(map);
        busMarker.bindPopup(`<b>Xe Limousine 9 Chỗ VIP</b><br>Tuyến: ${r.title}<br>Tài xế: Nguyễn Tuấn Kiệt`).openPopup();

        // Fit Bounds
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // Update Timeline
        renderTimeline(r.stops);

        startSimulation();
    }

    function renderTimeline(stops) {
        const container = document.getElementById('timelineContainer');
        container.innerHTML = `
            <div style="position:absolute; left:7px; top:8px; bottom:8px; width:2px; background:var(--gray-200);"></div>
            ${stops.map(s => `
                <div style="position:relative;">
                    <div style="position:absolute; left:-24px; top:2px; width:16px; height:16px; border-radius:50%; background:${s.status === 'completed' ? 'var(--success)' : (s.status === 'active' ? 'var(--accent-dark)' : 'var(--gray-300)')}; border:3px solid white; box-shadow:0 0 0 2px ${s.status === 'active' ? 'rgba(0,245,212,0.4)' : 'transparent'};"></div>
                    <div style="font-size:0.92rem; font-weight:800; color:${s.status === 'active' ? 'var(--primary)' : 'var(--gray-900)'};">${s.name}</div>
                    <div style="font-size:0.78rem; color:${s.status === 'active' ? 'var(--accent-dark)' : 'var(--gray-500)'}; font-weight:${s.status === 'active' ? '700' : '400'};">
                        ${s.time} • ${s.status === 'completed' ? 'Đã hoàn thành' : (s.status === 'active' ? 'Đang di chuyển tới' : 'Dự kiến')}
                    </div>
                </div>
            `).join('')}
        `;
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
        document.getElementById('hudSpeed').innerText = `${currentSpeed} km/h`;
        document.getElementById('currentLocationName').innerText = `Đang qua: ${pt.name}`;
        document.getElementById('currentCoords').innerText = `${pt.lat.toFixed(4)}° N, ${pt.lng.toFixed(4)}° E (Việt Nam)`;

        const progressPercent = Math.round(((currentIndex + 1) / r.coords.length) * 100);
        document.getElementById('hudProgress').innerText = `${progressPercent}%`;
        document.getElementById('hudDistance').innerText = `${Math.round((r.totalKm * progressPercent) / 100)} / ${r.totalKm} km`;
    }

    function changeDomesticRoute(val) {
        loadRoute(val);
        showToast(`Đã chuyển sang tuyến: ${DOMESTIC_ROUTES[val].title}`, 'success');
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
        document.getElementById('btnSpeed').innerHTML = `<i data-lucide="fast-forward" style="width:16px;height:16px;"></i> Tốc độ: ${simSpeed}x`;
        lucide.createIcons();
        startSimulation();
    }
</script>
