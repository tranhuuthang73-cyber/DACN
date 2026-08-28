<?php
use App\Core\Helper;
?>

<!-- ==================== TRIP HEADER ==================== -->
<section style="background: linear-gradient(135deg, var(--gray-900) 0%, #1a365d 100%); padding: calc(var(--header-height) + var(--space-2xl)) 0 var(--space-2xl); color:white;">
    <div class="container">
        <div style="display:flex; gap:var(--space-sm); align-items:center; margin-bottom:var(--space-sm);">
            <span class="badge badge-primary" style="background:rgba(255,255,255,0.15); color:white; border:1px solid rgba(255,255,255,0.2);">
                <i data-lucide="hash" style="width:12px;height:12px"></i> <?= Helper::e($trip->trip_code) ?>
            </span>
            <span class="badge badge-success" style="background:rgba(16,185,129,0.2); color:#6EE7B7; border:1px solid rgba(16,185,129,0.3);">
                <i data-lucide="<?= Helper::e($trip->vehicle_icon) ?>" style="width:12px;height:12px"></i> <?= Helper::e($trip->vehicle_name) ?>
            </span>
        </div>

        <h1 style="color:white; font-size:2.5rem; margin-bottom:var(--space-sm);">
            <?= Helper::e($trip->departure_name) ?> 
            <span style="color:var(--accent);">→</span> 
            <?= Helper::e($trip->arrival_name) ?>
        </h1>
        <p style="color:rgba(255,255,255,0.8); font-size:1.05rem;">
            Cung cấp bởi: <strong><?= Helper::e($trip->partner_name) ?></strong>
        </p>
    </div>
</section>

