<?php
use App\Core\Helper;
use App\Core\Auth;
?>

<div class="container section" style="padding-top:calc(var(--header-height) + var(--space-xl));">
    <div class="grid" style="grid-template-columns: 320px 1fr; gap: var(--space-xl); align-items: start;">
        
        <!-- ==================== LEFT COLUMN: USER CARD ==================== -->
        <div class="card" style="padding:var(--space-xl); text-align:center;">
            <div style="width:96px; height:96px; margin:0 auto var(--space-md); border-radius:var(--radius-full); background:linear-gradient(135deg, var(--primary), var(--accent)); color:white; display:flex; align-items:center; justify-content:center; font-size:2.5rem; font-weight:800; box-shadow:var(--shadow-md);">
                <?php if ($user->avatar): ?>
                    <img src="<?= $appUrl ?>/<?= $user->avatar ?>" alt="Avatar" style="width:100%;height:100%;border-radius:var(--radius-full);object-fit:cover;">
                <?php else: ?>
                    <?= mb_strtoupper(mb_substr($user->full_name, 0, 1)) ?>
                <?php endif; ?>
            </div>

            <h3 style="font-size:1.3rem; margin-bottom:4px;"><?= Helper::e($user->full_name) ?></h3>
            <p style="color:var(--gray-500); font-size:0.9rem; margin-bottom:var(--space-md);">@<?= Helper::e($user->username) ?></p>

            <div style="margin-bottom:var(--space-lg);">
                <?php if ($user->role === 'admin'): ?>
                    <span class="badge badge-danger"><i data-lucide="shield" style="width:12px;height:12px"></i> Quản trị viên (Admin)</span>
                <?php elseif ($user->role === 'employee'): ?>
                    <span class="badge badge-warning"><i data-lucide="briefcase" style="width:12px;height:12px"></i> Nhân viên hệ thống</span>
                <?php elseif ($user->role === 'partner'): ?>
                    <span class="badge badge-primary"><i data-lucide="handshake" style="width:12px;height:12px"></i> Đối tác cung cấp</span>
                <?php else: ?>
                    <span class="badge badge-success"><i data-lucide="user" style="width:12px;height:12px"></i> Khách hàng</span>
                <?php endif; ?>
            </div>

            <div style="border-top:1px solid var(--gray-100); padding-top:var(--space-md); text-align:left; font-size:0.88rem; color:var(--gray-600);">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>Email:</span>
                    <strong style="color:var(--gray-800);"><?= Helper::e($user->email) ?></strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>Điện thoại:</span>
                    <strong style="color:var(--gray-800);"><?= Helper::e($user->phone ?? 'Chưa cập nhật') ?></strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>Ngày tham gia:</span>
                    <strong style="color:var(--gray-800);"><?= Helper::formatDate($user->created_at) ?></strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span>Lần cuối login:</span>
                    <strong style="color:var(--gray-800);"><?= $user->last_login_at ? Helper::formatDateTime($user->last_login_at) : 'Chưa ghi nhận' ?></strong>
                </div>
            </div>
        </div>

        <!-- ==================== RIGHT COLUMN: SETTINGS TABS ==================== -->
        <div class="card" style="padding:var(--space-2xl);">
            
            <!-- Tab Buttons -->
            <div style="display:flex; gap:var(--space-sm); border-bottom:2px solid var(--gray-100); padding-bottom:var(--space-md); margin-bottom:var(--space-xl);">
                <button type="button" class="btn <?= ($activeTab ?? 'profile') === 'profile' ? 'btn-primary' : 'btn-ghost' ?>" onclick="switchProfileTab('tab-profile', this)">
                    <i data-lucide="user" style="width:16px;height:16px"></i> Thông tin cá nhân
                </button>
                <button type="button" class="btn <?= ($activeTab ?? 'profile') === 'security' ? 'btn-primary' : 'btn-ghost' ?>" onclick="switchProfileTab('tab-security', this)">
                    <i data-lucide="lock" style="width:16px;height:16px"></i> Đổi mật khẩu
                </button>
                <?php if ($partnerInfo): ?>
                    <button type="button" class="btn <?= ($activeTab ?? 'profile') === 'partner' ? 'btn-primary' : 'btn-ghost' ?>" onclick="switchProfileTab('tab-partner', this)">
                        <i data-lucide="building" style="width:16px;height:16px"></i> Hồ sơ Đối tác
                    </button>
                <?php endif; ?>
            </div>

            <!-- Tab 1: Profile Info -->
            <div id="tab-profile" style="display: <?= ($activeTab ?? 'profile') === 'profile' ? 'block' : 'none' ?>;">
                <h4 style="margin-bottom:var(--space-lg);">Cập nhật thông tin cơ bản</h4>

                <form action="<?= $appUrl ?>/auth/profile" method="POST">
                    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                    <input type="hidden" name="action_type" value="profile">

                    <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                        <div class="form-group">
                            <label>Tên đăng nhập</label>
                            <input type="text" class="form-control" value="<?= Helper::e($user->username) ?>" disabled style="background:var(--gray-100); cursor:not-allowed;">
                            <small class="text-muted">Tên đăng nhập không thể thay đổi</small>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-control" value="<?= Helper::e($user->email) ?>" disabled style="background:var(--gray-100); cursor:not-allowed;">
                            <small class="text-muted">Email liên hệ tài khoản chính</small>
                        </div>
                    </div>

                    <div class="grid grid-2 mb-2" style="gap:var(--space-md);">
                        <div class="form-group">
                            <label for="full_name">Họ và tên <span style="color:var(--danger)">*</span></label>
                            <input type="text" id="full_name" name="full_name" class="form-control <?= isset($errors['full_name']) ? 'is-invalid' : '' ?>" value="<?= Helper::e($old['full_name'] ?? $user->full_name) ?>" required>
                            <?php if (isset($errors['full_name'])): ?>
                                <div class="form-error"><?= $errors['full_name'] ?></div>
                            <?php endif; ?>
                        </div>

                        <div class="form-group">
                            <label for="phone">Số điện thoại <span style="color:var(--danger)">*</span></label>
                            <input type="tel" id="phone" name="phone" class="form-control <?= isset($errors['phone']) ? 'is-invalid' : '' ?>" value="<?= Helper::e($old['phone'] ?? $user->phone) ?>" required>
                            <?php if (isset($errors['phone'])): ?>
                                <div class="form-error"><?= $errors['phone'] ?></div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="save" style="width:16px;height:16px"></i> Lưu thay đổi
                    </button>
                </form>
            </div>

            <!-- Tab 2: Security & Password -->
            <div id="tab-security" style="display: <?= ($activeTab ?? 'profile') === 'security' ? 'block' : 'none' ?>;">
                <h4 style="margin-bottom:var(--space-lg);">Đổi mật khẩu bảo vệ tài khoản</h4>

                <form action="<?= $appUrl ?>/auth/profile" method="POST" style="max-width:500px;">
                    <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                    <input type="hidden" name="action_type" value="change_password">

                    <div class="form-group mb-1">
                        <label for="current_password">Mật khẩu hiện tại <span style="color:var(--danger)">*</span></label>
                        <input type="password" id="current_password" name="current_password" class="form-control <?= isset($errors['current_password']) ? 'is-invalid' : '' ?>" required>
                        <?php if (isset($errors['current_password'])): ?>
                            <div class="form-error"><?= $errors['current_password'] ?></div>
                        <?php endif; ?>
                    </div>

                    <div class="form-group mb-1">
                        <label for="new_password">Mật khẩu mới <span style="color:var(--danger)">*</span></label>
                        <input type="password" id="new_password" name="new_password" class="form-control <?= isset($errors['new_password']) ? 'is-invalid' : '' ?>" placeholder="Ít nhất 6 ký tự" required>
                        <?php if (isset($errors['new_password'])): ?>
                            <div class="form-error"><?= $errors['new_password'] ?></div>
                        <?php endif; ?>
                    </div>

                    <div class="form-group mb-2">
                        <label for="new_password_confirmation">Xác nhận mật khẩu mới <span style="color:var(--danger)">*</span></label>
                        <input type="password" id="new_password_confirmation" name="new_password_confirmation" class="form-control" placeholder="Nhập lại mật khẩu mới" required>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="key" style="width:16px;height:16px"></i> Cập nhật mật khẩu
                    </button>
                </form>
            </div>

            <!-- Tab 3: Partner Info (if partner) -->
            <?php if ($partnerInfo): ?>
            <div id="tab-partner" style="display: <?= ($activeTab ?? 'profile') === 'partner' ? 'block' : 'none' ?>;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-lg);">
                    <h4>Hồ sơ Doanh nghiệp Đối tác</h4>
                    <?php if ($partnerInfo->status === 'approved' || $partnerInfo->status === 'active'): ?>
                        <span class="badge badge-success"><i data-lucide="check-circle" style="width:12px;height:12px"></i> Đã được duyệt</span>
                    <?php elseif ($partnerInfo->status === 'pending'): ?>
                        <span class="badge badge-warning"><i data-lucide="clock" style="width:12px;height:12px"></i> Đang chờ duyệt</span>
                    <?php else: ?>
                        <span class="badge badge-danger"><?= $partnerInfo->status ?></span>
                    <?php endif; ?>
                </div>

                <div class="grid grid-2 mb-1" style="gap:var(--space-md);">
                    <div class="form-group">
                        <label>Tên Doanh nghiệp / Đơn vị</label>
                        <input type="text" class="form-control" value="<?= Helper::e($partnerInfo->company_name) ?>" disabled style="background:var(--gray-50);">
                    </div>
                    <div class="form-group">
                        <label>Mã số thuế</label>
                        <input type="text" class="form-control" value="<?= Helper::e($partnerInfo->tax_code ?: 'Chưa cập nhật') ?>" disabled style="background:var(--gray-50);">
                    </div>
                </div>

                <div class="form-group mb-1">
                    <label>Địa chỉ</label>
                    <input type="text" class="form-control" value="<?= Helper::e($partnerInfo->address ?: 'Chưa cập nhật') ?>" disabled style="background:var(--gray-50);">
                </div>

                <div class="form-group mb-2">
                    <label>Mô tả dịch vụ</label>
                    <textarea class="form-control" disabled style="background:var(--gray-50);"><?= Helper::e($partnerInfo->description ?: 'Chưa có mô tả') ?></textarea>
                </div>

                <a href="<?= $appUrl ?>/partner" class="btn btn-secondary">
                    <i data-lucide="layout-dashboard" style="width:16px;height:16px"></i> Đến Bảng điều khiển Đối tác
                </a>
            </div>
            <?php endif; ?>

        </div>
    </div>
</div>

<script>
    function switchProfileTab(tabId, btn) {
        document.getElementById('tab-profile').style.display = 'none';
        document.getElementById('tab-security').style.display = 'none';
        const partnerTab = document.getElementById('tab-partner');
        if (partnerTab) partnerTab.style.display = 'none';

        document.getElementById(tabId).style.display = 'block';

        btn.parentElement.querySelectorAll('.btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
        });
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-primary');

        lucide.createIcons();
    }
</script>
