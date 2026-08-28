<?php
/**
 * TravelGo - Employee Trip Approval Controller
 * Nhân viên có nhiệm vụ duyệt / xác nhận chuyến trước khi mở cho khách đặt
 */

namespace App\Controllers\Employee;

use App\Core\Controller;
use App\Middleware\EmployeeMiddleware;
use App\Models\TripModel;
use App\Core\Auth;
use App\Core\Session;

class EmpTripController extends Controller
{
    private TripModel $tripModel;

    public function __construct()
    {
        parent::__construct();
        EmployeeMiddleware::handle();
        $this->tripModel = new TripModel();
    }

    /**
     * Danh sách chuyến chờ duyệt và đã duyệt
     */
    public function index(): void
    {
        $status = $this->query('status', 'pending_approval');
        $page = (int)($this->query('page', 1));

        $results = $this->tripModel->getAdminTrips(['status' => $status], $page, 15);

        $this->view('employee/trips/index', [
            'pageTitle' => 'Phê duyệt Chuyến đi',
            'trips'     => $results['data'],
            'total'     => $results['total'],
            'pages'     => $results['pages'],
            'current'   => $results['current'],
            'status'    => $status,
        ], 'admin');
    }

    /**
     * Nhân viên phê duyệt chuyến đi (Mở bán cho khách)
     */
    public function approve(int|string $id = 0): void
    {
        $id = (int)$id;
        $trip = $this->tripModel->find($id);

        if (!$trip) {
            $this->redirectWithSuccess('/employee/trips', 'Chuyến đi không tồn tại.');
            return;
        }

        $this->tripModel->update($id, [
            'status'      => 'active',
            'approved_by' => Auth::id(),
            'approved_at' => date('Y-m-d H:i:s'),
        ]);

        Session::flash('success', "Đã phê duyệt chuyến {$trip->trip_code} thành công! Chuyến đã được mở bán cho khách.");
        $this->redirect('/employee/trips');
    }

    /**
     * Nhân viên từ chối chuyến đi
     */
    public function reject(int|string $id = 0): void
    {
        $id = (int)$id;
        $reason = trim($this->input('reason') ?? 'Lịch trình hoặc thông tin chuyến chưa phù hợp.');

        $this->tripModel->update($id, [
            'status'           => 'rejected',
            'rejection_reason' => $reason,
            'approved_by'      => Auth::id(),
            'approved_at'      => date('Y-m-d H:i:s'),
        ]);

        Session::flash('info', "Đã từ chối chuyến đi.");
        $this->redirect('/employee/trips');
    }
}
