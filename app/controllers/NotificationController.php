<?php
/**
 * TravelGo - Notification Controller
 * 
 * Cung cấp API và giao diện quản lý Thông báo In-App cho người dùng (Khách hàng, Đối tác, Nhân viên, Admin).
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Models\NotificationModel;

class NotificationController extends Controller
{
    private NotificationModel $notifModel;

    public function __construct()
    {
        parent::__construct();
        $this->notifModel = new NotificationModel();
    }

    /**
     * Trang xem toàn bộ thông báo
     */
    public function index(): void
    {
        $this->requireAuth();
        $userId = Auth::id();

        $notifications = $this->notifModel->getForUser($userId, 50);
        $unreadCount = $this->notifModel->countUnread($userId);

        $this->view('notifications/index', [
            'pageTitle'     => 'Thông báo của tôi',
            'notifications' => $notifications,
            'unreadCount'   => $unreadCount,
        ]);
    }

    /**
     * API lấy số lượng thông báo chưa đọc
     */
    public function unreadCount(): void
    {
        if (!Auth::check()) {
            $this->json(['success' => false, 'count' => 0]);
            return;
        }

        $count = $this->notifModel->countUnread(Auth::id());
        $this->json(['success' => true, 'count' => $count]);
    }

    /**
     * API lấy danh sách thông báo mới nhất cho dropdown
     */
    public function latest(): void
    {
        if (!Auth::check()) {
            $this->json(['success' => false, 'notifications' => []]);
            return;
        }

        $list = $this->notifModel->getForUser(Auth::id(), 10);
        $this->json([
            'success'       => true,
            'unread_count'  => $this->notifModel->countUnread(Auth::id()),
            'notifications' => $list,
        ]);
    }

    /**
     * Đánh dấu 1 thông báo là đã đọc
     */
    public function markRead(): void
    {
        if (!Auth::check()) {
            $this->json(['success' => false, 'message' => 'Unauthorized'], 401);
            return;
        }

        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $this->notifModel->markAsRead($id, Auth::id());
        }

        $this->json(['success' => true]);
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    public function markAllRead(): void
    {
        if (!Auth::check()) {
            $this->json(['success' => false, 'message' => 'Unauthorized'], 401);
            return;
        }

        $this->notifModel->markAllAsRead(Auth::id());
        $this->json(['success' => true]);
    }
}
