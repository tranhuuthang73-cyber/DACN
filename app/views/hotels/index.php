<?php
use App\Core\Helper;
?>

<!-- ==================== HOTEL SEARCH HEADER ==================== -->
<section style="background: linear-gradient(135deg, var(--gray-900) 0%, #0F766E 100%); padding: calc(var(--header-height) + var(--space-2xl)) 0 var(--space-2xl); color:white;">
    <div class="container text-center">
        <h1 style="color:white; font-size:2.2rem; margin-bottom:var(--space-xs);">Khách sạn & Khu nghỉ dưỡng</h1>
        <p style="color:rgba(255,255,255,0.75);">Trải nghiệm không gian nghỉ dưỡng tuyệt vời với giá ưu đãi</p>
    </div>
</section>

<!-- ==================== MAIN CONTENT ==================== -->
<section class="section" style="padding-top:var(--space-2xl);">
    <div class="container">
        <div class="grid" style="grid-template-columns: 280px 1fr; gap: var(--space-xl); align-items: start;">
            
            <!-- ==================== SIDEBAR FILTER ==================== -->
            <div class="card" style="padding:var(--space-lg); position:sticky; top:calc(var(--header-height) + 20px);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
                    <h4 style="font-size:1.1rem; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:var(--accent-dark);"></i> Bộ lọc
                    </h4>
                    <a href="<?= $appUrl ?>/hotels" style="font-size:0.8rem; color:var(--gray-500);">Xóa lọc</a>
                </div>

                <form action="<?= $appUrl ?>/hotels" method="GET">
                    <div class="form-group mb-1">
                        <label>Từ khóa</label>
                        <input type="text" name="keyword" class="form-control" placeholder="Tên khách sạn..." value="<?= Helper::e($filters['keyword'] ?? '') ?>">
                    </div>

                    <div class="form-group mb-1">
                        <label>Địa điểm</label>
                        <select name="location" class="form-control">
                            <option value="">Tất cả địa điểm</option>
                            <?php foreach ($locations as $loc): ?>
                                <option value="<?= $loc->id ?>" <?= ($filters['location'] ?? '') == $loc->id ? 'selected' : '' ?>>
                                    <?= Helper::e($loc->name) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group mb-1">
                        <label>Hạng sao</label>
                        <select name="stars" class="form-control">
                            <option value="">Tất cả hạng sao</option>
                            <option value="5" <?= ($filters['stars'] ?? '') == '5' ? 'selected' : '' ?>>⭐⭐⭐⭐⭐ 5 Sao</option>
                            <option value="4" <?= ($filters['stars'] ?? '') == '4' ? 'selected' : '' ?>>⭐⭐⭐⭐ 4 Sao</option>
                            <option value="3" <?= ($filters['stars'] ?? '') == '3' ? 'selected' : '' ?>>⭐⭐⭐ 3 Sao</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full mt-1" style="background:var(--accent-dark); border-color:var(--accent-dark);">
                        <i data-lucide="filter" style="width:16px;height:16px"></i> Lọc khách sạn
                    </button>
                </form>
            </div>

            <!-- ==================== RESULTS LIST ==================== -->
            <div>
                <!-- Top Toolbar -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-lg); background:white; padding:var(--space-md) var(--space-lg); border-radius:var(--radius-md); border:1px solid var(--gray-100);">
                    <div style="font-size:0.95rem; color:var(--gray-600);">
                        Tìm thấy <strong style="color:var(--gray-900);"><?= $total ?></strong> khách sạn
                    </div>

                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85rem; color:var(--gray-500); white-space:nowrap;">Sắp xếp:</label>
                        <select class="form-control" style="width:auto; padding:4px 30px 4px 10px; font-size:0.85rem;" onchange="location.href=this.value">
                            <?php
                            $queryParams = $_GET;
                            unset($queryParams['sort'], $queryParams['url']);
                            $baseQuery = http_build_query($queryParams);
                            $baseQuery = $baseQuery ? $baseQuery . '&' : '';
                            ?>
                            <option value="?<?= $baseQuery ?>sort=stars_desc" <?= ($filters['sort'] ?? '') === 'stars_desc' ? 'selected' : '' ?>>Hạng sao cao nhất</option>
                            <option value="?<?= $baseQuery ?>sort=price_asc" <?= ($filters['sort'] ?? '') === 'price_asc' ? 'selected' : '' ?>>Giá phòng thấp nhất</option>
                            <option value="?<?= $baseQuery ?>sort=name_asc" <?= ($filters['sort'] ?? '') === 'name_asc' ? 'selected' : '' ?>>Tên A - Z</option>
                        </select>
                    </div>
                </div>

                <!-- Hotel Cards -->
                <?php if (!empty($hotels)): ?>
                    <div class="grid grid-3" style="gap:var(--space-lg);">
                        <?php foreach ($hotels as $hotel): ?>
                            <a href="<?= $appUrl ?>/hotels/detail/<?= $hotel->id ?>" class="card">
                                <div class="card-image">
                                    <img src="<?= $hotel->featured_image ? $appUrl . '/' . $hotel->featured_image : 'https://placehold.co/600x380/0F766E/FFFFFF?text=' . urlencode($hotel->name) ?>" 
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

                    <!-- Pagination -->
                    <?php if ($pages > 1): ?>
                        <div class="pagination">
                            <?php for ($p = 1; $p <= $pages; $p++): ?>
                                <a href="?<?= http_build_query(array_merge($_GET, ['page' => $p])) ?>" class="<?= $p === $current ? 'active' : '' ?>">
                                    <?= $p ?>
                                </a>
                            <?php endfor; ?>
                        </div>
                    <?php endif; ?>

                <?php else: ?>
                    <div class="card" style="padding:var(--space-3xl); text-align:center;">
                        <div style="width:64px; height:64px; border-radius:var(--radius-full); background:var(--gray-100); color:var(--gray-400); display:flex; align-items:center; justify-content:center; margin:0 auto var(--space-md);">
                            <i data-lucide="building" style="width:32px;height:32px"></i>
                        </div>
                        <h3>Không tìm thấy khách sạn phù hợp</h3>
                        <p style="color:var(--gray-500); margin:var(--space-xs) 0 var(--space-lg);">
                            Vui lòng thử tìm với địa điểm hoặc hạng sao khác.
                        </p>
                        <a href="<?= $appUrl ?>/hotels" class="btn btn-outline">Xem tất cả khách sạn</a>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</section>
