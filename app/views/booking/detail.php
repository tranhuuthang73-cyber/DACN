<?php
use App\Core\Helper;

$statusMeta = Helper::bookingStatus($booking->status);
$isPending = ($booking->status === 'pending_payment');
$isConfirmed = in_array($booking->status, ['paid', 'confirmed']);
?>

<section class="section" style="padding-top:calc(var(--header-height) + var(--space-xl)); min-height:80vh;">
    <div class="container">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
            <div>
                <a href="<?= $appUrl ?>/booking/my-bookings" class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-xs);">
                    ← Quay lại danh sách booking
                </a>
                <h1 style="font-size:1.8rem;">Vé điện tử / Chi tiết Booking</h1>
            </div>

            <div style="display:flex; gap:8px;">
                <button onclick="window.print()" class="btn btn-outline btn-sm">
                    <i data-lucide="printer" style="width:14px;height:14px"></i> In vé
                </button>
            </div>
        </div>

        <!-- 15-Minute Countdown Warning (If Pending Payment) -->
        <?php if ($isPending): ?>
            <div class="card" style="padding:var(--space-lg); margin-bottom:var(--space-xl); background:linear-gradient(135deg, var(--warning-light), white); border:2px solid var(--warning); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-md);">
                <div style="display:flex; gap:12px; align-items:center;">
                    <div style="width:44px; height:44px; border-radius:var(--radius-full); background:var(--warning); color:white; display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="clock" style="width:24px;height:24px"></i>
                    </div>
                    <div>
                        <h3 style="font-size:1.1rem; color:#92400E; margin-bottom:2px;">Booking đang được giữ chỗ trong 15 phút</h3>
                        <p style="font-size:0.85rem; color:#78350F;">Thời gian còn lại để thanh toán: <strong id="countdownTimer" style="font-size:1.1rem; color:var(--danger);">--:--</strong></p>
                    </div>
                </div>

                <a href="<?= $appUrl ?>/payment/checkout/<?= $booking->order_code ?>" class="btn btn-secondary btn-lg">
                    <i data-lucide="credit-card" style="width:18px;height:18px"></i> Thanh toán ngay
                </a>
            </div>
        <?php endif; ?>

        <div class="grid" style="grid-template-columns: 2fr 1fr; gap:var(--space-2xl); align-items:start;">
            
            <!-- ==================== LEFT: ELECTRONIC TICKET ==================== -->
            <div class="card" style="padding:var(--space-2xl); border:2px solid var(--primary-100); background:white; position:relative; overflow:hidden;">
                
                <!-- Ticket Top Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed var(--gray-200); padding-bottom:var(--space-lg); margin-bottom:var(--space-xl);">
                    <div style="display:flex; align-items:center; gap:var(--space-sm);">
                        <div class="brand-icon" style="width:36px;height:36px;background:var(--primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:white;">
                            <i data-lucide="plane" style="width:20px;height:20px"></i>
                        </div>
                        <div>
                            <div style="font-weight:800; font-size:1.1rem;">TravelGo E-Ticket</div>
                            <div style="font-size:0.75rem; color:var(--gray-500);">Vé điện tử xác thực hệ thống</div>
                        </div>
                    </div>

                    <span class="badge badge-<?= $statusMeta['color'] ?>" style="font-size:0.85rem; padding:6px 14px;">
                        <i data-lucide="<?= $statusMeta['icon'] ?>" style="width:14px;height:14px"></i>
                        <?= $statusMeta['label'] ?>
                    </span>
                </div>

                <!-- Ticket Main Body -->
                <div style="margin-bottom:var(--space-xl);">
                    <div style="font-size:0.8rem; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">MÃ ĐẶT CHỖ (BOOKING CODE)</div>
                    <div style="font-size:1.8rem; font-weight:800; color:var(--primary); letter-spacing:1px; margin-bottom:var(--space-lg);">
                        <?= Helper::e($booking->booking_code) ?>
                    </div>

                    <?php if ($booking->booking_type === 'trip'): ?>
                        <!-- Trip Specific Specs -->
                        <div class="grid grid-2 mb-2" style="gap:var(--space-lg); background:var(--gray-50); padding:var(--space-lg); border-radius:var(--radius-md);">
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">HÀNH TRÌNH</div>
                                <div style="font-size:1.2rem; font-weight:700; color:var(--gray-900);">
                                    <?= Helper::e($booking->departure_name) ?> → <?= Helper::e($booking->arrival_name) ?>
                                </div>
                            </div>
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">KHỞI HÀNH LÚC</div>
                                <div style="font-size:1.1rem; font-weight:700; color:var(--primary);">
                                    <?= Helper::formatDateTime($booking->departure_datetime) ?>
                                </div>
                            </div>
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">PHƯƠNG TIỆN</div>
                                <div style="font-weight:600;"><?= Helper::e($booking->vehicle_name) ?> (Mã: <?= Helper::e($booking->trip_code) ?>)</div>
                            </div>
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">SỐ LƯỢNG HÀNH KHÁCH</div>
                                <div style="font-weight:600;"><?= $booking->num_passengers ?> người</div>
                            </div>
                        </div>
                    <?php else: ?>
                        <!-- Hotel Specific Specs -->
                        <div class="grid grid-2 mb-2" style="gap:var(--space-lg); background:var(--gray-50); padding:var(--space-lg); border-radius:var(--radius-md);">
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">KHÁCH SẠN</div>
                                <div style="font-size:1.2rem; font-weight:700; color:var(--gray-900);"><?= Helper::e($booking->hotel_name) ?></div>
                                <div style="font-size:0.8rem; color:var(--gray-500);"><?= Helper::e($booking->hotel_address) ?></div>
                            </div>
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">LOẠI PHÒNG</div>
                                <div style="font-size:1.1rem; font-weight:700; color:var(--primary);"><?= Helper::e($booking->room_name) ?></div>
                                <div style="font-size:0.8rem; color:var(--gray-500);"><?= $booking->num_rooms ?> phòng • <?= Helper::e($booking->bed_type ?? 'Tiêu chuẩn') ?></div>
                            </div>
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">NGÀY NHẬN PHÒNG</div>
                                <div style="font-weight:600;"><?= Helper::formatDate($booking->check_in_date) ?> (Từ <?= $booking->check_in_time ?>)</div>
                            </div>
                            <div>
                                <div style="font-size:0.8rem; color:var(--gray-500);">NGÀY TRẢ PHÒNG</div>
                                <div style="font-weight:600;"><?= Helper::formatDate($booking->check_out_date) ?> (Trước <?= $booking->check_out_time ?>)</div>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Passenger / Customer Contact Info -->
                    <div style="border-top:1px solid var(--gray-100); padding-top:var(--space-md); font-size:0.9rem; color:var(--gray-700);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Khách hàng / Đại diện:</span>
                            <strong><?= Helper::e($booking->customer_name) ?></strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Số điện thoại:</span>
                            <strong><?= Helper::e($booking->customer_phone) ?></strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <span>Email:</span>
                            <strong><?= Helper::e($booking->customer_email) ?></strong>
                        </div>
                    </div>
                </div>

                <!-- Ticket Footer with QR Code -->
                <div style="border-top:2px dashed var(--gray-200); padding-top:var(--space-lg); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:0.8rem; color:var(--gray-500);">TỔNG TIỀN VÉ</div>
                        <div style="font-size:1.6rem; font-weight:800; color:var(--secondary);">
                            <?= Helper::formatMoney($booking->subtotal) ?>
                        </div>
                    </div>

                    <!-- QR Code Display -->
                    <div style="text-align:center;">
                        <div style="width:90px; height:90px; border:1px solid var(--gray-200); border-radius:var(--radius-sm); padding:4px; background:white; display:flex; align-items:center; justify-content:center; margin-bottom:4px;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=<?= urlencode($booking->booking_code) ?>" alt="QR Code" style="width:100%;height:100%;">
                        </div>
                        <span style="font-size:0.7rem; color:var(--gray-400);">Mã QR Soát vé</span>
                    </div>
                </div>

            </div>

            <!-- ==================== RIGHT: ACTIONS & POLICIES ==================== -->
            <div style="display:flex; flex-direction:column; gap:var(--space-xl);">
                
                <!-- Cancel & Refund Action Box -->
                <div class="card" style="padding:var(--space-xl);">
                    <h3 style="font-size:1.15rem; margin-bottom:var(--space-md);">Quản lý Booking</h3>

                    <?php if ($isConfirmed): ?>
                        <div style="font-size:0.85rem; color:var(--gray-600); margin-bottom:var(--space-md); line-height:1.6;">
                            Bạn có thể yêu cầu hủy vé. Hệ thống sẽ tính toán số tiền hoàn dựa theo chính sách hoàn tiền giảm dần:
                            <ul style="margin-top:6px; padding-left:16px; list-style:disc; font-size:0.8rem; color:var(--gray-500);">
                                <li>≥ 7 ngày trước ngày đi: <strong>Hoàn 100%</strong></li>
                                <li>3 - 6 ngày: <strong>Hoàn 50%</strong></li>
                                <li>1 - 2 ngày: <strong>Hoàn 20%</strong></li>
                                <li>Trong ngày khởi hành: <strong>Không hoàn tiền</strong></li>
                            </ul>
                        </div>

                        <button type="button" class="btn btn-outline btn-full" onclick="openCancelModal()" style="color:var(--danger); border-color:var(--danger-light);">
                            <i data-lucide="x-circle" style="width:16px;height:16px"></i> Yêu cầu Hủy booking & Hoàn tiền
                        </button>

                    <?php elseif ($booking->status === 'cancel_requested'): ?>
                        <div class="alert alert-warning" style="margin-bottom:0;">
                            <i data-lucide="clock" style="width:16px;height:16px"></i>
                            <span>Yêu cầu hủy đang được Nhân viên xử lý hoàn tiền.</span>
                        </div>

                    <?php elseif ($booking->status === 'cancelled' || $booking->status === 'refunded'): ?>
                        <div class="alert alert-danger" style="margin-bottom:0;">
                            <i data-lucide="x-circle" style="width:16px;height:16px"></i>
                            <span>Booking này đã bị hủy.</span>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Support Card -->
                <div class="card" style="padding:var(--space-lg); background:var(--gray-50);">
                    <h4 style="font-size:0.95rem; margin-bottom:6px;">Cần hỗ trợ?</h4>
                    <p style="font-size:0.85rem; color:var(--gray-600); margin-bottom:var(--space-sm);">Liên hệ tổng đài TravelGo để được hỗ trợ 24/7 về vé và khách sạn.</p>
                    <a href="tel:19001234" class="btn btn-ghost btn-sm" style="font-weight:700; color:var(--primary); padding-left:0;">
                        <i data-lucide="phone" style="width:14px;height:14px"></i> Hotline: 1900 1234
                    </a>
                </div>

            </div>

        </div>

    </div>
