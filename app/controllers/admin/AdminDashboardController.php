<?php
/**
 * TravelGo - Admin Dashboard Controller
 * Thống kê tổng quan hệ thống, doanh thu, phân bổ dịch vụ và biểu đồ tăng trưởng
 */

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Middleware\AdminMiddleware;
use App\Core\Database;

class AdminDashboardController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        AdminMiddleware::handle();
    }

    /**
     * Trang Dashboard Quản trị viên
     */
    public function index(): void
    {
        $db = Database::getInstance();

        // 1. KPI Cards
        $totalRevenue = (float)$db->fetchColumn(
            "SELECT IFNULL(SUM(final_amount), 0) FROM orders WHERE status IN ('paid', 'completed')"
        );

        $totalOrders = (int)$db->fetchColumn("SELECT COUNT(*) FROM orders");
        
        $totalCustomers = (int)$db->fetchColumn("SELECT COUNT(*) FROM users WHERE role = 'customer'");

        $totalActivePartners = (int)$db->fetchColumn("SELECT COUNT(*) FROM partners WHERE status IN ('approved', 'active')");

        $totalActiveTrips = (int)$db->fetchColumn("SELECT COUNT(*) FROM trips WHERE status = 'active'");

        $totalActiveHotels = (int)$db->fetchColumn("SELECT COUNT(*) FROM hotels WHERE status = 'active'");

        // 2. Biểu đồ Doanh thu theo tháng (12 tháng gần nhất hoặc năm nay)
        $monthlyRevenueData = $db->fetchAll(
            "SELECT DATE_FORMAT(created_at, '%m/%Y') AS month_label,
                    SUM(final_amount) AS revenue,
                    COUNT(id) AS order_count
             FROM orders 
             WHERE status IN ('paid', 'completed')
             GROUP BY DATE_FORMAT(created_at, '%m/%Y'), YEAR(created_at), MONTH(created_at)
             ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
             LIMIT 12"
        );

        // Chuẩn hóa dữ liệu cho Chart.js
        $chartMonths = [];
        $chartRevenues = [];
        foreach ($monthlyRevenueData as $row) {
            $chartMonths[] = 'Tháng ' . $row->month_label;
            $chartRevenues[] = (float)$row->revenue;
        }

        // 3. Biểu đồ Tỷ trọng Doanh thu (Chuyến đi vs Khách sạn)
        $tripRevenue = (float)$db->fetchColumn(
            "SELECT IFNULL(SUM(subtotal), 0) FROM bookings WHERE booking_type = 'trip' AND status IN ('paid', 'confirmed', 'completed')"
        );
        $hotelRevenue = (float)$db->fetchColumn(
            "SELECT IFNULL(SUM(subtotal), 0) FROM bookings WHERE booking_type = 'hotel' AND status IN ('paid', 'confirmed', 'completed')"
        );

        // 4. Top Tuyến đường đông khách nhất (View v_popular_routes hoặc Query)
        $topRoutes = $db->fetchAll(
            "SELECT dl.name AS departure_name, al.name AS arrival_name,
                    COUNT(b.id) AS booking_count,
                    IFNULL(SUM(b.num_passengers), 0) AS total_passengers,
                    IFNULL(SUM(b.subtotal), 0) AS route_revenue
             FROM trips t
             JOIN locations dl ON t.departure_location_id = dl.id
             JOIN locations al ON t.arrival_location_id = al.id
             LEFT JOIN bookings b ON b.trip_id = t.id AND b.status IN ('paid', 'confirmed', 'completed')
             GROUP BY t.departure_location_id, t.arrival_location_id
             ORDER BY total_passengers DESC
             LIMIT 5"
        );

        // 5. Đơn hàng mới nhất cần theo dõi
        $recentOrders = $db->fetchAll(
            "SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             ORDER BY o.created_at DESC
             LIMIT 6"
        );

        // 6. Đối tác có doanh thu cao nhất
        $topPartners = $db->fetchAll(
            "SELECT p.company_name, p.status,
                    COUNT(DISTINCT t.id) AS trip_count,
                    COUNT(DISTINCT h.id) AS hotel_count,
                    IFNULL(SUM(b.subtotal), 0) AS total_revenue
             FROM partners p
             LEFT JOIN trips t ON t.partner_id = p.id
             LEFT JOIN hotels h ON h.partner_id = p.id
             LEFT JOIN bookings b ON (b.trip_id = t.id OR b.hotel_id = h.id) AND b.status IN ('paid', 'confirmed', 'completed')
             WHERE p.status IN ('approved', 'active')
             GROUP BY p.id
             ORDER BY total_revenue DESC
             LIMIT 5"
        );

        $this->view('admin/dashboard', [
            'pageTitle'           => 'Dashboard Thống kê Hệ thống',
            'totalRevenue'        => $totalRevenue,
            'totalOrders'         => $totalOrders,
            'totalCustomers'      => $totalCustomers,
            'totalActivePartners' => $totalActivePartners,
            'totalActiveTrips'    => $totalActiveTrips,
            'totalActiveHotels'   => $totalActiveHotels,
            'chartMonths'         => json_encode($chartMonths),
            'chartRevenues'       => json_encode($chartRevenues),
            'tripRevenue'         => $tripRevenue,
            'hotelRevenue'        => $hotelRevenue,
            'topRoutes'           => $topRoutes,
            'recentOrders'        => $recentOrders,
            'topPartners'         => $topPartners,
        ], 'admin');
    }
}
