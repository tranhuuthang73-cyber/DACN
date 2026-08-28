<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Quyền truy cập bị từ chối | TravelGo</title>
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
            background: linear-gradient(135deg, #EF4444, #F59E0B);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .error-title { font-size: 1.5rem; margin: 1rem 0 0.5rem; font-weight: 700; }
        .error-desc { color: #94A3B8; margin-bottom: 2rem; max-width: 480px; margin-left: auto; margin-right: auto; }
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
        <div class="error-code">403</div>
        <div class="error-title">Truy cập bị từ chối</div>
        <p class="error-desc"><?= htmlspecialchars($message ?? 'Bạn không có quyền truy cập vào trang này hoặc phiên làm việc của bạn không phù hợp.') ?></p>
        <a href="<?= getenv('APP_URL') ?: 'http://localhost/DULICH/public' ?>" class="btn-home">← Về trang chủ</a>
    </div>
</body>
</html>
