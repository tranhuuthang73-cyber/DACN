<?php
use App\Core\Helper;
?>

<div style="max-width:540px; margin:40px auto; padding:0 20px;">
    <div class="card" style="padding:40px; background:white; border-radius:28px; box-shadow:var(--shadow-xl); border:1px solid var(--gray-200); text-align:center;">
        
        <!-- Gateway Header -->
        <?php if ($method === 'vnpay'): ?>
            <div style="background:#005BAA; color:white; padding:16px 24px; border-radius:18px; margin-bottom:24px; display:inline-flex; align-items:center; gap:10px;">
                <span style="font-size:1.4rem; font-weight:900; letter-spacing:0.04em;">VNPAY</span>
                <span style="font-size:0.85rem; opacity:0.85;">| Cổng thanh toán quốc gia</span>
            </div>
        <?php else: ?>
            <div style="background:#A50064; color:white; padding:16px 24px; border-radius:18px; margin-bottom:24px; display:inline-flex; align-items:center; gap:10px;">
                <span style="font-size:1.4rem; font-weight:900; letter-spacing:0.04em;">MoMo</span>
                <span style="font-size:0.85rem; opacity:0.85;">| Ví điện tử tiện lợi</span>
            </div>
        <?php endif; ?>

        <div style="font-size:0.9rem; color:var(--gray-500); margin-bottom:4px;">Số tiền cần thanh toán</div>
        <div style="font-size:2.4rem; font-weight:900; color:var(--gray-900); margin-bottom:20px;">
            <?= Helper::formatMoney($order->final_amount) ?>
        </div>

        <div style="background:var(--gray-50); padding:16px; border-radius:16px; margin-bottom:28px; font-size:0.88rem; text-align:left;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="color:var(--gray-500);">Mã đơn hàng:</span>
                <strong style="color:var(--primary);"><?= Helper::e($order->order_code) ?></strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="color:var(--gray-500);">Đơn vị thụ hưởng:</span>
                <strong>Công ty Cổ phần Du lịch TravelGo</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--gray-500);">Nội dung chuyển khoản:</span>
                <strong><?= Helper::e($order->order_code) ?> TT VE</strong>
            </div>
        </div>

        <!-- Simulated QR Code -->
        <div style="background:white; padding:20px; border-radius:20px; display:inline-block; border:2px dashed var(--gray-300); margin-bottom:24px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=<?= urlencode($appUrl . '/payment/confirm/' . $order->order_code . '?method=' . $method) ?>" 
                 alt="QR Code Thanh toán" style="width:200px; height:200px; display:block; border-radius:12px;">
            <div style="font-size:0.82rem; color:var(--gray-500); margin-top:10px; font-weight:600;">
                Mở ứng dụng Ngân hàng hoặc <?= strtoupper($method) ?> để quét mã
            </div>
        </div>

        <!-- Simulation Buttons (Dành cho đồ án / chấm điểm) -->
        <div style="background:#FEF3C7; border:1px solid #FCD34D; padding:14px; border-radius:14px; margin-bottom:24px; font-size:0.84rem; color:#92400E;">
            💡 <strong>Mô phỏng Sandbox:</strong> Nhấn nút bên dưới để hoàn tất giao dịch tức thì!
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
            <a href="<?= $appUrl ?>/payment/confirm/<?= $order->order_code ?>?method=<?= $method ?>" 
               class="btn btn-success" style="padding:16px; font-size:1.1rem; font-weight:900; border-radius:16px; text-decoration:none;">
                ✓ MÔ PHỎNG: XÁC NHẬN ĐÃ THANH TOÁN
            </a>

            <a href="<?= $appUrl ?>/payment/checkout/<?= $order->order_code ?>" 
               class="btn btn-ghost" style="color:var(--gray-500); font-weight:600;">
                Quay lại chọn phương thức khác
            </a>
        </div>
    </div>
</div>
