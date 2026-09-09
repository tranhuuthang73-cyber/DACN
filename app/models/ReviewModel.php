<?php
/**
 * TravelGo - Review Model
 * 
 * Quản lý đánh giá và xếp hạng (Social Proof) cho Chuyến đi & Khách sạn.
 * Hỗ trợ tính điểm trung bình, phân bổ số sao, và phản hồi từ Đối tác.
 */

namespace App\Models;

use App\Core\Model;

class ReviewModel extends Model
{
    protected string $table = 'reviews';

    public function __construct()
    {
        parent::__construct();
        $this->ensureColumnsExist();
    }

    /**
     * Tự động bảo đảm các cột mở rộng (phản hồi đối tác, trạng thái duyệt) tồn tại trong bảng
     */
    private function ensureColumnsExist(): void
    {
        try {
            // Kiểm tra và thêm cột nếu chưa có (MySQL)
            $checkCol = $this->db->fetchOne("SHOW COLUMNS FROM {$this->table} LIKE 'partner_reply'");
            if (!$checkCol) {
                $this->db->query("ALTER TABLE {$this->table} ADD COLUMN partner_reply TEXT DEFAULT NULL AFTER comment");
                $this->db->query("ALTER TABLE {$this->table} ADD COLUMN partner_replied_at DATETIME DEFAULT NULL AFTER partner_reply");
                $this->db->query("ALTER TABLE {$this->table} ADD COLUMN status ENUM('approved', 'pending', 'hidden') NOT NULL DEFAULT 'approved' AFTER partner_replied_at");
            }
        } catch (\Throwable $e) {
            // Bỏ qua nếu bảng chưa tạo hoặc quyền hạn chế
        }
    }

    /**
     * Lấy danh sách đánh giá của một Chuyến đi hoặc Khách sạn
     */
    public function getReviewsFor(string $type, int $id, string $status = 'approved'): array
    {
        $sql = "
            SELECT r.*, 
                   u.full_name AS customer_name,
                   u.avatar AS customer_avatar
            FROM {$this->table} r
            JOIN users u ON r.customer_id = u.id
            WHERE r.reviewable_type = ? 
              AND r.reviewable_id = ?
              AND (r.status = ? OR r.status IS NULL)
            ORDER BY r.created_at DESC
        ";
        return $this->db->fetchAll($sql, [$type, $id, $status]);
    }

    /**
     * Tính điểm trung bình và phân bổ số sao
     */
    public function getRatingSummary(string $type, int $id): array
    {
        $sql = "
            SELECT 
                COUNT(*) AS total_reviews,
                AVG(rating) AS average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS stars_5,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS stars_4,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS stars_3,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS stars_2,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS stars_1
            FROM {$this->table}
            WHERE reviewable_type = ? 
              AND reviewable_id = ?
              AND (status = 'approved' OR status IS NULL)
        ";
        $row = $this->db->fetchOne($sql, [$type, $id]);

        $total = $row ? (int)$row->total_reviews : 0;
        $avg = ($row && $row->average_rating !== null) ? round((float)$row->average_rating, 1) : 5.0;

        $stars = [
            5 => $row ? (int)$row->stars_5 : 0,
            4 => $row ? (int)$row->stars_4 : 0,
            3 => $row ? (int)$row->stars_3 : 0,
            2 => $row ? (int)$row->stars_2 : 0,
            1 => $row ? (int)$row->stars_1 : 0,
        ];

        $percentages = [];
        foreach ($stars as $star => $count) {
            $percentages[$star] = $total > 0 ? round(($count / $total) * 100) : 0;
        }

        return [
            'total'       => $total,
            'average'     => $avg,
            'stars'       => $stars,
            'percentages' => $percentages,
        ];
    }

    /**
     * Kiểm tra khách hàng có booking đủ điều kiện đánh giá không
     */
    public function canUserReview(int $userId, string $type, int $id): ?object
    {
        $sql = "
            SELECT b.id AS booking_id
            FROM bookings b
            WHERE b.customer_id = ?
              AND b.bookable_type = ?
              AND b.bookable_id = ?
              AND b.status IN ('paid', 'confirmed', 'completed')
              AND b.id NOT IN (
                  SELECT booking_id FROM {$this->table} WHERE booking_id IS NOT NULL
              )
            ORDER BY b.created_at DESC
            LIMIT 1
        ";
        return $this->db->fetchOne($sql, [$userId, $type, $id]);
    }

    /**
     * Lưu phản hồi từ Đối tác
     */
    public function savePartnerReply(int $reviewId, string $reply): bool
    {
        return $this->update($reviewId, [
            'partner_reply'      => $reply,
            'partner_replied_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Thay đổi trạng thái duyệt (Admin / Employee)
     */
    public function setStatus(int $reviewId, string $status): bool
    {
        return $this->update($reviewId, [
            'status' => $status
        ]);
    }
}
