<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl); flex-wrap:wrap; gap:16px;">
    <div>
        <h2 style="font-size:1.6rem; font-weight:800; display:flex; align-items:center; gap:10px;">
            <i data-lucide="users" style="color:var(--primary);width:26px;height:26px;"></i> Quản lý Tài khoản & Phân quyền
        </h2>
        <p style="color:var(--gray-500); font-size:0.92rem; margin-top:4px;">
            Quản trị viên kiểm soát toàn bộ người dùng, cấp quyền Nhân viên/Đối tác và quản lý trạng thái tài khoản
        </p>
    </div>
    <a href="<?= $appUrl ?>/admin/users/create" class="btn btn-primary" style="display:flex; align-items:center; gap:8px;">
        <i data-lucide="user-plus" style="width:18px;height:18px;"></i> + Tạo tài khoản mới
    </a>
</div>

<!-- Role Summary Pills -->
<div style="display:flex; gap:12px; margin-bottom:var(--space-xl); flex-wrap:wrap;">
    <a href="<?= $appUrl ?>/admin/users" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= empty($role) ? 'var(--primary)' : 'white' ?>; color:<?= empty($role) ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); box-shadow:var(--shadow-sm);">
        Tất cả (<?= $roleCounts['all'] ?>)
    </a>
    <a href="<?= $appUrl ?>/admin/users?role=admin" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $role === 'admin' ? '#38BDF8' : 'white' ?>; color:<?= $role === 'admin' ? '#0B1120' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        👑 Quản trị viên (<?= $roleCounts['admin'] ?>)
    </a>
    <a href="<?= $appUrl ?>/admin/users?role=employee" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $role === 'employee' ? '#8B5CF6' : 'white' ?>; color:<?= $role === 'employee' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        💼 Nhân viên (<?= $roleCounts['employee'] ?>)
    </a>
    <a href="<?= $appUrl ?>/admin/users?role=partner" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $role === 'partner' ? '#FB923C' : 'white' ?>; color:<?= $role === 'partner' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        🤝 Đối tác (<?= $roleCounts['partner'] ?>)
    </a>
    <a href="<?= $appUrl ?>/admin/users?role=customer" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $role === 'customer' ? 'var(--success)' : 'white' ?>; color:<?= $role === 'customer' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        🧑 Khách hàng (<?= $roleCounts['customer'] ?>)
    </a>
</div>

<!-- Search & Filter Bar -->
<div class="card" style="padding:18px 24px; background:white; border-radius:18px; margin-bottom:var(--space-xl); box-shadow:var(--shadow-sm);">
    <form method="GET" action="<?= $appUrl ?>/admin/users" style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
        <input type="hidden" name="role" value="<?= htmlspecialchars($role) ?>">
        <div style="flex:1; min-width:240px; position:relative;">
            <i data-lucide="search" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:var(--gray-400);"></i>
            <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Tìm kiếm theo Tên, Username, Email hoặc SĐT..." style="width:100%; padding:10px 16px 10px 42px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.92rem;">
        </div>

        <div style="min-width:180px;">
            <select name="status" style="width:100%; padding:10px 14px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.92rem; background:white;">
                <option value="">-- Trạng thái: Tất cả --</option>
                <option value="active" <?= $status === 'active' ? 'selected' : '' ?>>Hoạt động (Active)</option>
                <option value="banned" <?= $status === 'banned' ? 'selected' : '' ?>>Đã khóa (Banned)</option>
                <option value="inactive" <?= $status === 'inactive' ? 'selected' : '' ?>>Chưa kích hoạt</option>
            </select>
        </div>

        <button type="submit" class="btn btn-primary btn-sm" style="padding:10px 20px; font-weight:700;">
            Lọc kết quả
        </button>
        <?php if (!empty($search) || !empty($status) || !empty($role)): ?>
            <a href="<?= $appUrl ?>/admin/users" class="btn btn-ghost btn-sm" style="color:var(--gray-500);">Xóa lọc</a>
        <?php endif; ?>
    </form>
</div>

