<?php
/**
 * TravelGo - Customer Dashboard Controller
 * Bảng điều khiển cá nhân của khách hàng: Tổng quan chi tiêu, chuyến sắp tới, điểm tích lũy
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Database;

class DashboardController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->requireAuth();
    }

    /**
     * Dashboard Khách hàng
     */
    public function index(): void
    {
        $db = Database::getInstance();
        $userId = Auth::id();

        // 1. KPI cá nhân
        $totalSpent = (float)$db->fetchColumn(
            "SELECT IFNULL(SUM(subtotal), 0) 
             FROM bookings 
             WHERE customer_id = ? AND status IN ('paid', 'confirmed', 'completed')",
            [$userId]
        );

        $totalCompletedTrips = (int)$db->fetchColumn(
            "SELECT COUNT(*) 
             FROM bookings 
             WHERE customer_id = ? AND booking_type = 'trip' AND status = 'completed'",
            [$userId]
        );

        $activeBookingsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) 
             FROM bookings 
             WHERE customer_id = ? AND status IN ('paid', 'confirmed')",
            [$userId]
        );

        // 2. Chuyến đi sắp khởi hành gần nhất (Next upcoming journey)
        $nextJourney = $db->fetchOne(
            "SELECT b.*, t.trip_code, t.departure_datetime, dl.name AS departure_name, al.name AS arrival_name,
                    vt.name AS vehicle_name, vt.icon AS vehicle_icon, p.company_name AS partner_name
             FROM bookings b
             JOIN trips t ON b.trip_id = t.id
             JOIN locations dl ON t.departure_location_id = dl.id
             JOIN locations al ON t.arrival_location_id = al.id
             JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
             JOIN partners p ON t.partner_id = p.id
             WHERE b.customer_id = ? 
               AND b.booking_type = 'trip' 
               AND b.status IN ('paid', 'confirmed')
               AND t.departure_datetime > NOW()
             ORDER BY t.departure_datetime ASC
             LIMIT 1",
            [$userId]
        );

        // 3. Đơn đặt phòng khách sạn sắp tới gần nhất
        $nextHotel = $db->fetchOne(
            "SELECT b.*, h.name AS hotel_name, h.address AS hotel_address, rt.name AS room_name
             FROM bookings b
             JOIN hotels h ON b.hotel_id = h.id
             JOIN room_types rt ON b.room_type_id = rt.id
             WHERE b.customer_id = ? 
               AND b.booking_type = 'hotel' 
               AND b.status IN ('paid', 'confirmed')
               AND b.check_in_date >= CURRENT_DATE()
             ORDER BY b.check_in_date ASC
             LIMIT 1",
            [$userId]
        );

        // 4. Lịch sử booking gần đây
        $recentBookings = $db->fetchAll(
            "SELECT b.*, 
                    t.trip_code, dl.name AS departure_name, al.name AS arrival_name, t.departure_datetime,
                    h.name AS hotel_name, rt.name AS room_name
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN locations dl ON t.departure_location_id = dl.id
             LEFT JOIN locations al ON t.arrival_location_id = al.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             LEFT JOIN room_types rt ON b.room_type_id = rt.id
             WHERE b.customer_id = ?
             ORDER BY b.created_at DESC
             LIMIT 5",
            [$userId]
        );

        $this->view('dashboard/index', [
            'pageTitle'           => 'Dashboard của tôi',
            'totalSpent'          => $totalSpent,
            'totalCompletedTrips' => $totalCompletedTrips,
            'activeBookingsCount' => $activeBookingsCount,
            'nextJourney'         => $nextJourney,
            'nextHotel'           => $nextHotel,
            'recentBookings'      => $recentBookings,
            'user'                => (object)Auth::user(),
        ]);
    }
}
