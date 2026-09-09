<?php
/**
 * TravelGo - Payment Service
 * Xử lý thanh toán trực tuyến qua VNPay / MoMo (hỗ trợ cả môi trường thật và Mock)
 */

namespace App\Services;

use App\Core\Database;
use App\Models\OrderModel;
use App\Models\BookingModel;
use Exception;

class PaymentService
{
    private Database $db;
    private OrderModel $orderModel;
    private BookingModel $bookingModel;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->orderModel = new OrderModel();
        $this->bookingModel = new BookingModel();
    }

    /**
     * Xử lý xác nhận thanh toán thành công (Mock / Gateway Callback)
     */
    public function processSuccessfulPayment(string $orderCode, string $method = 'vnpay'): object
    {
        $order = $this->orderModel->findByCode($orderCode);
        if (!$order) {
            throw new Exception("Đơn hàng #{$orderCode} không tồn tại.");
        }

        if ($order->status === 'paid' || $order->status === 'completed') {
            return $order;
        }

        // Kiểm tra xem đơn hàng có bị hết hạn 15 phút chưa
        if (strtotime($order->hold_expires_at) < time() && $order->status === 'holding') {
            throw new Exception("Thời gian giữ chỗ 15 phút cho đơn hàng này đã hết hạn.");
        }

        $this->db->beginTransaction();
        try {
            $transCode = strtoupper($method) . '-' . date('YmdHis') . '-' . rand(1000, 9999);

            // 1. Tạo bản ghi payment
            $paymentId = $this->db->insert(
                "INSERT INTO payments (order_id, payment_method, transaction_code, amount, status, paid_at, ip_address)
                 VALUES (?, ?, ?, ?, 'success', NOW(), ?)",
                [
                    $order->id,
                    $method,
                    $transCode,
                    $order->final_amount,
                    $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
                ]
            );

            // 2. Cập nhật Order sang paid
            $this->orderModel->update($order->id, [
                'status'         => 'paid',
                'payment_method' => $method,
                'paid_at'        => date('Y-m-d H:i:s'),
            ]);

            // 3. Cập nhật tất cả Bookings thuộc order sang paid
            $this->db->execute(
                "UPDATE bookings SET status = 'paid' WHERE order_id = ?",
                [$order->id]
            );

            // 4. Tạo thông báo cho khách hàng
            $this->db->insert(
                "INSERT INTO notifications (user_id, title, content, type, reference_id, is_read)
                 VALUES (?, ?, ?, 'payment_success', ?, 0)",
                [
                    $order->user_id,
                    "Thanh toán thành công đơn hàng #{$order->order_code}",
                    "Bạn đã thanh toán thành công " . number_format($order->final_amount) . "₫ qua cổng {$method}. Vé điện tử đã sẵn sàng!",
                    $order->id
                ]
            );

            $this->db->commit();

            return (object)[
                'order'            => $this->orderModel->find($order->id),
                'payment_id'       => $paymentId,
                'transaction_code' => $transCode,
            ];

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
}
