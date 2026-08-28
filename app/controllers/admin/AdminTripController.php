<?php
/**
 * TravelGo - Admin Trip Controller
 * Chỉ Admin được quyền Tạo chuyến đi mới theo đặc tả đề tài
 */

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Middleware\AdminMiddleware;
use App\Models\TripModel;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Helper;
use App\Core\Auth;
use App\Core\Session;

class AdminTripController extends Controller
{
    private TripModel $tripModel;

    public function __construct()
    {
        parent::__construct();
        AdminMiddleware::handle();
        $this->tripModel = new TripModel();
    }

    /**
     * Danh sách chuyến đi trong hệ thống
     */
    public function index(): void
    {
        $page = (int)($this->query('page', 1));
        $filters = [
            'status'     => $this->query('status'),
            'partner_id' => $this->query('partner_id'),
            'search'     => $this->query('search'),
        ];

        $results = $this->tripModel->getAdminTrips($filters, $page, 15);

        $db = Database::getInstance();
        $partners = $db->fetchAll("SELECT id, company_name FROM partners WHERE status IN ('approved', 'active')");

        $this->view('admin/trips/index', [
            'pageTitle' => 'Quản lý Chuyến đi',
            'trips'     => $results['data'],
            'total'     => $results['total'],
            'pages'     => $results['pages'],
            'current'   => $results['current'],
            'filters'   => $filters,
            'partners'  => $partners,
        ], 'admin');
    }

    /**
     * Giao diện Tạo chuyến đi mới
     */
    public function create(): void
    {
        $db = Database::getInstance();
        $locations = $db->fetchAll("SELECT * FROM locations ORDER BY sort_order ASC");
        $vehicles = $db->fetchAll("SELECT * FROM vehicle_types ORDER BY id ASC");
        $partners = $db->fetchAll("SELECT id, company_name FROM partners WHERE status IN ('approved', 'active')");

        $this->view('admin/trips/create', [
            'pageTitle' => 'Tạo Chuyến đi mới',
            'locations' => $locations,
            'vehicles'  => $vehicles,
            'partners'  => $partners,
        ], 'admin');
    }

    /**
     * Xử lý lưu chuyến đi mới
     */
    public function store(): void
    {
        if (!$this->validateCsrf()) return;

        $validator = new Validator($_POST, [
            'departure_location_id' => 'required',
            'arrival_location_id'   => 'required',
            'vehicle_type_id'       => 'required',
            'partner_id'            => 'required',
            'departure_datetime'    => 'required|datetime|future',
            'total_seats'           => 'required|integer|min_value:1',
            'price_per_person'      => 'required|numeric|min_value:0',
        ], [
            'departure_location_id' => 'Điểm đi',
            'arrival_location_id'   => 'Điểm đến',
            'vehicle_type_id'       => 'Phương tiện',
            'partner_id'            => 'Đối tác vận chuyển',
            'departure_datetime'    => 'Thời gian khởi hành',
            'total_seats'           => 'Tổng số chỗ',
            'price_per_person'      => 'Giá vé mỗi người',
        ]);

        if ($validator->fails()) {
            Session::flash('error', $validator->firstError());
            $this->create();
            return;
        }

        if ($this->input('departure_location_id') === $this->input('arrival_location_id')) {
            Session::flash('error', 'Điểm đi và điểm đến không được trùng nhau.');
            $this->create();
            return;
        }

        $tripCode = Helper::generateTripCode();
        $totalSeats = (int)$this->input('total_seats');

        // Tạo chuyến với trạng thái pending_approval để Nhân viên duyệt
        $tripId = $this->tripModel->create([
            'trip_code'              => $tripCode,
            'partner_id'             => (int)$this->input('partner_id'),
            'departure_location_id'  => (int)$this->input('departure_location_id'),
            'arrival_location_id'    => (int)$this->input('arrival_location_id'),
            'vehicle_type_id'        => (int)$this->input('vehicle_type_id'),
            'departure_datetime'     => $this->input('departure_datetime'),
            'return_datetime'        => !empty($this->input('return_datetime')) ? $this->input('return_datetime') : null,
            'total_seats'            => $totalSeats,
            'available_seats'        => $totalSeats,
            'price_per_person'       => (float)$this->input('price_per_person'),
            'description'            => trim($this->input('description') ?? ''),
            'policies'               => trim($this->input('policies') ?? ''),
            'status'                 => 'pending_approval',
            'created_by'             => Auth::id(),
        ]);

        // Thêm các dịch vụ kèm theo nếu có
        $serviceNames = $this->input('service_name') ?? [];
        $serviceIncluded = $this->input('service_included') ?? [];
        $servicePrices = $this->input('service_price') ?? [];

        if (is_array($serviceNames)) {
            $db = Database::getInstance();
            foreach ($serviceNames as $idx => $name) {
                if (!empty(trim($name))) {
                    $db->insert(
                        "INSERT INTO trip_services (trip_id, name, is_included, extra_price) VALUES (?, ?, ?, ?)",
                        [
                            $tripId,
                            trim($name),
                            isset($serviceIncluded[$idx]) ? 1 : 0,
                            (float)($servicePrices[$idx] ?? 0)
                        ]
                    );
                }
            }
        }

        Session::flash('success', "Đã tạo chuyến đi {$tripCode} thành công và chuyển cho Nhân viên phê duyệt!");
        $this->redirect('/admin/trips');
    }

    /**
     * Xóa chuyến đi nháp/bị từ chối
     */
    public function delete(int|string $id = 0): void
    {
        $id = (int)$id;
        $trip = $this->tripModel->find($id);

        if ($trip && in_array($trip->status, ['draft', 'rejected'])) {
            $this->tripModel->delete($id);
            Session::flash('success', 'Đã xóa chuyến đi thành công.');
        } else {
            Session::flash('error', 'Chỉ có thể xóa các chuyến ở trạng thái Nháp hoặc Bị từ chối.');
        }

        $this->redirect('/admin/trips');
    }
}
