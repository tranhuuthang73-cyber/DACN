<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle ?? 'Tài khoản') ?> | <?= $appName ?></title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

    <!-- Style -->
    <link rel="stylesheet" href="<?= $appUrl ?>/assets/css/style.css">

    <style>
        .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0052CC 100%);
            position: relative;
            padding: var(--space-xl) var(--space-md);
            overflow: hidden;
        }

        .auth-float-1, .auth-float-2 {
            position: absolute;
            border-radius: var(--radius-full);
            pointer-events: none;
            opacity: 0.15;
            animation: float 8s ease-in-out infinite;
        }
        .auth-float-1 {
            width: 400px; height: 400px;
            background: var(--accent);
            top: -100px; left: -100px;
        }
        .auth-float-2 {
            width: 350px; height: 350px;
            background: var(--secondary);
            bottom: -50px; right: -50px;
            animation-delay: 3s;
        }

        .auth-card {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: var(--radius-xl);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
            width: 100%;
            max-width: 480px;
            padding: var(--space-2xl);
            position: relative;
            z-index: 10;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .auth-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }

        .auth-logo {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            font-size: 1.6rem;
            font-weight: 800;
            color: var(--gray-900);
            margin-bottom: var(--space-md);
            text-decoration: none;
        }

        .auth-logo .brand-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .auth-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--gray-900);
            margin-bottom: 4px;
        }

        .auth-subtitle {
            color: var(--gray-500);
            font-size: 0.95rem;
        }

        .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--gray-400);
            cursor: pointer;
            padding: 4px;
        }
        .password-toggle:hover { color: var(--gray-700); }

        .demo-accounts {
            margin-top: var(--space-xl);
            padding-top: var(--space-md);
            border-top: 1px dashed var(--gray-300);
        }
        .demo-accounts-title {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--gray-500);
            margin-bottom: var(--space-sm);
            text-align: center;
        }
        .demo-btn-group {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        }
        .demo-btn {
            padding: 6px 8px;
            font-size: 0.78rem;
            font-weight: 600;
            border-radius: var(--radius-sm);
            border: 1px solid var(--gray-200);
            background: var(--gray-50);
            color: var(--gray-700);
            cursor: pointer;
            text-align: left;
            transition: all var(--transition-fast);
        }
        .demo-btn:hover {
            background: var(--primary-50);
            border-color: var(--primary-light);
            color: var(--primary-dark);
        }
    </style>
</head>
<body>

    <div class="auth-wrapper">
        <div class="auth-float-1"></div>
        <div class="auth-float-2"></div>

        <!-- Flash messages -->
        <?php if ($flashSuccess): ?>
            <div class="alert alert-success" style="position:fixed;top:20px;right:20px;z-index:9999;max-width:400px;">
                <i data-lucide="check-circle" style="width:20px;height:20px;flex-shrink:0;"></i>
                <span><?= \App\Core\Helper::e($flashSuccess) ?></span>
                <button class="alert-close" onclick="this.parentElement.remove()">×</button>
            </div>
        <?php endif; ?>

        <?php if ($flashError): ?>
            <div class="alert alert-error" style="position:fixed;top:20px;right:20px;z-index:9999;max-width:400px;">
                <i data-lucide="alert-circle" style="width:20px;height:20px;flex-shrink:0;"></i>
                <span><?= \App\Core\Helper::e($flashError) ?></span>
                <button class="alert-close" onclick="this.parentElement.remove()">×</button>
            </div>
        <?php endif; ?>

        <div class="auth-card">
            <div class="auth-header">
                <a href="<?= $appUrl ?>" class="auth-logo">
                    <div class="brand-icon">
                        <i data-lucide="plane"></i>
                    </div>
                    TravelGo
                </a>
            </div>

            <?= $content ?>
        </div>
    </div>

    <script>
        lucide.createIcons();

        // Password visibility toggle
        function togglePassword(inputId, btn) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<i data-lucide="eye-off" style="width:18px;height:18px"></i>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<i data-lucide="eye" style="width:18px;height:18px"></i>';
            }
            lucide.createIcons();
        }

        // Auto dismiss alert
        setTimeout(() => {
            document.querySelectorAll('.alert').forEach(a => a.remove());
        }, 5000);
    </script>
</body>
</html>
