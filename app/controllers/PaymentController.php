<?php
/**
 * TravelGo - Payment Controller
 * Quản lý quy trình Thanh toán Trực tuyến (VNPay & MoMo)
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Database;
use App\Services\PaymentService;
use App\Models\OrderModel;
use App\Models\BookingModel;
use Exception;

class PaymentController extends Controller
{
    private PaymentService $paymentService;
    private OrderModel $orderModel;
    private BookingModel $bookingModel;

    public function __construct()
    {
        parent::__construct();
        $this->paymentService = new PaymentService();
        $this->orderModel = new OrderModel();
        $this->bookingModel = new BookingModel();
    }

    /**
     * Bước 1: Chọn cổng thanh toán (VNPay / MoMo)
     */
    public function checkout(string $orderCode = ''): void
    {
        $this->requireAuth();
        $order = $this->orderModel->findByCode($orderCode);

        if (!$order || ($order->user_id !== Auth::id() && !Auth::isStaff())) {
            Session::flash('error', 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.');
            $this->redirect('/');
            return;
        }

        if ($order->status === 'paid' || $order->status === 'completed') {
            $this->redirect('/payment/success/' . $orderCode);
            return;
        }

        // Kiểm tra thời gian giữ chỗ 15 phút
        $expiresAt = strtotime($order->hold_expires_at);
        $remainingSeconds = max(0, $expiresAt - time());

        if ($remainingSeconds <= 0 && $order->status === 'holding') {
            Session::flash('error', 'Đơn hàng đã quá thời gian giữ chỗ 15 phút và đã bị hủy tự động.');
            $this->redirect('/cart');
            return;
        }

        $db = Database::getInstance();
        $bookings = $db->fetchAll(
            "SELECT b.*, t.trip_code, dl.name as departure_name, al.name as arrival_name,
                    h.name as hotel_name, rt.name as room_name
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN locations dl ON t.departure_location_id = dl.id
             LEFT JOIN locations al ON t.arrival_location_id = al.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             LEFT JOIN room_types rt ON b.room_type_id = rt.id
             WHERE b.order_id = ?",
            [$order->id]
        );

        $this->view('payment/index', [
            'pageTitle'        => 'Thanh toán đơn hàng #' . $order->order_code,
            'order'            => $order,
            'bookings'         => $bookings,
            'remainingSeconds' => $remainingSeconds,
        ]);
    }

    /**
     * Bước 2: Trang giả lập Cổng thanh toán Ngân hàng / MoMo
     */
    public function process(string $orderCode = ''): void
    {
        $this->requireAuth();
        $order = $this->orderModel->findByCode($orderCode);

        if (!$order) {
            $this->redirect('/');
            return;
        }

        $method = trim($this->input('payment_method') ?? $this->query('method', 'vnpay'));
        if (!in_array($method, ['vnpay', 'momo'])) {
            $method = 'vnpay';
        }

        $this->view('payment/process', [
            'pageTitle' => 'Cổng thanh toán ' . strtoupper($method),
            'order'     => $order,
            'method'    => $method,
        ], 'auth'); // Layout auth đơn giản tập trung vào giao dịch
    }

    /**
     * Bước 3: Xác nhận hoàn tất thanh toán
     */
    public function confirm(string $orderCode = ''): void
    {
        $this->requireAuth();
        $method = trim($this->input('payment_method') ?? $this->query('method', 'vnpay'));

        try {
            $result = $this->paymentService->processSuccessfulPayment($orderCode, $method);
            Session::flash('success', 'Thanh toán thành công! Vé điện tử của bạn đã được xuất.');
            $this->redirect('/payment/success/' . $orderCode);
        } catch (Exception $e) {
            Session::flash('error', 'Lỗi thanh toán: ' . $e->getMessage());
            $this->redirect('/payment/checkout/' . $orderCode);
        }
    }

    /**
     * Bước 4: Màn hình kết quả Thanh toán thành công & Xuất Vé E-Ticket
     */
    public function success(string $orderCode = ''): void
    {
        $this->requireAuth();
        $order = $this->orderModel->findByCode($orderCode);

        if (!$order) {
            $this->redirect('/');
            return;
        }

        $db = Database::getInstance();
        $payment = $db->fetchOne(
            "SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1",
            [$order->id]
        );

        $bookings = $db->fetchAll(
            "SELECT b.*, t.trip_code, dl.name as departure_name, al.name as arrival_name, t.departure_datetime,
                    h.name as hotel_name, rt.name as room_name
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN locations dl ON t.departure_location_id = dl.id
             LEFT JOIN locations al ON t.arrival_location_id = al.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             LEFT JOIN room_types rt ON b.room_type_id = rt.id
             WHERE b.order_id = ?",
            [$order->id]
        );

        $this->view('payment/success', [
            'pageTitle' => 'Thanh toán Thành công',
            'order'     => $order,
            'payment'   => $payment,
            'bookings'  => $bookings,
        ]);
    }
}
