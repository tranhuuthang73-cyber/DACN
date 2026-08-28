<?php
/**
 * TravelGo - Employee Hotel Approval Controller
 * Nhân viên kiểm tra và duyệt khách sạn / phòng do Đối tác đăng
 */

namespace App\Controllers\Employee;

use App\Core\Controller;
use App\Middleware\EmployeeMiddleware;
use App\Models\HotelModel;
use App\Core\Database;
use App\Core\Auth;
use App\Core\Session;

class EmpHotelController extends Controller
{
    private HotelModel $hotelModel;

    public function __construct()
    {
        parent::__construct();
        EmployeeMiddleware::handle();
        $this->hotelModel = new HotelModel();
    }

    /**
     * Danh sách khách sạn chờ duyệt & đã duyệt
     */
    public function index(): void
    {
        $status = $this->query('status', 'pending');
        $db = Database::getInstance();

        $sql = "SELECT h.*, l.name AS location_name, p.company_name AS partner_name, u.full_name AS approver_name
                FROM hotels h
                JOIN locations l ON h.location_id = l.id
                JOIN partners p ON h.partner_id = p.id
                LEFT JOIN users u ON h.approved_by = u.id";

        $params = [];
        if (!empty($status)) {
            $sql .= " WHERE h.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY h.created_at DESC";

        $hotels = $db->fetchAll($sql, $params);

        $this->view('employee/hotels/index', [
            'pageTitle' => 'Phê duyệt Khách sạn Đối tác',
            'hotels'    => $hotels,
            'status'    => $status,
        ], 'admin');
    }

    /**
     * Phê duyệt khách sạn
     */
    public function approve(int|string $id = 0): void
    {
        $id = (int)$id;
        $hotel = $this->hotelModel->find($id);

        if (!$hotel) {
            $this->redirectWithSuccess('/employee/hotels', 'Khách sạn không tồn tại.');
            return;
        }

        $this->hotelModel->update($id, [
            'status'      => 'active',
            'approved_by' => Auth::id(),
            'approved_at' => date('Y-m-d H:i:s'),
        ]);

        Session::flash('success', "Đã duyệt khách sạn '{$hotel->name}' thành công!");
        $this->redirect('/employee/hotels');
    }
}
