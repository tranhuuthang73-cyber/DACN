<?php
use App\Core\Helper;
?>

<section class="section" style="padding-top:calc(var(--header-height) + var(--space-xl)); min-height:80vh;">
    <div class="container">
        
        <div style="margin-bottom:var(--space-xl);">
            <a href="<?= $appUrl ?>/cart" class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-xs);">
                ← Quay lại Giỏ hàng
            </a>
            <h1 style="font-size:2rem;">Xác nhận Đặt chỗ & Giữ chỗ</h1>
            <p style="color:var(--gray-500); font-size:0.95rem;">Vui lòng kiểm tra lại thông tin trước khi chuyển sang bước thanh toán</p>
        </div>

        <form action="<?= $appUrl ?>/booking/process-checkout" method="POST">
            <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

            <div class="grid" style="grid-template-columns: 1fr 400px; gap:var(--space-2xl); align-items:start;">
                
                <!-- Left: Contact Information & Notes -->
                <div style="display:flex; flex-direction:column; gap:var(--space-xl);">
                    
                    <!-- Contact Form Card -->
                    <div class="card" style="padding:var(--space-xl);">
                        <h3 style="font-size:1.25rem; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm); display:flex; align-items:center; gap:8px;">
                            <i data-lucide="user" style="color:var(--primary); width:20px;height:20px;"></i> 1. Thông tin người đặt chỗ / Đại diện
                        </h3>

                        <div class="form-group mb-1">
                            <label for="contact_name">Họ và tên <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="contact_name" name="contact_name" class="form-control" value="<?= Helper::e($user->full_name ?? '') ?>" required>
                        </div>

                        <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                            <div class="form-group">
                                <label for="contact_phone">Số điện thoại nhận vé/thông báo <span style="color:var(--danger)">*</span></label>
                                <input type="tel" id="contact_phone" name="contact_phone" class="form-control" value="<?= Helper::e($user->phone ?? '') ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="contact_email">Email nhận vé điện tử <span style="color:var(--danger)">*</span></label>
                                <input type="email" id="contact_email" name="contact_email" class="form-control" value="<?= Helper::e($user->email ?? '') ?>" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="notes">Ghi chú đặc biệt cho chuyến đi / khách sạn (nếu có)</label>
                            <textarea name="notes" id="notes" class="form-control" rows="3" placeholder="Yêu cầu ghế ngồi cạnh nhau, ăn chay, nhận phòng muộn..."></textarea>
                        </div>
                    </div>

                    <!-- 15-Minute Holding Guarantee Banner -->
                    <div class="card" style="padding:var(--space-lg); background:linear-gradient(135deg, var(--primary-50), white); border:1px solid var(--primary-100);">
                        <div style="display:flex; gap:12px; align-items:flex-start;">
                            <div style="color:var(--primary); margin-top:2px;">
                                <i data-lucide="timer" style="width:24px;height:24px"></i>
                            </div>
                            <div>
                                <h4 style="font-size:1rem; color:var(--primary-dark); margin-bottom:4px;">Cơ chế Giữ chỗ Đảm bảo 15 Phút</h4>
                                <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.6;">
                                    Sau khi bấm <strong>"Xác nhận Giữ chỗ & Tiếp tục"</strong>, hệ thống sẽ lập tức khóa giữ số lượng chỗ/phòng của bạn trong đúng 15 phút để chống việc người khác đặt mất. Bạn sẽ có 15 phút để hoàn tất thanh toán online qua VNPay hoặc MoMo.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Right: Order Review & Submit -->
                <div style="position:sticky; top:calc(var(--header-height) + 20px);">
                    <div class="card" style="padding:var(--space-xl); box-shadow:var(--shadow-xl);">
                        <h3 style="font-size:1.2rem; margin-bottom:var(--space-md); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
                            Chi tiết dịch vụ (<?= count($cart) ?>)
                        </h3>

                        <div style="display:flex; flex-direction:column; gap:var(--space-md); margin-bottom:var(--space-lg); max-height:300px; overflow-y:auto; padding-right:4px;">
                            <?php foreach ($cart as $item): ?>
                                <div style="padding-bottom:var(--space-sm); border-bottom:1px dashed var(--gray-100);">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2px;">
                                        <strong style="font-size:0.92rem; color:var(--gray-800);"><?= Helper::e($item['title']) ?></strong>
                                        <span style="font-weight:700; color:var(--secondary); font-size:0.95rem; white-space:nowrap; margin-left:8px;">
                                            <?= Helper::formatMoney($item['subtotal']) ?>
                                        </span>
                                    </div>
                                    <div style="font-size:0.8rem; color:var(--gray-500);">
                                        <?= $item['quantity'] ?> <?= $item['type'] === 'trip' ? 'vé' : 'phòng' ?> × <?= Helper::formatMoney($item['unit_price']) ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:var(--space-md); border-top:2px solid var(--gray-100); margin-bottom:var(--space-xl);">
                            <span style="font-weight:700; font-size:1.1rem;">Tổng cộng:</span>
                            <span style="font-size:1.8rem; font-weight:800; color:var(--secondary);">
                                <?= Helper::formatMoney($totalAmount) ?>
                            </span>
                        </div>

                        <button type="submit" class="btn btn-primary btn-full btn-lg">
                            <i data-lucide="lock" style="width:18px;height:18px"></i> Xác nhận Giữ chỗ & Tiếp tục
                        </button>

                        <div style="font-size:0.78rem; color:var(--gray-500); text-align:center; margin-top:var(--space-md);">
                            Bằng việc nhấn tiếp tục, bạn đồng ý với Điều khoản và Chính sách hủy vé của TravelGo.
                        </div>
                    </div>
                </div>

            </div>
        </form>

    </div>
</section>
