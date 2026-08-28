<?php
/**
 * TravelGo - Employee Dashboard Controller
 * Bảng điều hành nhân viên: Hàng đợi xét duyệt, soát vé và xử lý hoàn tiền
 */

namespace App\Controllers\Employee;

use App\Core\Controller;
use App\Middleware\EmployeeMiddleware;
use App\Core\Database;

class EmployeeDashboardController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        EmployeeMiddleware::handle();
    }

    /**
     * Dashboard Nhân viên
     */
    public function index(): void
    {
        $db = Database::getInstance();

        // 1. Hàng đợi công việc cần xử lý
        $pendingTripsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM trips WHERE status = 'pending_approval'"
        );

        $pendingHotelsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM hotels WHERE status = 'pending'"
        );

        $pendingRefundsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM refunds WHERE status = 'pending'"
        );

        $todayBookingsCount = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE()"
        );

        // 2. Thống kê tỷ lệ trạng thái booking (Pie chart)
        $statusStats = $db->fetchAll(
            "SELECT status, COUNT(id) as count 
             FROM bookings 
             GROUP BY status"
        );

        // 3. Danh sách chuyến cần duyệt gấp
        $pendingTrips = $db->fetchAll(
            "SELECT t.*, dl.name AS departure_name, al.name AS arrival_name, vt.name AS vehicle_name, p.company_name AS partner_name
             FROM trips t
             JOIN locations dl ON t.departure_location_id = dl.id
             JOIN locations al ON t.arrival_location_id = al.id
             JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
             JOIN partners p ON t.partner_id = p.id
             WHERE t.status = 'pending_approval'
             ORDER BY t.created_at ASC
             LIMIT 5"
        );

        // 4. Danh sách yêu cầu hoàn tiền cần xử lý
        $pendingRefunds = $db->fetchAll(
            "SELECT r.*, b.booking_code, b.subtotal, u.full_name AS customer_name, u.phone AS customer_phone
             FROM refunds r
             JOIN bookings b ON r.booking_id = b.id
             JOIN users u ON b.customer_id = u.id
             WHERE r.status = 'pending'
             ORDER BY r.created_at ASC
             LIMIT 5"
        );

        $this->view('employee/dashboard', [
            'pageTitle'           => 'Bảng điều hành Nghiệp vụ Nhân viên',
            'pendingTripsCount'   => $pendingTripsCount,
            'pendingHotelsCount'  => $pendingHotelsCount,
            'pendingRefundsCount' => $pendingRefundsCount,
            'todayBookingsCount'  => $todayBookingsCount,
            'statusStats'         => $statusStats,
            'pendingTrips'        => $pendingTrips,
            'pendingRefunds'      => $pendingRefunds,
        ], 'admin');
    }
}
