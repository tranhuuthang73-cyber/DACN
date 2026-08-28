<?php
/**
 * TravelGo - Public Hotel Controller
 * Danh sách khách sạn, tìm kiếm theo ngày và chi tiết phòng nghỉ
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Models\HotelModel;
use App\Core\Database;

class HotelController extends Controller
{
    private HotelModel $hotelModel;

    public function __construct()
    {
        parent::__construct();
        $this->hotelModel = new HotelModel();
    }

    /**
     * Danh sách khách sạn
     */
    public function index(): void
    {
        $page = (int)($this->query('page', 1));
        $filters = [
            'location'  => $this->query('location'),
            'stars'     => $this->query('stars'),
            'keyword'   => $this->query('keyword'),
            'check_in'  => $this->query('check_in'),
            'check_out' => $this->query('check_out'),
            'sort'      => $this->query('sort', 'stars_desc'),
        ];

        $results = $this->hotelModel->searchHotels($filters, $page, 9);

        $db = Database::getInstance();
        $locations = $db->fetchAll("SELECT * FROM locations ORDER BY sort_order ASC");

        $this->view('hotels/index', [
            'pageTitle' => 'Khách sạn & Khu nghỉ dưỡng',
            'hotels'    => $results['data'],
            'total'     => $results['total'],
            'pages'     => $results['pages'],
            'current'   => $results['current'],
            'filters'   => $filters,
            'locations' => $locations,
        ]);
    }

    /**
     * Tìm kiếm khách sạn
     */
    public function search(): void
    {
        $this->index();
    }

    /**
     * Chi tiết khách sạn & danh sách phòng
     */
    public function detail(int|string $id = 0): void
    {
        $id = (int)$id;
        $checkIn = $this->query('check_in') ?: date('Y-m-d', strtotime('+1 day'));
        $checkOut = $this->query('check_out') ?: date('Y-m-d', strtotime('+3 days'));

        $hotel = $this->hotelModel->getDetail($id, $checkIn, $checkOut);

        if (!$hotel) {
            $this->redirectWithSuccess('/hotels', 'Khách sạn không tồn tại hoặc chưa kích hoạt.');
            return;
        }

        $this->view('hotels/detail', [
            'pageTitle' => $hotel->name . ' - Khách sạn ' . $hotel->star_rating . ' sao',
            'hotel'     => $hotel,
            'checkIn'   => $checkIn,
            'checkOut'  => $checkOut,
        ]);
    }
}