<!-- ==================== MAIN DETAIL BODY ==================== -->
<section class="section" style="padding-top:var(--space-2xl);">
    <div class="container">
        <div class="grid" style="grid-template-columns: 1fr 360px; gap: var(--space-2xl); align-items: start;">
            
            <!-- ==================== LEFT COLUMN ==================== -->
            <div>
                <!-- Featured Image -->
                <div style="border-radius:var(--radius-lg); overflow:hidden; margin-bottom:var(--space-2xl); box-shadow:var(--shadow-md); aspect-ratio:16/9;">
                    <img src="<?= $trip->featured_image ? $appUrl . '/' . $trip->featured_image : 'https://placehold.co/1000x560/0066FF/FFFFFF?text=' . urlencode($trip->departure_name . '+→+' . $trip->arrival_name) ?>" 
                         alt="<?= Helper::e($trip->departure_name) ?>" style="width:100%;height:100%;object-fit:cover;">
                </div>

                <!-- Hành trình & Thời gian -->
                <div class="card" style="padding:var(--space-xl); margin-bottom:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg); font-size:1.3rem; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="route" style="color:var(--primary); width:20px;height:20px;"></i> Thông tin hành trình
                    </h3>

                    <div class="grid grid-2" style="gap:var(--space-lg);">
                        <div style="background:var(--gray-50); padding:var(--space-md); border-radius:var(--radius-md); border-left:4px solid var(--primary);">
                            <div style="font-size:0.85rem; color:var(--gray-500); margin-bottom:4px;">KHỞI HÀNH (ĐIỂM ĐI)</div>
                            <div style="font-weight:700; font-size:1.15rem; color:var(--gray-900);"><?= Helper::e($trip->departure_name) ?></div>
                            <div style="font-size:0.95rem; color:var(--primary); font-weight:600; margin-top:4px;">
                                <i data-lucide="clock" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i>
                                <?= Helper::formatDateTime($trip->departure_datetime) ?>
                            </div>
                        </div>

                        <div style="background:var(--gray-50); padding:var(--space-md); border-radius:var(--radius-md); border-left:4px solid var(--secondary);">
                            <div style="font-size:0.85rem; color:var(--gray-500); margin-bottom:4px;">ĐẾN NƠI (ĐIỂM ĐẾN)</div>
                            <div style="font-weight:700; font-size:1.15rem; color:var(--gray-900);"><?= Helper::e($trip->arrival_name) ?></div>
                            <div style="font-size:0.95rem; color:var(--secondary); font-weight:600; margin-top:4px;">
                                <?php if ($trip->return_datetime): ?>
                                    <i data-lucide="clock" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i>
                                    Dự kiến: <?= Helper::formatDateTime($trip->return_datetime) ?>
                                <?php else: ?>
                                    Khách tự do tham quan tại điểm đến
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top:var(--space-lg); padding-top:var(--space-md); border-top:1px solid var(--gray-100); font-size:0.92rem; color:var(--gray-600); line-height:1.7;">
                        <?= nl2br(Helper::e($trip->description ?? 'Chưa có mô tả chi tiết cho chuyến đi này.')) ?>
                    </div>
                </div>

                <!-- Dịch vụ đi kèm -->
                <?php if (!empty($trip->services)): ?>
                <div class="card" style="padding:var(--space-xl); margin-bottom:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg); font-size:1.3rem; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="sparkles" style="color:var(--accent-dark); width:20px;height:20px;"></i> Dịch vụ & Tiện ích
                    </h3>

                    <div class="grid grid-2" style="gap:var(--space-md);">
                        <?php foreach ($trip->services as $service): ?>
                            <div style="display:flex; align-items:flex-start; gap:10px; background:var(--gray-50); padding:12px; border-radius:var(--radius-md);">
                                <div style="color: <?= $service->is_included ? 'var(--success)' : 'var(--warning)' ?>; margin-top:2px;">
                                    <i data-lucide="<?= $service->is_included ? 'check-circle-2' : 'plus-circle' ?>" style="width:18px;height:18px"></i>
                                </div>
                                <div>
                                    <div style="font-weight:600; font-size:0.95rem; color:var(--gray-900);">
                                        <?= Helper::e($service->name) ?>
                                        <?php if (!$service->is_included && $service->extra_price > 0): ?>
                                            <span style="font-size:0.8rem; color:var(--secondary); font-weight:700;">(+<?= Helper::formatMoney($service->extra_price) ?>)</span>
                                        <?php endif; ?>
                                    </div>
                                    <?php if ($service->description): ?>
                                        <div style="font-size:0.82rem; color:var(--gray-500);"><?= Helper::e($service->description) ?></div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Chính sách chuyến đi -->
                <div class="card" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-md); font-size:1.3rem; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="shield-alert" style="color:var(--gray-700); width:20px;height:20px;"></i> Chính sách & Lưu ý
                    </h3>
                    <div style="font-size:0.92rem; color:var(--gray-600); line-height:1.7;">
                        <?= nl2br(Helper::e($trip->policies ?? "• Quý khách vui lòng có mặt tại điểm đón trước giờ khởi hành ít nhất 15 phút.\n• Xuất trình vé điện tử có mã QR hoặc tin nhắn xác nhận cho nhân viên soát vé.\n• Chính sách hoàn tiền áp dụng tự động theo thời gian hủy trước ngày khởi hành.")) ?>
                    </div>
                </div>
            </div>

            <!-- ==================== RIGHT COLUMN: BOOKING BOX ==================== -->
            <div style="position:sticky; top:calc(var(--header-height) + 20px);">
                <div class="card" style="padding:var(--space-xl); box-shadow:var(--shadow-xl); border:2px solid var(--primary-50);">
                    <div style="font-size:0.85rem; color:var(--gray-500); margin-bottom:4px;">Giá vé niêm yết</div>
                    <div style="display:flex; align-items:baseline; gap:4px; margin-bottom:var(--space-md);">
                        <span style="font-size:2rem; font-weight:800; color:var(--secondary);">
                            <?= Helper::formatMoney($trip->price_per_person) ?>
                        </span>
                        <span style="color:var(--gray-500); font-size:0.9rem;">/người</span>
                    </div>

                    <!-- Tình trạng chỗ ngồi -->
                    <div style="background:var(--gray-50); padding:12px; border-radius:var(--radius-md); margin-bottom:var(--space-lg); border:1px solid var(--gray-200);">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
                            <span>Chỗ còn trống:</span>
                            <strong style="color:var(--primary); font-size:0.95rem;"><?= $trip->available_seats ?> / <?= $trip->total_seats ?></strong>
                        </div>
                        <div style="height:6px; background:var(--gray-200); border-radius:var(--radius-full); overflow:hidden;">
                            <div style="height:100%; width:<?= $trip->fill_rate ?>%; background:linear-gradient(90deg, var(--primary), var(--secondary)); border-radius:var(--radius-full);"></div>
                        </div>
                    </div>

                    <?php if ($trip->available_seats > 0): ?>
                        <!-- Form chọn số lượng & Đặt chỗ (giỏ hàng) -->
                        <form action="<?= $appUrl ?>/cart/add-trip" method="POST">
                            <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                            <input type="hidden" name="trip_id" value="<?= $trip->id ?>">

                            <div class="form-group mb-2">
                                <label for="quantity">Số lượng hành khách</label>
                                <select name="quantity" id="quantity" class="form-control" onchange="updateTotalPrice(this.value, <?= $trip->price_per_person ?>)">
                                    <?php for ($i = 1; $i <= min(10, $trip->available_seats); $i++): ?>
                                        <option value="<?= $i ?>"><?= $i ?> người</option>
                                    <?php endfor; ?>
                                </select>
                            </div>

                            <div style="display:flex; justify-content:space-between; font-size:1.05rem; font-weight:700; padding:var(--space-md) 0; border-top:1px dashed var(--gray-200); margin-bottom:var(--space-md);">
                                <span>Tạm tính:</span>
                                <span id="totalPriceDisplay" style="color:var(--secondary); font-size:1.3rem;">
                                    <?= Helper::formatMoney($trip->price_per_person) ?>
                                </span>
                            </div>

                            <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-bottom:var(--space-sm);">
                                <i data-lucide="ticket" style="width:18px;height:18px"></i> Đặt chuyến ngay
                            </button>
                        </form>
                    <?php else: ?>
                        <div class="alert alert-warning" style="margin-bottom:var(--space-md);">
                            <i data-lucide="alert-triangle" style="width:18px;height:18px"></i>
                            <span>Chuyến đi này hiện đã <strong>hết chỗ</strong>.</span>
                        </div>
                    <?php endif; ?>

                    <div style="font-size:0.8rem; color:var(--gray-500); text-align:center; margin-top:var(--space-sm);">
                        <i data-lucide="clock" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i>
                        Giữ chỗ 15 phút sau khi bắt đầu đặt đơn.
                    </div>
                </div>
            </div>

        </div>

        <!-- ==================== ALTERNATIVE TRIPS ==================== -->
        <?php if (!empty($alternatives)): ?>
            <div style="margin-top:var(--space-4xl); border-top:1px solid var(--gray-200); padding-top:var(--space-3xl);">
                <div class="section-header" style="text-align:left; margin-bottom:var(--space-xl);">
                    <h2>Chuyến đi <span class="text-gradient">gợi ý thay thế</span></h2>
                    <p>Các chuyến đi khác cùng tuyến đường hoặc lân cận để bạn tham khảo</p>
                </div>

                <div class="grid grid-3">
                    <?php foreach ($alternatives as $alt): ?>
                        <a href="<?= $appUrl ?>/trips/detail/<?= $alt->id ?>" class="card">
                            <div class="card-image">
                                <img src="<?= $alt->featured_image ? $appUrl . '/' . $alt->featured_image : 'https://placehold.co/600x380/0066FF/FFFFFF?text=' . urlencode($alt->departure_name . '+→+' . $alt->arrival_name) ?>" alt="Trip" loading="lazy">
                            </div>
                            <div class="card-body">
                                <div class="card-title"><?= Helper::e($alt->departure_name) ?> → <?= Helper::e($alt->arrival_name) ?></div>
                                <div class="card-subtitle">
                                    <i data-lucide="<?= Helper::e($alt->vehicle_icon) ?>" style="width:14px;height:14px"></i>
                                    <?= Helper::e($alt->vehicle_name) ?> • <?= Helper::e($alt->partner_name) ?>
                                </div>
                                <div class="card-meta">
                                    <span class="card-meta-item">
                                        <i data-lucide="calendar" style="width:14px;height:14px"></i>
                                        <?= Helper::formatDateTime($alt->departure_datetime) ?>
                                    </span>
                                </div>
                                <div class="card-price">
                                    <span class="price-value"><?= Helper::formatMoney($alt->price_per_person) ?></span>
                                    <span class="price-unit">/người</span>
                                </div>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        <!-- ==================== DESTINATION HOTELS (COMBO RECOMMENDATION) ==================== -->
        <?php if (!empty($comboHotels)): ?>
            <div style="margin-top:var(--space-3xl); border-top:1px solid var(--gray-200); padding-top:var(--space-3xl);">
                <div class="section-header" style="text-align:left; margin-bottom:var(--space-xl);">
                    <h2>Gợi ý Khách sạn tại <span class="text-gradient"><?= Helper::e($trip->arrival_name) ?></span></h2>
                    <p>Đặt phòng ngay tại điểm đến để hoàn thiện trọn gói kỳ nghỉ của bạn</p>
                </div>

                <div class="grid grid-3">
                    <?php foreach ($comboHotels as $ch): ?>
                        <a href="<?= $appUrl ?>/hotels/detail/<?= $ch->id ?>" class="card" style="text-decoration:none;">
                            <div class="card-image" style="height:180px;">
                                <img src="<?= $ch->featured_image ? $appUrl . '/' . $ch->featured_image : 'https://placehold.co/600x380/00D4AA/FFFFFF?text=' . urlencode($ch->name) ?>" alt="Hotel" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
                                <div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);color:#FBBF24;padding:4px 8px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:700;display:flex;align-items:center;gap:4px;">
                                    ★ <?= $ch->star_rating ?> sao
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="card-title"><?= Helper::e($ch->name) ?></div>
                                <div class="card-subtitle" style="font-size:0.8rem; color:var(--gray-500); margin-bottom:var(--space-xs);">
                                    <i data-lucide="map-pin" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i>
                                    <?= Helper::e($ch->location_name) ?>
                                </div>
                                <div class="card-price">
                                    <span class="price-value" style="color:var(--accent-dark);"><?= $ch->min_price ? Helper::formatMoney($ch->min_price) : 'Liên hệ' ?></span>
                                    <span class="price-unit">/đêm</span>
                                </div>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

    </div>
</section>

<script>
    function updateTotalPrice(qty, pricePerPerson) {
        const total = qty * pricePerPerson;
        document.getElementById('totalPriceDisplay').textContent = total.toLocaleString('vi-VN') + '₫';
    }
</script>
