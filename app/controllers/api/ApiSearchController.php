<?php
/**
 * TravelGo - Search & Recommendation API Controller
 * API gợi ý tìm kiếm realtime và đề xuất chuyến đi / khách sạn thay thế
 */

namespace App\Controllers\Api;

use App\Core\Controller;
use App\Services\RecommendationService;
use App\Core\Helper;

class ApiSearchController extends Controller
{
    private RecommendationService $recomService;

    public function __construct()
    {
        parent::__construct();
        $this->recomService = new RecommendationService();
    }

    /**
     * API Live Auto-suggest: /api/search/suggest?q=da+lat
     */
    public function suggest(): void
    {
        $query = $this->query('q', '');
        $results = $this->recomService->liveSuggest($query, 5);

        // Format tiền tệ và ngày cho kết quả JSON
        foreach ($results['trips'] as $trip) {
            $trip->formatted_price = Helper::formatMoney($trip->price_per_person);
            $trip->formatted_date = Helper::formatDateTime($trip->departure_datetime);
        }

        $this->json([
            'success' => true,
            'query'   => $query,
            'data'    => $results,
        ]);
    }

    /**
     * API Đề xuất chuyến thay thế & Khách sạn combo: /api/search/recommend?departure=1&arrival=2&date=2026-09-10
     */
    public function recommend(): void
    {
        $departureId = (int)$this->query('departure');
        $arrivalId = (int)$this->query('arrival');
        $date = $this->query('date');
        $excludeTripId = (int)$this->query('exclude_trip_id', 0);

        $alternatives = $this->recomService->getAlternativeTrips($departureId, $arrivalId, $date, $excludeTripId, 4);
        $hotels = $this->recomService->getRecommendedHotelsForDestination($arrivalId, $date, 3);

        foreach ($alternatives as $alt) {
            $alt->formatted_price = Helper::formatMoney($alt->price_per_person);
            $alt->formatted_date = Helper::formatDateTime($alt->departure_datetime);
        }

        foreach ($hotels as $h) {
            $h->formatted_min_price = $h->min_price ? Helper::formatMoney($h->min_price) : 'Liên hệ';
        }

        $this->json([
            'success'      => true,
            'alternatives' => $alternatives,
            'combo_hotels' => $hotels,
        ]);
    }
}
