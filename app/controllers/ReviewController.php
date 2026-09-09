<?php
/**
 * TravelGo - Review Controller
 * 
 * Xử lý đánh giá và bình luận (Social Proof) cho Chuyến đi & Khách sạn.
 * - Khách hàng: Gửi đánh giá sau khi hoàn thành chuyến/phòng.
 * - Đối tác: Phản hồi bình luận của khách hàng.
 * - Admin/Nhân viên: Kiểm duyệt, ẩn/hiện đánh giá.
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Csrf;
use App\Models\ReviewModel;
use App\Services\NotificationService;

class ReviewController extends Controller
{
    private ReviewModel $reviewModel;
    private NotificationService $notificationService;

    public function __construct()
    {
        parent::__construct();
        $this->reviewModel = new ReviewModel();
        $this->notificationService = new NotificationService();
    }

    /**
     * Khách hàng gửi đánh giá mới
     */
    public function store(): void
    {
        $this->requireAuth();

        if (!Csrf::validate()) {
            Session::flash('error', 'Yêu cầu không hợp lệ (CSRF). Vui lòng thử lại.');
            $this->redirectBack();
            return;
        }

        $userId = Auth::id();
        $type = trim($_POST['reviewable_type'] ?? '');
        $id = (int)($_POST['reviewable_id'] ?? 0);
        $rating = (int)($_POST['rating'] ?? 5);
        $title = trim($_POST['title'] ?? '');
        $comment = trim($_POST['comment'] ?? '');

        if (!in_array($type, ['trip', 'hotel']) || $id <= 0) {
            Session::flash('error', 'Dữ liệu đánh giá không hợp lệ.');
            $this->redirectBack();
            return;
        }

        if ($rating < 1 || $rating > 5) {
            Session::flash('error', 'Điểm đánh giá phải từ 1 đến 5 sao.');
            $this->redirectBack();
            return;
        }

        // Kiểm tra xem khách hàng có booking hợp lệ đã thanh toán không
        $eligibleBooking = $this->reviewModel->canUserReview($userId, $type, $id);
        $bookingId = $eligibleBooking ? (int)$eligibleBooking->booking_id : null;

        // Cho phép lưu review
        try {
            $this->reviewModel->create([
                'customer_id'     => $userId,
                'booking_id'      => $bookingId,
                'reviewable_type' => $type,
                'reviewable_id'   => $id,
                'rating'          => $rating,
                'title'           => $title ?: null,
                'comment'         => $comment,
                'status'          => 'approved',
                'created_at'      => date('Y-m-d H:i:s'),
            ]);

            // Gửi thông báo cho Admin & Nhân viên
            $targetName = $type === 'trip' ? "Chuyến đi #{$id}" : "Khách sạn #{$id}";
            $this->notificationService->notifyEmployees(
                "Đánh giá mới ⭐",
                "Khách hàng vừa đánh giá {$rating} sao cho {$targetName}.",
                $type,
                $type,
                $id
            );

            Session::flash('success', 'Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn giúp dịch vụ ngày càng hoàn thiện hơn.');
        } catch (\Throwable $e) {
            Session::flash('error', 'Không thể lưu đánh giá: ' . $e->getMessage());
        }

        $redirectUrl = $type === 'trip' ? "/trips/detail/{$id}" : "/hotels/detail/{$id}";
        $this->redirect($redirectUrl);
    }

    /**
     * Đối tác phản hồi đánh giá
     */
    public function reply(): void
    {
        $this->requireAuth();
        $user = Auth::user();

        if ($user['role'] !== 'partner' && $user['role'] !== 'admin') {
            Session::flash('error', 'Chỉ Đối tác hoặc Admin mới có quyền phản hồi đánh giá.');
            $this->redirectBack();
            return;
        }

        $reviewId = (int)($_POST['review_id'] ?? 0);
        $reply = trim($_POST['partner_reply'] ?? '');

        if ($reviewId <= 0 || empty($reply)) {
            Session::flash('error', 'Nội dung phản hồi không được để trống.');
            $this->redirectBack();
            return;
        }

        $this->reviewModel->savePartnerReply($reviewId, $reply);

        // Bắn thông báo cho khách hàng nhận phản hồi
        $rev = $this->reviewModel->find($reviewId);
        if ($rev && $rev->customer_id) {
            $this->notificationService->send(
                (int)$rev->customer_id,
                "Nhà cung cấp đã phản hồi đánh giá của bạn 💬",
                "Đối tác vừa gửi lời phản hồi cho đánh giá của bạn: \"{$reply}\"",
                'system',
                'review',
                $reviewId
            );
        }

        Session::flash('success', 'Đã đăng phản hồi của nhà cung cấp thành công.');
        $this->redirectBack();
    }

    /**
     * Admin/Employee duyệt hoặc ẩn đánh giá
     */
    public function moderate(): void
    {
        $this->requireAuth();
        $user = Auth::user();

        if (!in_array($user['role'], ['admin', 'employee'])) {
            Session::flash('error', 'Bạn không có quyền kiểm duyệt đánh giá.');
            $this->redirectBack();
            return;
        }

        $reviewId = (int)($_POST['review_id'] ?? 0);
        $status = trim($_POST['status'] ?? 'approved');

        if (in_array($status, ['approved', 'hidden', 'pending'])) {
            $this->reviewModel->setStatus($reviewId, $status);
            Session::flash('success', "Đã cập nhật trạng thái đánh giá thành: {$status}.");
        }

        $this->redirectBack();
    }

    /**
     * Quay lại trang trước
     */
    private function redirectBack(): void
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? '/';
        $this->redirect($referer);
    }
}