</section>

<!-- ==================== CANCELLATION MODAL ==================== -->
<div id="cancelModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:9999; align-items:center; justify-content:center;">
    <div class="card" style="width:100%; max-width:480px; padding:var(--space-2xl); background:white; position:relative;">
        <h3 style="font-size:1.3rem; margin-bottom:var(--space-sm); color:var(--danger);">Xác nhận yêu cầu Hủy booking</h3>
        <p style="font-size:0.88rem; color:var(--gray-600); margin-bottom:var(--space-md);">
            Dựa trên thời gian khởi hành (còn <?= $refundPreview['days_before'] ?> ngày), tỷ lệ hoàn tiền ước tính của bạn là:
        </p>

        <div style="background:var(--gray-50); padding:var(--space-md); border-radius:var(--radius-md); margin-bottom:var(--space-lg); border:1px solid var(--gray-200);">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.9rem;">
                <span>Tỷ lệ hoàn tiền:</span>
                <strong style="color:var(--primary); font-size:1.1rem;"><?= $refundPreview['percentage'] ?>%</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.95rem;">
                <span>Số tiền ước tính hoàn:</span>
                <strong style="color:var(--success); font-size:1.2rem;"><?= Helper::formatMoney($refundPreview['refund_amount']) ?></strong>
            </div>
        </div>

        <form action="<?= $appUrl ?>/booking/cancel/<?= $booking->booking_code ?>" method="POST">
            <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

            <div class="form-group mb-2">
                <label for="reason">Lý do hủy vé</label>
                <textarea name="reason" id="reason" class="form-control" rows="3" placeholder="Nhập lý do bạn muốn hủy booking này..." required></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:var(--space-sm);">
                <button type="button" class="btn btn-ghost" onclick="closeCancelModal()">Đóng</button>
                <button type="submit" class="btn btn-danger">Gửi yêu cầu hủy</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openCancelModal() {
        const modal = document.getElementById('cancelModal');
        modal.style.display = 'flex';
        lucide.createIcons();
    }
    function closeCancelModal() {
        document.getElementById('cancelModal').style.display = 'none';
    }

    <?php if ($isPending): ?>
    // Realtime 15-Minute Countdown Clock
    const expiresAt = new Date("<?= date('Y/m/d H:i:s', strtotime($booking->expires_at)) ?>").getTime();

    const timerInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = expiresAt - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            document.getElementById("countdownTimer").innerHTML = "ĐÃ HẾT HẠN";
            alert("Booking của bạn đã hết hạn giữ chỗ 15 phút. Số chỗ đã được trả lại.");
            location.reload();
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("countdownTimer").innerHTML = 
            (minutes < 10 ? "0" + minutes : minutes) + ":" + 
            (seconds < 10 ? "0" + seconds : seconds);
    }, 1000);
    <?php endif; ?>
</script>
