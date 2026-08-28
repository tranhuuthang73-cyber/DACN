<?php
/**
 * TravelGo - Booking Service
 * 
 * Xử lý logic nghiệp vụ đặt chỗ nguyên tử (Atomic Transaction):
 * - Giữ chỗ trong 15 phút
 * - Chống Race Condition bằng SELECT ... FOR UPDATE (Row-level Locking)
 * - Tạo Order tổng và các Booking chi tiết cho chuyến đi & khách sạn
 */

namespace App\Services;

use App\Core\Database;
use App\Core\Helper;
use App\Models\RoomModel;
use Exception;

class BookingService
{
    private Database $db;
    private RoomModel $roomModel;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->roomModel = new RoomModel();
    }

    /**
     * Tạo đơn hàng và giữ chỗ an toàn chống race condition
     * 
     * @param int   $customerId ID của khách hàng
     * @param array $cartItems  Danh sách item trong giỏ hàng
     * @param array $contactInfo Thông tin liên hệ (họ tên, phone, email, ghi chú)
     * @return object ['order_id' => int, 'order_code' => string, 'expires_at' => string, 'final_amount' => float]
     * @throws Exception
     */
    public function createOrderWithHold(int $customerId, array $cartItems, array $contactInfo = []): object
    {
        if (empty($cartItems)) {
            throw new Exception("Giỏ hàng đang trống, không thể tiến hành đặt chỗ.");
        }

        // Bắt đầu Transaction
        $this->db->beginTransaction();

        try {
            $orderCode = Helper::generateOrderCode();
            $holdMinutes = (int)(getenv('BOOKING_HOLD_MINUTES') ?: 15);
            $expiresAt = date('Y-m-d H:i:s', strtotime("+{$holdMinutes} minutes"));

            $totalAmount = 0;
            $processedBookings = [];

            // Duyệt từng item trong giỏ hàng để kiểm tra và giữ chỗ
            foreach ($cartItems as $item) {
                if ($item['type'] === 'trip') {
                    // ==========================================
                    // XỬ LÝ CHUYẾN ĐI (RACE CONDITION PREVENTION)
                    // ==========================================
                    $tripId = (int)$item['trip_id'];
                    $qty = (int)$item['quantity'];

                    // KHÓA DÒNG bằng SELECT ... FOR UPDATE
                    $sqlTrip = "SELECT id, trip_code, total_seats, available_seats, price_per_person, status, departure_datetime 
                                FROM trips 
                                WHERE id = ? FOR UPDATE";
                    $trip = $this->db->fetchOne($sqlTrip, [$tripId]);

                    if (!$trip) {
                        throw new Exception("Chuyến đi không tồn tại.");
                    }

                    if ($trip->status !== 'active' || strtotime($trip->departure_datetime) <= time()) {
                        throw new Exception("Chuyến đi '{$trip->trip_code}' hiện không còn mở bán.");
                    }

                    if ($trip->available_seats < $qty) {
                        throw new Exception("Rất tiếc, chuyến đi '{$trip->trip_code}' chỉ còn {$trip->available_seats} chỗ, không đủ cho {$qty} hành khách bạn yêu cầu.");
                    }

                    // Trừ số lượng chỗ khả dụng ngay lập tức
                    $this->db->execute(
                        "UPDATE trips SET available_seats = available_seats - ?, updated_at = NOW() WHERE id = ?",
                        [$qty, $tripId]
                    );

                    $subtotal = $trip->price_per_person * $qty;
                    $totalAmount += $subtotal;

                    $processedBookings[] = [
                        'type'           => 'trip',
                        'trip_id'        => $tripId,
                        'num_passengers' => $qty,
                        'unit_price'     => $trip->price_per_person,
                        'quantity'       => $qty,
                        'subtotal'       => $subtotal,
                    ];

                } elseif ($item['type'] === 'hotel') {
                    // ==========================================
                    // XỬ LÝ PHÒNG KHÁCH SẠN
                    // ==========================================
                    $hotelId = (int)$item['hotel_id'];
                    $roomTypeId = (int)$item['room_type_id'];
                    $qty = (int)$item['quantity'];
                    $checkIn = $item['check_in'];
                    $checkOut = $item['check_out'];
                    $nights = max(1, (int)round((strtotime($checkOut) - strtotime($checkIn)) / 86400));

                    // Kiểm tra tình trạng phòng trống
                    $check = $this->roomModel->checkAvailability($roomTypeId, $checkIn, $checkOut, $qty);

                    if (!$check['available']) {
                        $roomName = $check['room']->name ?? 'phòng';
                        throw new Exception("Loại phòng '{$roomName}' trong khoảng ngày {$checkIn} đến {$checkOut} chỉ còn {$check['available_count']} phòng trống (yêu cầu: {$qty} phòng).");
                    }

                    $unitPrice = (float)$check['room']->price_per_night;
                    $subtotal = $unitPrice * $qty * $nights;
                    $totalAmount += $subtotal;

                    $processedBookings[] = [
                        'type'           => 'hotel',
                        'hotel_id'       => $hotelId,
                        'room_type_id'   => $roomTypeId,
                        'num_rooms'      => $qty,
                        'check_in_date'  => $checkIn,
                        'check_out_date' => $checkOut,
                        'num_nights'     => $nights,
                        'unit_price'     => $unitPrice,
                        'quantity'       => $qty,
                        'subtotal'       => $subtotal,
                    ];
                }
            }

            // Tạo Order tổng
            $orderId = $this->db->insert(
                "INSERT INTO orders (order_code, customer_id, total_amount, final_amount, status, notes, expires_at) 
                 VALUES (?, ?, ?, ?, 'pending_payment', ?, ?)",
                [
                    $orderCode,
                    $customerId,
                    $totalAmount,
                    $totalAmount,
                    $contactInfo['notes'] ?? null,
                    $expiresAt
                ]
            );

            // Tạo các Bookings con chi tiết
            foreach ($processedBookings as $b) {
                $bookingCode = Helper::generateBookingCode();

                $this->db->insert(
                    "INSERT INTO bookings (
                        booking_code, order_id, customer_id, booking_type,
                        trip_id, num_passengers,
                        hotel_id, room_type_id, num_rooms, check_in_date, check_out_date, num_nights,
                        unit_price, quantity, subtotal, status, expires_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', ?)",
                    [
                        $bookingCode,
                        $orderId,
                        $customerId,
                        $b['type'],
                        $b['trip_id'] ?? null,
                        $b['num_passengers'] ?? null,
                        $b['hotel_id'] ?? null,
                        $b['room_type_id'] ?? null,
                        $b['num_rooms'] ?? null,
                        $b['check_in_date'] ?? null,
                        $b['check_out_date'] ?? null,
                        $b['num_nights'] ?? null,
                        $b['unit_price'],
                        $b['quantity'],
                        $b['subtotal'],
                        $expiresAt
                    ]
                );
            }

            // Commit Transaction thành công
            $this->db->commit();

            return (object)[
                'order_id'     => $orderId,
                'order_code'   => $orderCode,
                'expires_at'   => $expiresAt,
                'final_amount' => $totalAmount,
            ];

        } catch (Exception $e) {
            // Rollback toàn bộ nếu có bất kỳ lỗi nào xảy ra
            $this->db->rollback();
            throw $e;
        }
    }
}
