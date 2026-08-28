<?php
/**
 * TravelGo - Room Model
 */

namespace App\Models;

use App\Core\Model;

class RoomModel extends Model
{
    protected string $table = 'room_types';

    /**
     * Lấy danh sách loại phòng của khách sạn kèm kiểm tra số phòng trống theo ngày
     */
    public function getRoomsByHotel(int $hotelId, ?string $checkIn = null, ?string $checkOut = null): array
    {
        $rooms = $this->findWhere(['hotel_id' => $hotelId, 'status' => 'active'], 'price_per_night ASC');

        foreach ($rooms as $room) {
            $room->amenities_list = !empty($room->amenities) ? json_decode($room->amenities, true) : [];
            $room->available_rooms = $room->total_rooms;

            // Nếu có ngày check-in và check-out, tính số phòng đã được đặt
            if ($checkIn && $checkOut) {
                $bookedSql = "SELECT IFNULL(SUM(num_rooms), 0) 
                              FROM bookings 
                              WHERE room_type_id = ? 
                                AND status IN ('pending_payment', 'paid', 'confirmed', 'in_progress')
                                AND NOT (check_out_date <= ? OR check_in_date >= ?)";
                
                $bookedCount = (int)$this->db->fetchColumn($bookedSql, [$room->id, $checkIn, $checkOut]);
                $room->available_rooms = max(0, $room->total_rooms - $bookedCount);
            }
        }

        return $rooms;
    }

    /**
     * Kiểm tra khả năng đặt phòng cho khoảng thời gian và số lượng yêu cầu
     * Trả về: ['available' => bool, 'available_count' => int, 'total_rooms' => int]
     */
    public function checkAvailability(int $roomTypeId, string $checkIn, string $checkOut, int $requestedRooms = 1): array
    {
        $room = $this->find($roomTypeId);
        if (!$room) {
            return ['available' => false, 'available_count' => 0, 'total_rooms' => 0];
        }

        $bookedSql = "SELECT IFNULL(SUM(num_rooms), 0) 
                      FROM bookings 
                      WHERE room_type_id = ? 
                        AND status IN ('pending_payment', 'paid', 'confirmed', 'in_progress')
                        AND NOT (check_out_date <= ? OR check_in_date >= ?)";

        $bookedCount = (int)$this->db->fetchColumn($bookedSql, [$roomTypeId, $checkIn, $checkOut]);
        $availableCount = max(0, $room->total_rooms - $bookedCount);

        return [
            'available'       => $availableCount >= $requestedRooms,
            'available_count' => $availableCount,
            'total_rooms'     => $room->total_rooms,
            'room'            => $room,
        ];
    }
}
