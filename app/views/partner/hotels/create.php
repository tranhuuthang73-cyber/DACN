<?php
use App\Core\Helper;
?>

<div style="margin-bottom:var(--space-xl);">
    <a href="<?= $appUrl ?>/partner/hotels" class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-sm);">
        ← Quay lại danh sách khách sạn
    </a>
    <h2 style="font-size:1.5rem;">Đăng ký Khách sạn mới</h2>
    <p style="color:var(--gray-500); font-size:0.9rem;">Sau khi đăng ký, hồ sơ khách sạn sẽ được Nhân viên kiểm tra và phê duyệt.</p>
</div>

<form action="<?= $appUrl ?>/partner/hotels/store" method="POST">
    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

    <div class="card" style="padding:var(--space-2xl); max-width:800px;">
        <div class="form-group mb-1">
            <label for="name">Tên Khách sạn / Resort / Homestay <span style="color:var(--danger)">*</span></label>
            <input type="text" name="name" id="name" class="form-control" placeholder="VD: Havan Nha Trang Beach Hotel" required>
        </div>

        <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
            <div class="form-group">
                <label for="location_id">Tỉnh / Thành phố <span style="color:var(--danger)">*</span></label>
                <select name="location_id" id="location_id" class="form-control" required>
                    <option value="">Chọn địa điểm...</option>
                    <?php foreach ($locations as $loc): ?>
                        <option value="<?= $loc->id ?>"><?= Helper::e($loc->name) ?> (<?= Helper::e($loc->province) ?>)</option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label for="star_rating">Hạng sao tiêu chuẩn <span style="color:var(--danger)">*</span></label>
                <select name="star_rating" id="star_rating" class="form-control" required>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
                    <option value="4" selected>⭐⭐⭐⭐ 4 Sao</option>
                    <option value="3">⭐⭐⭐ 3 Sao</option>
                    <option value="2">⭐⭐ 2 Sao</option>
                    <option value="1">⭐ 1 Sao</option>
                </select>
            </div>
        </div>

        <div class="form-group mb-1">
            <label for="address">Địa chỉ chi tiết <span style="color:var(--danger)">*</span></label>
            <input type="text" name="address" id="address" class="form-control" placeholder="Số nhà, tên đường, phường/xã..." required>
        </div>

        <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
            <div class="form-group">
                <label for="check_in_time">Giờ nhận phòng</label>
                <input type="time" name="check_in_time" id="check_in_time" class="form-control" value="14:00">
            </div>

            <div class="form-group">
                <label for="check_out_time">Giờ trả phòng</label>
                <input type="time" name="check_out_time" id="check_out_time" class="form-control" value="12:00">
            </div>
        </div>

        <div class="form-group mb-1">
            <label>Tiện nghi & Dịch vụ khách sạn</label>
            <div class="grid grid-3" style="gap:8px; margin-top:6px; background:var(--gray-50); padding:var(--space-md); border-radius:var(--radius-md);">
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="wifi" checked> Wi-Fi miễn phí
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="pool"> Hồ bơi
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="restaurant"> Nhà hàng
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="spa"> Spa & Massage
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="gym"> Phòng Gym
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="parking"> Bãi đỗ xe
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="bar"> Quầy Bar
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="beach_access"> Gần biển
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                    <input type="checkbox" name="amenities[]" value="room_service"> Dịch vụ phòng 24/7
                </label>
            </div>
        </div>

        <div class="form-group mb-2">
            <label for="description">Giới thiệu tổng quan</label>
            <textarea name="description" id="description" class="form-control" rows="4" placeholder="Giới thiệu về cảnh quan, vị trí đắc địa, chất lượng phục vụ..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-lg">
            <i data-lucide="send" style="width:18px;height:18px"></i> Lưu & Chuyển sang thêm loại phòng
        </button>
    </div>
</form>