<!-- Users Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Thông tin liên hệ</th>
                <th>Vai trò (Phân quyền)</th>
                <th>Trạng thái</th>
                <th>Đơn hàng</th>
                <th>Ngày tham gia</th>
                <th style="text-align:right;">Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($users)): ?>
                <?php foreach ($users as $u): ?>
                    <tr>
                        <td style="color:var(--gray-400); font-weight:700;">#<?= $u->id ?></td>
                        <td>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg, #0066FF, #00C896); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:1.1rem; flex-shrink:0;">
                                    <?= mb_strtoupper(mb_substr($u->full_name, 0, 1)) ?>
                                </div>
                                <div>
                                    <div style="font-weight:700; color:var(--gray-900);"><?= Helper::e($u->full_name) ?></div>
                                    <div style="font-size:0.82rem; color:var(--gray-500);">@<?= Helper::e($u->username) ?></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="font-size:0.88rem; font-weight:500;"><?= Helper::e($u->email) ?></div>
                            <div style="font-size:0.82rem; color:var(--gray-500);"><?= Helper::e($u->phone ?? 'Chưa cập nhật') ?></div>
                        </td>
                        <td>
                            <!-- Form đổi nhanh quyền -->
                            <form method="POST" action="<?= $appUrl ?>/admin/users/update-role/<?= $u->id ?>" style="display:inline-block;">
                                <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                                <select name="role" onchange="this.form.submit()" style="padding:6px 12px; border-radius:10px; font-size:0.84rem; font-weight:700; cursor:pointer;
                                    background: <?= $u->role === 'admin' ? 'rgba(56,189,248,0.15)' : ($u->role === 'employee' ? 'rgba(139,92,246,0.15)' : ($u->role === 'partner' ? 'rgba(251,146,60,0.15)' : 'rgba(16,185,129,0.15)')) ?>;
                                    color: <?= $u->role === 'admin' ? '#0284C7' : ($u->role === 'employee' ? '#7C3AED' : ($u->role === 'partner' ? '#EA580C' : '#059669')) ?>;
                                    border: 1px solid currentColor;">
                                    <option value="customer" <?= $u->role === 'customer' ? 'selected' : '' ?>>🧑 Khách hàng</option>
                                    <option value="partner" <?= $u->role === 'partner' ? 'selected' : '' ?>>🤝 Đối tác</option>
                                    <option value="employee" <?= $u->role === 'employee' ? 'selected' : '' ?>>💼 Nhân viên</option>
                                    <option value="admin" <?= $u->role === 'admin' ? 'selected' : '' ?>>👑 Quản trị viên</option>
                                </select>
                            </form>
                            <?php if ($u->role === 'partner' && !empty($u->partner_company)): ?>
                                <div style="font-size:0.75rem; color:var(--gray-500); margin-top:3px;">DN: <?= Helper::e($u->partner_company) ?></div>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if ($u->status === 'active'): ?>
                                <span class="badge badge-success" style="font-size:0.78rem;">Đang hoạt động</span>
                            <?php elseif ($u->status === 'banned'): ?>
                                <span class="badge badge-danger" style="font-size:0.78rem;">Đã bị khóa</span>
                            <?php else: ?>
                                <span class="badge badge-secondary" style="font-size:0.78rem;"><?= $u->status ?></span>
                            <?php endif; ?>
                        </td>
                        <td style="font-weight:700; color:var(--primary); text-align:center;">
                            <?= $u->order_count ?? 0 ?> đơn
                        </td>
                        <td style="font-size:0.85rem; color:var(--gray-500);">
                            <?= Helper::formatDate($u->created_at) ?>
                        </td>
                        <td style="text-align:right;">
                            <div style="display:flex; justify-content:flex-end; gap:8px;">
                                <?php if ($u->id !== \App\Core\Auth::id()): ?>
                                    <a href="<?= $appUrl ?>/admin/users/toggle-status/<?= $u->id ?>" 
                                       onclick="return confirm('Bạn có chắc muốn <?= $u->status === 'banned' ? 'MỞ KHÓA' : 'KHÓA' ?> tài khoản này?')"
                                       class="btn <?= $u->status === 'banned' ? 'btn-success' : 'btn-danger' ?> btn-sm" 
                                       style="font-size:0.8rem; padding:6px 12px;" 
                                       title="<?= $u->status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản' ?>">
                                        <i data-lucide="<?= $u->status === 'banned' ? 'unlock' : 'lock' ?>" style="width:14px;height:14px;"></i>
                                        <?= $u->status === 'banned' ? 'Mở khóa' : 'Khóa' ?>
                                    </a>
                                <?php else: ?>
                                    <span style="font-size:0.8rem; color:var(--gray-400); font-style:italic;">(Bạn)</span>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="8" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Không tìm thấy người dùng nào phù hợp với bộ lọc.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<!-- Pagination -->
<?php if ($pages > 1): ?>
    <div class="pagination" style="margin-top:24px;">
        <?php for ($p = 1; $p <= $pages; $p++): ?>
            <a href="?<?= http_build_query(array_merge($_GET, ['page' => $p])) ?>" class="<?= $p === $current ? 'active' : '' ?>">
                <?= $p ?>
            </a>
        <?php endfor; ?>
    </div>
<?php endif; ?>
