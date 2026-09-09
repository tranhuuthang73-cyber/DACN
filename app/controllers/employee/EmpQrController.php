<?php
/**
 * TravelGo - Employee QR Scanner & Check-in Controller
 * Soát vé điện tử E-Ticket bằng mã QR hoặc mã Booking
 */

namespace App\Controllers\Employee;

use App\Core\Controller;
use App\Middleware\EmployeeMiddleware;
use App\Core\Database;
use App\Core\Auth;
use App\Core\Session;

class EmpQrController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        EmployeeMiddleware::handle();
    }

    /**
     * Màn hình soát vé / Quét mã QR
     */
    public function index(): void
    {
        $code = trim($this->query('code', ''));
        $booking = null;
        $message = null;

        if (!empty($code)) {
            $db = Database::getInstance();
            $sql = "SELECT b.*, u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
                           t.trip_code, t.departure_datetime, dl.name AS departure_name, al.name AS arrival_name, vt.name AS vehicle_name,
                           h.name AS hotel_name, rt.name AS room_name,
                           staff.full_name AS checkin_staff_name
                    FROM bookings b
                    JOIN users u ON b.customer_id = u.id
                    LEFT JOIN trips t ON b.trip_id = t.id
                    LEFT JOIN locations dl ON t.departure_location_id = dl.id
                    LEFT JOIN locations al ON t.arrival_location_id = al.id
                    LEFT JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                    LEFT JOIN hotels h ON b.hotel_id = h.id
                    LEFT JOIN room_types rt ON b.room_type_id = rt.id
                    LEFT JOIN users staff ON b.checked_in_by = staff.id
                    WHERE b.booking_code = ?
                    LIMIT 1";

            $booking = $db->fetchOne($sql, [$code]);

            if (!$booking) {
                $message = "Không tìm thấy vé với mã '{$code}'. Vui lòng kiểm tra lại.";
            }
        }

        $this->view('employee/qr/index', [
            'pageTitle' => 'Soát vé & Quét QR Code Check-in',
            'code'      => $code,
            'booking'   => $booking,
            'message'   => $message,
        ], 'admin');
    }

    /**
     * Xác nhận Check-in cho hành khách
     */
    public function checkin(string $code = ''): void
    {
        $code = trim($code);
        if (empty($code)) {
            $this->redirect('/employee/qr');
            return;
        }

        $db = Database::getInstance();
        $booking = $db->fetchOne("SELECT * FROM bookings WHERE booking_code = ?", [$code]);

        if (!$booking) {
            Session::flash('error', 'Vé không tồn tại.');
            $this->redirect('/employee/qr');
            return;
        }

        if ($booking->status === 'cancelled') {
            Session::flash('error', 'Vé này đã bị hủy hoặc hoàn tiền. Không thể check-in!');
            $this->redirect('/employee/qr?code=' . $code);
            return;
        }

        if (!empty($booking->checkin_status) && $booking->checkin_status === 'checked_in') {
            Session::flash('info', 'Vé này ĐÃ ĐƯỢC CHECK-IN trước đó rồi!');
            $this->redirect('/employee/qr?code=' . $code);
            return;
        }

        $db->execute(
            "UPDATE bookings SET checkin_status = 'checked_in', checked_in_at = NOW(), checked_in_by = ? WHERE id = ?",
            [Auth::id(), $booking->id]
        );

        Session::flash('success', "✅ CHECK-IN THÀNH CÔNG! Đã xác nhận khách hàng lên xe/nhận phòng.");
        $this->redirect('/employee/qr?code=' . $code);
    }
}
