<?php
/**
 * TravelGo - Employee Booking & Refund Controller
 * Quản lý danh sách Booking toàn hệ thống và Phê duyệt Hoàn tiền theo chính sách
 */

namespace App\Controllers\Employee;

use App\Core\Controller;
use App\Middleware\EmployeeMiddleware;
use App\Core\Database;
use App\Core\Auth;
use App\Core\Session;

class EmpBookingController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        EmployeeMiddleware::handle();
    }

    /**
     * Danh sách booking toàn hệ thống
     */
    public function index(): void
    {
        $db = Database::getInstance();
        $status = trim($this->query('status', ''));
        $search = trim($this->query('search', ''));
        $page = max(1, (int)$this->query('page', 1));
        $limit = 15;
        $offset = ($page - 1) * $limit;

        $where = ["1=1"];
        $params = [];

        if (!empty($status)) {
            $where[] = "b.status = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $where[] = "(b.booking_code LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ?)";
            $keyword = "%{$search}%";
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
        }

        $whereSql = implode(" AND ", $where);

        $total = (int)$db->fetchColumn(
            "SELECT COUNT(*) FROM bookings b JOIN users u ON b.customer_id = u.id WHERE {$whereSql}",
            $params
        );

        $sql = "SELECT b.*, u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
                       t.trip_code, dl.name AS departure_name, al.name AS arrival_name,
                       h.name AS hotel_name, rt.name AS room_name
                FROM bookings b
                JOIN users u ON b.customer_id = u.id
                LEFT JOIN trips t ON b.trip_id = t.id
                LEFT JOIN locations dl ON t.departure_location_id = dl.id
                LEFT JOIN locations al ON t.arrival_location_id = al.id
                LEFT JOIN hotels h ON b.hotel_id = h.id
                LEFT JOIN room_types rt ON b.room_type_id = rt.id
                WHERE {$whereSql}
                ORDER BY b.created_at DESC
                LIMIT {$limit} OFFSET {$offset}";

        $bookings = $db->fetchAll($sql, $params);
        $pages = ceil($total / $limit);

        // Đếm số lượng theo trạng thái
        $counts = [
            'all'              => (int)$db->fetchColumn("SELECT COUNT(*) FROM bookings"),
            'paid'             => (int)$db->fetchColumn("SELECT COUNT(*) FROM bookings WHERE status = 'paid'"),
            'confirmed'        => (int)$db->fetchColumn("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'"),
            'cancel_requested' => (int)$db->fetchColumn("SELECT COUNT(*) FROM bookings WHERE status = 'cancel_requested'"),
            'cancelled'        => (int)$db->fetchColumn("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'"),
        ];

        $this->view('employee/bookings/index', [
            'pageTitle' => 'Quản lý Đơn đặt chỗ & Booking',
            'bookings'  => $bookings,
            'total'     => $total,
            'pages'     => $pages,
            'current'   => $page,
            'status'    => $status,
            'search'    => $search,
            'counts'    => $counts,
        ], 'admin');
    }

    /**
     * Hàng đợi xử lý yêu cầu hoàn tiền
     */
    public function refunds(): void
    {
        $db = Database::getInstance();
        $status = trim($this->query('status', 'pending'));

        $sql = "SELECT r.*, b.booking_code, b.booking_type, b.subtotal, b.status AS booking_status,
                       u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
                       t.trip_code, dl.name AS departure_name, al.name AS arrival_name, t.departure_datetime,
                       h.name AS hotel_name,
                       p.payment_code, p.payment_method,
                       staff.full_name AS processor_name
                FROM refunds r
                JOIN bookings b ON r.booking_id = b.id
                JOIN users u ON b.customer_id = u.id
                LEFT JOIN trips t ON b.trip_id = t.id
                LEFT JOIN locations dl ON t.departure_location_id = dl.id
                LEFT JOIN locations al ON t.arrival_location_id = al.id
                LEFT JOIN hotels h ON b.hotel_id = h.id
                LEFT JOIN payments p ON r.payment_id = p.id
                LEFT JOIN users staff ON r.processed_by = staff.id";

        $params = [];
        if (!empty($status)) {
            $sql .= " WHERE r.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY r.created_at ASC";

        $refunds = $db->fetchAll($sql, $params);

        $pendingCount = (int)$db->fetchColumn("SELECT COUNT(*) FROM refunds WHERE status = 'pending'");

        $this->view('employee/bookings/refunds', [
            'pageTitle'    => 'Xử lý Yêu cầu Hoàn tiền',
            'refunds'      => $refunds,
            'status'       => $status,
            'pendingCount' => $pendingCount,
        ], 'admin');
    }

    /**
     * Phê duyệt hoàn tiền
     */
    public function approveRefund(int|string $id = 0): void
    {
        $id = (int)$id;
        $db = Database::getInstance();

        $refund = $db->fetchOne("SELECT * FROM refunds WHERE id = ?", [$id]);
        if (!$refund || $refund->status !== 'pending') {
            Session::flash('error', 'Yêu cầu hoàn tiền không hợp lệ hoặc đã được xử lý.');
            $this->redirect('/employee/bookings/refunds');
            return;
        }

        $db->beginTransaction();
        try {
            // Cập nhật refund
            $db->execute(
                "UPDATE refunds SET status = 'completed', processed_by = ?, processed_at = NOW() WHERE id = ?",
                [Auth::id(), $id]
            );

            // Cập nhật booking sang cancelled
            $db->execute(
                "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
                [$refund->booking_id]
            );

            // Hoàn lại số chỗ trống cho chuyến xe nếu là trip
            $booking = $db->fetchOne("SELECT * FROM bookings WHERE id = ?", [$refund->booking_id]);
            if ($booking && $booking->booking_type === 'trip' && $booking->trip_id) {
                $db->execute(
                    "UPDATE trips SET available_seats = available_seats + ? WHERE id = ?",
                    [$booking->num_passengers, $booking->trip_id]
                );
            }

            $db->commit();
            Session::flash('success', "Đã phê duyệt hoàn tiền " . number_format($refund->refund_amount) . "₫ thành công!");
        } catch (\Exception $e) {
            $db->rollback();
            Session::flash('error', 'Lỗi khi xử lý hoàn tiền: ' . $e->getMessage());
        }

        $this->redirect('/employee/bookings/refunds');
    }

    /**
     * Từ chối hoàn tiền
     */
    public function rejectRefund(int|string $id = 0): void
    {
        $id = (int)$id;
        $db = Database::getInstance();
        $reason = trim($this->input('reason') ?? 'Không thỏa mãn điều kiện chính sách hoàn tiền.');

        $db->execute(
            "UPDATE refunds SET status = 'rejected', rejection_reason = ?, processed_by = ?, processed_at = NOW() WHERE id = ?",
            [$reason, Auth::id(), $id]
        );

        Session::flash('info', 'Đã từ chối yêu cầu hoàn tiền.');
        $this->redirect('/employee/bookings/refunds');
    }
}
