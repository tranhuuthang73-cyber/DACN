<?php
use App\Core\Helper;
?>

<div style="max-width:760px; margin:40px auto; padding:0 24px; text-align:center;">
    <div class="card" style="padding:48px 36px; background:white; border-radius:32px; box-shadow:var(--shadow-xl); border:1px solid var(--gray-100);">
        
        <!-- Success Icon -->
        <div style="width:84px; height:84px; border-radius:50%; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; color:var(--success);">
            <i data-lucide="check-circle-2" style="width:52px; height:52px;"></i>
        </div>

        <span class="badge badge-success" style="font-size:0.9rem; padding:8px 20px; font-weight:800; margin-bottom:12px;">
            GIAO DỊCH HOÀN TẤT
        </span>

        <h1 style="font-size:2.2rem; font-weight:900; color:var(--gray-900); margin-bottom:8px;">
            Thanh toán Thành công!
        </h1>
        <p style="color:var(--gray-500); font-size:1.05rem; margin-bottom:32px;">
            Cảm ơn bạn đã lựa chọn TravelGo. Chuyến hành trình của bạn đã được đảm bảo giữ chỗ 100%.
        </p>

        <!-- Transaction Details -->
        <div style="background:var(--gray-50); border-radius:20px; padding:24px; text-align:left; margin-bottom:32px; font-size:0.95rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                <span style="color:var(--gray-500);">Mã đơn hàng:</span>
                <strong style="color:var(--primary); font-size:1.05rem;"><?= Helper::e($order->order_code) ?></strong>
            </div>

            <?php if ($payment): ?>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                    <span style="color:var(--gray-500);">Mã giao dịch ngân hàng:</span>
                    <strong style="font-family:monospace;"><?= Helper::e($payment->transaction_code) ?></strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                    <span style="color:var(--gray-500);">Phương thức:</span>
                    <strong style="text-transform:uppercase; color:#005BAA;"><?= Helper::e($payment->payment_method) ?></strong>
                </div>
            <?php endif; ?>

            <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                <span style="color:var(--gray-500);">Thời gian thanh toán:</span>
                <strong><?= Helper::formatDateTime($order->paid_at ?? date('Y-m-d H:i:s')) ?></strong>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--gray-500); font-weight:600;">Tổng tiền đã thanh toán:</span>
                <span style="font-size:1.5rem; font-weight:900; color:var(--success);"><?= Helper::formatMoney($order->final_amount) ?></span>
            </div>
        </div>

        <!-- E-Tickets Access -->
        <div style="margin-bottom:32px; text-align:left;">
            <h4 style="font-size:1.1rem; font-weight:800; margin-bottom:16px;">
                🎟️ Vé điện tử đã phát hành:
            </h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <?php foreach ($bookings as $b): ?>
                    <div style="display:flex; justify-content:space-between; align-items:center; background:white; border:1px solid var(--gray-200); padding:16px 20px; border-radius:16px;">
                        <div>
                            <div style="font-weight:800; font-size:1.05rem; color:var(--primary);">
                                <?= Helper::e($b->booking_code) ?>
                            </div>
                            <div style="font-size:0.85rem; color:var(--gray-500);">
                                <?= $b->booking_type === 'trip' ? "🚌 Chuyến {$b->trip_code}: {$b->departure_name} → {$b->arrival_name}" : "🏨 Khách sạn: {$b->hotel_name}" ?>
                            </div>
                        </div>
                        <a href="<?= $appUrl ?>/booking/detail/<?= $b->booking_code ?>" class="btn btn-primary btn-sm" style="font-weight:800;">
                            Xem Vé & Mã QR →
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Quick Links -->
        <div style="display:flex; justify-content:center; gap:16px;">
            <a href="<?= $appUrl ?>/dashboard" class="btn btn-outline" style="font-weight:700;">
                Về Dashboard của tôi
            </a>
            <a href="<?= $appUrl ?>/" class="btn btn-ghost" style="color:var(--gray-500);">
                Về Trang chủ
            </a>
        </div>
    </div>
</div>
