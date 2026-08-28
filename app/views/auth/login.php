<?php
use App\Core\Helper;
?>

<div style="text-align:center;margin-bottom:var(--space-lg);">
    <h2 class="auth-title">Đăng nhập</h2>
    <p class="auth-subtitle">Chào mừng bạn quay trở lại với TravelGo</p>
</div>

<form action="<?= $appUrl ?>/auth/login" method="POST">
    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

    <div class="form-group mb-1">
        <label for="login">Tên đăng nhập hoặc Email</label>
        <div style="position:relative;">
            <input type="text" 
                   id="login" 
                   name="login" 
                   class="form-control <?= isset($errors['login']) ? 'is-invalid' : '' ?>" 
                   placeholder="admin, an.nguyen@gmail.com..." 
                   value="<?= Helper::e($old['login'] ?? '') ?>" 
                   required 
                   autofocus>
        </div>
        <?php if (isset($errors['login'])): ?>
            <div class="form-error"><?= $errors['login'] ?></div>
        <?php endif; ?>
    </div>

    <div class="form-group mb-1">
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <label for="password">Mật khẩu</label>
            <a href="#" style="font-size:0.8rem;color:var(--primary);" onclick="alert('Vui lòng liên hệ Admin hoặc sử dụng tài khoản mẫu để đăng nhập.')">Quên mật khẩu?</a>
        </div>
        <div style="position:relative;">
            <input type="password" 
                   id="password" 
                   name="password" 
                   class="form-control <?= isset($errors['password']) ? 'is-invalid' : '' ?>" 
                   placeholder="••••••••" 
                   required>
            <button type="button" class="password-toggle" onclick="togglePassword('password', this)" title="Ẩn/Hiện mật khẩu">
                <i data-lucide="eye" style="width:18px;height:18px"></i>
            </button>
        </div>
        <?php if (isset($errors['password'])): ?>
            <div class="form-error"><?= $errors['password'] ?></div>
        <?php endif; ?>
    </div>

    <button type="submit" class="btn btn-primary btn-full btn-lg mt-1">
        <i data-lucide="log-in" style="width:18px;height:18px"></i> Đăng nhập
    </button>
</form>

<div style="text-align:center;margin-top:var(--space-lg);font-size:0.9rem;color:var(--gray-600);">
    Chưa có tài khoản? <a href="<?= $appUrl ?>/auth/register" style="font-weight:700;">Đăng ký ngay</a>
    <div style="margin-top:6px;">
        Hoặc <a href="<?= $appUrl ?>/auth/register-partner" style="color:var(--secondary);font-weight:600;">Đăng ký Đối tác cung cấp dịch vụ</a>
    </div>
</div>

<!-- Quick-fill Demo Accounts for Evaluators -->
<div class="demo-accounts">
    <div class="demo-accounts-title">⚡ Chọn tài khoản mẫu (Click để điền nhanh)</div>
    <div class="demo-btn-group">
        <button type="button" class="demo-btn" onclick="fillLogin('admin', 'password123')">
            👑 <strong>Admin</strong> (admin)
        </button>
        <button type="button" class="demo-btn" onclick="fillLogin('nv_hoa', 'password123')">
            💼 <strong>Nhân viên</strong> (nv_hoa)
        </button>
        <button type="button" class="demo-btn" onclick="fillLogin('dt_saigontour', 'password123')">
            🤝 <strong>Đối tác</strong> (dt_saigontour)
        </button>
        <button type="button" class="demo-btn" onclick="fillLogin('kh_an', 'password123')">
            👤 <strong>Khách hàng</strong> (kh_an)
        </button>
    </div>
</div>

<script>
    function fillLogin(username, password) {
        document.getElementById('login').value = username;
        document.getElementById('password').value = password;
    }
</script>
