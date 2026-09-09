<?php
/**
 * TravelGo - Notification Model
 * 
 * Quản lý thông báo người dùng theo thời gian thực (In-App Notifications).
 */

namespace App\Models;

use App\Core\Model;

class NotificationModel extends Model
{
    protected string $table = 'notifications';

    /**
     * Lấy danh sách thông báo của người dùng
     */
    public function getForUser(int $userId, int $limit = 10, bool $unreadOnly = false): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        $params = [$userId];

        if ($unreadOnly) {
            $sql .= " AND is_read = 0";
        }

        $sql .= " ORDER BY created_at DESC LIMIT ?";
        $params[] = $limit;

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Đếm số thông báo chưa đọc của người dùng
     */
    public function countUnread(int $userId): int
    {
        $sql = "SELECT COUNT(*) AS count FROM {$this->table} WHERE user_id = ? AND is_read = 0";
        $row = $this->db->fetchOne($sql, [$userId]);
        return $row ? (int)$row->count : 0;
    }

    /**
     * Đánh dấu 1 thông báo là đã đọc
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?";
        return $this->db->query($sql, [$notificationId, $userId]);
    }

    /**
     * Đánh dấu tất cả thông báo của người dùng là đã đọc
     */
    public function markAllAsRead(int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0";
        return $this->db->query($sql, [$userId]);
    }

    /**
     * Tạo thông báo mới cho người dùng
     */
    public function createNotification(
        int $userId,
        string $title,
        string $message,
        string $type = 'system',
        ?string $refType = null,
        ?int $refId = null
    ): int {
        return $this->create([
            'user_id'        => $userId,
            'title'          => $title,
            'message'        => $message,
            'type'           => $type,
            'reference_type' => $refType,
            'reference_id'   => $refId,
            'is_read'        => 0,
            'created_at'     => date('Y-m-d H:i:s'),
        ]);
    }
}
