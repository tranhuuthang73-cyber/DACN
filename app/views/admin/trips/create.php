<?php
use App\Core\Helper;
?>

<div style="margin-bottom:var(--space-xl);">
    <a href="<?= $appUrl ?>/admin/trips" class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-sm);">
        ← Quay lại danh sách chuyến
    </a>
    <h2 style="font-size:1.5rem;">Tạo Chuyến đi mới</h2>
    <p style="color:var(--gray-500); font-size:0.9rem;">Chỉ Admin có quyền tạo chuyến. Sau khi tạo, chuyến sẽ chuyển đến Nhân viên xét duyệt.</p>
</div>

<form action="<?= $appUrl ?>/admin/trips/store" method="POST">
    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

    <div class="grid" style="grid-template-columns: 2fr 1fr; gap:var(--space-xl); align-items:start;">
        
        <!-- Left: Thông tin chính -->
        <div style="display:flex; flex-direction:column; gap:var(--space-xl);">
            
            <div class="card" style="padding:var(--space-xl);">
                <h3 style="font-size:1.2rem; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
                    1. Tuyến đường & Phương tiện
                </h3>

                <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                    <div class="form-group">
                        <label for="departure_location_id">Điểm khởi hành (Điểm đi) <span style="color:var(--danger)">*</span></label>
                        <select name="departure_location_id" id="departure_location_id" class="form-control" required>
                            <option value="">Chọn điểm đi...</option>
                            <?php foreach ($locations as $loc): ?>
                                <option value="<?= $loc->id ?>"><?= Helper::e($loc->name) ?> (<?= Helper::e($loc->province) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="arrival_location_id">Điểm đến <span style="color:var(--danger)">*</span></label>
                        <select name="arrival_location_id" id="arrival_location_id" class="form-control" required>
                            <option value="">Chọn điểm đến...</option>
                            <?php foreach ($locations as $loc): ?>
                                <option value="<?= $loc->id ?>"><?= Helper::e($loc->name) ?> (<?= Helper::e($loc->province) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                    <div class="form-group">
                        <label for="vehicle_type_id">Loại phương tiện <span style="color:var(--danger)">*</span></label>
                        <select name="vehicle_type_id" id="vehicle_type_id" class="form-control" required>
                            <option value="">Chọn phương tiện...</option>
                            <?php foreach ($vehicles as $v): ?>
                                <option value="<?= $v->id ?>"><?= Helper::e($v->name) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="partner_id">Đối tác cung cấp dịch vụ <span style="color:var(--danger)">*</span></label>
                        <select name="partner_id" id="partner_id" class="form-control" required>
                            <option value="">Chọn đối tác...</option>
                            <?php foreach ($partners as $p): ?>
                                <option value="<?= $p->id ?>"><?= Helper::e($p->company_name) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Thời gian & Chỗ ngồi -->
            <div class="card" style="padding:var(--space-xl);">
                <h3 style="font-size:1.2rem; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
                    2. Thời gian & Sức chứa
                </h3>

                <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                    <div class="form-group">
                        <label for="departure_datetime">Ngày giờ khởi hành <span style="color:var(--danger)">*</span></label>
                        <input type="datetime-local" name="departure_datetime" id="departure_datetime" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="return_datetime">Ngày giờ đến dự kiến</label>
                        <input type="datetime-local" name="return_datetime" id="return_datetime" class="form-control">
                    </div>
                </div>

                <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                    <div class="form-group">
                        <label for="total_seats">Tổng số chỗ ngồi <span style="color:var(--danger)">*</span></label>
                        <input type="number" name="total_seats" id="total_seats" class="form-control" placeholder="40" min="1" max="500" required>
                    </div>

                    <div class="form-group">
                        <label for="price_per_person">Giá vé mỗi khách (VND) <span style="color:var(--danger)">*</span></label>
                        <input type="number" name="price_per_person" id="price_per_person" class="form-control" placeholder="350000" min="0" step="1000" required>
                    </div>
                </div>
            </div>

            <!-- Dịch vụ kèm theo -->
            <div class="card" style="padding:var(--space-xl);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
                    <h3 style="font-size:1.2rem;">3. Dịch vụ & Tiện ích đi kèm</h3>
                    <button type="button" class="btn btn-outline btn-sm" onclick="addServiceRow()">
                        <i data-lucide="plus" style="width:14px;height:14px"></i> Thêm dịch vụ
                    </button>
                </div>

                <div id="servicesContainer" style="display:flex; flex-direction:column; gap:8px;">
                    <div class="service-row" style="display:grid; grid-template-columns: 2fr 1fr 1fr auto; gap:8px; align-items:center;">
                        <input type="text" name="service_name[]" class="form-control" placeholder="Tên dịch vụ (VD: Nước uống miễn phí)">
                        <select name="service_included[]" class="form-control">
                            <option value="1">Đã bao gồm (Miễn phí)</option>
                            <option value="0">Thu phụ phí</option>
                        </select>
                        <input type="number" name="service_price[]" class="form-control" placeholder="Phụ phí (nếu có)" value="0">
                        <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.service-row').remove()">×</button>
                    </div>
                </div>
            </div>

            <!-- Mô tả & Chính sách -->
            <div class="card" style="padding:var(--space-xl);">
                <h3 style="font-size:1.2rem; margin-bottom:var(--space-md);">4. Mô tả & Chính sách</h3>

                <div class="form-group mb-1">
                    <label for="description">Mô tả chuyến đi</label>
                    <textarea name="description" id="description" class="form-control" rows="4" placeholder="Mô tả chi tiết chuyến đi, điểm đón khách, trang bị trên xe..."></textarea>
                </div>

                <div class="form-group">
                    <label for="policies">Chính sách & Quy định</label>
                    <textarea name="policies" id="policies" class="form-control" rows="3" placeholder="Quy định hành lý, hủy vé, giấy tờ tùy thân..."></textarea>
                </div>
            </div>

        </div>

        <!-- Right: Submit Action Box -->
        <div style="position:sticky; top:calc(var(--header-height) + 20px);">
            <div class="card" style="padding:var(--space-xl);">
                <h4 style="margin-bottom:var(--space-md);">Xác nhận tạo chuyến</h4>
                <p style="font-size:0.85rem; color:var(--gray-500); margin-bottom:var(--space-lg); line-height:1.6;">
                    Chuyến đi sau khi lưu sẽ có trạng thái <strong>Chờ nhân viên duyệt</strong>. Khi Nhân viên xác nhận, chuyến sẽ tự động hiển thị cho khách hàng đặt chỗ.
                </p>

                <button type="submit" class="btn btn-primary btn-full btn-lg">
                    <i data-lucide="send" style="width:18px;height:18px"></i> Lưu & Gửi duyệt chuyến
                </button>
            </div>
        </div>

    </div>
</form>

<script>
    function addServiceRow() {
        const container = document.getElementById('servicesContainer');
        const row = document.createElement('div');
        row.className = 'service-row';
        row.style.cssText = 'display:grid; grid-template-columns: 2fr 1fr 1fr auto; gap:8px; align-items:center;';
        row.innerHTML = `
            <input type="text" name="service_name[]" class="form-control" placeholder="Tên dịch vụ">
            <select name="service_included[]" class="form-control">
                <option value="1">Đã bao gồm (Miễn phí)</option>
                <option value="0">Thu phụ phí</option>
            </select>
            <input type="number" name="service_price[]" class="form-control" placeholder="Phụ phí" value="0">
            <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.service-row').remove()">×</button>
        `;
        container.appendChild(row);
        lucide.createIcons();
    }
</script>
