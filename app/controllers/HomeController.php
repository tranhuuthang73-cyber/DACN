<?php
/**
 * TravelGo - Home Controller
 * Trang chủ hiển thị chuyến phổ biến, địa điểm nổi bật, form tìm kiếm
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class HomeController extends Controller
{
    public function index(): void
    {
        $db = Database::getInstance();

        // Lấy địa điểm phổ biến
        $popularLocations = $db->fetchAll(
            "SELECT * FROM locations WHERE is_popular = 1 ORDER BY sort_order ASC LIMIT 8"
        );

        // Lấy chuyến đi đang mở (sắp tới)
        $upcomingTrips = $db->fetchAll(
            "SELECT t.*, 
                    dl.name AS departure_name, 
                    al.name AS arrival_name,
                    vt.name AS vehicle_name,
                    vt.icon AS vehicle_icon,
                    p.company_name AS partner_name,
                    ROUND((t.total_seats - t.available_seats) / t.total_seats * 100) AS fill_rate
             FROM trips t
             JOIN locations dl ON t.departure_location_id = dl.id
             JOIN locations al ON t.arrival_location_id = al.id
             JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
             JOIN partners p ON t.partner_id = p.id
             WHERE t.status = 'active' 
               AND t.departure_datetime > NOW()
               AND t.available_seats > 0
             ORDER BY t.departure_datetime ASC
             LIMIT 6"
        );

        // Lấy khách sạn nổi bật
        $featuredHotels = $db->fetchAll(
            "SELECT h.*, 
                    l.name AS location_name,
                    p.company_name AS partner_name,
                    MIN(rt.price_per_night) AS min_price,
                    MAX(rt.price_per_night) AS max_price,
                    COUNT(rt.id) AS room_type_count
             FROM hotels h
             JOIN locations l ON h.location_id = l.id
             JOIN partners p ON h.partner_id = p.id
             LEFT JOIN room_types rt ON rt.hotel_id = h.id AND rt.status = 'active'
             WHERE h.status = 'active'
             GROUP BY h.id
             ORDER BY h.star_rating DESC
             LIMIT 6"
        );

        // Lấy danh sách phương tiện
        $vehicleTypes = $db->fetchAll("SELECT * FROM vehicle_types ORDER BY id");

        // Lấy tất cả locations cho dropdown search
        $allLocations = $db->fetchAll("SELECT id, name FROM locations ORDER BY sort_order ASC");

        // Thống kê tổng quan
        $stats = [
            'total_trips'     => $db->fetchColumn("SELECT COUNT(*) FROM trips WHERE status = 'active'"),
            'total_hotels'    => $db->fetchColumn("SELECT COUNT(*) FROM hotels WHERE status = 'active'"),
            'total_locations'=> $db->fetchColumn("SELECT COUNT(*) FROM locations"),
            'total_customers'=> $db->fetchColumn("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
        ];

        $this->view('home/index', [
            'pageTitle'        => 'Trang chủ',
            'popularLocations' => $popularLocations,
            'upcomingTrips'    => $upcomingTrips,
            'featuredHotels'   => $featuredHotels,
            'vehicleTypes'     => $vehicleTypes,
            'allLocations'     => $allLocations,
            'stats'            => $stats,
        ]);
    }
}
