<?php
use App\Core\Helper;
?>

<div style="max-width:960px; margin:0 auto;">
    <div style="margin-bottom:var(--space-xl);">
        <h2 style="font-size:1.6rem; font-weight:800; display:flex; align-items:center; gap:10px;">
            <i data-lucide="settings" style="color:var(--primary);width:26px;height:26px;"></i> Cấu hình Hệ thống TravelGo
        </h2>
        <p style="color:var(--gray-500); font-size:0.92rem; margin-top:4px;">
            Thiết lập các tham số nghiệp vụ trọng yếu: Giữ chỗ vé 15 phút, cổng thanh toán VNPay/MoMo, chính sách hoàn tiền
        </p>
    </div>

    <form method="POST" action="<?= $appUrl ?>/admin/settings/update">
        <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

        <!-- Section 1: Nghiệp vụ Đặt chỗ -->
        <div class="card" style="padding:32px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                <i data-lucide="clock" style="color:var(--primary);width:20px;height:20px;"></i> Quy định Giữ chỗ & Đặt dịch vụ
            </h3>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">
                        Thời gian giữ chỗ tạm thời (Phút)
                    </label>
                    <div style="position:relative;">
                        <input type="number" name="booking_hold_minutes" min="5" max="60" value="<?= htmlspecialchars($settings['booking_hold_minutes'] ?? '15') ?>" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:1.05rem; font-weight:800; color:var(--primary);">
                    </div>
                    <small style="color:var(--gray-500); display:block; margin-top:6px;">
                        Mặc định 15 phút: Quá thời gian này đơn hàng chưa thanh toán sẽ tự động nhả ghế/phòng.
                    </small>
                </div>

                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">
                        Tên nền tảng (Site Name)
                    </label>
                    <input type="text" name="site_name" value="<?= htmlspecialchars($settings['site_name'] ?? 'TravelGo') ?>" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>

                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">
                        Số hành khách tối đa mỗi lần đặt
                    </label>
                    <input type="number" name="max_passengers_per_booking" min="1" max="50" value="<?= htmlspecialchars($settings['max_passengers_per_booking'] ?? '10') ?>" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>

                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">
                        Số phòng tối đa mỗi lần đặt
                    </label>
                    <input type="number" name="max_rooms_per_booking" min="1" max="20" value="<?= htmlspecialchars($settings['max_rooms_per_booking'] ?? '5') ?>" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
            </div>
        </div>

        <!-- Section 2: Cổng Thanh toán Mock & Thật -->
        <div class="card" style="padding:32px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                <i data-lucide="credit-card" style="color:var(--success);width:20px;height:20px;"></i> Cổng Thanh toán Trực tuyến
            </h3>

            <div style="display:flex; flex-direction:column; gap:16px;">
                <label style="display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:var(--gray-50); border-radius:16px; cursor:pointer; border:1px solid var(--gray-200);">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; border-radius:12px; background:white; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); font-weight:900; color:#005BAA;">
                            VN
                        </div>
                        <div>
                            <div style="font-weight:800; font-size:1.05rem;">Cổng thanh toán VNPay (QR Pay / Thẻ ATM / Visa)</div>
                            <div style="font-size:0.85rem; color:var(--gray-500);">Hỗ trợ thanh toán nhanh bằng ứng dụng ngân hàng và quét mã VNPAY-QR</div>
                        </div>
                    </div>
                    <input type="checkbox" name="vnpay_enabled" value="1" <?= ($settings['vnpay_enabled'] ?? '1') === '1' ? 'checked' : '' ?> style="width:24px; height:24px; accent-color:var(--primary); cursor:pointer;">
                </label>

                <label style="display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:var(--gray-50); border-radius:16px; cursor:pointer; border:1px solid var(--gray-200);">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:48px; height:48px; border-radius:12px; background:#A50064; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm); font-weight:900; color:white;">
                            MoMo
                        </div>
                        <div>
                            <div style="font-weight:800; font-size:1.05rem;">Ví điện tử MoMo</div>
                            <div style="font-size:0.85rem; color:var(--gray-500);">Quét mã QR MoMo hoặc thanh toán bằng ứng dụng MoMo</div>
                        </div>
                    </div>
                    <input type="checkbox" name="momo_enabled" value="1" <?= ($settings['momo_enabled'] ?? '1') === '1' ? 'checked' : '' ?> style="width:24px; height:24px; accent-color:#A50064; cursor:pointer;">
                </label>
            </div>
        </div>

        <!-- Section 3: Thông tin Liên hệ & Hỗ trợ -->
        <div class="card" style="padding:32px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); margin-bottom:28px;">
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
                <i data-lucide="headphones" style="color:var(--secondary);width:20px;height:20px;"></i> Thông tin CSKH & Hotline
            </h3>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Email CSKH</label>
                    <input type="email" name="contact_email" value="<?= htmlspecialchars($settings['contact_email'] ?? 'support@travelgo.vn') ?>" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Hotline 24/7</label>
                    <input type="text" name="contact_phone" value="<?= htmlspecialchars($settings['contact_phone'] ?? '1900 1234') ?>" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
            </div>
        </div>

        <!-- Section 4: Bảng Chính sách Hủy Hoàn tiền (Tham chiếu) -->
        <div class="card" style="padding:32px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); margin-bottom:32px;">
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                <i data-lucide="rotate-ccw" style="color:#FB923C;width:20px;height:20px;"></i> Chính sách Hủy hoàn tiền Bậc thang (Quy chuẩn Đồ án)
            </h3>
            <p style="font-size:0.88rem; color:var(--gray-500); margin-bottom:16px;">
                Hệ thống tự động áp dụng công thức sau khi khách hàng bấm Yêu cầu Hủy vé:
            </p>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Mức hoàn</th>
                            <th>Khoảng thời gian hủy trước giờ đi</th>
                            <th>Tỷ lệ hoàn tiền</th>
                            <th>Mô tả chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($policies)): ?>
                            <?php foreach ($policies as $p): ?>
                                <tr>
                                    <td><strong><?= Helper::e($p->name) ?></strong></td>
                                    <td>
                                        <?php if ($p->min_days_before !== null && $p->max_days_before !== null): ?>
                                            Từ <?= $p->min_days_before ?> đến <?= $p->max_days_before ?> ngày
                                        <?php elseif ($p->min_days_before !== null): ?>
                                            Trước ≥ <?= $p->min_days_before ?> ngày
                                        <?php else: ?>
                                            Trong vòng 24 giờ
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="badge badge-<?= $p->refund_percentage >= 50 ? 'success' : ($p->refund_percentage > 0 ? 'warning' : 'danger') ?>" style="font-size:0.85rem; font-weight:800;">
                                            <?= number_format($p->refund_percentage, 0) ?>%
                                        </span>
                                    </td>
                                    <td style="color:var(--gray-500); font-size:0.88rem;"><?= Helper::e($p->description) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:16px; margin-bottom:40px;">
            <button type="submit" class="btn btn-primary" style="padding:14px 36px; font-weight:800; font-size:1.05rem;">
                ✓ Lưu tất cả thay đổi
            </button>
        </div>
    </form>
</div>
