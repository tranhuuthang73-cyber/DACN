<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Không tìm thấy | TravelGo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Be Vietnam Pro', sans-serif; 
            min-height: 100vh; 
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            color: white; text-align: center; padding: 2rem;
        }
        .error-code { font-size: 8rem; font-weight: 800; line-height: 1; 
            background: linear-gradient(135deg, #0066FF, #00D4AA);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .error-title { font-size: 1.5rem; margin: 1rem 0 0.5rem; font-weight: 700; }
        .error-desc { color: #94A3B8; margin-bottom: 2rem; }
        .btn-home { 
            display: inline-flex; align-items: center; gap: 8px;
            padding: 0.8rem 2rem; background: #0066FF; color: white; 
            border-radius: 12px; font-weight: 600; text-decoration: none;
            transition: all 0.25s;
        }
        .btn-home:hover { background: #0052CC; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,102,255,0.3); }
    </style>
</head>
<body>
    <div>
        <div class="error-code">404</div>
        <div class="error-title">Trang không tồn tại</div>
        <p class="error-desc">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <a href="/" class="btn-home">← Về trang chủ</a>
        <?php if (!empty($message) && (getenv('APP_DEBUG') === 'true')): ?>
            <p style="margin-top:2rem;font-size:0.8rem;color:#475569;font-family:monospace;"><?= htmlspecialchars($message) ?></p>
        <?php endif; ?>
    </div>
</body>
</html>
