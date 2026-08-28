<?php
/**
 * TravelGo - Public Trip Controller
 * Danh sách chuyến đi, tìm kiếm, lọc nâng cao và chi tiết chuyến
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Models\TripModel;
use App\Core\Database;

class TripController extends Controller
{
    private TripModel $tripModel;

    public function __construct()
    {
        parent::__construct();
        $this->tripModel = new TripModel();
    }

    /**
     * Danh sách chuyến đi có lọc và phân trang
     */
    public function index(): void
    {
        $page = (int)($this->query('page', 1));
        $filters = [
            'departure'  => $this->query('departure'),
            'arrival'    => $this->query('arrival'),
            'date'       => $this->query('date'),
            'vehicle'    => $this->query('vehicle'),
            'min_price'  => $this->query('min_price'),
            'max_price'  => $this->query('max_price'),
            'passengers' => $this->query('passengers'),
            'sort'       => $this->query('sort', 'date_asc'),
        ];

        $results = $this->tripModel->searchTrips($filters, $page, 9);

        $db = Database::getInstance();
        $locations = $db->fetchAll("SELECT * FROM locations ORDER BY sort_order ASC");
        $vehicles = $db->fetchAll("SELECT * FROM vehicle_types ORDER BY id ASC");

        $this->view('trips/index', [
            'pageTitle' => 'Tìm kiếm & Đặt chuyến đi',
            'trips'     => $results['data'],
            'total'     => $results['total'],
            'pages'     => $results['pages'],
            'current'   => $results['current'],
            'filters'   => $filters,
            'locations' => $locations,
            'vehicles'  => $vehicles,
        ]);
    }

    /**
     * Tìm kiếm chuyến
     */
    public function search(): void
    {
        $this->index();
    }

    /**
     * Chi tiết chuyến đi
     */
    public function detail(int|string $id = 0): void
    {
        $id = (int)$id;
        $trip = $this->tripModel->getDetail($id);

        if (!$trip) {
            $this->redirectWithSuccess('/trips', 'Chuyến đi không tồn tại hoặc đã bị gỡ.');
            return;
        }

        // Lấy danh sách chuyến thay thế nếu chuyến này gần hết chỗ hoặc để khách tham khảo
        $recomService = new \App\Services\RecommendationService();
        $alternatives = $recomService->getAlternativeTrips(
            $trip->departure_location_id,
            $trip->arrival_location_id,
            date('Y-m-d', strtotime($trip->departure_datetime)),
            $trip->id,
            3
        );

        // Gợi ý Combo Khách sạn tại điểm đến
        $comboHotels = $recomService->getRecommendedHotelsForDestination(
            $trip->arrival_location_id,
            date('Y-m-d', strtotime($trip->departure_datetime)),
            3
        );

        $this->view('trips/detail', [
            'pageTitle'    => "{$trip->departure_name} → {$trip->arrival_name} ({$trip->vehicle_name})",
            'trip'         => $trip,
            'alternatives' => $alternatives,
            'comboHotels'  => $comboHotels,
        ]);
    }
}
