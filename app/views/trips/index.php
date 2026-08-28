<?php
use App\Core\Helper;
?>

<!-- ==================== SEARCH HEADER ==================== -->
<section style="background: linear-gradient(135deg, var(--gray-900) 0%, #1a365d 100%); padding: calc(var(--header-height) + var(--space-2xl)) 0 var(--space-2xl); color:white;">
    <div class="container text-center">
        <h1 style="color:white; font-size:2.2rem; margin-bottom:var(--space-xs);">Tìm kiếm Chuyến đi</h1>
        <p style="color:rgba(255,255,255,0.75);">Hàng chục chuyến xe limousine, giường nằm, tàu hỏa và chuyến bay mỗi ngày</p>
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
                        <i data-lucide="sliders-horizontal" style="width:16px;height:16px;color:var(--primary);"></i> Bộ lọc
                    </h4>
                    <a href="<?= $appUrl ?>/trips" style="font-size:0.8rem; color:var(--gray-500);">Xóa lọc</a>
                </div>

                <form action="<?= $appUrl ?>/trips" method="GET">
                    <div class="form-group mb-1">
                        <label>Điểm đi</label>
                        <select name="departure" class="form-control">
                            <option value="">Tất cả điểm đi</option>
                            <?php foreach ($locations as $loc): ?>
                                <option value="<?= $loc->id ?>" <?= ($filters['departure'] ?? '') == $loc->id ? 'selected' : '' ?>>
                                    <?= Helper::e($loc->name) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group mb-1">
                        <label>Điểm đến</label>
                        <select name="arrival" class="form-control">
                            <option value="">Tất cả điểm đến</option>
                            <?php foreach ($locations as $loc): ?>
                                <option value="<?= $loc->id ?>" <?= ($filters['arrival'] ?? '') == $loc->id ? 'selected' : '' ?>>
                                    <?= Helper::e($loc->name) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group mb-1">
                        <label>Ngày khởi hành</label>
                        <input type="date" name="date" class="form-control" value="<?= Helper::e($filters['date'] ?? '') ?>" min="<?= date('Y-m-d') ?>">
                    </div>

                    <div class="form-group mb-1">
                        <label>Phương tiện</label>
                        <select name="vehicle" class="form-control">
                            <option value="">Tất cả phương tiện</option>
                            <?php foreach ($vehicles as $v): ?>
                                <option value="<?= $v->id ?>" <?= ($filters['vehicle'] ?? '') == $v->id ? 'selected' : '' ?>>
                                    <?= Helper::e($v->name) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group mb-1">
                        <label>Mức giá tối đa</label>
                        <select name="max_price" class="form-control">
                            <option value="">Không giới hạn</option>
                            <option value="300000" <?= ($filters['max_price'] ?? '') == '300000' ? 'selected' : '' ?>>Dưới 300.000₫</option>
                            <option value="500000" <?= ($filters['max_price'] ?? '') == '500000' ? 'selected' : '' ?>>Dưới 500.000₫</option>
                            <option value="1000000" <?= ($filters['max_price'] ?? '') == '1000000' ? 'selected' : '' ?>>Dưới 1.000.000₫</option>
                            <option value="2000000" <?= ($filters['max_price'] ?? '') == '2000000' ? 'selected' : '' ?>>Dưới 2.000.000₫</option>
                        </select>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full mt-1">
                        <i data-lucide="filter" style="width:16px;height:16px"></i> Áp dụng bộ lọc
                    </button>
                </form>
            </div>

            <!-- ==================== RESULTS LIST ==================== -->
            <div>
                <!-- Top Toolbar -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-lg); background:white; padding:var(--space-md) var(--space-lg); border-radius:var(--radius-md); border:1px solid var(--gray-100);">
                    <div style="font-size:0.95rem; color:var(--gray-600);">
                        Tìm thấy <strong style="color:var(--gray-900);"><?= $total ?></strong> chuyến đi phù hợp
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
                            <option value="?<?= $baseQuery ?>sort=date_asc" <?= ($filters['sort'] ?? '') === 'date_asc' ? 'selected' : '' ?>>Khởi hành sớm nhất</option>
                            <option value="?<?= $baseQuery ?>sort=price_asc" <?= ($filters['sort'] ?? '') === 'price_asc' ? 'selected' : '' ?>>Giá tăng dần</option>
                            <option value="?<?= $baseQuery ?>sort=price_desc" <?= ($filters['sort'] ?? '') === 'price_desc' ? 'selected' : '' ?>>Giá giảm dần</option>
                        </select>
                    </div>
                </div>

                <!-- Trips Cards -->
                <?php if (!empty($trips)): ?>
                    <div class="grid grid-3" style="gap:var(--space-lg);">
                        <?php foreach ($trips as $trip): ?>
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
                                            Còn <?= $trip->available_seats ?> chỗ
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
                            <i data-lucide="search-x" style="width:32px;height:32px"></i>
                        </div>
                        <h3>Không tìm thấy chuyến đi phù hợp</h3>
                        <p style="color:var(--gray-500); margin:var(--space-xs) 0 var(--space-lg);">
                            Thử điều chỉnh lại bộ lọc tìm kiếm hoặc xem các chuyến đi khác sắp tới.
                        </p>
                        <a href="<?= $appUrl ?>/trips" class="btn btn-outline">Xem tất cả chuyến đi</a>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</section>
