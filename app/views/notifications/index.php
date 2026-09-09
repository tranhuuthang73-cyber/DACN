<?php
/**
 * TravelGo - Notifications Center View
 * Giao diện Trung tâm Thông báo người dùng
 */
?>

<div class="page-header" style="background: linear-gradient(135deg, #0A192F 0%, #172A45 100%); padding: 50px 0 40px; color: white; margin-bottom: 40px;">
    <div class="container" style="max-width: 1000px; margin: 0 auto; padding: 0 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div>
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 245, 212, 0.15); color: #00F5D4; padding: 6px 14px; border-radius: 30px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">
                    <i data-lucide="bell" style="width: 16px; height: 16px;"></i> TRUNG TÂM THÔNG BÁO
                </div>
                <h1 style="font-size: 2.2rem; font-weight: 900; margin: 0; color: white;">
                    Thông báo của bạn
                </h1>
                <p style="color: #94A3B8; margin-top: 6px; font-size: 1rem;">
                    Cập nhật trạng thái đặt chỗ, xác nhận thanh toán, hoàn tiền và ưu đãi mới nhất.
                </p>
            </div>

            <?php if (($unreadCount ?? 0) > 0): ?>
                <button onclick="markAllNotificationsRead()" class="btn btn-outline" style="border-color: rgba(255,255,255,0.3); color: white; font-weight: 700;">
                    ✓ Đánh dấu tất cả đã đọc (<?= (int)$unreadCount ?>)
                </button>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="container" style="max-width: 1000px; margin: 0 auto; padding: 0 20px 80px;">
    <?php if (empty($notifications)): ?>
        <div class="card" style="padding: 60px 20px; text-align: center; background: white; border-radius: 24px; box-shadow: var(--shadow-sm);">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--gray-100); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--gray-400);">
                <i data-lucide="bell-off" style="width: 36px; height: 36px;"></i>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--gray-800); margin-bottom: 8px;">
                Chưa có thông báo nào
            </h3>
            <p style="color: var(--gray-500); max-width: 420px; margin: 0 auto 24px;">
                Khi bạn đặt vé, thực hiện thanh toán hoặc có thông tin chuyến đi mới, các thông báo sẽ xuất hiện tại đây.
            </p>
            <a href="/trips" class="btn btn-primary" style="font-weight: 700;">
                Khám phá chuyến đi ngay
            </a>
        </div>
    <?php else: ?>
        <div style="display: flex; flex-direction: column; gap: 14px;">
            <?php foreach ($notifications as $n): ?>
                <?php
                    $isUnread = empty($n->is_read);
                    $icon = 'bell';
                    $iconBg = 'rgba(0,102,255,0.1)';
                    $iconColor = 'var(--primary)';

                    if ($n->type === 'booking') {
                        $icon = 'ticket';
                        $iconBg = 'rgba(16,185,129,0.12)';
                        $iconColor = '#10B981';
                    } elseif ($n->type === 'payment') {
                        $icon = 'credit-card';
                        $iconBg = 'rgba(245,158,11,0.12)';
                        $iconColor = '#F59E0B';
                    } elseif ($n->type === 'trip') {
                        $icon = 'bus';
                        $iconBg = 'rgba(139,92,246,0.12)';
                        $iconColor = '#8B5CF6';
                    } elseif ($n->type === 'hotel') {
                        $icon = 'building-2';
                        $iconBg = 'rgba(236,72,153,0.12)';
                        $iconColor = '#EC4899';
                    }
                ?>
                <div class="card notif-item" id="notif-<?= (int)$n->id ?>" style="padding: 20px 24px; background: <?= $isUnread ? '#F8FAFC' : 'white' ?>; border-radius: 18px; border: 1px solid <?= $isUnread ? '#BAE6FD' : 'var(--gray-200)' ?>; display: flex; gap: 18px; align-items: flex-start; transition: all 0.2s;">
                    <div style="width: 46px; height: 46px; border-radius: 14px; background: <?= $iconBg ?>; color: <?= $iconColor ?>; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                        <i data-lucide="<?= $icon ?>" style="width: 22px; height: 22px;"></i>
                    </div>

                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <h4 style="font-size: 1.05rem; font-weight: <?= $isUnread ? '900' : '700' ?>; color: var(--gray-900); margin: 0;">
                                <?= htmlspecialchars($n->title) ?>
                            </h4>
                            <span style="font-size: 0.8rem; color: var(--gray-400);">
                                <?= date('d/m/Y H:i', strtotime($n->created_at)) ?>
                            </span>
                        </div>

                        <p style="color: var(--gray-600); font-size: 0.92rem; line-height: 1.5; margin: 0 0 10px;">
                            <?= nl2br(htmlspecialchars($n->message)) ?>
                        </p>

                        <div style="display: flex; gap: 12px; align-items: center;">
                            <?php if ($n->reference_type === 'booking' && $n->reference_id): ?>
                                <a href="/booking/detail/<?= (int)$n->reference_id ?>" class="btn btn-primary btn-sm" style="font-size: 0.8rem; padding: 5px 14px; border-radius: 8px;">
                                    Xem chi tiết vé →
                                </a>
                            <?php elseif ($n->reference_type === 'trip' && $n->reference_id): ?>
                                <a href="/trips/detail/<?= (int)$n->reference_id ?>" class="btn btn-outline btn-sm" style="font-size: 0.8rem; padding: 5px 14px; border-radius: 8px;">
                                    Xem chuyến đi →
                                </a>
                            <?php endif; ?>

                            <?php if ($isUnread): ?>
                                <button onclick="markOneRead(<?= (int)$n->id ?>)" class="btn btn-ghost btn-sm" style="font-size: 0.8rem; color: var(--gray-500);">
                                    Đã đọc
                                </button>
                            <?php endif; ?>
                        </div>
                    </div>

                    <?php if ($isUnread): ?>
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--primary); margin-top: 6px; flex-shrink: 0;" title="Chưa đọc"></div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<script>
    function markOneRead(id) {
        fetch('/notifications/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + id
        }).then(res => res.json()).then(data => {
            if (data.success) {
                const el = document.getElementById('notif-' + id);
                if (el) {
                    el.style.background = 'white';
                    el.style.borderColor = 'var(--gray-200)';
                }
            }
        });
    }

    function markAllNotificationsRead() {
        fetch('/notifications/mark-all-read', {
            method: 'POST'
        }).then(res => res.json()).then(data => {
            if (data.success) {
                window.location.reload();
            }
        });
    }
</script>
