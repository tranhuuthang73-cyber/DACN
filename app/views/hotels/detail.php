<?php
use App\Core\Helper;

$nights = max(1, (int)round((strtotime($checkOut) - strtotime($checkIn)) / 86400));
?>

<!-- ==================== HOTEL HEADER ==================== -->
<section style="background: linear-gradient(135deg, var(--gray-900) 0%, #0F766E 100%); padding: calc(var(--header-height) + var(--space-2xl)) 0 var(--space-2xl); color:white;">
    <div class="container">
        <div style="display:flex; gap:var(--space-sm); align-items:center; margin-bottom:var(--space-sm);">
            <span class="badge badge-warning" style="background:rgba(245,158,11,0.2); color:#FCD34D; border:1px solid rgba(245,158,11,0.4);">
                <?= str_repeat('★', $hotel->star_rating) ?> Khách sạn <?= $hotel->star_rating ?> sao
            </span>
            <span class="badge badge-primary" style="background:rgba(255,255,255,0.15); color:white;">
                <i data-lucide="map-pin" style="width:12px;height:12px"></i> <?= Helper::e($hotel->location_name) ?>
            </span>
        </div>

        <h1 style="color:white; font-size:2.5rem; margin-bottom:var(--space-xs);">
            <?= Helper::e($hotel->name) ?>
        </h1>
        <p style="color:rgba(255,255,255,0.8); font-size:1.05rem; display:flex; align-items:center; gap:6px;">
            <i data-lucide="map-pin" style="width:16px;height:16px;color:var(--accent);"></i>
            <?= Helper::e($hotel->address) ?>
        </p>
    </div>
</section>

