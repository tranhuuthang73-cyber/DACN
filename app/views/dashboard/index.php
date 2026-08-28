<?php
use App\Core\Helper;
?>

<section class="section" style="padding-top:calc(var(--header-height) + var(--space-xl)); min-height:80vh;">
    <div class="container">
        
        <!-- ==================== GREETING HEADER ==================== -->
        <div class="card" style="padding:var(--space-2xl); background:linear-gradient(135deg, var(--gray-900) 0%, #1E293B 50%, var(--primary-dark) 100%); color:white; margin-bottom:var(--space-2xl); position:relative; overflow:hidden;">
            <div style="position:relative; z-index:2; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-lg);">
                <div style="display:flex; align-items:center; gap:var(--space-lg);">
                    <div style="width:68px; height:68px; border-radius:var(--radius-full); background:linear-gradient(135deg, var(--primary), var(--accent)); color:white; display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:800; border:3px solid rgba(255,255,255,0.2);">
                        <?= mb_strtoupper(mb_substr($user->full_name, 0, 1)) ?>
                    </div>
                    <div>
                        <div style="font-size:0.85rem; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.05em;">XIN CHÀO BẠN,</div>
                        <h1 style="color:white; font-size:1.8rem; margin-bottom:4px;"><?= Helper::e($user->full_name) ?></h1>
                        <div style="font-size:0.85rem; color:var(--accent-light);">
                            Thành viên TravelGo • <?= Helper::e($user->email) ?>
                        </div>
                    </div>
                </div>

                <div style="display:flex; gap:var(--space-sm);">
                    <a href="<?= $appUrl ?>/trips" class="btn btn-primary btn-sm" style="background:var(--accent); border-color:var(--accent); color:var(--gray-900); font-weight:700;">
                        <i data-lucide="plus" style="width:16px;height:16px"></i> Đặt chuyến mới
                    </a>
                    <a href="<?= $appUrl ?>/booking/my-bookings" class="btn btn-outline btn-sm" style="color:white; border-color:rgba(255,255,255,0.4);">
                        <i data-lucide="ticket" style="width:16px;height:16px"></i> Vé của tôi
                    </a>
                </div>
            </div>
        </div>

        <!-- ==================== PERSONAL STATS ==================== -->
        <div class="stats-grid" style="margin-bottom:var(--space-2xl);">
            
            <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--primary);">
                <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">TỔNG CHI TIÊU DU LỊCH</div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--secondary); margin-bottom:2px;">
                    <?= Helper::formatMoney($totalSpent) ?>
                </div>
                <div style="font-size:0.8rem; color:var(--gray-500);">Đã thanh toán thành công</div>
            </div>

            <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--success);">
                <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">CHUYẾN ĐI HOÀN THÀNH</div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--success); margin-bottom:2px;">
                    <?= $totalCompletedTrips ?> chuyến
                </div>
                <div style="font-size:0.8rem; color:var(--gray-500);">Hành trình đã trải nghiệm</div>
            </div>

            <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid var(--accent-dark);">
                <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">BOOKING ĐANG HIỆU LỰC</div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--primary); margin-bottom:2px;">
                    <?= $activeBookingsCount ?> đơn
                </div>
                <div style="font-size:0.8rem; color:var(--gray-500);">Sắp khởi hành / nhận phòng</div>
            </div>

            <div class="stat-card" style="text-align:left; padding:var(--space-lg); border-left:4px solid #8B5CF6;">
                <div style="font-size:0.85rem; color:var(--gray-500); font-weight:600; margin-bottom:4px;">HẠNG THÀNH VIÊN</div>
                <div style="font-size:1.6rem; font-weight:800; color:#8B5CF6; margin-bottom:2px;">
                    Silver Member
                </div>
                <div style="font-size:0.8rem; color:var(--gray-500);">Tích lũy ưu đãi 5%</div>
            </div>

        </div>

        <!-- ==================== UPCOMING TRIPS / HOTELS ==================== -->
        <div class="grid grid-2" style="gap:var(--space-xl); margin-bottom:var(--space-2xl); align-items:start;">
            
            <!-- 1. Next Upcoming Trip -->
            <div class="card" style="padding:var(--space-xl); border:2px solid var(--primary-50);">
                <h3 style="font-size:1.15rem; margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="map-pin" style="color:var(--primary); width:18px;height:18px;"></i> Chuyến đi sắp tới gần nhất
                </h3>

                <?php if ($nextJourney): ?>
                    <div style="background:var(--gray-50); padding:var(--space-lg); border-radius:var(--radius-md); margin-bottom:var(--space-md);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span class="badge badge-success">Đã xác nhận</span>
                            <span style="font-size:0.8rem; color:var(--gray-500);">Mã: <?= Helper::e($nextJourney->booking_code) ?></span>
                        </div>
                        <h4 style="font-size:1.25rem; margin-bottom:4px;">
                            <?= Helper::e($nextJourney->departure_name) ?> → <?= Helper::e($nextJourney->arrival_name) ?>
                        </h4>
                        <div style="font-size:0.88rem; color:var(--primary); font-weight:600; margin-bottom:4px;">
                            <i data-lucide="clock" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i>
                            Khởi hành: <?= Helper::formatDateTime($nextJourney->departure_datetime) ?>
                        </div>
                        <div style="font-size:0.82rem; color:var(--gray-500);">
                            Phương tiện: <?= Helper::e($nextJourney->vehicle_name) ?> • <?= Helper::e($nextJourney->partner_name) ?>
                        </div>
                    </div>
                    <a href="<?= $appUrl ?>/booking/detail/<?= $nextJourney->booking_code ?>" class="btn btn-primary btn-full btn-sm">
                        <i data-lucide="qr-code" style="width:14px;height:14px"></i> Mở Vé điện tử để soát vé
                    </a>
                <?php else: ?>
                    <div style="text-align:center; padding:var(--space-xl); color:var(--gray-500);">
                        <p style="margin-bottom:var(--space-md);">Bạn không có chuyến đi nào sắp khởi hành.</p>
                        <a href="<?= $appUrl ?>/trips" class="btn btn-outline btn-sm">Tìm chuyến đi</a>
                    </div>
                <?php endif; ?>
            </div>

            <!-- 2. Next Upcoming Hotel -->
            <div class="card" style="padding:var(--space-xl); border:2px solid rgba(0, 212, 170, 0.2);">
                <h3 style="font-size:1.15rem; margin-bottom:var(--space-md); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="building" style="color:var(--accent-dark); width:18px;height:18px;"></i> Phòng khách sạn sắp nhận
                </h3>

                <?php if ($nextHotel): ?>
                    <div style="background:var(--gray-50); padding:var(--space-lg); border-radius:var(--radius-md); margin-bottom:var(--space-md);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span class="badge badge-success">Đã đặt</span>
                            <span style="font-size:0.8rem; color:var(--gray-500);">Mã: <?= Helper::e($nextHotel->booking_code) ?></span>
                        </div>
                        <h4 style="font-size:1.25rem; margin-bottom:4px;">
                            <?= Helper::e($nextHotel->hotel_name) ?>
                        </h4>
                        <div style="font-size:0.85rem; color:var(--gray-600); margin-bottom:4px;">
                            <?= Helper::e($nextHotel->room_name) ?> (<?= $nextHotel->num_rooms ?> phòng)
                        </div>
                        <div style="font-size:0.85rem; color:var(--accent-dark); font-weight:600;">
                            <i data-lucide="calendar" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"></i>
                            Nhận: <?= Helper::formatDate($nextHotel->check_in_date) ?> • Trả: <?= Helper::formatDate($nextHotel->check_out_date) ?>
                        </div>
                    </div>
                    <a href="<?= $appUrl ?>/booking/detail/<?= $nextHotel->booking_code ?>" class="btn btn-outline btn-full btn-sm">
                        Xem chi tiết đặt phòng
                    </a>
                <?php else: ?>
                    <div style="text-align:center; padding:var(--space-xl); color:var(--gray-500);">
                        <p style="margin-bottom:var(--space-md);">Chưa có đặt phòng khách sạn sắp tới.</p>
                        <a href="<?= $appUrl ?>/hotels" class="btn btn-outline btn-sm">Đặt phòng ngay</a>
                    </div>
                <?php endif; ?>
            </div>

        </div>

    </div>
</section>
