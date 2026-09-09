<?php
/**
 * TravelGo - Coupon Controller
 * 
 * Cung cấp API kiểm tra và áp dụng mã khuyến mãi (Coupons) trong Giỏ hàng & Thanh toán.
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Core\Auth;
use App\Models\CouponModel;

class CouponController extends Controller
{
    private CouponModel $couponModel;

    public function __construct()
    {
        parent::__construct();
        $this->couponModel = new CouponModel();
    }

    /**
     * API Áp dụng mã giảm giá
     */
    public function apply(): void
    {
        $code = trim($_POST['code'] ?? '');
        $orderAmount = (float)($_POST['order_amount'] ?? 0);

        if (empty($code)) {
            $this->json([
                'success' => false,
                'message' => 'Vui lòng nhập mã giảm giá.',
            ], 400);
            return;
        }

        // Nếu không truyền order_amount thì tính từ giỏ hàng hiện tại
        if ($orderAmount <= 0) {
            $cart = Session::get('cart', []);
            foreach ($cart as $item) {
                $orderAmount += (float)($item['subtotal'] ?? 0);
            }
        }

        $userId = Auth::id() ?: null;
        $result = $this->couponModel->validateCoupon($code, $orderAmount, $userId);

        if ($result['valid']) {
            Session::set('applied_coupon', [
                'id'       => $result['coupon']->id,
                'code'     => $result['coupon']->code,
                'discount' => $result['discount'],
            ]);

            $finalAmount = max(0, $orderAmount - $result['discount']);

            $this->json([
                'success'      => true,
                'message'      => $result['message'],
                'code'         => $result['coupon']->code,
                'discount'     => $result['discount'],
                'final_amount' => $finalAmount,
            ]);
        } else {
            Session::remove('applied_coupon');
            $this->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }
    }

    /**
     * API Hủy áp dụng mã giảm giá
     */
    public function remove(): void
    {
        Session::remove('applied_coupon');
        $this->json([
            'success' => true,
            'message' => 'Đã hủy áp dụng mã giảm giá.',
        ]);
    }

    /**
     * API Gợi ý danh sách mã giảm giá khả dụng
     */
    public function available(): void
    {
        $sql = "SELECT id, code, description, discount_type, discount_value, min_order_amount FROM coupons WHERE is_active = 1 ORDER BY id DESC LIMIT 5";
        $list = (new CouponModel())->all();
        $this->json([
            'success' => true,
            'coupons' => $list,
        ]);
    }
}
