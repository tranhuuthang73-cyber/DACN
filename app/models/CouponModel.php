<?php
/**
 * TravelGo - Coupon Model
 * 
 * Quản lý Mã khuyến mãi, giảm giá (Vouchers / Coupons).
 * Kiểm tra điều kiện áp dụng, tính toán chiết khấu và lưu vết sử dụng.
 */

namespace App\Models;

use App\Core\Model;

class CouponModel extends Model
{
    protected string $table = 'coupons';

    public function __construct()
    {
        parent::__construct();
        $this->ensureTableExists();
    }

    /**
     * Tự động khởi tạo bảng nếu chưa có trong MySQL
     */
    private function ensureTableExists(): void
    {
        try {
            $sql = "
                CREATE TABLE IF NOT EXISTS coupons (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    code VARCHAR(50) NOT NULL UNIQUE,
                    description VARCHAR(255) DEFAULT NULL,
                    discount_type ENUM('fixed', 'percent') NOT NULL DEFAULT 'fixed',
                    discount_value DECIMAL(12,2) NOT NULL,
                    min_order_amount DECIMAL(12,2) DEFAULT 0,
                    max_discount_amount DECIMAL(12,2) DEFAULT NULL,
                    usage_limit INT DEFAULT NULL,
                    used_count INT DEFAULT 0,
                    start_date DATETIME DEFAULT NULL,
                    end_date DATETIME DEFAULT NULL,
                    is_active TINYINT(1) NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_coupons_code (code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ";
            $this->db->query($sql);

            // Bảng coupon_usages
            $sql2 = "
                CREATE TABLE IF NOT EXISTS coupon_usages (
                    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    coupon_id INT UNSIGNED NOT NULL,
                    user_id INT UNSIGNED NOT NULL,
                    order_id INT UNSIGNED DEFAULT NULL,
                    discount_applied DECIMAL(12,2) NOT NULL,
                    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_coupon_usages_coupon (coupon_id),
                    INDEX idx_coupon_usages_user (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ";
            $this->db->query($sql2);

            // Seed mặc định nếu chưa có
            $count = $this->db->fetchOne("SELECT COUNT(*) AS total FROM coupons");
            if ($count && (int)$count->total === 0) {
                $this->db->query("
                    INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, is_active)
                    VALUES 
                    ('TRAVELGO100', 'Giảm 100.000₫ cho đơn từ 300.000₫', 'fixed', 100000, 300000, 1),
                    ('SUMMER20', 'Giảm 20% tối đa 200.000₫', 'percent', 20, 500000, 1),
                    ('VIPLUXURY', 'Giảm ngay 300.000₫ cho đơn từ 1.500.000₫', 'fixed', 300000, 1500000, 1);
                ");
            }
        } catch (\Throwable $e) {
            // Bỏ qua lỗi DDL nếu user MySQL bị giới hạn quyền
        }
    }

    /**
     * Tìm coupon theo mã code
     */
    public function findByCode(string $code): ?object
    {
        $code = strtoupper(trim($code));
        $sql = "SELECT * FROM {$this->table} WHERE code = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$code]);
    }

    /**
     * Kiểm tra tính hợp lệ của mã giảm giá cho đơn hàng
     */
    public function validateCoupon(string $code, float $orderAmount, ?int $userId = null): array
    {
        $coupon = $this->findByCode($code);

        if (!$coupon) {
            return [
                'valid'    => false,
                'message'  => 'Mã giảm giá không tồn tại hoặc đã hết hạn.',
                'discount' => 0,
                'coupon'   => null,
            ];
        }

        if (empty($coupon->is_active)) {
            return [
                'valid'    => false,
                'message'  => 'Mã giảm giá này hiện đang tạm khóa.',
                'discount' => 0,
                'coupon'   => $coupon,
            ];
        }

        // Kiểm tra thời hạn
        $now = date('Y-m-d H:i:s');
        if ($coupon->start_date && $coupon->start_date > $now) {
            return [
                'valid'    => false,
                'message'  => 'Mã giảm giá chưa đến thời gian áp dụng.',
                'discount' => 0,
                'coupon'   => $coupon,
            ];
        }

        if ($coupon->end_date && $coupon->end_date < $now) {
            return [
                'valid'    => false,
                'message'  => 'Mã giảm giá đã hết hạn sử dụng.',
                'discount' => 0,
                'coupon'   => $coupon,
            ];
        }

        // Kiểm tra số lượt dùng tối đa
        if ($coupon->usage_limit !== null && (int)$coupon->used_count >= (int)$coupon->usage_limit) {
            return [
                'valid'    => false,
                'message'  => 'Mã giảm giá đã hết lượt sử dụng.',
                'discount' => 0,
                'coupon'   => $coupon,
            ];
        }

        // Kiểm tra giá trị đơn tối thiểu
        if ((float)$coupon->min_order_amount > 0 && $orderAmount < (float)$coupon->min_order_amount) {
            return [
                'valid'    => false,
                'message'  => 'Đơn hàng chưa đạt mức tối thiểu ' . number_format((float)$coupon->min_order_amount, 0, ',', '.') . '₫ để áp dụng mã.',
                'discount' => 0,
                'coupon'   => $coupon,
            ];
        }

        // Tính toán số tiền chiết khấu
        $discount = 0;
        if ($coupon->discount_type === 'percent') {
            $discount = ($orderAmount * (float)$coupon->discount_value) / 100;
            if ($coupon->max_discount_amount && $discount > (float)$coupon->max_discount_amount) {
                $discount = (float)$coupon->max_discount_amount;
            }
        } else {
            $discount = (float)$coupon->discount_value;
        }

        // Giảm không vượt quá tổng đơn hàng
        $discount = min($discount, $orderAmount);

        return [
            'valid'    => true,
            'message'  => 'Áp dụng mã giảm giá thành công! Tiết kiệm ' . number_format($discount, 0, ',', '.') . '₫',
            'discount' => $discount,
            'coupon'   => $coupon,
        ];
    }

    /**
     * Ghi nhận sử dụng mã giảm giá sau khi đơn hàng tạo/thanh toán thành công
     */
    public function recordUsage(int $couponId, int $userId, ?int $orderId, float $discount): bool
    {
        try {
            $this->db->query("
                INSERT INTO coupon_usages (coupon_id, user_id, order_id, discount_applied, used_at)
                VALUES (?, ?, ?, ?, NOW())
            ", [$couponId, $userId, $orderId, $discount]);

            $this->db->query("
                UPDATE {$this->table} SET used_count = used_count + 1 WHERE id = ?
            ", [$couponId]);

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }
}
