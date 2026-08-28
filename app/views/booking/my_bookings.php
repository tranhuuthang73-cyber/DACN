<?php
use App\Core\Helper;
?>

<section class="section" style="padding-top:calc(var(--header-height) + var(--space-xl)); min-height:80vh;">
    <div class="container">
        
        <div style="margin-bottom:var(--space-xl);">
            <h1 style="font-size:2rem; margin-bottom:4px;">Booking <span class="text-gradient">của tôi</span></h1>
            <p style="color:var(--gray-500); font-size:0.95rem;">Quản lý toàn bộ vé chuyến đi và phòng khách sạn bạn đã đặt</p>
        </div>

        <!-- Filter Tabs -->
        <div style="display:flex; gap:8px; margin-bottom:var(--space-xl); border-bottom:1px solid var(--gray-200); padding-bottom:8px; overflow-x:auto;">
            <a href="<?= $appUrl ?>/booking/my-bookings" class="btn <?= empty($status) ? 'btn-primary' : 'btn-ghost' ?> btn-sm">Tất cả</a>
            <a href="<?= $appUrl ?>/booking/my-bookings?status=confirmed" class="btn <?= $status === 'confirmed' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
                <i data-lucide="check-circle" style="width:14px;height:14px"></i> Đã xác nhận
            </a>
            <a href="<?= $appUrl ?>/booking/my-bookings?status=pending_payment" class="btn <?= $status === 'pending_payment' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
                <i data-lucide="clock" style="width:14px;height:14px"></i> Chờ thanh toán
            </a>
            <a href="<?= $appUrl ?>/booking/my-bookings?status=completed" class="btn <?= $status === 'completed' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
                <i data-lucide="check-check" style="width:14px;height:14px"></i> Đã hoàn thành
            </a>
            <a href="<?= $appUrl ?>/booking/my-bookings?status=cancelled" class="btn <?= $status === 'cancelled' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
                <i data-lucide="x-circle" style="width:14px;height:14px"></i> Đã hủy
            </a>
        </div>

        <!-- Bookings List -->
        <?php if (!empty($bookings)): ?>
            <div style="display:flex; flex-direction:column; gap:var(--space-lg);">
                <?php foreach ($bookings as $booking): ?>
                    <?php $statusMeta = Helper::bookingStatus($booking->status); ?>
                    <div class="card" style="padding:var(--space-xl); display:grid; grid-template-columns: auto 1fr auto; gap:var(--space-xl); align-items:center;">
                        
                        <!-- Icon Type -->
                        <div style="width:56px; height:56px; border-radius:var(--radius-lg); background: <?= $booking->booking_type === 'trip' ? 'var(--primary-50)' : 'rgba(0, 212, 170, 0.1)' ?>; color: <?= $booking->booking_type === 'trip' ? 'var(--primary)' : 'var(--accent-dark)' ?>; display:flex; align-items:center; justify-content:center;">
                            <i data-lucide="<?= $booking->booking_type === 'trip' ? 'map-pin' : 'building' ?>" style="width:28px;height:28px"></i>
                        </div>

                        <!-- Details -->
                        <div>
                            <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
                                <strong style="font-size:0.9rem; color:var(--gray-900);">Mã: <?= Helper::e($booking->booking_code) ?></strong>
                                <span class="badge badge-<?= $statusMeta['color'] ?>">
                                    <i data-lucide="<?= $statusMeta['icon'] ?>" style="width:12px;height:12px"></i>
                                    <?= $statusMeta['label'] ?>
                                </span>
                            </div>

                            <?php if ($booking->booking_type === 'trip'): ?>
                                <h3 style="font-size:1.25rem; margin-bottom:4px;">
                                    <?= Helper::e($booking->departure_name) ?> → <?= Helper::e($booking->arrival_name) ?>
                                </h3>
                                <div style="font-size:0.85rem; color:var(--gray-500); display:flex; gap:var(--space-md);">
                                    <span><i data-lucide="calendar" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> <?= Helper::formatDateTime($booking->departure_datetime) ?></span>
                                    <span><i data-lucide="users" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> <?= $booking->num_passengers ?> hành khách</span>
                                    <span><i data-lucide="car" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> <?= Helper::e($booking->vehicle_name) ?></span>
                                </div>
                            <?php else: ?>
                                <h3 style="font-size:1.25rem; margin-bottom:4px;">
                                    <?= Helper::e($booking->hotel_name) ?> - <?= Helper::e($booking->room_name) ?>
                                </h3>
                                <div style="font-size:0.85rem; color:var(--gray-500); display:flex; gap:var(--space-md);">
                                    <span><i data-lucide="calendar" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> <?= Helper::formatDate($booking->check_in_date) ?> đến <?= Helper::formatDate($booking->check_out_date) ?> (<?= $booking->num_nights ?> đêm)</span>
                                    <span><i data-lucide="door-open" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i> <?= $booking->num_rooms ?> phòng</span>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Price & Action -->
                        <div style="text-align:right;">
                            <div style="font-size:1.4rem; font-weight:800; color:var(--secondary); margin-bottom:8px;">
                                <?= Helper::formatMoney($booking->subtotal) ?>
                            </div>
                            <a href="<?= $appUrl ?>/booking/detail/<?= $booking->booking_code ?>" class="btn btn-outline btn-sm">
                                Xem vé & Chi tiết <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
                            </a>
                        </div>

                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div class="card" style="padding:var(--space-4xl); text-align:center; max-width:600px; margin:0 auto;">
                <div style="width:64px; height:64px; border-radius:var(--radius-full); background:var(--gray-100); color:var(--gray-400); display:flex; align-items:center; justify-content:center; margin:0 auto var(--space-md);">
                    <i data-lucide="ticket" style="width:32px;height:32px"></i>
                </div>
                <h3>Chưa có booking nào</h3>
                <p style="color:var(--gray-500); margin:var(--space-xs) 0 var(--space-lg);">Bạn chưa có đơn đặt chỗ nào trong danh mục này.</p>
                <a href="<?= $appUrl ?>/trips" class="btn btn-primary">Tìm chuyến đi ngay</a>
            </div>
        <?php endif; ?>

    </div>
</section>
