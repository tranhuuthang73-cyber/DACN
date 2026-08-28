<?php
/**
 * TravelGo - Partner Dashboard Controller
 * Thống kê doanh thu, số lượng khách, tỷ lệ lấp đầy của đối tác
 */

namespace App\Controllers\Partner;

use App\Core\Controller;
use App\Middleware\PartnerMiddleware;
use App\Models\PartnerModel;
use App\Core\Database;
use App\Core\Auth;

class PartnerDashboardController extends Controller
{
    private PartnerModel $partnerModel;

    public function __construct()
    {
        parent::__construct();
        PartnerMiddleware::handle();
        $this->partnerModel = new PartnerModel();
    }

    /**
     * Dashboard Đối tác
     */
    public function index(): void
    {
        $db = Database::getInstance();
        $partner = $this->partnerModel->findByUserId(Auth::id());

        // 1. KPI Cards của đối tác
        $totalRevenue = (float)$db->fetchColumn(
            "SELECT IFNULL(SUM(b.subtotal), 0)
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             WHERE (t.partner_id = ? OR h.partner_id = ?)
               AND b.status IN ('paid', 'confirmed', 'completed')",
            [$partner->id, $partner->id]
        );

        $thisMonthRevenue = (float)$db->fetchColumn(
            "SELECT IFNULL(SUM(b.subtotal), 0)
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             WHERE (t.partner_id = ? OR h.partner_id = ?)
               AND b.status IN ('paid', 'confirmed', 'completed')
               AND MONTH(b.created_at) = MONTH(CURRENT_DATE())
               AND YEAR(b.created_at) = YEAR(CURRENT_DATE())",
            [$partner->id, $partner->id]
        );

        $totalCustomersServed = (int)$db->fetchColumn(
            "SELECT IFNULL(SUM(CASE WHEN b.booking_type = 'trip' THEN b.num_passengers ELSE b.num_rooms END), 0)
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             WHERE (t.partner_id = ? OR h.partner_id = ?)
               AND b.status IN ('paid', 'confirmed', 'completed')",
            [$partner->id, $partner->id]
        );

        $activeTripsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM trips WHERE partner_id = ? AND status = 'active'",
            [$partner->id]
        );

        $activeHotelsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM hotels WHERE partner_id = ? AND status = 'active'",
            [$partner->id]
        );

        // 2. Biểu đồ doanh thu 6 tháng gần nhất của đối tác
        $monthlyRevenue = $db->fetchAll(
            "SELECT DATE_FORMAT(b.created_at, '%m/%Y') AS month_label,
                    SUM(b.subtotal) AS revenue
             FROM bookings b
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             WHERE (t.partner_id = ? OR h.partner_id = ?)
               AND b.status IN ('paid', 'confirmed', 'completed')
             GROUP BY DATE_FORMAT(b.created_at, '%m/%Y'), YEAR(b.created_at), MONTH(b.created_at)
             ORDER BY YEAR(b.created_at) ASC, MONTH(b.created_at) ASC
             LIMIT 6",
            [$partner->id, $partner->id]
        );

        $chartLabels = [];
        $chartData = [];
        foreach ($monthlyRevenue as $row) {
            $chartLabels[] = 'Tháng ' . $row->month_label;
            $chartData[] = (float)$row->revenue;
        }

        // 3. Danh sách booking mới nhất của đơn vị
        $recentBookings = $db->fetchAll(
            "SELECT b.*, u.full_name AS customer_name, u.phone AS customer_phone,
                    t.trip_code, dl.name AS departure_name, al.name AS arrival_name,
                    h.name AS hotel_name, rt.name AS room_name
             FROM bookings b
             JOIN users u ON b.customer_id = u.id
             LEFT JOIN trips t ON b.trip_id = t.id
             LEFT JOIN locations dl ON t.departure_location_id = dl.id
             LEFT JOIN locations al ON t.arrival_location_id = al.id
             LEFT JOIN hotels h ON b.hotel_id = h.id
             LEFT JOIN room_types rt ON b.room_type_id = rt.id
             WHERE (t.partner_id = ? OR h.partner_id = ?)
             ORDER BY b.created_at DESC
             LIMIT 8",
            [$partner->id, $partner->id]
        );

        $this->view('partner/dashboard', [
            'pageTitle'            => 'Dashboard Doanh thu Đối tác',
            'partner'              => $partner,
            'totalRevenue'         => $totalRevenue,
            'thisMonthRevenue'     => $thisMonthRevenue,
            'totalCustomersServed' => $totalCustomersServed,
            'activeTripsCount'     => $activeTripsCount,
            'activeHotelsCount'    => $activeHotelsCount,
            'chartLabels'          => json_encode($chartLabels),
            'chartData'            => json_encode($chartData),
            'recentBookings'       => $recentBookings,
        ], 'admin');
    }
}
