<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl); flex-wrap:wrap; gap:16px;">
    <div>
        <h2 style="font-size:1.6rem; font-weight:800; display:flex; align-items:center; gap:10px;">
            <i data-lucide="ticket" style="color:var(--primary);width:26px;height:26px;"></i> Quản lý Đơn đặt chỗ & Booking
        </h2>
        <p style="color:var(--gray-500); font-size:0.92rem; margin-top:4px;">
            Theo dõi trạng thái vé xe & phòng khách sạn của hành khách trên toàn hệ thống
        </p>
    </div>
    <a href="<?= $appUrl ?>/employee/bookings/refunds" class="btn btn-outline" style="display:flex; align-items:center; gap:8px; border-color:#FB923C; color:#EA580C; font-weight:800;">
        <i data-lucide="rotate-ccw" style="width:18px;height:18px;"></i> Xem Hàng đợi Hoàn tiền (<?= $counts['cancel_requested'] ?>)
    </a>
</div>

<!-- Status Filters -->
<div style="display:flex; gap:10px; margin-bottom:var(--space-lg); flex-wrap:wrap;">
    <a href="<?= $appUrl ?>/employee/bookings" class="badge" style="padding:10px 16px; font-size:0.86rem; text-decoration:none; cursor:pointer; background:<?= empty($status) ? 'var(--primary)' : 'white' ?>; color:<?= empty($status) ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200);">
        Tất cả (<?= $counts['all'] ?>)
    </a>
    <a href="<?= $appUrl ?>/employee/bookings?status=paid" class="badge" style="padding:10px 16px; font-size:0.86rem; text-decoration:none; cursor:pointer; background:<?= $status === 'paid' ? 'var(--success)' : 'white' ?>; color:<?= $status === 'paid' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200);">
        Đã thanh toán (<?= $counts['paid'] ?>)
    </a>
    <a href="<?= $appUrl ?>/employee/bookings?status=confirmed" class="badge" style="padding:10px 16px; font-size:0.86rem; text-decoration:none; cursor:pointer; background:<?= $status === 'confirmed' ? '#3B82F6' : 'white' ?>; color:<?= $status === 'confirmed' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200);">
        Đã xác nhận (<?= $counts['confirmed'] ?>)
    </a>
    <a href="<?= $appUrl ?>/employee/bookings?status=cancel_requested" class="badge" style="padding:10px 16px; font-size:0.86rem; text-decoration:none; cursor:pointer; background:<?= $status === 'cancel_requested' ? '#FB923C' : 'white' ?>; color:<?= $status === 'cancel_requested' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        Chờ duyệt hoàn (<?= $counts['cancel_requested'] ?>)
    </a>
    <a href="<?= $appUrl ?>/employee/bookings?status=cancelled" class="badge" style="padding:10px 16px; font-size:0.86rem; text-decoration:none; cursor:pointer; background:<?= $status === 'cancelled' ? '#EF4444' : 'white' ?>; color:<?= $status === 'cancelled' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200);">
        Đã hủy (<?= $counts['cancelled'] ?>)
    </a>
</div>

<!-- Search Bar -->
<div class="card" style="padding:16px 20px; background:white; border-radius:16px; margin-bottom:var(--space-xl); box-shadow:var(--shadow-sm);">
    <form method="GET" action="<?= $appUrl ?>/employee/bookings" style="display:flex; gap:12px; align-items:center;">
        <input type="hidden" name="status" value="<?= htmlspecialchars($status) ?>">
        <div style="flex:1; position:relative;">
            <i data-lucide="search" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:var(--gray-400);"></i>
            <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Tìm mã booking (vd: BK-2026...), tên khách hoặc số điện thoại..." style="width:100%; padding:10px 16px 10px 42px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.92rem;">
        </div>
        <button type="submit" class="btn btn-primary btn-sm" style="padding:10px 20px; font-weight:700;">Tìm kiếm</button>
    </form>
</div>

