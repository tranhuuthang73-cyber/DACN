<?php
use App\Core\Helper;
?>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xl); flex-wrap:wrap; gap:16px;">
    <div>
        <h2 style="font-size:1.6rem; font-weight:800; display:flex; align-items:center; gap:10px;">
            <i data-lucide="rotate-ccw" style="color:#FB923C;width:26px;height:26px;"></i> Hàng đợi Xử lý Hoàn tiền Vé
        </h2>
        <p style="color:var(--gray-500); font-size:0.92rem; margin-top:4px;">
            Nhân viên kiểm duyệt các yêu cầu hủy vé của khách hàng, tự động tính tỷ lệ hoàn tiền theo chính sách bậc thang
        </p>
    </div>
    <a href="<?= $appUrl ?>/employee/bookings" class="btn btn-ghost btn-sm">
        <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Quay lại danh sách Booking
    </a>
</div>

<!-- Tabs Status -->
<div style="display:flex; gap:10px; margin-bottom:var(--space-xl);">
    <a href="<?= $appUrl ?>/employee/bookings/refunds?status=pending" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $status === 'pending' ? '#FB923C' : 'white' ?>; color:<?= $status === 'pending' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        ⏳ Đang chờ xử lý (<?= $pendingCount ?>)
    </a>
    <a href="<?= $appUrl ?>/employee/bookings/refunds?status=completed" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $status === 'completed' ? 'var(--success)' : 'white' ?>; color:<?= $status === 'completed' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        ✅ Đã phê duyệt hoàn tiền
    </a>
    <a href="<?= $appUrl ?>/employee/bookings/refunds?status=rejected" class="badge" style="padding:10px 18px; font-size:0.88rem; text-decoration:none; cursor:pointer; background:<?= $status === 'rejected' ? 'var(--danger)' : 'white' ?>; color:<?= $status === 'rejected' ? 'white' : 'var(--gray-700)' ?>; border:1px solid var(--gray-200); font-weight:700;">
        ❌ Đã từ chối
    </a>
</div>

<!-- Refunds Queue List -->
<?php if (!empty($refunds)): ?>
    <div style="display:flex; flex-direction:column; gap:20px;">
        <?php foreach ($refunds as $r): ?>
            <div class="card" style="padding:28px; background:white; border-radius:20px; box-shadow:var(--shadow-sm); border-left:5px solid <?= $r->status === 'pending' ? '#FB923C' : ($r->status === 'completed' ? 'var(--success)' : 'var(--danger)') ?>;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px;">
                    <div style="flex:1; min-width:300px;">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                            <span style="font-weight:900; color:var(--primary); font-size:1.15rem;">#RF-<?= str_pad($r->id, 5, '0', STR_PAD_LEFT) ?></span>
                            <span class="badge" style="background:<?= $r->status === 'pending' ? 'rgba(251,146,60,0.15)' : ($r->status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') ?>; color:<?= $r->status === 'pending' ? '#EA580C' : ($r->status === 'completed' ? '#059669' : '#DC2626') ?>; font-weight:800;">
                                <?= $r->status === 'pending' ? 'Chờ xét duyệt' : ($r->status === 'completed' ? 'Đã hoàn tiền' : 'Đã từ chối') ?>
                            </span>
                            <span style="font-size:0.82rem; color:var(--gray-400);">Mã Booking: <strong><?= Helper::e($r->booking_code) ?></strong></span>
                        </div>

                        <div style="font-size:1.05rem; font-weight:700; margin-bottom:6px;">
                            <?= Helper::e($r->customer_name) ?> — <span style="color:var(--gray-500); font-weight:500; font-size:0.9rem;"><?= Helper::e($r->customer_phone) ?></span>
                        </div>

                        <div style="background:var(--gray-50); padding:14px 18px; border-radius:12px; margin-bottom:12px; font-size:0.9rem;">
                            <strong>Dịch vụ:</strong> <?= $r->booking_type === 'trip' ? "🚌 Chuyến xe: {$r->departure_name} → {$r->arrival_name}" : "🏨 Khách sạn: {$r->hotel_name}" ?><br>
                            <strong>Lý do khách gửi:</strong> <em>"<?= Helper::e($r->reason) ?>"</em>
                        </div>

                        <div style="display:flex; gap:24px; font-size:0.9rem; flex-wrap:wrap;">
                            <div>Giá gốc: <strong style="color:var(--gray-900);"><?= Helper::formatMoney($r->original_amount) ?></strong></div>
                            <div>Thời gian trước khởi hành: <strong><?= $r->days_before_departure ?> ngày</strong></div>
                            <div>Mức hoàn: <span class="badge badge-primary" style="font-weight:800;"><?= number_format($r->refund_percentage, 0) ?>%</span></div>
                            <div>Số tiền hoàn thực tế: <strong style="color:var(--success); font-size:1.1rem;"><?= Helper::formatMoney($r->refund_amount) ?></strong></div>
                        </div>

                        <?php if ($r->status !== 'pending' && !empty($r->processor_name)): ?>
                            <div style="font-size:0.82rem; color:var(--gray-500); margin-top:10px;">
                                Xử lý bởi: <strong><?= Helper::e($r->processor_name) ?></strong> lúc <?= Helper::formatDateTime($r->processed_at) ?>
                                <?php if (!empty($r->rejection_reason)): ?>
                                    — Lý do: <em><?= Helper::e($r->rejection_reason) ?></em>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <?php if ($r->status === 'pending'): ?>
                        <div style="display:flex; flex-direction:column; gap:10px; min-width:180px;">
                            <a href="<?= $appUrl ?>/employee/bookings/approve-refund/<?= $r->id ?>" 
                               onclick="return confirm('Xác nhận phê duyệt hoàn tiền <?= Helper::formatMoney($r->refund_amount) ?> cho khách hàng?')"
                               class="btn btn-success" style="font-weight:800; padding:12px 20px; text-align:center;">
                                <i data-lucide="check" style="width:18px;height:18px;display:inline-block;vertical-align:middle;"></i> Phê duyệt hoàn
                            </a>
                            <button type="button" onclick="promptRejectRefund(<?= $r->id ?>)" class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--danger); font-weight:700;">
                                <i data-lucide="x" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i> Từ chối
                            </button>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php else: ?>
    <div class="card" style="padding:60px 24px; text-align:center; background:white; border-radius:20px; color:var(--gray-500);">
        <i data-lucide="check-circle" style="width:48px; height:48px; color:var(--success); margin:0 auto 12px;"></i>
        <div style="font-size:1.1rem; font-weight:700;">Không có yêu cầu hoàn tiền nào trong mục này!</div>
        <p style="font-size:0.9rem; margin-top:4px;">Tất cả các yêu cầu hủy vé của khách đã được giải quyết hoặc chưa phát sinh yêu cầu mới.</p>
    </div>
<?php endif; ?>

<script>
    function promptRejectRefund(id) {
        const reason = prompt('Nhập lý do từ chối hoàn tiền:');
        if (reason !== null) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '<?= $appUrl ?>/employee/bookings/reject-refund/' + id;
            form.innerHTML = `
                <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">
                <input type="hidden" name="reason" value="${encodeURIComponent(reason)}">
            `;
            document.body.appendChild(form);
            form.submit();
        }
    }
</script>
