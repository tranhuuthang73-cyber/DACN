<?php
use App\Core\Helper;
?>

<div style="max-width:860px; margin:0 auto;">
    <div style="margin-bottom:var(--space-xl); text-align:center;">
        <h2 style="font-size:1.8rem; font-weight:900; display:flex; align-items:center; justify-content:center; gap:10px;">
            <i data-lucide="qr-code" style="color:var(--primary);width:32px;height:32px;"></i> Soát vé & Quét QR Code Check-in
        </h2>
        <p style="color:var(--gray-500); font-size:0.95rem; margin-top:6px;">
            Dành cho Nhân viên bến xe / Lễ tân khách sạn kiểm tra tính hợp lệ của Vé điện tử và xác nhận khách lên xe
        </p>
    </div>

    <!-- Input / Scan Card -->
    <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-md); margin-bottom:28px;">
        <form method="GET" action="<?= $appUrl ?>/employee/qr" style="display:flex; gap:12px; margin-bottom:16px;">
            <div style="flex:1; position:relative;">
                <i data-lucide="scan" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); width:20px; height:20px; color:var(--primary);"></i>
                <input type="text" name="code" value="<?= htmlspecialchars($code) ?>" placeholder="Nhập hoặc quét mã vé (vd: BK-20260905-001)..." autofocus required style="width:100%; padding:14px 16px 14px 48px; border-radius:14px; border:2px solid var(--primary); font-size:1.05rem; font-weight:700;">
            </div>
            <button type="submit" class="btn btn-primary" style="padding:14px 28px; font-weight:800; font-size:1rem;">
                🔍 Kiểm tra vé
            </button>
        </form>

        <!-- Quick Test Buttons -->
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.85rem; color:var(--gray-500);">
            <span>Mã vé mẫu test nhanh:</span>
            <a href="<?= $appUrl ?>/employee/qr?code=BK-20260905-001" class="badge badge-secondary" style="text-decoration:none; cursor:pointer;">BK-20260905-001</a>
            <a href="<?= $appUrl ?>/employee/qr?code=BK-20260905-002" class="badge badge-secondary" style="text-decoration:none; cursor:pointer;">BK-20260905-002</a>
            <a href="<?= $appUrl ?>/employee/qr?code=BK-20260906-003" class="badge badge-secondary" style="text-decoration:none; cursor:pointer;">BK-20260906-003</a>
        </div>
    </div>

    <!-- Verification Result -->
    <?php if ($booking): ?>
        <div class="card" style="padding:36px; background:white; border-radius:28px; box-shadow:var(--shadow-xl); border:2px solid <?= ($booking->checkin_status ?? '') === 'checked_in' ? 'var(--success)' : 'var(--primary)' ?>; margin-bottom:40px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gray-100); padding-bottom:20px; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <span style="font-size:0.85rem; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.04em;">KẾT QUẢ XÁC THỰC VÉ</span>
                    <h3 style="font-size:1.6rem; font-weight:900; color:var(--primary); margin-top:2px;">
                        <?= Helper::e($booking->booking_code) ?>
                    </h3>
                </div>

                <div>
                    <?php if (($booking->checkin_status ?? '') === 'checked_in'): ?>
                        <div class="badge badge-success" style="padding:10px 20px; font-size:1rem; font-weight:900;">
                            ✅ ĐÃ CHECK-IN LÊN XE
                        </div>
                    <?php elseif ($booking->status === 'cancelled'): ?>
                        <div class="badge badge-danger" style="padding:10px 20px; font-size:1rem; font-weight:900;">
                            ❌ VÉ ĐÃ BỊ HỦY
                        </div>
                    <?php else: ?>
                        <div class="badge" style="background:rgba(0,102,255,0.12); color:var(--primary); padding:10px 20px; font-size:1rem; font-weight:900;">
                            🎫 VÉ HỢP LỆ - CHỜ CHECK-IN
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Booking Details Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px;">
                <div style="background:var(--gray-50); padding:20px; border-radius:18px;">
                    <div style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; margin-bottom:6px;">HÀNH KHÁCH</div>
                    <div style="font-size:1.2rem; font-weight:800; color:var(--gray-900);"><?= Helper::e($booking->customer_name) ?></div>
                    <div style="font-size:0.9rem; color:var(--gray-600); margin-top:4px;">📞 <?= Helper::e($booking->customer_phone) ?></div>
                    <div style="font-size:0.85rem; color:var(--gray-500);">✉️ <?= Helper::e($booking->customer_email) ?></div>
                </div>

                <div style="background:var(--gray-50); padding:20px; border-radius:18px;">
                    <div style="font-size:0.82rem; color:var(--gray-500); text-transform:uppercase; margin-bottom:6px;">CHI TIẾT VÉ & DỊCH VỤ</div>
                    <?php if ($booking->booking_type === 'trip'): ?>
                        <div style="font-size:1.15rem; font-weight:800; color:var(--gray-900);">
                            <?= Helper::e($booking->departure_name) ?> → <?= Helper::e($booking->arrival_name) ?>
                        </div>
                        <div style="font-size:0.9rem; color:var(--primary); font-weight:700; margin-top:4px;">
                            Khởi hành: <?= Helper::formatDateTime($booking->departure_datetime) ?>
                        </div>
                        <div style="font-size:0.85rem; color:var(--gray-600); margin-top:2px;">
                            Phương tiện: <strong><?= Helper::e($booking->vehicle_name) ?></strong> • Số lượng: <strong><?= $booking->num_passengers ?> vé</strong>
                        </div>
                    <?php else: ?>
                        <div style="font-size:1.15rem; font-weight:800; color:var(--gray-900);">
                            <?= Helper::e($booking->hotel_name) ?>
                        </div>
                        <div style="font-size:0.9rem; color:var(--primary); font-weight:700; margin-top:4px;">
                            Loại phòng: <?= Helper::e($booking->room_name) ?>
                        </div>
                        <div style="font-size:0.85rem; color:var(--gray-600); margin-top:2px;">
                            Số lượng: <strong><?= $booking->num_rooms ?> phòng</strong>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Payment & Check-in Info -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:#F0FDF4; padding:18px 24px; border-radius:16px; border:1px solid #BBF7D0; margin-bottom:28px;">
                <div>
                    <div style="font-size:0.82rem; color:#15803D; font-weight:700;">TRẠNG THÁI THANH TOÁN</div>
                    <div style="font-size:1.2rem; font-weight:900; color:#166534;">
                        <?= Helper::formatMoney($booking->subtotal) ?> (Đã thanh toán)
                    </div>
                </div>
                <?php if (!empty($booking->checked_in_at)): ?>
                    <div style="text-align:right;">
                        <div style="font-size:0.82rem; color:var(--gray-500);">Đã soát vé lúc</div>
                        <div style="font-weight:700; color:var(--gray-900);">
                            <?= Helper::formatDateTime($booking->checked_in_at) ?>
                        </div>
                        <?php if (!empty($booking->checkin_staff_name)): ?>
                            <div style="font-size:0.8rem; color:var(--gray-500);">Bởi NV: <?= Helper::e($booking->checkin_staff_name) ?></div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Action Button -->
            <?php if (($booking->checkin_status ?? '') !== 'checked_in' && $booking->status !== 'cancelled'): ?>
                <div style="text-align:center;">
                    <a href="<?= $appUrl ?>/employee/qr/checkin/<?= $booking->booking_code ?>" class="btn btn-success" style="padding:16px 48px; font-size:1.2rem; font-weight:900; border-radius:18px; box-shadow:0 8px 24px rgba(16,185,129,0.35);">
                        ✓ XÁC NHẬN CHO HÀNH KHÁCH LÊN XE
                    </a>
                </div>
            <?php endif; ?>
        </div>
    <?php elseif (!empty($message)): ?>
        <div class="card" style="padding:48px 24px; text-align:center; background:white; border-radius:24px; color:var(--danger); border:1px solid #FCA5A5;">
            <i data-lucide="alert-circle" style="width:48px; height:48px; margin:0 auto 12px;"></i>
            <div style="font-size:1.2rem; font-weight:800;"><?= htmlspecialchars($message) ?></div>
            <p style="color:var(--gray-500); font-size:0.9rem; margin-top:6px;">Hãy kiểm tra lại ký tự mã vé trên hóa đơn hoặc ứng dụng TravelGo của hành khách.</p>
        </div>
    <?php endif; ?>
</div>
