<?php
use App\Core\Helper;
?>

<div style="text-align:center;margin-bottom:var(--space-lg);">
    <span class="badge badge-warning" style="margin-bottom:8px;">Dành cho Doanh nghiệp & Nhà xe & Khách sạn</span>
    <h2 class="auth-title">Đăng ký Đối tác</h2>
    <p class="auth-subtitle">Mở rộng kinh doanh và kết nối hàng ngàn khách du lịch</p>
</div>

<form action="<?= $appUrl ?>/auth/register-partner" method="POST">
    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

    <div class="form-group mb-1">
        <label for="company_name">Tên Công ty / Đơn vị cung cấp <span style="color:var(--danger)">*</span></label>
        <input type="text" 
               id="company_name" 
               name="company_name" 
               class="form-control <?= isset($errors['company_name']) ? 'is-invalid' : '' ?>" 
               placeholder="Công ty TNHH Du lịch Sài Gòn / Havan Hotel..." 
               value="<?= Helper::e($old['company_name'] ?? '') ?>" 
               required>
        <?php if (isset($errors['company_name'])): ?>
            <div class="form-error"><?= $errors['company_name'] ?></div>
        <?php endif; ?>
    </div>

    <div class="grid grid-2 mb-1" style="gap:var(--space-sm);">
        <div class="form-group">
            <label for="full_name">Người đại diện liên hệ <span style="color:var(--danger)">*</span></label>
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

        <div class="form-group">
            <label for="phone">Số điện thoại liên hệ <span style="color:var(--danger)">*</span></label>
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

    <div class="grid grid-2 mb-1" style="gap:var(--space-sm);">
        <div class="form-group">
            <label for="email">Email doanh nghiệp <span style="color:var(--danger)">*</span></label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   class="form-control <?= isset($errors['email']) ? 'is-invalid' : '' ?>" 
                   placeholder="contact@company.com" 
                   value="<?= Helper::e($old['email'] ?? '') ?>" 
                   required>
            <?php if (isset($errors['email'])): ?>
                <div class="form-error"><?= $errors['email'] ?></div>
            <?php endif; ?>
        </div>

        <div class="form-group">
            <label for="tax_code">Mã số thuế</label>
            <input type="text" 
                   id="tax_code" 
                   name="tax_code" 
                   class="form-control <?= isset($errors['tax_code']) ? 'is-invalid' : '' ?>" 
                   placeholder="0301234567" 
                   value="<?= Helper::e($old['tax_code'] ?? '') ?>">
            <?php if (isset($errors['tax_code'])): ?>
                <div class="form-error"><?= $errors['tax_code'] ?></div>
            <?php endif; ?>
        </div>
    </div>

    <div class="form-group mb-1">
        <label for="address">Địa chỉ trụ sở / Văn phòng <span style="color:var(--danger)">*</span></label>
        <input type="text" 
               id="address" 
               name="address" 
               class="form-control <?= isset($errors['address']) ? 'is-invalid' : '' ?>" 
               placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" 
               value="<?= Helper::e($old['address'] ?? '') ?>" 
               required>
        <?php if (isset($errors['address'])): ?>
            <div class="form-error"><?= $errors['address'] ?></div>
        <?php endif; ?>
    </div>

    <div class="form-group mb-1">
        <label for="username">Tên đăng nhập tài khoản <span style="color:var(--danger)">*</span></label>
        <input type="text" 
               id="username" 
               name="username" 
               class="form-control <?= isset($errors['username']) ? 'is-invalid' : '' ?>" 
               placeholder="dt_saigontour" 
               value="<?= Helper::e($old['username'] ?? '') ?>" 
               required>
        <?php if (isset($errors['username'])): ?>
            <div class="form-error"><?= $errors['username'] ?></div>
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

    <div style="background:var(--gray-50);padding:12px;border-radius:var(--radius-md);font-size:0.82rem;color:var(--gray-600);margin-bottom:var(--space-md);border:1px solid var(--gray-200);">
        <i data-lucide="info" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--info);"></i>
        Sau khi gửi đăng ký, Quản trị viên sẽ xét duyệt hồ sơ trong vòng 24 giờ.
    </div>

    <button type="submit" class="btn btn-secondary btn-full btn-lg">
        <i data-lucide="send" style="width:18px;height:18px"></i> Gửi hồ sơ đăng ký đối tác
    </button>
</form>

<div style="text-align:center;margin-top:var(--space-lg);font-size:0.9rem;color:var(--gray-600);">
    Đã có tài khoản đối tác? <a href="<?= $appUrl ?>/auth/login" style="font-weight:700;">Đăng nhập</a>
</div>
