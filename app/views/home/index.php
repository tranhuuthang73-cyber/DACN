<?php
/**
 * TravelGo - Trang chủ
 * Hero section + Search box + Destinations + Trips + Hotels
 */

use App\Core\Helper;
?>

<!-- ==================== HERO SECTION ==================== -->
<section class="hero">
    <div class="hero-float"></div>
    <div class="hero-float"></div>
    <div class="hero-float"></div>

    <div class="hero-content">
        <h1>Khám phá Việt Nam<br>theo cách <span class="text-gradient">của bạn</span></h1>
        <p>Đặt chuyến đi tự do, chọn khách sạn yêu thích và tận hưởng hành trình không giới hạn cùng TravelGo.</p>

        <!-- Search Box -->
        <div class="search-box">
            <div class="search-tabs">
                <button class="search-tab active" data-tab="trip" onclick="switchSearchTab('trip', this)">
                    <i data-lucide="map-pin" style="width:16px;height:16px"></i> Chuyến đi
                </button>
                <button class="search-tab" data-tab="hotel" onclick="switchSearchTab('hotel', this)">
                    <i data-lucide="building-2" style="width:16px;height:16px"></i> Khách sạn
                </button>
            </div>

            <!-- Trip Search Form -->
            <form id="tripSearchForm" class="search-form" action="<?= $appUrl ?>/trips/search" method="GET">
                <div class="form-group">
                    <label><i data-lucide="circle-dot" style="width:14px;height:14px;color:var(--primary)"></i> Điểm đi</label>
                    <select name="departure" class="form-control" required>
                        <option value="">Chọn điểm đi...</option>
                        <?php foreach ($allLocations as $loc): ?>
                            <option value="<?= $loc->id ?>"><?= Helper::e($loc->name) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--secondary)"></i> Điểm đến</label>
                    <select name="arrival" class="form-control" required>
                        <option value="">Chọn điểm đến...</option>
                        <?php foreach ($allLocations as $loc): ?>
                            <option value="<?= $loc->id ?>"><?= Helper::e($loc->name) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label><i data-lucide="calendar" style="width:14px;height:14px"></i> Ngày đi</label>
                    <input type="date" name="date" class="form-control" min="<?= date('Y-m-d') ?>" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">
                    <i data-lucide="search" style="width:18px;height:18px"></i> Tìm
                </button>
            </form>

            <!-- Hotel Search Form (hidden by default) -->
            <form id="hotelSearchForm" class="search-form" action="<?= $appUrl ?>/hotels/search" method="GET" style="display:none">
                <div class="form-group">
                    <label><i data-lucide="map-pin" style="width:14px;height:14px;color:var(--primary)"></i> Địa điểm</label>
                    <select name="location" class="form-control" required>
                        <option value="">Chọn địa điểm...</option>
                        <?php foreach ($allLocations as $loc): ?>
                            <option value="<?= $loc->id ?>"><?= Helper::e($loc->name) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label><i data-lucide="calendar" style="width:14px;height:14px"></i> Nhận phòng</label>
                    <input type="date" name="check_in" class="form-control" min="<?= date('Y-m-d') ?>" required>
                </div>
                <div class="form-group">
                    <label><i data-lucide="calendar-check" style="width:14px;height:14px"></i> Trả phòng</label>
                    <input type="date" name="check_out" class="form-control" min="<?= date('Y-m-d', strtotime('+1 day')) ?>" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">
                    <i data-lucide="search" style="width:18px;height:18px"></i> Tìm
                </button>
            </form>
        </div>
    </div>
</section>

