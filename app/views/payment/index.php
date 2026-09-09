<?php
use App\Core\Helper;
?>

<div style="max-width:960px; margin:40px auto; padding:0 24px;">
    <!-- 15-Minute Countdown Banner -->
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color:white; padding:24px 32px; border-radius:24px; margin-bottom:32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; box-shadow:var(--shadow-lg);">
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; color:#FBBF24;">
                <i data-lucide="clock" style="width:26px;height:26px;"></i>
            </div>
            <div>
                <div style="font-size:0.85rem; color:#C7D2FE; text-transform:uppercase; letter-spacing:0.04em;">THỜI GIAN GIỮ CHỖ CÒN LẠI</div>
                <div style="font-size:1.1rem; font-weight:700;">Vui lòng hoàn tất thanh toán để nhận vé chính thức</div>
            </div>
        </div>

        <div style="display:flex; align-items:baseline; gap:6px; background:rgba(0,0,0,0.3); padding:10px 24px; border-radius:16px; border:1px solid rgba(255,255,255,0.15);">
            <span id="countdownTimer" style="font-size:2.4rem; font-weight:900; color:#FBBF24; font-variant-numeric:tabular-nums;">
                --:--
            </span>
        </div>
    </div>

    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:32px;">
        <!-- Left: Payment Method Selection -->
        <div>
            <div class="card" style="padding:32px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
                <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <i data-lucide="credit-card" style="color:var(--primary);width:22px;height:22px;"></i> Chọn phương thức thanh toán
                </h3>

                <form method="POST" action="<?= $appUrl ?>/payment/process/<?= $order->order_code ?>">
                    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

                    <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:28px;">
                        <!-- VNPay -->
                        <label style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border:2px solid var(--primary); background:#F0F7FF; border-radius:18px; cursor:pointer; transition:all 0.2s;">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <input type="radio" name="payment_method" value="vnpay" checked style="width:20px; height:20px; accent-color:var(--primary);">
                                <div>
                                    <div style="font-weight:800; font-size:1.05rem; color:#005BAA;">Cổng thanh toán VNPAY</div>
                                    <div style="font-size:0.85rem; color:var(--gray-500);">Quét mã VNPAY-QR, Thẻ ATM Nội địa, Internet Banking, Visa/Mastercard</div>
                                </div>
                            </div>
                            <span class="badge badge-primary" style="font-weight:800;">Khuyên dùng</span>
                        </label>

                        <!-- MoMo -->
                        <label style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border:2px solid var(--gray-200); background:white; border-radius:18px; cursor:pointer; transition:all 0.2s;">
                            <div style="display:flex; align-items:center; gap:16px;">
                                <input type="radio" name="payment_method" value="momo" style="width:20px; height:20px; accent-color:#A50064;">
                                <div>
                                    <div style="font-weight:800; font-size:1.05rem; color:#A50064;">Ví điện tử MoMo</div>
                                    <div style="font-size:0.85rem; color:var(--gray-500);">Quét mã QR MoMo hoặc thanh toán trực tiếp qua ứng dụng MoMo</div>
                                </div>
                            </div>
                            <span class="badge" style="background:rgba(165,0,100,0.1); color:#A50064; font-weight:800;">Nhanh chóng</span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width:100%; padding:16px; font-size:1.15rem; font-weight:900; border-radius:16px; box-shadow:0 8px 24px rgba(0,102,255,0.25);">
                        Tiếp tục thanh toán <?= Helper::formatMoney($order->final_amount) ?> →
                    </button>
                </form>
            </div>
        </div>

        <!-- Right: Order Summary -->
        <div>
            <div class="card" style="padding:28px; background:white; border-radius:24px; box-shadow:var(--shadow-sm); position:sticky; top:100px;">
                <h4 style="font-size:1.15rem; font-weight:800; margin-bottom:16px; border-bottom:1px solid var(--gray-100); padding-bottom:12px;">
                    Tóm tắt đơn hàng #<?= Helper::e($order->order_code) ?>
                </h4>

                <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:20px;">
                    <?php foreach ($bookings as $b): ?>
                        <div style="font-size:0.9rem; border-bottom:1px dashed var(--gray-200); padding-bottom:10px;">
                            <?php if ($b->booking_type === 'trip'): ?>
                                <div style="font-weight:700;"><?= Helper::e($b->departure_name) ?> → <?= Helper::e($b->arrival_name) ?></div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">Chuyến: <?= Helper::e($b->trip_code) ?> • <?= $b->num_passengers ?> vé</div>
                            <?php else: ?>
                                <div style="font-weight:700;"><?= Helper::e($b->hotel_name) ?></div>
                                <div style="font-size:0.8rem; color:var(--gray-500);"><?= Helper::e($b->room_name) ?> • <?= $b->num_rooms ?> phòng</div>
                            <?php endif; ?>
                            <div style="text-align:right; font-weight:800; color:var(--primary); margin-top:2px;">
                                <?= Helper::formatMoney($b->subtotal) ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.1rem; font-weight:900; color:var(--gray-900); padding-top:12px; border-top:2px solid var(--gray-200);">
                    <span>Tổng thanh toán:</span>
                    <span style="color:var(--secondary); font-size:1.35rem;"><?= Helper::formatMoney($order->final_amount) ?></span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    let remaining = <?= $remainingSeconds ?>;
    const timerElem = document.getElementById('countdownTimer');

    function updateCountdown() {
        if (remaining <= 0) {
            timerElem.textContent = 'HẾT HẠN';
            timerElem.style.color = '#EF4444';
            alert('Đã hết thời gian giữ chỗ 15 phút. Đơn hàng sẽ được hủy.');
            window.location.href = '<?= $appUrl ?>/cart';
            return;
        }

        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        remaining--;
        setTimeout(updateCountdown, 1000);
    }

    updateCountdown();
</script>
