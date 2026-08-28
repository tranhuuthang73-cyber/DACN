<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
    <div>
        <h2 style="font-size:1.5rem;">Danh sách Chuyến đi</h2>
        <p style="color:var(--gray-500); font-size:0.9rem;">Tổng số: <?= $total ?> chuyến đi trong hệ thống</p>
    </div>
    <a href="<?= $appUrl ?>/admin/trips/create" class="btn btn-primary">
        <i data-lucide="plus-circle" style="width:16px;height:16px"></i> Tạo Chuyến mới
    </a>
</div>

<!-- Filters Bar -->
<div class="card" style="padding:var(--space-md); margin-bottom:var(--space-xl);">
    <form action="<?= $appUrl ?>/admin/trips" method="GET" class="grid" style="grid-template-columns: 2fr 1fr 1fr auto; gap:var(--space-sm); align-items:end;">
        <div class="form-group">
            <label>Tìm kiếm</label>
            <input type="text" name="search" class="form-control" placeholder="Mã chuyến, tên địa điểm..." value="<?= Helper::e($filters['search'] ?? '') ?>">
        </div>

        <div class="form-group">
            <label>Trạng thái</label>
            <select name="status" class="form-control">
                <option value="">Tất cả trạng thái</option>
                <option value="pending_approval" <?= ($filters['status'] ?? '') === 'pending_approval' ? 'selected' : '' ?>>Chờ nhân viên duyệt</option>
                <option value="active" <?= ($filters['status'] ?? '') === 'active' ? 'selected' : '' ?>>Đang mở bán</option>
                <option value="draft" <?= ($filters['status'] ?? '') === 'draft' ? 'selected' : '' ?>>Bản nháp</option>
                <option value="rejected" <?= ($filters['status'] ?? '') === 'rejected' ? 'selected' : '' ?>>Bị từ chối</option>
                <option value="completed" <?= ($filters['status'] ?? '') === 'completed' ? 'selected' : '' ?>>Đã hoàn thành</option>
            </select>
        </div>

        <div class="form-group">
            <label>Đối tác</label>
            <select name="partner_id" class="form-control">
                <option value="">Tất cả đối tác</option>
                <?php foreach ($partners as $p): ?>
                    <option value="<?= $p->id ?>" <?= ($filters['partner_id'] ?? '') == $p->id ? 'selected' : '' ?>>
                        <?= Helper::e($p->company_name) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <button type="submit" class="btn btn-secondary" style="height:42px;">
            <i data-lucide="filter" style="width:16px;height:16px"></i> Lọc
        </button>
    </form>
</div>

<!-- Table of Trips -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Mã chuyến</th>
                <th>Hành trình</th>
                <th>Phương tiện</th>
                <th>Đối tác</th>
                <th>Khởi hành</th>
                <th>Chỗ còn</th>
                <th>Giá vé</th>
                <th>Trạng thái</th>
                <th style="text-align:right;">Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($trips)): ?>
                <?php foreach ($trips as $trip): ?>
                    <?php $statusMeta = Helper::tripStatus($trip->status); ?>
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
                            <div style="font-size:0.85rem;"><?= Helper::formatDateTime($trip->departure_datetime) ?></div>
                        </td>
                        <td>
                            <strong><?= $trip->available_seats ?></strong> / <?= $trip->total_seats ?>
                        </td>
                        <td>
                            <strong style="color:var(--secondary);"><?= Helper::formatMoney($trip->price_per_person) ?></strong>
                        </td>
                        <td>
                            <span class="badge badge-<?= $statusMeta['color'] ?>">
                                <?= $statusMeta['label'] ?>
                            </span>
                        </td>
                        <td style="text-align:right;">
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <a href="<?= $appUrl ?>/trips/detail/<?= $trip->id ?>" target="_blank" class="btn btn-ghost btn-sm" title="Xem chi tiết">
                                    <i data-lucide="eye" style="width:14px;height:14px"></i>
                                </a>
                                <?php if (in_array($trip->status, ['draft', 'rejected'])): ?>
                                    <a href="<?= $appUrl ?>/admin/trips/delete/<?= $trip->id ?>" class="btn btn-danger btn-sm" onclick="return confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')" title="Xóa">
                                        <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                                    </a>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="9" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Chưa có chuyến đi nào phù hợp với điều kiện tìm kiếm.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<!-- Pagination -->
<?php if ($pages > 1): ?>
    <div class="pagination">
        <?php for ($p = 1; $p <= $pages; $p++): ?>
            <a href="?<?= http_build_query(array_merge($_GET, ['page' => $p])) ?>" class="<?= $p === $current ? 'active' : '' ?>">
                <?= $p ?>
            </a>
        <?php endfor; ?>
    </div>
<?php endif; ?>
