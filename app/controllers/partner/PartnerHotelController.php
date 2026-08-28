<?php
/**
 * TravelGo - Partner Hotel Controller
 * Đối tác quản lý khách sạn và loại phòng thuộc sở hữu của mình
 */

namespace App\Controllers\Partner;

use App\Core\Controller;
use App\Middleware\PartnerMiddleware;
use App\Models\PartnerModel;
use App\Models\HotelModel;
use App\Models\RoomModel;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Helper;
use App\Core\Auth;
use App\Core\Session;

class PartnerHotelController extends Controller
{
    private PartnerModel $partnerModel;
    private HotelModel $hotelModel;
    private RoomModel $roomModel;

    public function __construct()
    {
        parent::__construct();
        PartnerMiddleware::handle();
        $this->partnerModel = new PartnerModel();
        $this->hotelModel = new HotelModel();
        $this->roomModel = new RoomModel();
    }

    /**
     * Danh sách khách sạn của đối tác
     */
    public function index(): void
    {
        $partner = $this->partnerModel->findByUserId(Auth::id());
        $hotels = $this->hotelModel->getPartnerHotels($partner->id);

        $this->view('partner/hotels/index', [
            'pageTitle' => 'Khách sạn của đơn vị',
            'hotels'    => $hotels,
            'partner'   => $partner,
        ], 'admin');
    }

    /**
     * Form Thêm khách sạn mới
     */
    public function create(): void
    {
        $db = Database::getInstance();
        $locations = $db->fetchAll("SELECT * FROM locations ORDER BY sort_order ASC");

        $this->view('partner/hotels/create', [
            'pageTitle' => 'Đăng ký Khách sạn mới',
            'locations' => $locations,
        ], 'admin');
    }

    /**
     * Xử lý lưu khách sạn mới
     */
    public function store(): void
    {
        if (!$this->validateCsrf()) return;

        $partner = $this->partnerModel->findByUserId(Auth::id());

        $validator = new Validator($_POST, [
            'name'        => 'required|min:3|max:150',
            'location_id' => 'required',
            'address'     => 'required|min:5|max:255',
            'star_rating' => 'required|integer|min_value:1|max_value:5',
        ], [
            'name'        => 'Tên khách sạn',
            'location_id' => 'Địa điểm',
            'address'     => 'Địa chỉ chi tiết',
            'star_rating' => 'Hạng sao',
        ]);

        if ($validator->fails()) {
            Session::flash('error', $validator->firstError());
            $this->create();
            return;
        }

        $amenities = $this->input('amenities') ?? [];
        $amenitiesJson = json_encode(array_values($amenities), JSON_UNESCAPED_UNICODE);

        $slug = Helper::slug($this->input('name')) . '-' . rand(100, 999);

        $hotelId = $this->hotelModel->create([
            'partner_id'     => $partner->id,
            'location_id'    => (int)$this->input('location_id'),
            'name'           => trim($this->input('name')),
            'slug'           => $slug,
            'address'        => trim($this->input('address')),
            'description'    => trim($this->input('description') ?? ''),
            'star_rating'    => (int)$this->input('star_rating'),
            'check_in_time'  => $this->input('check_in_time') ?: '14:00:00',
            'check_out_time' => $this->input('check_out_time') ?: '12:00:00',
            'amenities'      => $amenitiesJson,
            'status'         => 'pending', // Chờ nhân viên duyệt
        ]);

        Session::flash('success', "Đã gửi thông tin khách sạn thành công! Vui lòng thêm các loại phòng trong khi chờ Nhân viên xét duyệt.");
        $this->redirect('/partner/hotels/rooms/' . $hotelId);
    }

    /**
     * Quản lý danh sách phòng của khách sạn
     */
    public function rooms(int|string $hotelId = 0): void
    {
        $hotelId = (int)$hotelId;
        $partner = $this->partnerModel->findByUserId(Auth::id());
        $hotel = $this->hotelModel->find($hotelId);

        // Bảo mật: Đối tác không được xem/sửa khách sạn của đối tác khác!
        if (!$hotel || $hotel->partner_id !== $partner->id) {
            http_response_code(403);
            require dirname(__DIR__, 2) . '/views/errors/403.php';
            exit;
        }

        $rooms = $this->roomModel->findWhere(['hotel_id' => $hotelId], 'price_per_night ASC');

        $this->view('partner/hotels/rooms', [
            'pageTitle' => 'Quản lý Phòng - ' . $hotel->name,
            'hotel'     => $hotel,
            'rooms'     => $rooms,
        ], 'admin');
    }

    /**
     * Lưu loại phòng mới
     */
    public function storeRoom(int|string $hotelId = 0): void
    {
        if (!$this->validateCsrf()) return;

        $hotelId = (int)$hotelId;
        $partner = $this->partnerModel->findByUserId(Auth::id());
        $hotel = $this->hotelModel->find($hotelId);

        if (!$hotel || $hotel->partner_id !== $partner->id) {
            http_response_code(403);
            exit;
        }

        $validator = new Validator($_POST, [
            'name'            => 'required|min:2|max:100',
            'price_per_night' => 'required|numeric|min_value:0',
            'total_rooms'     => 'required|integer|min_value:1',
            'max_occupancy'   => 'required|integer|min_value:1',
        ], [
            'name'            => 'Tên loại phòng',
            'price_per_night' => 'Giá mỗi đêm',
            'total_rooms'     => 'Số lượng phòng',
            'max_occupancy'   => 'Số khách tối đa',
        ]);

        if ($validator->fails()) {
            Session::flash('error', $validator->firstError());
            $this->redirect('/partner/hotels/rooms/' . $hotelId);
            return;
        }

        $this->roomModel->create([
            'hotel_id'        => $hotelId,
            'name'            => trim($this->input('name')),
            'description'     => trim($this->input('description') ?? ''),
            'max_occupancy'   => (int)$this->input('max_occupancy'),
            'total_rooms'     => (int)$this->input('total_rooms'),
            'price_per_night' => (float)$this->input('price_per_night'),
            'area_sqm'        => !empty($this->input('area_sqm')) ? (float)$this->input('area_sqm') : null,
            'bed_type'        => trim($this->input('bed_type') ?? ''),
            'status'          => 'active',
        ]);

        Session::flash('success', 'Đã thêm loại phòng mới thành công!');
        $this->redirect('/partner/hotels/rooms/' . $hotelId);
    }
}
