<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
    <div>
        <h2 style="font-size:1.5rem;">Quản lý & Xét duyệt Đối tác</h2>
        <p style="color:var(--gray-500); font-size:0.9rem;">Duyệt hồ sơ các công ty du lịch, nhà xe và khách sạn đăng ký liên kết</p>
    </div>
</div>

<!-- Tabs Status -->
<div style="display:flex; gap:8px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-200); padding-bottom:8px;">
    <a href="<?= $appUrl ?>/admin/partners" class="btn <?= empty($status) ? 'btn-primary' : 'btn-ghost' ?> btn-sm">Tất cả</a>
    <a href="<?= $appUrl ?>/admin/partners?status=pending" class="btn <?= $status === 'pending' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="clock" style="width:14px;height:14px"></i> Chờ duyệt
    </a>
    <a href="<?= $appUrl ?>/admin/partners?status=approved" class="btn <?= $status === 'approved' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="check-circle" style="width:14px;height:14px"></i> Đã duyệt
    </a>
    <a href="<?= $appUrl ?>/admin/partners?status=active" class="btn <?= $status === 'active' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="activity" style="width:14px;height:14px"></i> Đang hoạt động
    </a>
    <a href="<?= $appUrl ?>/admin/partners?status=suspended" class="btn <?= $status === 'suspended' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="pause-circle" style="width:14px;height:14px"></i> Tạm ngưng
    </a>
</div>

<!-- Partner List Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Tên Doanh nghiệp</th>
                <th>Người đại diện</th>
                <th>Liên hệ</th>
                <th>Mã số thuế</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th style="text-align:right;">Thao tác xét duyệt</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($partners)): ?>
                <?php foreach ($partners as $partner): ?>
                    <tr>
                        <td>
                            <strong style="color:var(--gray-900); font-size:0.95rem;"><?= Helper::e($partner->company_name) ?></strong>
                            <div style="font-size:0.8rem; color:var(--gray-500);"><?= Helper::e($partner->address ?? 'Chưa có địa chỉ') ?></div>
                        </td>
                        <td>
                            <div><?= Helper::e($partner->contact_person ?? $partner->user_full_name) ?></div>
                            <div style="font-size:0.8rem; color:var(--gray-500);">@<?= Helper::e($partner->username) ?></div>
                        </td>
                        <td>
                            <div><?= Helper::e($partner->contact_phone ?? $partner->user_phone) ?></div>
                            <div style="font-size:0.8rem; color:var(--gray-500);"><?= Helper::e($partner->contact_email ?? $partner->user_email) ?></div>
                        </td>
                        <td>
                            <?= Helper::e($partner->tax_code ?: 'N/A') ?>
                        </td>
                        <td>
                            <?= Helper::formatDate($partner->created_at) ?>
                        </td>
                        <td>
                            <?php if ($partner->status === 'approved' || $partner->status === 'active'): ?>
                                <span class="badge badge-success">Hoạt động</span>
                            <?php elseif ($partner->status === 'pending'): ?>
                                <span class="badge badge-warning">Chờ duyệt</span>
                            <?php elseif ($partner->status === 'suspended'): ?>
                                <span class="badge badge-danger">Tạm ngưng</span>
                            <?php else: ?>
                                <span class="badge badge-secondary"><?= $partner->status ?></span>
                            <?php endif; ?>
                        </td>
                        <td style="text-align:right;">
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <?php if ($partner->status === 'pending'): ?>
                                    <a href="<?= $appUrl ?>/admin/partners/approve/<?= $partner->id ?>" class="btn btn-success btn-sm" onclick="return confirm('Xác nhận duyệt hồ sơ đối tác này?')">
                                        <i data-lucide="check" style="width:14px;height:14px"></i> Duyệt
                                    </a>
                                    <button type="button" class="btn btn-danger btn-sm" onclick="promptReject(<?= $partner->id ?>)">
                                        <i data-lucide="x" style="width:14px;height:14px"></i> Từ chối
                                    </button>
                                <?php else: ?>
                                    <a href="<?= $appUrl ?>/admin/partners/toggle/<?= $partner->id ?>" class="btn btn-outline btn-sm">
                                        <?= $partner->status === 'suspended' ? 'Kích hoạt lại' : 'Tạm ngưng' ?>
                                    </a>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="7" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Không có đối tác nào trong danh mục này.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<script>
    function promptReject(id) {
        const reason = prompt('Nhập lý do từ chối hồ sơ đối tác:');
        if (reason !== null) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '<?= $appUrl ?>/admin/partners/reject/' + id;
            form.innerHTML = `
                <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                <input type="hidden" name="reason" value="${encodeURIComponent(reason)}">
            `;
            document.body.appendChild(form);
            form.submit();
        }
    }
</script>
