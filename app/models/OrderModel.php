<?php
/**
 * TravelGo - Order Model
 */

namespace App\Models;

use App\Core\Model;

class OrderModel extends Model
{
    protected string $table = 'orders';

    /**
     * Tìm đơn hàng theo mã đơn
     */
    public function findByCode(string $code): ?object
    {
        return $this->findOneWhere(['order_code' => $code]);
    }

    /**
     * Lấy chi tiết đơn hàng kèm danh sách các booking bên trong
     */
    public function getOrderWithBookings(int $orderId): ?object
    {
        $order = $this->find($orderId);
        if (!$order) return null;

        $sqlBookings = "SELECT b.*,
                               t.trip_code, dl.name AS departure_name, al.name AS arrival_name, t.departure_datetime, vt.name AS vehicle_name,
                               h.name AS hotel_name, h.address AS hotel_address, rt.name AS room_name
                        FROM bookings b
                        LEFT JOIN trips t ON b.trip_id = t.id
                        LEFT JOIN locations dl ON t.departure_location_id = dl.id
                        LEFT JOIN locations al ON t.arrival_location_id = al.id
                        LEFT JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                        LEFT JOIN hotels h ON b.hotel_id = h.id
                        LEFT JOIN room_types rt ON b.room_type_id = rt.id
                        WHERE b.order_id = ?
                        ORDER BY b.id ASC";

        $order->bookings = $this->db->fetchAll($sqlBookings, [$orderId]);
        return $order;
    }
}
