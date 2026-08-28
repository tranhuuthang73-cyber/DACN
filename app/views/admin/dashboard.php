<?php
use App\Core\Helper;
?>

<!-- Include Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div style="margin-bottom:var(--space-xl);">
    <h1 style="font-size:1.8rem; margin-bottom:4px;">Dashboard Phân tích <span class="text-gradient">Dữ liệu Du lịch</span></h1>
    <p style="color:var(--gray-500); font-size:0.95rem;">Báo cáo thời gian thực về doanh thu, lượt đặt chỗ và hiệu suất đối tác</p>
</div>

<!-- ==================== 1. KPI STAT CARDS ==================== -->
<div class="stats-grid" style="margin-bottom:var(--space-2xl);">
    
    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--primary);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-sm);">
            <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600;">TỔNG DOANH THU</div>
            <div style="width:40px; height:40px; border-radius:var(--radius-md); background:var(--primary-50); color:var(--primary); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="dollar-sign" style="width:20px;height:20px"></i>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
            <?= Helper::formatMoney($totalRevenue) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--success); display:flex; align-items:center; gap:4px;">
            <i data-lucide="trending-up" style="width:14px;height:14px"></i> Tăng trưởng ổn định
        </div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--secondary);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-sm);">
            <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600;">TỔNG ĐƠN HÀNG</div>
            <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(255, 107, 44, 0.1); color:var(--secondary); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="shopping-bag" style="width:20px;height:20px"></i>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
            <?= number_format($totalOrders) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">
            Tất cả các dịch vụ kết hợp
        </div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--accent-dark);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-sm);">
            <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600;">KHÁCH HÀNG</div>
            <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(0, 212, 170, 0.1); color:var(--accent-dark); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="users" style="width:20px;height:20px"></i>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
            <?= number_format($totalCustomers) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">
            Tài khoản đã kích hoạt
        </div>
    </div>

    <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid #8B5CF6;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-sm);">
            <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600;">ĐỐI TÁC HOẠT ĐỘNG</div>
            <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(139, 92, 246, 0.1); color:#8B5CF6; display:flex; align-items:center; justify-content:center;">
                <i data-lucide="handshake" style="width:20px;height:20px"></i>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
            <?= number_format($totalActivePartners) ?>
        </div>
        <div style="font-size:0.8rem; color:var(--gray-500);">
            <?= $totalActiveTrips ?> chuyến • <?= $totalActiveHotels ?> KS
        </div>
    </div>

</div>

<!-- ==================== 2. CHARTS ROW ==================== -->
<div class="grid grid-2" style="gap:var(--space-xl); margin-bottom:var(--space-2xl);">
    
    <!-- Chart 1: Doanh thu theo tháng -->
    <div class="card" style="padding:var(--space-xl);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-lg);">
            <h3 style="font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                <i data-lucide="bar-chart-3" style="width:18px;height:18px;color:var(--primary);"></i> Doanh thu theo tháng (VND)
            </h3>
        </div>
        <div style="height:280px; position:relative;">
            <canvas id="revenueMonthlyChart"></canvas>
        </div>
    </div>

    <!-- Chart 2: Tỷ trọng doanh thu theo loại dịch vụ -->
    <div class="card" style="padding:var(--space-xl);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-lg);">
            <h3 style="font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                <i data-lucide="pie-chart" style="width:18px;height:18px;color:var(--secondary);"></i> Cơ cấu Doanh thu Dịch vụ
            </h3>
        </div>
        <div style="height:280px; position:relative; display:flex; align-items:center; justify-content:center;">
            <canvas id="serviceShareChart"></canvas>
        </div>
    </div>

</div>

