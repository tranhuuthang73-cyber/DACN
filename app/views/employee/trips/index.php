<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
    <div>
        <h2 style="font-size:1.5rem;">Phê duyệt Chuyến đi</h2>
        <p style="color:var(--gray-500); font-size:0.9rem;">Nhân viên kiểm tra thông tin và phê duyệt chuyến trước khi mở bán</p>
    </div>
</div>

<!-- Tabs Status -->
<div style="display:flex; gap:8px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-200); padding-bottom:8px;">
    <a href="<?= $appUrl ?>/employee/trips?status=pending_approval" class="btn <?= $status === 'pending_approval' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="clock" style="width:14px;height:14px"></i> Chờ duyệt (Cần xử lý)
    </a>
    <a href="<?= $appUrl ?>/employee/trips?status=active" class="btn <?= $status === 'active' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="check-circle" style="width:14px;height:14px"></i> Đang mở bán
    </a>
    <a href="<?= $appUrl ?>/employee/trips?status=rejected" class="btn <?= $status === 'rejected' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="x-circle" style="width:14px;height:14px"></i> Đã từ chối
    </a>
</div>

<!-- Trip Approval Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Mã chuyến</th>
                <th>Tuyến đường</th>
                <th>Phương tiện</th>
                <th>Đối tác</th>
                <th>Thời gian đi</th>
                <th>Số chỗ</th>
                <th>Giá vé</th>
                <th>Người tạo (Admin)</th>
                <th style="text-align:right;">Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($trips)): ?>
                <?php foreach ($trips as $trip): ?>
                    <tr>
                        <td>
                            <strong><?= Helper::e($trip->trip_code) ?></strong>
                        </td>
                        <td>
                            <div style="font-weight:600;"><?= Helper::e($trip->departure_name) ?> → <?= Helper::e($trip->arrival_name) ?></div>
                        </td>
                        <td>
                            <span class="badge badge-secondary"><?= Helper::e($trip->vehicle_name) ?></span>
                        </td>
                        <td>
                            <?= Helper::e($trip->partner_name) ?>
                        </td>
                        <td>
                            <div style="font-size:0.85rem; font-weight:600; color:var(--primary);">
                                <?= Helper::formatDateTime($trip->departure_datetime) ?>
                            </div>
                        </td>
                        <td>
                            <strong><?= $trip->total_seats ?></strong> chỗ
                        </td>
                        <td>
                            <strong style="color:var(--secondary);"><?= Helper::formatMoney($trip->price_per_person) ?></strong>
                        </td>
                        <td>
                            <div style="font-size:0.85rem;"><?= Helper::e($trip->creator_name) ?></div>
                        </td>
                        <td style="text-align:right;">
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <a href="<?= $appUrl ?>/trips/detail/<?= $trip->id ?>" target="_blank" class="btn btn-ghost btn-sm" title="Xem trước">
                                    <i data-lucide="eye" style="width:14px;height:14px"></i>
                                </a>

                                <?php if ($trip->status === 'pending_approval'): ?>
                                    <a href="<?= $appUrl ?>/employee/trips/approve/<?= $trip->id ?>" class="btn btn-success btn-sm" onclick="return confirm('Xác nhận duyệt và mở bán chuyến này?')">
                                        <i data-lucide="check" style="width:14px;height:14px"></i> Duyệt mở bán
                                    </a>
                                    <button type="button" class="btn btn-danger btn-sm" onclick="promptRejectTrip(<?= $trip->id ?>)">
                                        <i data-lucide="x" style="width:14px;height:14px"></i> Từ chối
                                    </button>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="9" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Không có chuyến đi nào trong danh mục này.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<script>
    function promptRejectTrip(id) {
        const reason = prompt('Nhập lý do từ chối chuyến đi:');
        if (reason !== null) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '<?= $appUrl ?>/employee/trips/reject/' + id;
            form.innerHTML = `
                <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                <input type="hidden" name="reason" value="${encodeURIComponent(reason)}">
            `;
            document.body.appendChild(form);
            form.submit();
        }
    }
</script>
