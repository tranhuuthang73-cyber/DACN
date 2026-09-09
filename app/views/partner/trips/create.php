<div style="max-width:800px; margin:0 auto;">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:var(--space-xl);">
        <a href="<?= $appUrl ?>/partner/trips" class="btn btn-ghost btn-sm">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Quay lại
        </a>
        <h2 style="font-size:1.5rem; font-weight:800;">Đăng ký Chuyến xe mới</h2>
    </div>

    <div class="card" style="padding:36px; background:white; border-radius:24px; box-shadow:var(--shadow-md);">
        <form method="POST" action="<?= $appUrl ?>/partner/trips/store">
            <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Điểm khởi hành <span style="color:var(--danger)">*</span></label>
                    <select name="departure_location_id" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem; background:white;">
                        <option value="">-- Chọn điểm đi --</option>
                        <?php foreach ($locations as $loc): ?>
                            <option value="<?= $loc->id ?>"><?= $loc->name ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Điểm đến <span style="color:var(--danger)">*</span></label>
                    <select name="arrival_location_id" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem; background:white;">
                        <option value="">-- Chọn điểm đến --</option>
                        <?php foreach ($locations as $loc): ?>
                            <option value="<?= $loc->id ?>"><?= $loc->name ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Loại phương tiện <span style="color:var(--danger)">*</span></label>
                    <select name="vehicle_type_id" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem; background:white;">
                        <option value="">-- Chọn loại xe --</option>
                        <?php foreach ($vehicles as $v): ?>
                            <option value="<?= $v->id ?>"><?= $v->name ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Thời gian khởi hành <span style="color:var(--danger)">*</span></label>
                    <input type="datetime-local" name="departure_datetime" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Tổng số ghế / chỗ <span style="color:var(--danger)">*</span></label>
                    <input type="number" name="total_seats" min="1" max="100" placeholder="vd: 34" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Giá vé mỗi người (VND) <span style="color:var(--danger)">*</span></label>
                    <input type="number" name="price_per_person" min="10000" step="10000" placeholder="vd: 350000" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Mô tả tiện ích chuyến xe</label>
                <textarea name="description" rows="3" placeholder="vd: Xe Limousine 9 chỗ VIP, massage toàn thân, cổng sạc Type-C, wifi tốc độ cao miễn phí..." style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;"></textarea>
            </div>

            <div style="margin-bottom:24px;">
                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Quy định & Lưu ý đón trả</label>
                <textarea name="policies" rows="2" placeholder="vd: Có mặt trước giờ khởi hành 15 phút tại văn phòng nhà xe..." style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:12px; padding-top:16px; border-top:1px solid var(--gray-100);">
                <a href="<?= $appUrl ?>/partner/trips" class="btn btn-ghost">Hủy bỏ</a>
                <button type="submit" class="btn btn-primary" style="padding:12px 28px; font-weight:800;">
                    ✓ Gửi chuyến xe chờ duyệt
                </button>
            </div>
        </form>
    </div>
</div>