<!-- ==================== STATS ==================== -->
<section class="section" style="padding-top:var(--space-3xl);padding-bottom:var(--space-2xl);">
    <div class="container">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i data-lucide="map" style="width:28px;height:28px"></i></div>
                <div class="stat-value" data-count="<?= $stats['total_trips'] ?>"><?= $stats['total_trips'] ?></div>
                <div class="stat-label">Chuyến đi</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i data-lucide="building-2" style="width:28px;height:28px"></i></div>
                <div class="stat-value" data-count="<?= $stats['total_hotels'] ?>"><?= $stats['total_hotels'] ?></div>
                <div class="stat-label">Khách sạn</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i data-lucide="map-pin" style="width:28px;height:28px"></i></div>
                <div class="stat-value" data-count="<?= $stats['total_locations'] ?>"><?= $stats['total_locations'] ?></div>
                <div class="stat-label">Địa điểm</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i data-lucide="users" style="width:28px;height:28px"></i></div>
                <div class="stat-value" data-count="<?= $stats['total_customers'] ?>"><?= $stats['total_customers'] ?></div>
                <div class="stat-label">Khách hàng</div>
            </div>
        </div>
    </div>
</section>

<!-- ==================== POPULAR DESTINATIONS ==================== -->
<?php if (!empty($popularLocations)): ?>
<section class="section" style="background:white;">
    <div class="container">
        <div class="section-header">
            <h2>Điểm đến <span class="text-gradient">phổ biến</span></h2>
            <p>Khám phá những địa điểm du lịch hấp dẫn nhất Việt Nam</p>
        </div>

        <div class="grid grid-4">
            <?php foreach ($popularLocations as $i => $location): ?>
                <a href="<?= $appUrl ?>/trips/search?arrival=<?= $location->id ?>" class="location-card" style="<?= $i < 2 ? 'grid-column: span 2; aspect-ratio: 2/1;' : '' ?>">
                    <img src="<?= $location->image ? $appUrl . '/' . $location->image : 'https://placehold.co/600x400/1E293B/CBD5E1?text=' . urlencode($location->name) ?>" 
                         alt="<?= Helper::e($location->name) ?>" loading="lazy">
                    <div class="location-overlay">
                        <div class="location-name"><?= Helper::e($location->name) ?></div>
                        <div class="location-count"><?= Helper::e($location->province) ?></div>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ==================== UPCOMING TRIPS ==================== -->
<?php if (!empty($upcomingTrips)): ?>
<section class="section">
    <div class="container">
        <div class="section-header">
            <h2>Chuyến đi <span class="text-gradient">sắp khởi hành</span></h2>
            <p>Đặt ngay để không bỏ lỡ chỗ ngồi tốt nhất</p>
        </div>

        <div class="grid grid-3">
            <?php foreach ($upcomingTrips as $trip): ?>
                <a href="<?= $appUrl ?>/trips/detail/<?= $trip->id ?>" class="card">
                    <div class="card-image">
                        <img src="<?= $trip->featured_image ? $appUrl . '/' . $trip->featured_image : 'https://placehold.co/600x380/0066FF/FFFFFF?text=' . urlencode($trip->departure_name . '+→+' . $trip->arrival_name) ?>" 
                             alt="<?= Helper::e($trip->departure_name . ' → ' . $trip->arrival_name) ?>" loading="lazy">

                        <?php if ($trip->fill_rate >= 80): ?>
                            <span class="card-badge badge-popular">🔥 Sắp hết chỗ</span>
                        <?php endif; ?>
                    </div>
                    <div class="card-body">
                        <div class="card-title"><?= Helper::e($trip->departure_name) ?> → <?= Helper::e($trip->arrival_name) ?></div>
                        <div class="card-subtitle">
                            <i data-lucide="<?= Helper::e($trip->vehicle_icon) ?>" style="width:14px;height:14px"></i>
                            <?= Helper::e($trip->vehicle_name) ?> • <?= Helper::e($trip->partner_name) ?>
                        </div>
                        <div class="card-meta">
                            <span class="card-meta-item">
                                <i data-lucide="calendar" style="width:14px;height:14px"></i>
                                <?= Helper::formatDateTime($trip->departure_datetime) ?>
                            </span>
                            <span class="card-meta-item">
                                <i data-lucide="armchair" style="width:14px;height:14px"></i>
                                Còn <?= $trip->available_seats ?>/<?= $trip->total_seats ?> chỗ
                            </span>
                        </div>
                        <div class="card-price">
                            <span class="price-value"><?= Helper::formatMoney($trip->price_per_person) ?></span>
                            <span class="price-unit">/người</span>
                        </div>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>

        <div class="text-center mt-2">
            <a href="<?= $appUrl ?>/trips" class="btn btn-outline btn-lg">
                Xem tất cả chuyến đi <i data-lucide="arrow-right" style="width:18px;height:18px"></i>
            </a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ==================== FEATURED HOTELS ==================== -->
