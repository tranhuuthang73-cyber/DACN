<?php
use App\Core\Helper;
?>

<div style="margin-bottom:var(--space-xl);">
    <h1 style="font-size:1.8rem; margin-bottom:4px;">Bảng điều hành <span class="text-gradient">Nghiệp vụ Nhân viên</span></h1>
    <p style="color:var(--gray-500); font-size:0.95rem;">Theo dõi hàng đợi xét duyệt, soát vé và xử lý các yêu cầu hoàn tiền</p>
</div>

<!-- ==================== TASK QUEUE CARDS ==================== -->
<div class="stats-grid" style="margin-bottom:var(--space-2xl);">
    
    <a href="<?= $appUrl ?>/employee/trips" class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--warning); text-decoration:none; display:block;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:0.85rem; color:var(--gray-600); font-weight:700;">CHUYẾN CHỜ DUYỆT</div>
            <span class="badge badge-warning"><?= $pendingTripsCount ?> việc</span>
        </div>
        <div style="font-size:2rem; font-weight:800; color:var(--warning);">
            <?= $pendingTripsCount ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">Chuyến Admin tạo cần xác nhận</div>
    </a>

    <a href="<?= $appUrl ?>/employee/hotels" class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--primary); text-decoration:none; display:block;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:0.85rem; color:var(--gray-600); font-weight:700;">KHÁCH SẠN CHỜ DUYỆT</div>
            <span class="badge badge-primary"><?= $pendingHotelsCount ?> việc</span>
        </div>
        <div style="font-size:2rem; font-weight:800; color:var(--primary);">
            <?= $pendingHotelsCount ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">Khách sạn Đối tác đăng ký</div>
    </a>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--danger);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:0.85rem; color:var(--gray-600); font-weight:700;">YÊU CẦU HOÀN TIỀN</div>
            <span class="badge badge-danger"><?= $pendingRefundsCount ?> việc</span>
        </div>
        <div style="font-size:2rem; font-weight:800; color:var(--danger);">
            <?= $pendingRefundsCount ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">Khách gửi yêu cầu hủy vé</div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--success);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:0.85rem; color:var(--gray-600); font-weight:700;">BOOKING HÔM NAY</div>
            <span class="badge badge-success">Mới</span>
        </div>
        <div style="font-size:2rem; font-weight:800; color:var(--success);">
            <?= $todayBookingsCount ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">Lượt đặt trong ngày</div>
    </div>

</div>

<!-- ==================== QUEUE TABLES ==================== -->
<div class="grid grid-2" style="gap:var(--space-xl); align-items:start;">
    
    <!-- 1. Pending Trips Queue -->
    <div class="card" style="padding:var(--space-xl);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
            <h3 style="font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                <i data-lucide="clock" style="width:18px;height:18px;color:var(--warning);"></i> Chuyến đi chờ duyệt
            </h3>
            <a href="<?= $appUrl ?>/employee/trips" class="btn btn-ghost btn-sm">Xem tất cả</a>
        </div>

        <?php if (!empty($pendingTrips)): ?>
            <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                <?php foreach ($pendingTrips as $pt): ?>
                    <div style="background:var(--gray-50); padding:var(--space-md); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:700; font-size:0.95rem;"><?= Helper::e($pt->departure_name) ?> → <?= Helper::e($pt->arrival_name) ?></div>
                            <div style="font-size:0.8rem; color:var(--gray-500);">
                                <?= Helper::formatDateTime($pt->departure_datetime) ?> • <?= Helper::e($pt->vehicle_name) ?>
                            </div>
                        </div>
                        <a href="<?= $appUrl ?>/employee/trips/approve/<?= $pt->id ?>" class="btn btn-success btn-sm" onclick="return confirm('Duyệt mở bán chuyến này?')">
                            Duyệt
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <p style="color:var(--gray-500); text-align:center; padding:var(--space-lg);">Không có chuyến đi nào đang chờ duyệt.</p>
        <?php endif; ?>
    </div>

    <!-- 2. Pending Refunds Queue -->
    <div class="card" style="padding:var(--space-xl);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
            <h3 style="font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                <i data-lucide="rotate-ccw" style="width:18px;height:18px;color:var(--danger);"></i> Yêu cầu hủy & hoàn tiền
            </h3>
        </div>

        <?php if (!empty($pendingRefunds)): ?>
            <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                <?php foreach ($pendingRefunds as $rf): ?>
                    <div style="background:var(--gray-50); padding:var(--space-md); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:700; font-size:0.95rem;">Mã: <?= Helper::e($rf->booking_code) ?></div>
                            <div style="font-size:0.8rem; color:var(--gray-500);">
                                Khách: <?= Helper::e($rf->customer_name) ?> • Hoàn <strong><?= $rf->refund_percentage ?>%</strong> (<?= Helper::formatMoney($rf->refund_amount) ?>)
                            </div>
                            <div style="font-size:0.75rem; color:var(--gray-400); margin-top:2px;">Lý do: <?= Helper::e($rf->reason) ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <p style="color:var(--gray-500); text-align:center; padding:var(--space-lg);">Hiện không có yêu cầu hủy nào cần xử lý.</p>
        <?php endif; ?>
    </div>

</div>
