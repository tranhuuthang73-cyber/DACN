<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl);">
    <div>
        <h2 style="font-size:1.5rem;">Chuyến đi của Đơn vị</h2>
        <p style="color:var(--gray-500); font-size:0.9rem;">Các chuyến đi do Ban Quản trị hệ thống liên kết với đơn vị vận tải của bạn</p>
    </div>
</div>

<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th>Mã chuyến</th>
                <th>Tuyến đường</th>
                <th>Phương tiện</th>
                <th>Khởi hành</th>
                <th>Tổng chỗ</th>
                <th>Đã đặt</th>
                <th>Chỗ còn lại</th>
                <th>Giá vé</th>
                <th>Trạng thái</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($trips)): ?>
                <?php foreach ($trips as $trip): ?>
                    <?php $statusMeta = Helper::tripStatus($trip->status); ?>
                    <tr>
                        <td><strong><?= Helper::e($trip->trip_code) ?></strong></td>
                        <td><strong><?= Helper::e($trip->departure_name) ?> → <?= Helper::e($trip->arrival_name) ?></strong></td>
                        <td><span class="badge badge-secondary"><?= Helper::e($trip->vehicle_name) ?></span></td>
                        <td><?= Helper::formatDateTime($trip->departure_datetime) ?></td>
                        <td><?= $trip->total_seats ?></td>
                        <td><strong style="color:var(--primary);"><?= $trip->total_seats - $trip->available_seats ?></strong></td>
                        <td><strong style="color:var(--success);"><?= $trip->available_seats ?></strong></td>
                        <td><strong style="color:var(--secondary);"><?= Helper::formatMoney($trip->price_per_person) ?></strong></td>
                        <td>
                            <span class="badge badge-<?= $statusMeta['color'] ?>">
                                <?= $statusMeta['label'] ?>
                            </span>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="9" style="text-align:center; padding:var(--space-2xl); color:var(--gray-500);">
                        Chưa có chuyến đi nào được liên kết với đơn vị của bạn.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php if ($pages > 1): ?>
    <div class="pagination">
        <?php for ($p = 1; $p <= $pages; $p++): ?>
            <a href="?<?= http_build_query(array_merge($_GET, ['page' => $p])) ?>" class="<?= $p === $current ? 'active' : '' ?>">
                <?= $p ?>
            </a>
        <?php endfor; ?>
    </div>
<?php endif; ?>