<!-- Bookings Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Mã Booking</th>
                <th>Khách hàng</th>
                <th>Loại dịch vụ</th>
                <th>Chi tiết chuyến / Khách sạn</th>
                <th>Số lượng</th>
                <th style="text-align:right;">Thành tiền</th>
                <th style="text-align:center;">Trạng thái</th>
                <th>Thời gian đặt</th>
                <th style="text-align:right;">Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($bookings)): ?>
                <?php foreach ($bookings as $b): ?>
                    <tr>
                        <td>
                            <strong style="color:var(--primary);"><?= Helper::e($b->booking_code) ?></strong>
                        </td>
                        <td>
                            <div style="font-weight:700;"><?= Helper::e($b->customer_name) ?></div>
                            <div style="font-size:0.8rem; color:var(--gray-500);"><?= Helper::e($b->customer_phone) ?></div>
                        </td>
                        <td>
                            <span class="badge" style="background:<?= $b->booking_type === 'trip' ? 'rgba(0,102,255,0.1)' : 'rgba(251,146,60,0.1)' ?>; color:<?= $b->booking_type === 'trip' ? 'var(--primary)' : '#EA580C' ?>; font-weight:800;">
                                <?= $b->booking_type === 'trip' ? '🚌 Chuyến xe' : '🏨 Khách sạn' ?>
                            </span>
                        </td>
                        <td>
                            <?php if ($b->booking_type === 'trip'): ?>
                                <div style="font-weight:600; font-size:0.92rem;"><?= Helper::e($b->departure_name) ?> → <?= Helper::e($b->arrival_name) ?></div>
                                <div style="font-size:0.78rem; color:var(--gray-500);">Mã chuyến: <?= Helper::e($b->trip_code) ?></div>
                            <?php else: ?>
                                <div style="font-weight:600; font-size:0.92rem;"><?= Helper::e($b->hotel_name) ?></div>
                                <div style="font-size:0.78rem; color:var(--gray-500);"><?= Helper::e($b->room_name) ?></div>
                            <?php endif; ?>
                        </td>
                        <td>
                            <strong><?= $b->booking_type === 'trip' ? $b->num_passengers . ' vé' : $b->num_rooms . ' phòng' ?></strong>
                        </td>
                        <td style="text-align:right; font-weight:900; color:var(--gray-900);">
                            <?= Helper::formatMoney($b->subtotal) ?>
                        </td>
                        <td style="text-align:center;">
                            <?php if ($b->status === 'paid'): ?>
                                <span class="badge badge-success">Đã thanh toán</span>
                            <?php elseif ($b->status === 'confirmed'): ?>
                                <span class="badge badge-primary">Đã xác nhận</span>
                            <?php elseif ($b->status === 'cancel_requested'): ?>
                                <span class="badge" style="background:rgba(251,146,60,0.15); color:#EA580C; font-weight:800;">Chờ duyệt hủy</span>
                            <?php elseif ($b->status === 'cancelled'): ?>
                                <span class="badge badge-danger">Đã hủy</span>
                            <?php else: ?>
                                <span class="badge badge-secondary"><?= $b->status ?></span>
                            <?php endif; ?>
                        </td>
                        <td style="font-size:0.85rem; color:var(--gray-500);">
                            <?= Helper::formatDate($b->created_at) ?>
                        </td>
                        <td style="text-align:right;">
                            <a href="<?= $appUrl ?>/booking/detail/<?= $b->booking_code ?>" target="_blank" class="btn btn-ghost btn-sm" title="Xem chi tiết vé">
                                <i data-lucide="eye" style="width:16px;height:16px;"></i> Xem vé
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="9" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Không tìm thấy booking nào.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php if ($pages > 1): ?>
    <div class="pagination" style="margin-top:24px;">
        <?php for ($p = 1; $p <= $pages; $p++): ?>
            <a href="?<?= http_build_query(array_merge($_GET, ['page' => $p])) ?>" class="<?= $p === $current ? 'active' : '' ?>">
                <?= $p ?>
            </a>
        <?php endfor; ?>
    </div>
<?php endif; ?>
