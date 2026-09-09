<?php
/**
 * TravelGo - Partner Trip Controller
 * Đối tác xem và tự đăng ký chuyến đi mới (chờ Nhân viên/Admin phê duyệt)
 */

namespace App\Controllers\Partner;

use App\Core\Controller;
use App\Middleware\PartnerMiddleware;
use App\Models\PartnerModel;
use App\Models\TripModel;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Auth;
use App\Core\Session;

class PartnerTripController extends Controller
{
    private PartnerModel $partnerModel;
    private TripModel $tripModel;

    public function __construct()
    {
        parent::__construct();
        PartnerMiddleware::handle();
        $this->partnerModel = new PartnerModel();
        $this->tripModel = new TripModel();
    }

    /**
     * Danh sách chuyến đi của đối tác này
     */
    public function index(): void
    {
        $partner = $this->partnerModel->findByUserId(Auth::id());
        $page = (int)($this->query('page', 1));

        $results = $this->tripModel->getAdminTrips([
            'partner_id' => $partner->id,
            'status'     => $this->query('status'),
        ], $page, 15);

        $this->view('partner/trips/index', [
            'pageTitle' => 'Chuyến đi của đơn vị',
            'trips'     => $results['data'],
            'total'     => $results['total'],
            'pages'     => $results['pages'],
            'current'   => $results['current'],
            'partner'   => $partner,
            'status'    => $this->query('status'),
        ], 'admin');
    }

    /**
     * Form Đăng ký chuyến đi mới
     */
    public function create(): void
    {
        $partner = $this->partnerModel->findByUserId(Auth::id());
        $db = Database::getInstance();
        $locations = $db->fetchAll("SELECT * FROM locations ORDER BY sort_order ASC");
        $vehicles = $db->fetchAll("SELECT * FROM vehicle_types ORDER BY id ASC");

        $this->view('partner/trips/create', [
            'pageTitle' => 'Đăng ký Chuyến xe mới',
            'partner'   => $partner,
            'locations' => $locations,
            'vehicles'  => $vehicles,
        ], 'admin');
    }

    /**
     * Xử lý lưu chuyến đi mới gửi duyệt
     */
    public function store(): void
    {
        if (!$this->validateCsrf()) return;

        $partner = $this->partnerModel->findByUserId(Auth::id());

        $validator = new Validator($_POST, [
            'departure_location_id' => 'required',
            'arrival_location_id'   => 'required',
            'vehicle_type_id'       => 'required',
            'departure_datetime'    => 'required',
            'total_seats'           => 'required',
            'price_per_person'      => 'required',
        ], [
            'departure_location_id' => 'Điểm khởi hành',
            'arrival_location_id'   => 'Điểm đến',
            'vehicle_type_id'       => 'Loại phương tiện',
            'departure_datetime'    => 'Thời gian khởi hành',
            'total_seats'           => 'Tổng số chỗ ngồi',
            'price_per_person'      => 'Giá vé',
        ]);

        if ($validator->fails()) {
            Session::flash('error', $validator->firstError());
            $this->create();
            return;
        }

        if ($this->input('departure_location_id') == $this->input('arrival_location_id')) {
            Session::flash('error', 'Điểm khởi hành và điểm đến không được trùng nhau.');
            $this->create();
            return;
        }

        $totalSeats = (int)$this->input('total_seats');
        $price = (float)$this->input('price_per_person');

        // Tạo mã chuyến ngẫu nhiên
        $tripCode = 'TG-' . strtoupper(substr(uniqid(), -6));

        $tripId = $this->tripModel->create([
            'trip_code'              => $tripCode,
            'partner_id'             => $partner->id,
            'departure_location_id'  => (int)$this->input('departure_location_id'),
            'arrival_location_id'    => (int)$this->input('arrival_location_id'),
            'vehicle_type_id'        => (int)$this->input('vehicle_type_id'),
            'departure_datetime'     => $this->input('departure_datetime'),
            'return_datetime'        => !empty($this->input('return_datetime')) ? $this->input('return_datetime') : null,
            'total_seats'            => $totalSeats,
            'available_seats'        => $totalSeats,
            'price_per_person'       => $price,
            'description'            => trim($this->input('description') ?? ''),
            'policies'               => trim($this->input('policies') ?? ''),
            'status'                 => 'pending_approval', // Trạng thái chờ nhân viên duyệt
            'created_by'             => Auth::id(),
        ]);

        Session::flash('success', "Đã gửi yêu cầu đăng ký chuyến {$tripCode} thành công! Đang chờ Nhân viên TravelGo phê duyệt.");
        $this->redirect('/partner/trips');
    }
}
