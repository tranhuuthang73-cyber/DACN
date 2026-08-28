<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
    <div>
        <h2 style="font-size:1.5rem;">Phê duyệt Khách sạn Đối tác</h2>
        <p style="color:var(--gray-500); font-size:0.9rem;">Kiểm tra thông tin khách sạn và phòng do Đối tác đăng tải</p>
    </div>
</div>

<!-- Tabs Status -->
<div style="display:flex; gap:8px; margin-bottom:var(--space-lg); border-bottom:1px solid var(--gray-200); padding-bottom:8px;">
    <a href="<?= $appUrl ?>/employee/hotels?status=pending" class="btn <?= $status === 'pending' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="clock" style="width:14px;height:14px"></i> Chờ duyệt
    </a>
    <a href="<?= $appUrl ?>/employee/hotels?status=active" class="btn <?= $status === 'active' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="check-circle" style="width:14px;height:14px"></i> Đang hoạt động
    </a>
    <a href="<?= $appUrl ?>/employee/hotels?status=suspended" class="btn <?= $status === 'suspended' ? 'btn-primary' : 'btn-ghost' ?> btn-sm">
        <i data-lucide="pause-circle" style="width:14px;height:14px"></i> Tạm ngưng
    </a>
</div>

<!-- Hotel Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Tên Khách sạn</th>
                <th>Địa điểm</th>
                <th>Đối tác</th>
                <th>Hạng sao</th>
                <th>Giờ nhận / trả</th>
                <th>Trạng thái</th>
                <th style="text-align:right;">Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($hotels)): ?>
                <?php foreach ($hotels as $hotel): ?>
                    <tr>
                        <td>
                            <strong style="font-size:0.95rem;"><?= Helper::e($hotel->name) ?></strong>
                            <div style="font-size:0.8rem; color:var(--gray-500);"><?= Helper::e($hotel->address) ?></div>
                        </td>
                        <td>
                            <span class="badge badge-secondary"><?= Helper::e($hotel->location_name) ?></span>
                        </td>
                        <td>
                            <?= Helper::e($hotel->partner_name) ?>
                        </td>
                        <td>
                            <?= str_repeat('★', $hotel->star_rating) ?> (<?= $hotel->star_rating ?> sao)
                        </td>
                        <td>
                            <?= $hotel->check_in_time ?> / <?= $hotel->check_out_time ?>
                        </td>
                        <td>
                            <?php if ($hotel->status === 'active'): ?>
                                <span class="badge badge-success">Hoạt động</span>
                            <?php elseif ($hotel->status === 'pending'): ?>
                                <span class="badge badge-warning">Chờ duyệt</span>
                            <?php else: ?>
                                <span class="badge badge-danger"><?= $hotel->status ?></span>
                            <?php endif; ?>
                        </td>
                        <td style="text-align:right;">
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <a href="<?= $appUrl ?>/hotels/detail/<?= $hotel->id ?>" target="_blank" class="btn btn-ghost btn-sm" title="Xem trang">
                                    <i data-lucide="eye" style="width:14px;height:14px"></i>
                                </a>

                                <?php if ($hotel->status === 'pending'): ?>
                                    <a href="<?= $appUrl ?>/employee/hotels/approve/<?= $hotel->id ?>" class="btn btn-success btn-sm" onclick="return confirm('Xác nhận duyệt khách sạn này?')">
                                        <i data-lucide="check" style="width:14px;height:14px"></i> Phê duyệt
                                    </a>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="7" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Không có khách sạn nào trong danh mục này.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>
