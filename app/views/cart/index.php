<?php
use App\Core\Helper;
?>

<section class="section" style="padding-top:calc(var(--header-height) + var(--space-xl)); min-height:80vh;">
    <div class="container">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
            <div>
                <h1 style="font-size:2rem; margin-bottom:4px;">Giỏ hàng <span class="text-gradient">của bạn</span></h1>
                <p style="color:var(--gray-500); font-size:0.95rem;">Kiểm tra các chuyến đi và phòng khách sạn đã chọn trước khi đặt chỗ</p>
            </div>

            <?php if (!empty($cart)): ?>
                <a href="<?= $appUrl ?>/cart/clear" class="btn btn-ghost btn-sm" onclick="return confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')" style="color:var(--danger);">
                    <i data-lucide="trash-2" style="width:16px;height:16px"></i> Xóa tất cả
                </a>
            <?php endif; ?>
        </div>

        <?php if (!empty($cart)): ?>
            <div class="grid" style="grid-template-columns: 1fr 360px; gap:var(--space-2xl); align-items:start;">
                
                <!-- Left: List of Items in Cart -->
                <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                    <?php foreach ($cart as $item): ?>
                        <div class="card" style="padding:var(--space-lg); display:grid; grid-template-columns: 100px 1fr auto; gap:var(--space-lg); align-items:center;">
                            
                            <!-- Thumbnail / Icon -->
                            <div style="border-radius:var(--radius-md); overflow:hidden; aspect-ratio:1/1; background:var(--gray-100); display:flex; align-items:center; justify-content:center;">
                                <?php if (!empty($item['image'])): ?>
                                    <img src="<?= $appUrl ?>/<?= $item['image'] ?>" alt="Item" style="width:100%;height:100%;object-fit:cover;">
                                <?php else: ?>
                                    <i data-lucide="<?= $item['type'] === 'trip' ? 'map-pin' : 'building' ?>" style="width:36px;height:36px;color:var(--primary);"></i>
                                <?php endif; ?>
                            </div>

                            <!-- Item Information -->
                            <div>
                                <div style="display:flex; gap:6px; align-items:center; margin-bottom:4px;">
                                    <span class="badge <?= $item['type'] === 'trip' ? 'badge-primary' : 'badge-success' ?>">
                                        <?= $item['type'] === 'trip' ? 'Chuyến đi' : 'Khách sạn' ?>
                                    </span>
                                </div>

                                <h3 style="font-size:1.15rem; margin-bottom:4px;"><?= Helper::e($item['title']) ?></h3>
                                <p style="color:var(--gray-500); font-size:0.88rem; margin-bottom:4px;"><?= Helper::e($item['subtitle']) ?></p>

                                <?php if ($item['type'] === 'trip'): ?>
                                    <div style="font-size:0.82rem; color:var(--primary); font-weight:600;">
                                        <i data-lucide="calendar" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i>
                                        Khởi hành: <?= Helper::formatDateTime($item['time']) ?>
                                    </div>
                                <?php endif; ?>

                                <div style="font-size:0.85rem; color:var(--gray-600); margin-top:6px;">
                                    Đơn giá: <?= Helper::formatMoney($item['unit_price']) ?> × <?= $item['quantity'] ?> <?= $item['type'] === 'trip' ? 'khách' : 'phòng' ?>
                                </div>
                            </div>

                            <!-- Subtotal & Remove Action -->
                            <div style="text-align:right;">
                                <div style="font-size:1.25rem; font-weight:800; color:var(--secondary); margin-bottom:8px;">
                                    <?= Helper::formatMoney($item['subtotal']) ?>
                                </div>
                                <a href="<?= $appUrl ?>/cart/remove/<?= $item['key'] ?>" class="btn btn-ghost btn-sm" style="color:var(--danger);" title="Xóa">
                                    <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                                </a>
                            </div>

                        </div>
                    <?php endforeach; ?>

                    <div style="margin-top:var(--space-md); display:flex; gap:var(--space-md);">
                        <a href="<?= $appUrl ?>/trips" class="btn btn-outline btn-sm">
                            + Thêm chuyến đi khác
                        </a>
                        <a href="<?= $appUrl ?>/hotels" class="btn btn-outline btn-sm">
                            + Thêm khách sạn
                        </a>
                    </div>
                </div>

                <!-- Right: Summary & Checkout Action -->
                <div style="position:sticky; top:calc(var(--header-height) + 20px);">
                    <div class="card" style="padding:var(--space-xl); box-shadow:var(--shadow-xl); border:2px solid var(--primary-50);">
                        <h3 style="font-size:1.2rem; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-100); padding-bottom:var(--space-sm);">
                            Tóm tắt đơn hàng
                        </h3>

                        <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-sm); font-size:0.95rem; color:var(--gray-600);">
                            <span>Số lượng dịch vụ:</span>
                            <strong><?= count($cart) ?> mục</strong>
                        </div>

                        <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-md); font-size:0.95rem; color:var(--gray-600);">
                            <span>Tạm tính:</span>
                            <strong><?= Helper::formatMoney($totalAmount) ?></strong>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:var(--space-md); border-top:2px solid var(--gray-100); margin-bottom:var(--space-xl);">
                            <span style="font-weight:700; font-size:1.1rem;">Tổng thanh toán:</span>
                            <span style="font-size:1.8rem; font-weight:800; color:var(--secondary);">
                                <?= Helper::formatMoney($totalAmount) ?>
                            </span>
                        </div>

                        <a href="<?= $appUrl ?>/booking/checkout" class="btn btn-primary btn-full btn-lg">
                            Tiến hành Đặt chỗ <i data-lucide="arrow-right" style="width:18px;height:18px"></i>
                        </a>

                        <div style="font-size:0.8rem; color:var(--gray-500); text-align:center; margin-top:var(--space-md); line-height:1.5;">
                            <i data-lucide="shield-check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--success);"></i>
                            Chỗ được giữ tự động trong <strong>15 phút</strong> sau khi bạn xác nhận.
                        </div>
                    </div>
                </div>

            </div>

        <?php else: ?>
            <!-- Empty Cart State -->
            <div class="card" style="padding:var(--space-4xl); text-align:center; max-width:600px; margin:0 auto;">
                <div style="width:80px; height:80px; border-radius:var(--radius-full); background:var(--primary-50); color:var(--primary); display:flex; align-items:center; justify-content:center; margin:0 auto var(--space-lg);">
                    <i data-lucide="shopping-cart" style="width:40px;height:40px"></i>
                </div>
                <h2 style="font-size:1.5rem; margin-bottom:var(--space-xs);">Giỏ hàng của bạn đang trống</h2>
                <p style="color:var(--gray-500); margin-bottom:var(--space-xl);">Hãy chọn cho mình một chuyến đi tự do hoặc khách sạn yêu thích.</p>
                <div style="display:flex; justify-content:center; gap:var(--space-md);">
                    <a href="<?= $appUrl ?>/trips" class="btn btn-primary">
                        <i data-lucide="map-pin" style="width:16px;height:16px"></i> Khám phá Chuyến đi
                    </a>
                    <a href="<?= $appUrl ?>/hotels" class="btn btn-outline">
                        <i data-lucide="building-2" style="width:16px;height:16px"></i> Xem Khách sạn
                    </a>
                </div>
            </div>
        <?php endif; ?>

    </div>
</section>
