<?php
use App\Core\Helper;
?>

<div style="text-align:center;margin-bottom:var(--space-lg);">
    <h2 class="auth-title">Đăng ký tài khoản</h2>
    <p class="auth-subtitle">Trở thành thành viên để đặt chuyến và phòng nghỉ tiện lợi</p>
</div>

<form action="<?= $appUrl ?>/auth/register" method="POST">
    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

    <div class="form-group mb-1">
        <label for="full_name">Họ và tên <span style="color:var(--danger)">*</span></label>
        <input type="text" 
               id="full_name" 
               name="full_name" 
               class="form-control <?= isset($errors['full_name']) ? 'is-invalid' : '' ?>" 
               placeholder="Nguyễn Văn A" 
               value="<?= Helper::e($old['full_name'] ?? '') ?>" 
               required>
        <?php if (isset($errors['full_name'])): ?>
            <div class="form-error"><?= $errors['full_name'] ?></div>
        <?php endif; ?>
    </div>

    <div class="grid grid-2 mb-1" style="gap:var(--space-sm);">
        <div class="form-group">
            <label for="username">Tên đăng nhập <span style="color:var(--danger)">*</span></label>
            <input type="text" 
                   id="username" 
                   name="username" 
                   class="form-control <?= isset($errors['username']) ? 'is-invalid' : '' ?>" 
                   placeholder="nguyenvana" 
                   value="<?= Helper::e($old['username'] ?? '') ?>" 
                   required>
            <?php if (isset($errors['username'])): ?>
                <div class="form-error"><?= $errors['username'] ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="phone">Số điện thoại <span style="color:var(--danger)">*</span></label>
            <input type="tel" 
                   id="phone" 
                   name="phone" 
                   class="form-control <?= isset($errors['phone']) ? 'is-invalid' : '' ?>" 
                   placeholder="0901234567" 
                   value="<?= Helper::e($old['phone'] ?? '') ?>" 
                   required>
            <?php if (isset($errors['phone'])): ?>
                <div class="form-error"><?= $errors['phone'] ?></div>
            <?php endif; ?>
        </div>
    </div>

    <div class="form-group mb-1">
        <label for="email">Email <span style="color:var(--danger)">*</span></label>
        <input type="email" 
               id="email" 
               name="email" 
               class="form-control <?= isset($errors['email']) ? 'is-invalid' : '' ?>" 
               placeholder="vana@example.com" 
               value="<?= Helper::e($old['email'] ?? '') ?>" 
               required>
        <?php if (isset($errors['email'])): ?>
            <div class="form-error"><?= $errors['email'] ?></div>
        <?php endif; ?>
    </div>

    <div class="grid grid-2 mb-1" style="gap:var(--space-sm);">
        <div class="form-group">
            <label for="password">Mật khẩu <span style="color:var(--danger)">*</span></label>
            <div style="position:relative;">
                <input type="password" 
                       id="password" 
                       name="password" 
                       class="form-control <?= isset($errors['password']) ? 'is-invalid' : '' ?>" 
                       placeholder="Ít nhất 6 ký tự" 
                       required>
                <button type="button" class="password-toggle" onclick="togglePassword('password', this)">
                    <i data-lucide="eye" style="width:16px;height:16px"></i>
                </button>
            </div>
            <?php if (isset($errors['password'])): ?>
                <div class="form-error"><?= $errors['password'] ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="password_confirmation">Xác nhận MK <span style="color:var(--danger)">*</span></label>
            <div style="position:relative;">
                <input type="password" 
                       id="password_confirmation" 
                       name="password_confirmation" 
                       class="form-control" 
                       placeholder="Nhập lại mật khẩu" 
                       required>
                <button type="button" class="password-toggle" onclick="togglePassword('password_confirmation', this)">
                    <i data-lucide="eye" style="width:16px;height:16px"></i>
                </button>
            </div>
        </div>
    </div>

    <button type="submit" class="btn btn-primary btn-full btn-lg mt-1">
        <i data-lucide="user-plus" style="width:18px;height:18px"></i> Tạo tài khoản
    </button>
</form>

<div style="text-align:center;margin-top:var(--space-lg);font-size:0.9rem;color:var(--gray-600);">
    Đã có tài khoản? <a href="<?= $appUrl ?>/auth/login" style="font-weight:700;">Đăng nhập</a>
    <div style="margin-top:6px;">
        Đối tác cung cấp tour/khách sạn? <a href="<?= $appUrl ?>/auth/register-partner" style="color:var(--secondary);font-weight:600;">Đăng ký Đối tác</a>
    </div>
</div>
