<?php
/**
 * TravelGo - Booking Model
 */

namespace App\Models;

use App\Core\Model;
use App\Core\Helper;

class BookingModel extends Model
{
    protected string $table = 'bookings';

    /**
     * Tìm booking theo mã booking
     */
    public function findByCode(string $code): ?object
    {
        return $this->findOneWhere(['booking_code' => $code]);
    }

    /**
     * Lấy chi tiết booking kèm thông tin chuyến đi / khách sạn liên quan
     */
    public function getDetailByCode(string $code): ?object
    {
        $sql = "SELECT b.*,
                       o.order_code, o.payment_method, o.paid_at,
                       u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
                       t.trip_code, t.departure_datetime, t.return_datetime, t.policies AS trip_policies,
                       dl.name AS departure_name, al.name AS arrival_name,
                       vt.name AS vehicle_name, vt.icon AS vehicle_icon,
                       tp.company_name AS trip_partner_name,
                       h.name AS hotel_name, h.address AS hotel_address, h.check_in_time, h.check_out_time,
                       rt.name AS room_name, rt.bed_type,
                       hp.company_name AS hotel_partner_name
                FROM {$this->table} b
                JOIN orders o ON b.order_id = o.id
                JOIN users u ON b.customer_id = u.id
                LEFT JOIN trips t ON b.trip_id = t.id
                LEFT JOIN locations dl ON t.departure_location_id = dl.id
                LEFT JOIN locations al ON t.arrival_location_id = al.id
                LEFT JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                LEFT JOIN partners tp ON t.partner_id = tp.id
                LEFT JOIN hotels h ON b.hotel_id = h.id
                LEFT JOIN room_types rt ON b.room_type_id = rt.id
                LEFT JOIN partners hp ON h.partner_id = hp.id
                WHERE b.booking_code = ?
                LIMIT 1";

        return $this->db->fetchOne($sql, [$code]);
    }

    /**
     * Lấy danh sách booking của một khách hàng
     */
    public function getMyBookings(int $customerId, string $status = ''): array
    {
        $sql = "SELECT b.*,
                       t.trip_code, dl.name AS departure_name, al.name AS arrival_name, t.departure_datetime, vt.name AS vehicle_name,
                       h.name AS hotel_name, rt.name AS room_name
                FROM {$this->table} b
                LEFT JOIN trips t ON b.trip_id = t.id
                LEFT JOIN locations dl ON t.departure_location_id = dl.id
                LEFT JOIN locations al ON t.arrival_location_id = al.id
                LEFT JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                LEFT JOIN hotels h ON b.hotel_id = h.id
                LEFT JOIN room_types rt ON b.room_type_id = rt.id
                WHERE b.customer_id = ?";

        $params = [$customerId];
        if (!empty($status)) {
            $sql .= " AND b.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY b.created_at DESC";

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Tính toán số tiền hoàn dựa theo ngày khởi hành
     * Quy định: >= 7 ngày: 100%, 3-6 ngày: 50%, 1-2 ngày: 20%, < 1 ngày: 0%
     */
    public function calculateRefundPreview(object $booking): array
    {
        $targetDate = null;
        if ($booking->booking_type === 'trip' && $booking->departure_datetime) {
            $targetDate = $booking->departure_datetime;
        } elseif ($booking->booking_type === 'hotel' && $booking->check_in_date) {
            $targetDate = $booking->check_in_date . ' 14:00:00';
        }

        if (!$targetDate) {
            return ['percentage' => 0, 'refund_amount' => 0, 'days_before' => 0];
        }

        $diffHours = (strtotime($targetDate) - time()) / 3600;
        $daysBefore = (int)floor($diffHours / 24);

        $percentage = Helper::calculateRefundPercentage($daysBefore);
        $refundAmount = ($booking->subtotal * $percentage) / 100;

        return [
            'days_before'   => $daysBefore,
            'percentage'    => $percentage,
            'refund_amount' => $refundAmount,
            'subtotal'      => $booking->subtotal,
        ];
    }
}