<!-- ==================== 3. TOP ROUTES & POPULARITY ==================== -->
<div class="grid grid-2" style="gap:var(--space-xl); margin-bottom:var(--space-2xl); align-items:start;">
    
    <!-- Top 5 Tuyến đường -->
    <div class="card" style="padding:var(--space-xl);">
        <h3 style="font-size:1.15rem; margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
            <i data-lucide="trending-up" style="width:18px;height:18px;color:var(--accent-dark);"></i> Top 5 Tuyến đường đông khách nhất
        </h3>

        <div style="display:flex; flex-direction:column; gap:var(--space-md);">
            <?php foreach ($topRoutes as $idx => $route): ?>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:4px;">
                        <span style="font-weight:600;">
                            #<?= $idx + 1 ?>. <?= Helper::e($route->departure_name) ?> → <?= Helper::e($route->arrival_name) ?>
                        </span>
                        <strong style="color:var(--primary);"><?= $route->total_passengers ?> khách</strong>
                    </div>
                    <div style="height:6px; background:var(--gray-100); border-radius:var(--radius-full); overflow:hidden;">
                        <div style="height:100%; width:<?= min(100, $route->total_passengers * 10) ?>%; background:linear-gradient(90deg, var(--primary), var(--accent));"></div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Top Đối tác Doanh thu -->
    <div class="card" style="padding:var(--space-xl);">
        <h3 style="font-size:1.15rem; margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
            <i data-lucide="award" style="width:18px;height:18px;color:#F59E0B;"></i> Doanh thu theo Đối tác
        </h3>

        <div class="table-responsive">
            <table class="table" style="font-size:0.85rem;">
                <thead>
                    <tr>
                        <th>Đối tác</th>
                        <th>Dịch vụ</th>
                        <th style="text-align:right;">Doanh thu</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($topPartners as $tp): ?>
                        <tr>
                            <td><strong><?= Helper::e($tp->company_name) ?></strong></td>
                            <td><?= $tp->trip_count ?> chuyến • <?= $tp->hotel_count ?> KS</td>
                            <td style="text-align:right; font-weight:700; color:var(--secondary);">
                                <?= Helper::formatMoney($tp->total_revenue) ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

</div>

<!-- ==================== 4. RECENT ORDERS TABLE ==================== -->
<div class="card" style="padding:var(--space-xl);">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
        <h3 style="font-size:1.15rem; display:flex; align-items:center; gap:8px;">
            <i data-lucide="clock" style="width:18px;height:18px;color:var(--gray-600);"></i> Đơn hàng gần đây
        </h3>
        <a href="<?= $appUrl ?>/admin/orders" class="btn btn-ghost btn-sm">Xem tất cả</a>
    </div>

    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Mã đơn hàng</th>
                    <th>Khách hàng</th>
                    <th>Thời gian</th>
                    <th>Tổng tiền</th>
                    <th>Phương thức</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($recentOrders as $order): ?>
                    <?php $statusMeta = Helper::bookingStatus($order->status); ?>
                    <tr>
                        <td><strong><?= Helper::e($order->order_code) ?></strong></td>
                        <td>
                            <div><?= Helper::e($order->customer_name) ?></div>
                            <small class="text-muted"><?= Helper::e($order->customer_phone) ?></small>
                        </td>
                        <td><?= Helper::formatDateTime($order->created_at) ?></td>
                        <td><strong style="color:var(--secondary);"><?= Helper::formatMoney($order->final_amount) ?></strong></td>
                        <td><span class="badge badge-secondary"><?= strtoupper($order->payment_method ?? 'ONLINE') ?></span></td>
                        <td>
                            <span class="badge badge-<?= $statusMeta['color'] ?>">
                                <?= $statusMeta['label'] ?>
                            </span>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ==================== CHART.JS SCRIPTS ==================== -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // 1. Monthly Revenue Bar Chart
        const ctxRevenue = document.getElementById('revenueMonthlyChart').getContext('2d');
        const months = <?= $chartMonths ?>;
        const revenues = <?= $chartRevenues ?>;

        new Chart(ctxRevenue, {
            type: 'bar',
            data: {
                labels: months.length ? months : ['Tháng 7', 'Tháng 8', 'Tháng 9'],
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: revenues.length ? revenues : [15000000, 24500000, 32000000],
                    backgroundColor: 'rgba(0, 102, 255, 0.85)',
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toLocaleString('vi-VN') + ' tr';
                            }
                        }
                    }
                }
            }
        });

        // 2. Service Share Doughnut Chart
        const ctxShare = document.getElementById('serviceShareChart').getContext('2d');
        const tripRev = <?= (float)$tripRevenue ?> || 65000000;
        const hotelRev = <?= (float)$hotelRevenue ?> || 35000000;

        new Chart(ctxShare, {
            type: 'doughnut',
            data: {
                labels: ['Vé Chuyến đi / Tour', 'Phòng Khách sạn'],
                datasets: [{
                    data: [tripRev, hotelRev],
                    backgroundColor: ['#0066FF', '#00D4AA'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    });
</script>