<?php if (!empty($featuredHotels)): ?>
<section class="section" style="background:white;">
    <div class="container">
        <div class="section-header">
            <h2>Khách sạn <span class="text-gradient">nổi bật</span></h2>
            <p>Nghỉ dưỡng thoải mái tại các khách sạn chất lượng hàng đầu</p>
        </div>

        <div class="grid grid-3">
            <?php foreach ($featuredHotels as $hotel): ?>
                <a href="<?= $appUrl ?>/hotels/detail/<?= $hotel->id ?>" class="card">
                    <div class="card-image">
                        <img src="<?= $hotel->featured_image ? $appUrl . '/' . $hotel->featured_image : 'https://placehold.co/600x380/1E293B/CBD5E1?text=' . urlencode($hotel->name) ?>" 
                             alt="<?= Helper::e($hotel->name) ?>" loading="lazy">
                        <span class="card-badge badge-new"><?= $hotel->star_rating ?>★</span>
                    </div>
                    <div class="card-body">
                        <div class="card-title"><?= Helper::e($hotel->name) ?></div>
                        <div class="card-subtitle">
                            <i data-lucide="map-pin" style="width:14px;height:14px"></i>
                            <?= Helper::e($hotel->location_name) ?>
                        </div>
                        <div class="card-meta">
                            <span class="card-meta-item">
                                <i data-lucide="door-open" style="width:14px;height:14px"></i>
                                <?= $hotel->room_type_count ?> loại phòng
                            </span>
                            <span class="card-meta-item">
                                <i data-lucide="star" style="width:14px;height:14px;color:var(--warning)"></i>
                                <?= $hotel->star_rating ?> sao
                            </span>
                        </div>
                        <div class="card-price">
                            <span class="price-value"><?= $hotel->min_price ? Helper::formatMoney($hotel->min_price) : 'Liên hệ' ?></span>
                            <span class="price-unit">/đêm</span>
                        </div>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>

        <div class="text-center mt-2">
            <a href="<?= $appUrl ?>/hotels" class="btn btn-outline btn-lg">
                Xem tất cả khách sạn <i data-lucide="arrow-right" style="width:18px;height:18px"></i>
            </a>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ==================== CTA SECTION ==================== -->
<section class="section" style="background: linear-gradient(135deg, var(--primary) 0%, #1a365d 100%);">
    <div class="container text-center" style="max-width:700px;">
        <h2 style="color:white;margin-bottom:var(--space-md);">Bạn là đối tác du lịch?</h2>
        <p style="color:rgba(255,255,255,0.8);font-size:1.1rem;margin-bottom:var(--space-xl);">
            Đăng ký trở thành đối tác của TravelGo để quảng bá dịch vụ của bạn đến hàng ngàn khách hàng tiềm năng.
        </p>
        <a href="<?= $appUrl ?>/auth/register-partner" class="btn btn-secondary btn-lg">
            <i data-lucide="handshake" style="width:20px;height:20px"></i> Đăng ký đối tác
        </a>
    </div>
</section>

<script>
    // Switch search tabs
    function switchSearchTab(tab, btn) {
        document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        
        document.getElementById('tripSearchForm').style.display = tab === 'trip' ? 'grid' : 'none';
        document.getElementById('hotelSearchForm').style.display = tab === 'hotel' ? 'grid' : 'none';
        
        // Re-init icons
        lucide.createIcons();
    }

    // Animate stat numbers on scroll
    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                let current = 0;
                const increment = Math.ceil(target / 30);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        el.textContent = target.toLocaleString('vi-VN');
                        clearInterval(timer);
                    } else {
                        el.textContent = current.toLocaleString('vi-VN');
                    }
                }, 30);
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
</script>
