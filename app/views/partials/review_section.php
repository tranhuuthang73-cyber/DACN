<?php
/**
 * TravelGo - Review & Social Proof Partial
 * Tái sử dụng cho cả Trip Detail và Hotel Detail
 * 
 * Các biến truyền vào:
 * - $reviewType: 'trip' hoặc 'hotel'
 * - $reviewId: int ID của trip hoặc hotel
 * - $reviews: array danh sách review
 * - $ratingSummary: array thống kê điểm và sao
 * - $canReview: object|null thông tin booking đủ điều kiện
 */

use App\Core\Helper;
use App\Core\Auth;
use App\Core\Csrf;

$currentUser = Auth::user();
$isPartnerOrAdmin = $currentUser && in_array($currentUser['role'], ['partner', 'admin', 'employee']);
?>

<div class="card" style="padding:var(--space-2xl); margin-top:var(--space-2xl); background:white; border-radius:var(--radius-xl); box-shadow:var(--shadow-sm);">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px; border-bottom:1px solid var(--gray-200); padding-bottom:var(--space-xl); margin-bottom:var(--space-xl);">
        <div>
            <div style="display:inline-flex; align-items:center; gap:6px; color:#F59E0B; font-weight:800; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.04em;">
                <i data-lucide="star" style="width:16px;height:16px;fill:#F59E0B;"></i> ĐÁNH GIÁ TỪ HÀNH KHÁCH
            </div>
            <h3 style="font-size:1.6rem; font-weight:900; color:var(--gray-900); margin:4px 0 0;">
                Trải nghiệm & Bình luận thực tế
            </h3>
        </div>

        <!-- Rating Summary Badge -->
        <div style="display:flex; align-items:center; gap:20px; background:var(--gray-50); padding:16px 24px; border-radius:var(--radius-lg); border:1px solid var(--gray-200);">
            <div style="text-align:center;">
                <div style="font-size:2.4rem; font-weight:900; color:var(--gray-900); line-height:1;">
                    <?= number_format($ratingSummary['average'] ?? 5.0, 1) ?>
                </div>
                <div style="color:#F59E0B; font-size:0.95rem; margin-top:4px;">
                    <?php for ($i = 1; $i <= 5; $i++): ?>
                        <i data-lucide="star" style="width:14px;height:14px;fill:<?= $i <= round($ratingSummary['average'] ?? 5) ? '#F59E0B' : 'none' ?>;color:#F59E0B;"></i>
                    <?php endfor; ?>
                </div>
            </div>
            <div style="border-left:1px solid var(--gray-300); padding-left:16px; font-size:0.88rem; color:var(--gray-600);">
                Dựa trên <strong><?= (int)($ratingSummary['total'] ?? 0) ?></strong> lượt đánh giá<br>
                <span style="color:var(--success); font-weight:700;">100% Đã xác thực đặt chỗ</span>
            </div>
        </div>
    </div>

    <!-- Star Breakdown Bars -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:var(--space-2xl); align-items:center;">
        <div style="display:flex; flex-direction:column; gap:8px;">
            <?php for ($star = 5; $star >= 1; $star--): ?>
                <?php $pct = $ratingSummary['percentages'][$star] ?? 0; ?>
                <div style="display:flex; align-items:center; gap:12px; font-size:0.85rem;">
                    <span style="min-width:45px; font-weight:700; color:var(--gray-700);"><?= $star ?> sao</span>
                    <div style="flex:1; height:8px; background:var(--gray-100); border-radius:4px; overflow:hidden;">
                        <div style="width:<?= $pct ?>%; height:100%; background:linear-gradient(90deg, #F59E0B, #FBBF24); border-radius:4px;"></div>
                    </div>
                    <span style="min-width:35px; text-align:right; color:var(--gray-500); font-weight:600;"><?= $pct ?>%</span>
                </div>
            <?php endfor; ?>
        </div>

        <!-- Callout Banner -->
        <div style="background:linear-gradient(135deg, rgba(0,102,255,0.06), rgba(0,245,212,0.08)); border:1px dashed var(--primary); padding:20px; border-radius:var(--radius-lg);">
            <div style="font-weight:800; color:var(--primary); font-size:0.95rem; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                <i data-lucide="shield-check" style="width:18px;height:18px;"></i> Tiêu chuẩn Đánh giá Xác thực
            </div>
            <p style="font-size:0.86rem; color:var(--gray-600); margin:0; line-height:1.5;">
                Mọi nhận xét trên TravelGo đều xuất phát từ hành khách đã đặt vé và hoàn thành hành trình. Đối tác có nghĩa vụ phản hồi công khai các khiếu nại.
            </p>
        </div>
    </div>

    <!-- Review Submission Form -->
    <div style="background:var(--gray-50); padding:24px; border-radius:var(--radius-lg); margin-bottom:var(--space-2xl); border:1px solid var(--gray-200);">
        <?php if (!Auth::check()): ?>
            <div style="text-align:center; padding:16px;">
                <p style="color:var(--gray-600); margin-bottom:12px; font-weight:600;">
                    Bạn đã từng trải nghiệm dịch vụ này? Đăng nhập để chia sẻ cảm nhận nhé!
                </p>
                <a href="<?= $appUrl ?>/auth/login" class="btn btn-primary btn-sm" style="font-weight:800;">
                    Đăng nhập để viết đánh giá
                </a>
            </div>
        <?php else: ?>
            <h4 style="font-size:1.15rem; font-weight:800; color:var(--gray-900); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                <i data-lucide="edit-3" style="width:18px;height:18px;color:var(--primary);"></i> Viết đánh giá của bạn
            </h4>

            <form action="<?= $appUrl ?>/reviews/store" method="POST">
                <?= Csrf::field() ?>
                <input type="hidden" name="reviewable_type" value="<?= Helper::e($reviewType) ?>">
                <input type="hidden" name="reviewable_id" value="<?= (int)$reviewId ?>">

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.88rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                        Mức độ hài lòng của bạn:
                    </label>
                    <div style="display:flex; gap:16px; align-items:center;">
                        <select name="rating" class="form-control" style="max-width:200px; font-weight:800; color:#F59E0B;">
                            <option value="5" selected>★★★★★ Tuyệt vời (5/5)</option>
                            <option value="4">★★★★☆ Rất tốt (4/5)</option>
                            <option value="3">★★★☆☆ Hài lòng (3/5)</option>
                            <option value="2">★★☆☆☆ Tạm được (2/5)</option>
                            <option value="1">★☆☆☆☆ Không hài lòng (1/5)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.88rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                        Tiêu đề tóm tắt:
                    </label>
                    <input type="text" name="title" class="form-control" placeholder="Ví dụ: Chuyến đi êm ái, tài xế đúng giờ và thân thiện..." required>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.88rem; font-weight:700; color:var(--gray-700); margin-bottom:6px;">
                        Chi tiết trải nghiệm của bạn:
                    </label>
                    <textarea name="comment" rows="3" class="form-control" placeholder="Chia sẻ thêm về chất lượng xe, ghế ngồi, thái độ phục vụ..." required></textarea>
                </div>

                <div style="text-align:right;">
                    <button type="submit" class="btn btn-primary" style="font-weight:800; padding:10px 28px;">
                        ✓ Gửi đánh giá ngay
                    </button>
                </div>
            </form>
        <?php endif; ?>
    </div>

    <!-- Reviews List -->
    <div style="display:flex; flex-direction:column; gap:20px;">
        <?php if (empty($reviews)): ?>
            <div style="text-align:center; padding:40px 20px; color:var(--gray-400);">
                <i data-lucide="message-square" style="width:40px;height:40px;margin-bottom:8px;opacity:0.5;"></i>
                <div style="font-weight:700;">Chưa có nhận xét nào cho dịch vụ này.</div>
                <div style="font-size:0.85rem;">Hãy là người đầu tiên trải nghiệm và để lại đánh giá nhé!</div>
            </div>
        <?php else: ?>
            <?php foreach ($reviews as $rev): ?>
                <div style="padding:20px; background:white; border-radius:var(--radius-lg); border:1px solid var(--gray-200); box-shadow:var(--shadow-xs);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, var(--primary), #00F5D4); color:white; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:1.05rem;">
                                <?= mb_strtoupper(mb_substr($rev->customer_name ?? 'K', 0, 1)) ?>
                            </div>
                            <div>
                                <div style="font-weight:800; color:var(--gray-900); font-size:0.98rem;">
                                    <?= Helper::e($rev->customer_name ?? 'Khách hàng ẩn danh') ?>
                                    <span class="badge badge-success" style="font-size:0.7rem; padding:2px 8px; margin-left:6px;">✓ Đã trải nghiệm</span>
                                </div>
                                <div style="font-size:0.8rem; color:var(--gray-400);">
                                    <?= date('d/m/Y', strtotime($rev->created_at)) ?>
                                </div>
                            </div>
                        </div>

                        <!-- Star Rating -->
                        <div style="color:#F59E0B; font-size:0.95rem;">
                            <?php for ($i = 1; $i <= 5; $i++): ?>
                                <i data-lucide="star" style="width:15px;height:15px;fill:<?= $i <= (int)$rev->rating ? '#F59E0B' : 'none' ?>;color:#F59E0B;"></i>
                            <?php endfor; ?>
                        </div>
                    </div>

                    <?php if (!empty($rev->title)): ?>
                        <div style="font-weight:800; font-size:1rem; color:var(--gray-900); margin-bottom:6px;">
                            <?= Helper::e($rev->title) ?>
                        </div>
                    <?php endif; ?>

                    <p style="color:var(--gray-700); font-size:0.92rem; line-height:1.6; margin:0 0 12px;">
                        <?= nl2br(Helper::e($rev->comment)) ?>
                    </p>

                    <!-- Partner Reply (if any) -->
                    <?php if (!empty($rev->partner_reply)): ?>
                        <div style="background:#F0FDF4; border-left:4px solid var(--success); padding:14px 18px; border-radius:0 12px 12px 0; margin-top:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <strong style="font-size:0.85rem; color:#166534; display:flex; align-items:center; gap:6px;">
                                    <i data-lucide="message-circle" style="width:14px;height:14px;"></i> Phản hồi từ Nhà cung cấp
                                </strong>
                                <?php if (!empty($rev->partner_replied_at)): ?>
                                    <span style="font-size:0.75rem; color:#15803D;">
                                        <?= date('d/m/Y H:i', strtotime($rev->partner_replied_at)) ?>
                                    </span>
                                <?php endif; ?>
                            </div>
                            <p style="font-size:0.88rem; color:#14532D; margin:0; line-height:1.5;">
                                <?= nl2br(Helper::e($rev->partner_reply)) ?>
                            </p>
                        </div>
                    <?php elseif ($isPartnerOrAdmin): ?>
                        <!-- Partner Reply Form for authorized users -->
                        <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--gray-200);">
                            <details style="font-size:0.86rem;">
                                <summary style="color:var(--primary); font-weight:700; cursor:pointer;">
                                    💬 Trả lời đánh giá này với tư cách Nhà cung cấp...
                                </summary>
                                <form action="<?= $appUrl ?>/reviews/reply" method="POST" style="margin-top:10px;">
                                    <input type="hidden" name="review_id" value="<?= (int)$rev->id ?>">
                                    <textarea name="partner_reply" rows="2" class="form-control" placeholder="Nhập lời cảm ơn hoặc giải đáp của đơn vị..." style="font-size:0.86rem; margin-bottom:8px;" required></textarea>
                                    <div style="text-align:right;">
                                        <button type="submit" class="btn btn-primary btn-sm" style="font-weight:700;">
                                            Gửi phản hồi
                                        </button>
                                    </div>
                                </form>
                            </details>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
