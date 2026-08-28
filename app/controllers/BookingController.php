<?php
/**
 * TravelGo - Booking Controller
 * Xử lý Xác nhận đặt chỗ, Giữ chỗ 15 phút, Quản lý Booking cá nhân và Yêu cầu Hủy
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Validator;
use App\Core\Database;
use App\Services\BookingService;
use App\Models\BookingModel;
use App\Models\OrderModel;
use Exception;

class BookingController extends Controller
{
    private BookingService $bookingService;
    private BookingModel $bookingModel;
    private OrderModel $orderModel;

    public function __construct()
    {
        parent::__construct();
        $this->bookingService = new BookingService();
        $this->bookingModel = new BookingModel();
        $this->orderModel = new OrderModel();
    }

    /**
     * Trang xác nhận thông tin đặt chỗ (Checkout)
     */
    public function checkout(): void
    {
        $this->requireAuth();

        $cart = Session::get('cart', []);
        if (empty($cart)) {
            Session::flash('error', 'Giỏ hàng của bạn đang trống.');
            $this->redirect('/trips');
            return;
        }

        $totalAmount = 0;
        foreach ($cart as $item) {
            $totalAmount += (float)$item['subtotal'];
        }

        $user = (object)Auth::user();

        $this->view('booking/checkout', [
            'pageTitle'   => 'Xác nhận thông tin & Đặt chỗ',
            'cart'        => $cart,
            'totalAmount' => $totalAmount,
            'user'        => $user,
        ]);
    }

    /**
     * Xử lý xác nhận đặt chỗ & Thực hiện giữ chỗ 15 phút
     */
    public function processCheckout(): void
    {
        $this->requireAuth();
        if (!$this->validateCsrf()) return;

        $cart = Session::get('cart', []);
        if (empty($cart)) {
            Session::flash('error', 'Giỏ hàng của bạn đang trống.');
            $this->redirect('/cart');
            return;
        }

        $validator = new Validator($_POST, [
            'contact_name'  => 'required|min:2|max:100',
            'contact_phone' => 'required|phone',
            'contact_email' => 'required|email',
        ], [
            'contact_name'  => 'Họ tên người liên hệ',
            'contact_phone' => 'Số điện thoại',
            'contact_email' => 'Email',
        ]);

        if ($validator->fails()) {
            Session::flash('error', $validator->firstError());
            $this->checkout();
            return;
        }

        try {
            // Gọi BookingService để thực hiện Transaction nguyên tử với FOR UPDATE
            $orderResult = $this->bookingService->createOrderWithHold(
                Auth::id(),
                $cart,
                [
                    'contact_name'  => trim($this->input('contact_name')),
                    'contact_phone' => trim($this->input('contact_phone')),
                    'contact_email' => trim($this->input('contact_email')),
                    'notes'         => trim($this->input('notes') ?? ''),
                ]
            );

            // Xóa giỏ hàng sau khi giữ chỗ thành công
            Session::remove('cart');

            Session::flash('success', 'Giữ chỗ thành công! Vui lòng hoàn tất thanh toán trong vòng 15 phút.');
            $this->redirect('/payment/checkout/' . $orderResult->order_code);

        } catch (Exception $e) {
            Session::flash('error', $e->getMessage());
            $this->redirect('/cart');
        }
    }

    /**
     * Danh sách booking của tôi
     */
    public function myBookings(): void
    {
        $this->requireAuth();

        $status = $this->query('status', '');
        $bookings = $this->bookingModel->getMyBookings(Auth::id(), $status);

        $this->view('booking/my_bookings', [
            'pageTitle' => 'Booking của tôi',
            'bookings'  => $bookings,
            'status'    => $status,
        ]);
    }

    /**
     * Chi tiết booking / Vé điện tử
     */
    public function detail(string $code = ''): void
    {
        $this->requireAuth();

        $booking = $this->bookingModel->getDetailByCode($code);

        // Bảo mật: Chỉ chủ nhân booking hoặc Staff mới được xem
        if (!$booking || ($booking->customer_id !== Auth::id() && !Auth::isStaff())) {
            http_response_code(403);
            require dirname(__DIR__) . '/views/errors/403.php';
            exit;
        }

        $refundPreview = $this->bookingModel->calculateRefundPreview($booking);

        $this->view('booking/detail', [
            'pageTitle'     => 'Chi tiết Booking #' . $booking->booking_code,
            'booking'       => $booking,
            'refundPreview' => $refundPreview,
        ]);
    }

    /**
     * Khách hàng yêu cầu hủy booking
     */
    public function cancel(string $code = ''): void
    {
        $this->requireAuth();
        if (!$this->validateCsrf()) return;

        $booking = $this->bookingModel->getDetailByCode($code);

        if (!$booking || $booking->customer_id !== Auth::id()) {
            http_response_code(403);
            exit;
        }

        // Chỉ cho phép yêu cầu hủy với booking đã thanh toán hoặc đã xác nhận
        if (!in_array($booking->status, ['paid', 'confirmed'])) {
            Session::flash('error', 'Chỉ có thể yêu cầu hủy đối với các booking đã thanh toán hoặc đã xác nhận.');
            $this->redirect('/booking/detail/' . $code);
            return;
        }

        $reason = trim($this->input('reason') ?? 'Thay đổi kế hoạch cá nhân');
        $refundCalc = $this->bookingModel->calculateRefundPreview($booking);

        $db = Database::getInstance();
        $db->beginTransaction();

        try {
            // Cập nhật trạng thái booking sang cancel_requested
            $this->bookingModel->update($booking->id, [
                'status'              => 'cancel_requested',
                'cancellation_reason' => $reason,
                'cancelled_by'        => Auth::id(),
            ]);

            // Tìm payment liên quan
            $payment = $db->fetchOne(
                "SELECT * FROM payments WHERE order_id = ? AND status = 'success' LIMIT 1",
                [$booking->order_id]
            );

            if ($payment) {
                // Tạo record hoàn tiền chờ nhân viên xử lý
                $db->insert(
                    "INSERT INTO refunds (booking_id, payment_id, original_amount, refund_percentage, refund_amount, days_before_departure, reason, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')",
                    [
                        $booking->id,
                        $payment->id,
                        $booking->subtotal,
                        $refundCalc['percentage'],
                        $refundCalc['refund_amount'],
                        $refundCalc['days_before'],
                        $reason
                    ]
                );
            }

            $db->commit();

            Session::flash('success', "Đã gửi yêu cầu hủy booking thành công. Dự kiến tỷ lệ hoàn tiền: {$refundCalc['percentage']}%.");
            $this->redirect('/booking/detail/' . $code);

        } catch (Exception $e) {
            $db->rollback();
            Session::flash('error', 'Lỗi khi gửi yêu cầu hủy: ' . $e->getMessage());
            $this->redirect('/booking/detail/' . $code);
        }
    }
}
