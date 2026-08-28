<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle ?? 'Quản trị hệ thống') ?> | TravelGo Dashboard</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

    <!-- Style -->
    <link rel="stylesheet" href="<?= $appUrl ?>/assets/css/style.css">

    <style>
        .admin-layout {
            display: flex;
            min-height: 100vh;
            background: #F8FAFC;
        }

        .admin-sidebar {
            width: var(--sidebar-width);
            background: #0F172A;
            color: #94A3B8;
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 1000;
            border-right: 1px solid #1E293B;
            transition: all var(--transition-base);
        }

        .sidebar-brand {
            height: var(--header-height);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            padding: 0 var(--space-xl);
            font-size: 1.3rem;
            font-weight: 800;
            color: white;
            border-bottom: 1px solid #1E293B;
            text-decoration: none;
        }

        .sidebar-menu {
            padding: var(--space-md) var(--space-sm);
            flex: 1;
            overflow-y: auto;
        }

        .sidebar-heading {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748B;
            padding: var(--space-md) var(--space-md) var(--space-xs);
        }

        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            color: #94A3B8;
            font-size: 0.92rem;
            font-weight: 500;
            border-radius: var(--radius-md);
            transition: all var(--transition-fast);
            text-decoration: none;
            margin-bottom: 2px;
        }

        .sidebar-link:hover {
            color: white;
            background: #1E293B;
        }

        .sidebar-link.active {
            color: white;
            background: var(--primary);
            font-weight: 600;
        }

        .sidebar-user {
            padding: var(--space-md) var(--space-lg);
            border-top: 1px solid #1E293B;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #0B1120;
        }

        .admin-main {
            margin-left: var(--sidebar-width);
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        .admin-topbar {
            height: var(--header-height);
            background: white;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 var(--space-2xl);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .admin-content {
            padding: var(--space-2xl);
            flex: 1;
        }

        /* Table styles */
        .table-responsive {
            overflow-x: auto;
            border-radius: var(--radius-md);
            background: white;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--gray-100);
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.9rem;
        }

        .table th {
            background: var(--gray-50);
            color: var(--gray-600);
            font-weight: 600;
            padding: 12px 16px;
            border-bottom: 1px solid var(--gray-200);
        }

        .table td {
            padding: 14px 16px;
            border-bottom: 1px solid var(--gray-100);
            vertical-align: middle;
        }

        .table tr:hover td {
            background: var(--gray-50);
        }

        @media (max-width: 1024px) {
            .admin-sidebar { transform: translateX(-100%); }
            .admin-sidebar.open { transform: translateX(0); }
            .admin-main { margin-left: 0; }
        }
    </style>
</head>
<body>

    <div class="admin-layout">
        
        <!-- ==================== SIDEBAR ==================== -->
        <aside class="admin-sidebar" id="adminSidebar">
            <a href="<?= $appUrl ?>" class="sidebar-brand">
                <div class="brand-icon" style="width:36px;height:36px;background:var(--primary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:white;">
                    <i data-lucide="plane" style="width:20px;height:20px"></i>
                </div>
                TravelGo
            </a>

            <div class="sidebar-menu">
                <?php if ($currentUser['role'] === 'admin'): ?>
                    <!-- ADMIN MENU -->
                    <div class="sidebar-heading">Tổng quan</div>
                    <a href="<?= $appUrl ?>/admin" class="sidebar-link <?= \App\Core\Helper::isActive('admin') && !isset($_GET['url']) || ($_GET['url'] ?? '') === 'admin' ? 'active' : '' ?>">
                        <i data-lucide="layout-dashboard" style="width:18px;height:18px"></i> Dashboard Admin
                    </a>

                    <div class="sidebar-heading">Quản lý Du lịch</div>
                    <a href="<?= $appUrl ?>/admin/trips" class="sidebar-link <?= \App\Core\Helper::isActive('admin/trips') ?>">
                        <i data-lucide="map-pin" style="width:18px;height:18px"></i> Quản lý Chuyến đi
                    </a>
                    <a href="<?= $appUrl ?>/admin/trips/create" class="sidebar-link <?= \App\Core\Helper::isActive('admin/trips/create') ?>">
                        <i data-lucide="plus-circle" style="width:18px;height:18px"></i> Tạo Chuyến mới
                    </a>
                    <a href="<?= $appUrl ?>/admin/partners" class="sidebar-link <?= \App\Core\Helper::isActive('admin/partners') ?>">
                        <i data-lucide="handshake" style="width:18px;height:18px"></i> Duyệt Đối tác
                    </a>

                    <div class="sidebar-heading">Hệ thống</div>
                    <a href="<?= $appUrl ?>/admin/users" class="sidebar-link <?= \App\Core\Helper::isActive('admin/users') ?>">
                        <i data-lucide="users" style="width:18px;height:18px"></i> Tài khoản & Quyền
                    </a>
                    <a href="<?= $appUrl ?>/admin/settings" class="sidebar-link <?= \App\Core\Helper::isActive('admin/settings') ?>">
                        <i data-lucide="settings" style="width:18px;height:18px"></i> Cấu hình hệ thống
                    </a>

                <?php elseif ($currentUser['role'] === 'employee'): ?>
                    <!-- EMPLOYEE MENU -->
                    <div class="sidebar-heading">Bảng điều khiển</div>
                    <a href="<?= $appUrl ?>/employee" class="sidebar-link <?= \App\Core\Helper::isActive('employee') && ($_GET['url'] ?? '') === 'employee' ? 'active' : '' ?>">
                        <i data-lucide="layout-dashboard" style="width:18px;height:18px"></i> Dashboard NV
                    </a>

                    <div class="sidebar-heading">Xét duyệt & Nghiệp vụ</div>
                    <a href="<?= $appUrl ?>/employee/trips" class="sidebar-link <?= \App\Core\Helper::isActive('employee/trips') ?>">
                        <i data-lucide="check-square" style="width:18px;height:18px"></i> Phê duyệt Chuyến
                    </a>
                    <a href="<?= $appUrl ?>/employee/hotels" class="sidebar-link <?= \App\Core\Helper::isActive('employee/hotels') ?>">
                        <i data-lucide="building-2" style="width:18px;height:18px"></i> Duyệt Khách sạn
                    </a>
                    <a href="<?= $appUrl ?>/employee/bookings" class="sidebar-link <?= \App\Core\Helper::isActive('employee/bookings') ?>">
                        <i data-lucide="ticket" style="width:18px;height:18px"></i> Quản lý Booking
                    </a>
                    <a href="<?= $appUrl ?>/employee/qr" class="sidebar-link <?= \App\Core\Helper::isActive('employee/qr') ?>">
                        <i data-lucide="qr-code" style="width:18px;height:18px"></i> Quét QR soát vé
                    </a>

                <?php elseif ($currentUser['role'] === 'partner'): ?>
                    <!-- PARTNER MENU -->
                    <div class="sidebar-heading">Đối tác cung cấp</div>
                    <a href="<?= $appUrl ?>/partner" class="sidebar-link <?= \App\Core\Helper::isActive('partner') && ($_GET['url'] ?? '') === 'partner' ? 'active' : '' ?>">
                        <i data-lucide="layout-dashboard" style="width:18px;height:18px"></i> Dashboard Doanh thu
                    </a>
                    <a href="<?= $appUrl ?>/partner/hotels" class="sidebar-link <?= \App\Core\Helper::isActive('partner/hotels') ?>">
                        <i data-lucide="building" style="width:18px;height:18px"></i> Khách sạn & Phòng
                    </a>
                    <a href="<?= $appUrl ?>/partner/trips" class="sidebar-link <?= \App\Core\Helper::isActive('partner/trips') ?>">
                        <i data-lucide="map-pin" style="width:18px;height:18px"></i> Chuyến đi của tôi
                    </a>
                <?php endif; ?>

                <div class="sidebar-heading">Khác</div>
                <a href="<?= $appUrl ?>/auth/profile" class="sidebar-link">
                    <i data-lucide="user" style="width:18px;height:18px"></i> Hồ sơ tài khoản
                </a>
                <a href="<?= $appUrl ?>" class="sidebar-link" target="_blank">
                    <i data-lucide="external-link" style="width:18px;height:18px"></i> Xem Website
                </a>
                <a href="<?= $appUrl ?>/auth/logout" class="sidebar-link" style="color:var(--danger);">
                    <i data-lucide="log-out" style="width:18px;height:18px"></i> Đăng xuất
                </a>
            </div>

            <!-- User footer -->
            <div class="sidebar-user">
                <div class="user-avatar" style="width:34px;height:34px;font-size:0.8rem;">
                    <?= mb_strtoupper(mb_substr($currentUser['full_name'], 0, 1)) ?>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        <?= \App\Core\Helper::e($currentUser['full_name']) ?>
                    </div>
                    <div style="font-size:0.75rem;color:#64748B;text-transform:capitalize;">
                        <?= $currentUser['role'] ?>
                    </div>
                </div>
            </div>
        </aside>

        <!-- ==================== MAIN CONTENT AREA ==================== -->
        <div class="admin-main">
            
            <!-- Topbar -->
            <header class="admin-topbar">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button class="btn btn-ghost btn-sm" id="sidebarToggle" style="display:none;">
                        <i data-lucide="menu" style="width:20px;height:20px"></i>
                    </button>
                    <h2 style="font-size:1.2rem;font-weight:700;"><?= htmlspecialchars($pageTitle ?? 'Bảng điều khiển') ?></h2>
                </div>

                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="badge badge-primary">
                        <?= strtoupper($currentUser['role']) ?>
                    </span>
                    <a href="<?= $appUrl ?>" class="btn btn-outline btn-sm">
                        <i data-lucide="globe" style="width:14px;height:14px"></i> Trang chủ
                    </a>
                </div>
            </header>

            <!-- Flash alerts -->
            <?php if ($flashSuccess): ?>
                <div class="alert alert-success" style="margin:var(--space-lg) var(--space-2xl) 0;">
                    <i data-lucide="check-circle" style="width:20px;height:20px;flex-shrink:0;"></i>
                    <span><?= \App\Core\Helper::e($flashSuccess) ?></span>
                    <button class="alert-close" onclick="this.parentElement.remove()">×</button>
                </div>
            <?php endif; ?>

            <?php if ($flashError): ?>
                <div class="alert alert-error" style="margin:var(--space-lg) var(--space-2xl) 0;">
                    <i data-lucide="alert-circle" style="width:20px;height:20px;flex-shrink:0;"></i>
                    <span><?= \App\Core\Helper::e($flashError) ?></span>
                    <button class="alert-close" onclick="this.parentElement.remove()">×</button>
                </div>
            <?php endif; ?>

            <!-- Page Body -->
            <main class="admin-content">
                <?= $content ?>
            </main>
        </div>

    </div>

    <script>
        lucide.createIcons();

        // Responsive sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.getElementById('adminSidebar').classList.toggle('open');
        });
    </script>
</body>
</html>
