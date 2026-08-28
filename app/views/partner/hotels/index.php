<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
    <div>
        <h2 style="font-size:1.5rem;">Khách sạn của Đơn vị</h2>
        <p style="color:var(--gray-500); font-size:0.9rem;">Quản lý cơ sở lưu trú và các loại phòng thuộc doanh nghiệp</p>
    </div>
    <a href="<?= $appUrl ?>/partner/hotels/create" class="btn btn-primary">
        <i data-lucide="plus-circle" style="width:16px;height:16px"></i> Đăng ký Khách sạn mới
    </a>
</div>

<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Khách sạn</th>
                <th>Địa điểm</th>
                <th>Hạng sao</th>
                <th>Số loại phòng</th>
                <th>Giá thấp nhất</th>
                <th>Trạng thái</th>
                <th style="text-align:right;">Quản lý</th>
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
                            <?= str_repeat('★', $hotel->star_rating) ?>
                        </td>
                        <td>
                            <strong><?= $hotel->room_count ?></strong> loại phòng
                        </td>
                        <td>
                            <strong style="color:var(--secondary);">
                                <?= $hotel->min_price ? Helper::formatMoney($hotel->min_price) : 'Chưa có phòng' ?>
                            </strong>
                        </td>
                        <td>
                            <?php if ($hotel->status === 'active'): ?>
                                <span class="badge badge-success">Đang hoạt động</span>
                            <?php elseif ($hotel->status === 'pending'): ?>
                                <span class="badge badge-warning">Chờ nhân viên duyệt</span>
                            <?php else: ?>
                                <span class="badge badge-danger"><?= $hotel->status ?></span>
                            <?php endif; ?>
                        </td>
                        <td style="text-align:right;">
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <a href="<?= $appUrl ?>/partner/hotels/rooms/<?= $hotel->id ?>" class="btn btn-outline btn-sm">
                                    <i data-lucide="bed" style="width:14px;height:14px"></i> Quản lý Phòng
                                </a>
                                <a href="<?= $appUrl ?>/hotels/detail/<?= $hotel->id ?>" target="_blank" class="btn btn-ghost btn-sm">
                                    <i data-lucide="eye" style="width:14px;height:14px"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="7" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Đơn vị của bạn chưa đăng ký khách sạn nào. Hãy bấm "Đăng ký Khách sạn mới" để bắt đầu.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>
