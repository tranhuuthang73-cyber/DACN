<?php
use App\Core\Helper;
?>

<!-- Include Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div style="margin-bottom:var(--space-xl);">
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
            <h1 style="font-size:1.8rem; margin-bottom:4px;">Dashboard Đối tác - <?= Helper::e($partner->company_name) ?></h1>
            <p style="color:var(--gray-500); font-size:0.95rem;">Báo cáo doanh thu và tình hình đặt chỗ các dịch vụ của doanh nghiệp</p>
        </div>
        <span class="badge badge-success" style="padding:6px 14px; font-size:0.85rem;">
            <i data-lucide="check-circle" style="width:14px;height:14px"></i> Đối tác chính thức
        </span>
    </div>
</div>

<!-- ==================== 1. KPI CARDS ==================== -->
<div class="stats-grid" style="margin-bottom:var(--space-2xl);">
    
    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--secondary);">
        <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">DOANH THU TÍCH LŨY</div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--secondary); margin-bottom:4px;">
            <?= Helper::formatMoney($totalRevenue) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">Toàn bộ thời gian</div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--primary);">
        <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">DOANH THU THÁNG NÀY</div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--primary); margin-bottom:4px;">
            <?= Helper::formatMoney($thisMonthRevenue) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--success);">Tháng <?= date('m/Y') ?></div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--accent-dark);">
        <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">LƯỢT KHÁCH ĐÃ PHỤC VỤ</div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
            <?= number_format($totalCustomersServed) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">Hành khách & Lượt phòng</div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid #8B5CF6;">
        <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">DỊCH VỤ ĐANG CHẠY</div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
            <?= $activeTripsCount + $activeHotelsCount ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);"><?= $activeTripsCount ?> chuyến • <?= $activeHotelsCount ?> khách sạn</div>
    </div>

</div>

<!-- ==================== 2. CHART ==================== -->
<div class="card" style="padding:var(--space-xl); margin-bottom:var(--space-2xl);">
    <h3 style="font-size:1.15rem; margin-bottom:var(--space-lg); display:flex; align-items:center; gap:8px;">
        <i data-lucide="bar-chart-2" style="width:18px;height:18px;color:var(--primary);"></i> Biểu đồ Doanh thu của Đơn vị
    </h3>
    <div style="height:260px; position:relative;">
        <canvas id="partnerRevenueChart"></canvas>
    </div>
</div>

<!-- ==================== 3. RECENT BOOKINGS ==================== -->
<div class="card" style="padding:var(--space-xl);">
    <h3 style="font-size:1.15rem; margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
        <i data-lucide="ticket" style="width:18px;height:18px;color:var(--secondary);"></i> Booking dịch vụ gần đây
    </h3>

    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Mã Booking</th>
                    <th>Dịch vụ</th>
                    <th>Khách hàng</th>
                    <th>Số lượng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($recentBookings)): ?>
                    <?php foreach ($recentBookings as $b): ?>
                        <?php $statusMeta = Helper::bookingStatus($b->status); ?>
                        <tr>
                            <td><strong><?= Helper::e($b->booking_code) ?></strong></td>
                            <td>
                                <?php if ($b->booking_type === 'trip'): ?>
                                    <span class="badge badge-primary">Chuyến đi</span>
                                    <strong><?= Helper::e($b->departure_name) ?> → <?= Helper::e($b->arrival_name) ?></strong>
                                <?php else: ?>
                                    <span class="badge badge-success">Khách sạn</span>
                                    <strong><?= Helper::e($b->hotel_name) ?> (<?= Helper::e($b->room_name) ?>)</strong>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div><?= Helper::e($b->customer_name) ?></div>
                                <small class="text-muted"><?= Helper::e($b->customer_phone) ?></small>
                            </td>
                            <td>
                                <?= $b->quantity ?> <?= $b->booking_type === 'trip' ? 'vé' : 'phòng' ?>
                            </td>
                            <td><strong style="color:var(--secondary);"><?= Helper::formatMoney($b->subtotal) ?></strong></td>
                            <td>
                                <span class="badge badge-<?= $statusMeta['color'] ?>">
                                    <?= $statusMeta['label'] ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="6" style="text-align:center; padding:var(--space-xl); color:var(--gray-500);">
                            Chưa có booking nào cho dịch vụ của đơn vị bạn.
                        </td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        const ctx = document.getElementById('partnerRevenueChart').getContext('2d');
        const labels = <?= $chartLabels ?>;
        const data = <?= $chartData ?>;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['Tháng 6', 'Tháng 7', 'Tháng 8'],
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: data.length ? data : [5000000, 12000000, 18500000],
                    borderColor: '#FF6B2C',
                    backgroundColor: 'rgba(255, 107, 44, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(val) { return (val / 1000000).toLocaleString('vi-VN') + ' tr'; }
                        }
                    }
                }
            }
        });
    });
</script>
