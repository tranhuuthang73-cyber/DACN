<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="TravelGo - Nền tảng đặt chuyến đi và khách sạn du lịch hàng đầu Việt Nam">
    <meta name="keywords" content="du lịch, đặt vé, khách sạn, TravelGo, tour du lịch">
    
    <title><?= htmlspecialchars($pageTitle ?? 'Trang chủ') ?> | <?= $appName ?></title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

    <!-- Styles -->
    <link rel="stylesheet" href="<?= $appUrl ?>/assets/css/style.css">

    <?php if (isset($extraCss)): ?>
        <?php foreach ((array)$extraCss as $css): ?>
            <link rel="stylesheet" href="<?= $appUrl ?>/assets/css/<?= $css ?>">
        <?php endforeach; ?>
    <?php endif; ?>
</head>
<body>

    <!-- ==================== NAVBAR ==================== -->
    <nav class="navbar" id="navbar">
        <div class="navbar-inner">
            <!-- Brand -->
            <a href="<?= $appUrl ?>" class="navbar-brand">
                <div class="brand-icon">
                    <i data-lucide="plane"></i>
                </div>
                TravelGo
            </a>

            <!-- Menu Links -->
            <div class="navbar-menu" id="navbarMenu">
                <a href="<?= $appUrl ?>" class="<?= \App\Core\Helper::isActive('') === 'active' && !isset($_GET['url']) ? 'active' : '' ?>">
                    <i data-lucide="home" style="width:16px;height:16px"></i> Trang chủ
                </a>
                <a href="<?= $appUrl ?>/trips" class="<?= \App\Core\Helper::isActive('trips') ?>">
                    <i data-lucide="map-pin" style="width:16px;height:16px"></i> Chuyến đi
                </a>
                <a href="<?= $appUrl ?>/hotels" class="<?= \App\Core\Helper::isActive('hotels') ?>">
                    <i data-lucide="building-2" style="width:16px;height:16px"></i> Khách sạn
                </a>
            </div>

            <!-- Actions -->
            <div class="navbar-actions">
                <?php $cartCount = count(\App\Core\Session::get('cart', [])); ?>
                <!-- Cart Button -->
                <a href="<?= $appUrl ?>/cart" class="notification-bell" title="Giỏ hàng" style="position:relative; display:flex; align-items:center; justify-content:center; text-decoration:none;">
                    <i data-lucide="shopping-cart" style="width:20px;height:20px"></i>
                    <?php if ($cartCount > 0): ?>
                        <span class="badge" style="position:absolute;top:-2px;right:-2px;width:18px;height:18px;background:var(--secondary);color:white;font-size:0.65rem;font-weight:700;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;border:2px solid white;">
                            <?= $cartCount ?>
                        </span>
                    <?php endif; ?>
                </a>

                <?php if ($currentUser): ?>
                    <!-- Notification Bell -->
                    <button class="notification-bell" id="notificationBell" title="Thông báo">
                        <i data-lucide="bell" style="width:20px;height:20px"></i>
                        <span class="badge" id="notifCount" style="display:none">0</span>
                    </button>

                    <!-- User Menu -->
                    <div style="position:relative">
                        <button class="user-avatar" id="userMenuBtn" title="<?= \App\Core\Helper::e($currentUser['full_name']) ?>">
                            <?php if ($currentUser['avatar']): ?>
                                <img src="<?= $appUrl ?>/<?= $currentUser['avatar'] ?>" alt="Avatar">
                            <?php else: ?>
                                <?= mb_strtoupper(mb_substr($currentUser['full_name'], 0, 1)) ?>
                            <?php endif; ?>
                        </button>
                        <div class="dropdown-menu" id="userDropdown" style="display:none;position:absolute;right:0;top:48px;background:white;border-radius:var(--radius-md);box-shadow:var(--shadow-xl);border:1px solid var(--gray-200);min-width:220px;z-index:100;padding:8px 0;">
                            <div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);">
                                <div style="font-weight:700;font-size:0.95rem;"><?= \App\Core\Helper::e($currentUser['full_name']) ?></div>
                                <div style="font-size:0.8rem;color:var(--gray-500);"><?= \App\Core\Helper::e($currentUser['email'] ?? '') ?></div>
                            </div>

                            <?php if ($currentUser['role'] === 'customer'): ?>
                                <a href="<?= $appUrl ?>/dashboard" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--gray-700);font-size:0.9rem;"><i data-lucide="layout-dashboard" style="width:16px;height:16px"></i> Dashboard</a>
                                <a href="<?= $appUrl ?>/booking/my-bookings" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--gray-700);font-size:0.9rem;"><i data-lucide="ticket" style="width:16px;height:16px"></i> Booking của tôi</a>
                            <?php elseif ($currentUser['role'] === 'admin'): ?>
                                <a href="<?= $appUrl ?>/admin" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--gray-700);font-size:0.9rem;"><i data-lucide="shield" style="width:16px;height:16px"></i> Admin Panel</a>
                            <?php elseif ($currentUser['role'] === 'employee'): ?>
                                <a href="<?= $appUrl ?>/employee" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--gray-700);font-size:0.9rem;"><i data-lucide="briefcase" style="width:16px;height:16px"></i> Bảng điều khiển</a>
                            <?php elseif ($currentUser['role'] === 'partner'): ?>
                                <a href="<?= $appUrl ?>/partner" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--gray-700);font-size:0.9rem;"><i data-lucide="handshake" style="width:16px;height:16px"></i> Quản lý đối tác</a>
                            <?php endif; ?>

                            <a href="<?= $appUrl ?>/auth/profile" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--gray-700);font-size:0.9rem;"><i data-lucide="user" style="width:16px;height:16px"></i> Hồ sơ</a>
                            
                            <div style="border-top:1px solid var(--gray-100);margin:4px 0;"></div>
                            
                            <a href="<?= $appUrl ?>/auth/logout" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:var(--danger);font-size:0.9rem;"><i data-lucide="log-out" style="width:16px;height:16px"></i> Đăng xuất</a>
                        </div>
                    </div>
                <?php else: ?>
                    <a href="<?= $appUrl ?>/auth/login" class="btn btn-ghost btn-sm">Đăng nhập</a>
                    <a href="<?= $appUrl ?>/auth/register" class="btn btn-primary btn-sm">Đăng ký</a>
                <?php endif; ?>

                <button class="menu-toggle" id="menuToggle" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- ==================== FLASH MESSAGES ==================== -->
    <?php if ($flashSuccess): ?>
        <div class="alert alert-success" style="position:fixed;top:80px;right:20px;z-index:9999;max-width:400px;animation:slideDown 0.3s ease;">
            <i data-lucide="check-circle" style="width:20px;height:20px;flex-shrink:0;margin-top:2px;"></i>
            <span><?= \App\Core\Helper::e($flashSuccess) ?></span>
            <button class="alert-close" onclick="this.parentElement.remove()">×</button>
        </div>
    <?php endif; ?>

    <?php if ($flashError): ?>
        <div class="alert alert-error" style="position:fixed;top:80px;right:20px;z-index:9999;max-width:400px;animation:slideDown 0.3s ease;">
            <i data-lucide="alert-circle" style="width:20px;height:20px;flex-shrink:0;margin-top:2px;"></i>
            <span><?= \App\Core\Helper::e($flashError) ?></span>
            <button class="alert-close" onclick="this.parentElement.remove()">×</button>
        </div>
    <?php endif; ?>

    <!-- ==================== MAIN CONTENT ==================== -->
    <main>
        <?= $content ?>
    </main>

    <!-- ==================== FOOTER ==================== -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand">
                        <i data-lucide="plane" style="width:24px;height:24px;color:var(--accent)"></i>
                        TravelGo
                    </div>
                    <p style="margin-bottom:var(--space-lg);line-height:1.7;">Nền tảng đặt chuyến đi và khách sạn du lịch trên khắp Việt Nam. Trải nghiệm chuyến đi tự do, thoải mái và tiết kiệm.</p>
                    <div class="flex gap-sm">
                        <a href="#" style="width:36px;height:36px;background:var(--gray-800);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;color:var(--gray-400);transition:all 0.2s;" onmouseover="this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.background='var(--gray-800)';this.style.color='var(--gray-400)'">
                            <i data-lucide="facebook" style="width:18px;height:18px"></i>
                        </a>
                        <a href="#" style="width:36px;height:36px;background:var(--gray-800);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;color:var(--gray-400);transition:all 0.2s;" onmouseover="this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.background='var(--gray-800)';this.style.color='var(--gray-400)'">
                            <i data-lucide="instagram" style="width:18px;height:18px"></i>
                        </a>
                        <a href="#" style="width:36px;height:36px;background:var(--gray-800);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;color:var(--gray-400);transition:all 0.2s;" onmouseover="this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.background='var(--gray-800)';this.style.color='var(--gray-400)'">
                            <i data-lucide="youtube" style="width:18px;height:18px"></i>
                        </a>
                    </div>
                </div>

                <div>
                    <h4>Dịch vụ</h4>
                    <div class="footer-links">
                        <a href="<?= $appUrl ?>/trips">Chuyến đi</a>
                        <a href="<?= $appUrl ?>/hotels">Khách sạn</a>
                        <a href="#">Combo tiết kiệm</a>
                        <a href="#">Khuyến mãi</a>
                    </div>
                </div>

                <div>
                    <h4>Hỗ trợ</h4>
                    <div class="footer-links">
                        <a href="#">Trung tâm trợ giúp</a>
                        <a href="#">Chính sách hủy</a>
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Chính sách bảo mật</a>
                    </div>
                </div>

                <div>
                    <h4>Liên hệ</h4>
                    <div class="footer-links">
                        <a href="mailto:support@travelgo.vn" style="display:flex;align-items:center;gap:6px;">
                            <i data-lucide="mail" style="width:14px;height:14px"></i> support@travelgo.vn
                        </a>
                        <a href="tel:19001234" style="display:flex;align-items:center;gap:6px;">
                            <i data-lucide="phone" style="width:14px;height:14px"></i> 1900 1234
                        </a>
                        <a href="#" style="display:flex;align-items:center;gap:6px;">
                            <i data-lucide="map-pin" style="width:14px;height:14px"></i> TP. Hồ Chí Minh
                        </a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <span>© <?= date('Y') ?> TravelGo. Đồ án chuyên ngành CNPM.</span>
                <span>LV13-062</span>
            </div>
        </div>
    </footer>

    <!-- ==================== SCRIPTS ==================== -->
    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
        });

        // Mobile menu toggle
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.getElementById('navbarMenu').classList.toggle('open');
        });

        // User dropdown
        document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.style.display = 'none';
        });

        // Auto-hide flash messages
        document.querySelectorAll('.alert').forEach(alert => {
            setTimeout(() => {
                alert.style.opacity = '0';
                alert.style.transform = 'translateX(20px)';
                alert.style.transition = 'all 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }, 5000);
        });
    </script>
    <script src="<?= $appUrl ?>/assets/js/search-suggest.js"></script>

    <?php if (isset($extraJs)): ?>
        <?php foreach ((array)$extraJs as $js): ?>
            <script src="<?= $appUrl ?>/assets/js/<?= $js ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
</body>
</html>
