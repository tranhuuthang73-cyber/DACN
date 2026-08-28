<?php
use App\Core\Helper;
?>

<div style="margin-bottom:var(--space-xl);">
    <a href="<?= $appUrl ?>/partner/hotels" class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-sm);">
        ← Quay lại danh sách khách sạn
    </a>
    <h2 style="font-size:1.5rem;">Quản lý Loại phòng - <?= Helper::e($hotel->name) ?></h2>
    <p style="color:var(--gray-500); font-size:0.9rem;">Thêm và quản lý giá, số lượng phòng của từng hạng phòng</p>
</div>

<div class="grid" style="grid-template-columns: 1fr 380px; gap:var(--space-xl); align-items:start;">
    
    <!-- Left: Existing Rooms List -->
    <div>
        <h3 style="font-size:1.2rem; margin-bottom:var(--space-md);">Danh sách loại phòng hiện có</h3>

        <?php if (!empty($rooms)): ?>
            <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                <?php foreach ($rooms as $room): ?>
                    <div class="card" style="padding:var(--space-lg); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="font-size:1.15rem; margin-bottom:4px;"><?= Helper::e($room->name) ?></h4>
                            <div style="font-size:0.85rem; color:var(--gray-500); display:flex; gap:var(--space-md);">
                                <span><i data-lucide="users" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Tối đa: <?= $room->max_occupancy ?> người</span>
                                <span><i data-lucide="door-open" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> Tổng: <?= $room->total_rooms ?> phòng</span>
                                <span><i data-lucide="bed" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> <?= Helper::e($room->bed_type ?? 'Tiêu chuẩn') ?></span>
                            </div>
                        </div>

                        <div style="text-align:right;">
                            <div style="font-size:1.3rem; font-weight:800; color:var(--secondary);">
                                <?= Helper::formatMoney($room->price_per_night) ?>
                            </div>
                            <div style="font-size:0.75rem; color:var(--gray-500);">/đêm</div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div class="card" style="padding:var(--space-2xl); text-align:center; color:var(--gray-500);">
                Khách sạn chưa có loại phòng nào. Vui lòng thêm loại phòng ở khung bên phải.
            </div>
        <?php endif; ?>
    </div>

    <!-- Right: Add Room Type Form -->
    <div class="card" style="padding:var(--space-xl); position:sticky; top:calc(var(--header-height) + 20px);">
        <h3 style="font-size:1.2rem; margin-bottom:var(--space-md); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
            + Thêm loại phòng mới
        </h3>

        <form action="<?= $appUrl ?>/partner/hotels/store-room/<?= $hotel->id ?>" method="POST">
            <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

            <div class="form-group mb-1">
                <label for="name">Tên loại phòng <span style="color:var(--danger)">*</span></label>
                <input type="text" name="name" id="name" class="form-control" placeholder="VD: Phòng Deluxe Hướng Biển" required>
            </div>

            <div class="grid grid-2 mb-1" style="gap:var(--space-sm);">
                <div class="form-group">
                    <label for="price_per_night">Giá/đêm (VND) <span style="color:var(--danger)">*</span></label>
                    <input type="number" name="price_per_night" id="price_per_night" class="form-control" placeholder="1200000" min="0" step="10000" required>
                </div>

                <div class="form-group">
                    <label for="total_rooms">Số phòng <span style="color:var(--danger)">*</span></label>
                    <input type="number" name="total_rooms" id="total_rooms" class="form-control" placeholder="10" min="1" required>
                </div>
            </div>

            <div class="grid grid-2 mb-1" style="gap:var(--space-sm);">
                <div class="form-group">
                    <label for="max_occupancy">Khách tối đa <span style="color:var(--danger)">*</span></label>
                    <input type="number" name="max_occupancy" id="max_occupancy" class="form-control" value="2" min="1" required>
                </div>

                <div class="form-group">
                    <label for="area_sqm">Diện tích (m²)</label>
                    <input type="number" name="area_sqm" id="area_sqm" class="form-control" placeholder="32" step="0.5">
                </div>
            </div>

            <div class="form-group mb-1">
                <label for="bed_type">Loại giường</label>
                <input type="text" name="bed_type" id="bed_type" class="form-control" placeholder="1 giường King đôi / 2 giường đơn">
            </div>

            <div class="form-group mb-2">
                <label for="description">Mô tả phòng</label>
                <textarea name="description" id="description" class="form-control" rows="2" placeholder="View ban công, tiện nghi bồn tắm..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-full">
                <i data-lucide="plus" style="width:16px;height:16px"></i> Lưu loại phòng
            </button>
        </form>
    </div>

</div>