<!-- ==================== MAIN CONTENT ==================== -->
<section class="section" style="padding-top:var(--space-2xl);">
    <div class="container">
        
        <!-- Featured Image Gallery -->
        <div style="border-radius:var(--radius-lg); overflow:hidden; margin-bottom:var(--space-2xl); box-shadow:var(--shadow-md); aspect-ratio:21/9;">
            <img src="<?= $hotel->featured_image ? $appUrl . '/' . $hotel->featured_image : 'https://placehold.co/1200x500/0F766E/FFFFFF?text=' . urlencode($hotel->name) ?>" 
                 alt="<?= Helper::e($hotel->name) ?>" style="width:100%;height:100%;object-fit:cover;">
        </div>

        <!-- Date Picker Widget -->
        <div class="card" style="padding:var(--space-lg); margin-bottom:var(--space-2xl); border:2px solid var(--primary-50); background:linear-gradient(to right, white, var(--gray-50));">
            <form action="<?= $appUrl ?>/hotels/detail/<?= $hotel->id ?>" method="GET" class="grid" style="grid-template-columns: 1fr 1fr auto; gap:var(--space-md); align-items:end;">
                <div class="form-group">
                    <label><i data-lucide="calendar" style="width:14px;height:14px;color:var(--primary);"></i> Ngày nhận phòng</label>
                    <input type="date" name="check_in" class="form-control" value="<?= Helper::e($checkIn) ?>" min="<?= date('Y-m-d') ?>" required>
                </div>
                <div class="form-group">
                    <label><i data-lucide="calendar-check" style="width:14px;height:14px;color:var(--secondary);"></i> Ngày trả phòng</label>
                    <input type="date" name="check_out" class="form-control" value="<?= Helper::e($checkOut) ?>" min="<?= date('Y-m-d', strtotime('+1 day')) ?>" required>
                </div>
                <button type="submit" class="btn btn-primary" style="height:44px;">
                    <i data-lucide="search" style="width:16px;height:16px"></i> Kiểm tra phòng trống
                </button>
            </form>
            <div style="font-size:0.85rem; color:var(--gray-500); margin-top:8px; display:flex; gap:var(--space-lg);">
                <span><i data-lucide="moon" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i> Thời gian lưu trú: <strong><?= $nights ?> đêm</strong></span>
                <span><i data-lucide="clock" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i> Giờ nhận: <?= $hotel->check_in_time ?> • Giờ trả: <?= $hotel->check_out_time ?></span>
            </div>
        </div>

        <!-- Amenities Overview -->
        <?php if (!empty($hotel->amenities_list)): ?>
            <div class="card" style="padding:var(--space-xl); margin-bottom:var(--space-2xl);">
                <h3 style="font-size:1.2rem; margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="sparkles" style="color:var(--accent-dark); width:18px;height:18px;"></i> Tiện nghi khách sạn
                </h3>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                    <?php foreach ($hotel->amenities_list as $amenity): ?>
                        <span style="background:var(--gray-100); color:var(--gray-700); padding:6px 14px; border-radius:var(--radius-full); font-size:0.85rem; font-weight:500;">
                            ✓ <?= Helper::amenityLabel($amenity) ?>
                        </span>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Available Room Types List -->
        <div style="margin-bottom:var(--space-3xl);">
            <h2 style="font-size:1.6rem; margin-bottom:var(--space-lg);">Các loại phòng <span class="text-gradient">sẵn có</span></h2>

            <?php if (!empty($hotel->room_types)): ?>
                <div style="display:flex; flex-direction:column; gap:var(--space-lg);">
                    <?php foreach ($hotel->room_types as $room): ?>
                        <div class="card" style="padding:var(--space-xl); display:grid; grid-template-columns: 240px 1fr 220px; gap:var(--space-xl); align-items:center;">
                            
                            <!-- Room Image -->
                            <div style="border-radius:var(--radius-md); overflow:hidden; aspect-ratio:4/3;">
                                <img src="<?= $room->featured_image ? $appUrl . '/' . $room->featured_image : 'https://placehold.co/400x300/1E293B/CBD5E1?text=' . urlencode($room->name) ?>" 
                                     alt="<?= Helper::e($room->name) ?>" style="width:100%;height:100%;object-fit:cover;">
                            </div>

                            <!-- Room Details -->
                            <div>
                                <h3 style="font-size:1.3rem; margin-bottom:var(--space-xs);"><?= Helper::e($room->name) ?></h3>
                                <p style="color:var(--gray-500); font-size:0.9rem; margin-bottom:var(--space-md);">
                                    <?= Helper::e($room->description ?? 'Phòng trang bị đầy đủ tiện nghi tiêu chuẩn.') ?>
                                </p>

                                <div class="grid grid-2" style="gap:8px; font-size:0.85rem; color:var(--gray-600); margin-bottom:var(--space-sm);">
                                    <div><i data-lucide="users" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Tối đa: <strong><?= $room->max_occupancy ?> người</strong></div>
                                    <div><i data-lucide="bed" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Giường: <strong><?= Helper::e($room->bed_type ?? 'Giường tiêu chuẩn') ?></strong></div>
                                    <div><i data-lucide="maximize" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Diện tích: <strong><?= $room->area_sqm ? $room->area_sqm . ' m²' : 'Tiêu chuẩn' ?></strong></div>
                                    <div>
                                        <i data-lucide="door-open" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--primary);"></i> Phòng trống: 
                                        <strong style="color: <?= $room->available_rooms > 0 ? 'var(--success)' : 'var(--danger)' ?>;">
                                            <?= $room->available_rooms ?> phòng
                                        </strong>
                                    </div>
                                </div>

                                <?php if (!empty($room->amenities_list)): ?>
                                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
                                        <?php foreach ($room->amenities_list as $ra): ?>
                                            <span style="font-size:0.75rem; background:var(--gray-100); padding:2px 8px; border-radius:var(--radius-sm); color:var(--gray-600);">
                                                • <?= Helper::amenityLabel($ra) ?>
                                            </span>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <!-- Price & Booking Form -->
                            <div style="border-left:1px solid var(--gray-100); padding-left:var(--space-xl); text-align:right;">
                                <div style="font-size:0.8rem; color:var(--gray-500); margin-bottom:2px;">Giá mỗi đêm</div>
                                <div style="font-size:1.5rem; font-weight:800; color:var(--secondary); margin-bottom:2px;">
                                    <?= Helper::formatMoney($room->price_per_night) ?>
                                </div>
                                <div style="font-size:0.8rem; color:var(--gray-500); margin-bottom:var(--space-md);">
                                    Tổng <?= $nights ?> đêm: <strong><?= Helper::formatMoney($room->price_per_night * $nights) ?></strong>
                                </div>

                                <?php if ($room->available_rooms > 0): ?>
                                    <form action="<?= $appUrl ?>/cart/add-hotel" method="POST">
                                        <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                                        <input type="hidden" name="hotel_id" value="<?= $hotel->id ?>">
                                        <input type="hidden" name="room_type_id" value="<?= $room->id ?>">
                                        <input type="hidden" name="check_in" value="<?= Helper::e($checkIn) ?>">
                                        <input type="hidden" name="check_out" value="<?= Helper::e($checkOut) ?>">

                                        <div style="margin-bottom:8px; text-align:left;">
                                            <label style="font-size:0.8rem; color:var(--gray-600);">Số lượng phòng:</label>
                                            <select name="quantity" class="form-control" style="padding:4px 8px; font-size:0.85rem;">
                                                <?php for ($r = 1; $r <= min(5, $room->available_rooms); $r++): ?>
                                                    <option value="<?= $r ?>"><?= $r ?> phòng</option>
                                                <?php endfor; ?>
                                            </select>
                                        </div>

                                        <button type="submit" class="btn btn-primary btn-full">
                                            <i data-lucide="shopping-cart" style="width:16px;height:16px"></i> Chọn phòng
                                        </button>
                                    </form>
                                <?php else: ?>
                                    <button class="btn btn-secondary btn-full disabled" disabled>
                                        Hết phòng
                                    </button>
                                <?php endif; ?>
                            </div>

                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="card" style="padding:var(--space-2xl); text-align:center;">
                    <p style="color:var(--gray-500);">Khách sạn này hiện chưa có loại phòng nào đang hoạt động.</p>
                </div>
            <?php endif; ?>
        </div>

    </div>
</section>
