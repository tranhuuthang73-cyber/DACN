<?php
/**
 * TravelGo - Smart Recommendation Service
 * 
 * Động cơ gợi ý thông minh cho du lịch:
 * 1. Gợi ý chuyến đi thay thế khi chuyến đã chọn hết chỗ hoặc không đúng ngày
 * 2. Gợi ý khách sạn phù hợp tại điểm đến (Combo Chuyến đi + Khách sạn)
 * 3. Gợi ý các địa điểm du lịch tương đồng theo mùa / xu hướng
 */

namespace App\Services;

use App\Core\Database;

class RecommendationService
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Gợi ý các chuyến đi thay thế thông minh:
     * - Cùng tuyến đường nhưng cách +- 3 ngày
     * - Cùng điểm đến nhưng khác loại phương tiện
     * - Sắp xếp theo độ lệch thời gian nhỏ nhất và số chỗ còn nhiều nhất
     */
    public function getAlternativeTrips(int $departureId, int $arrivalId, ?string $targetDate = null, int $excludeTripId = 0, int $limit = 4): array
    {
        $targetDateTime = $targetDate ? $targetDate . ' 00:00:00' : date('Y-m-d H:i:s');

        $sql = "SELECT t.*, 
                       dl.name AS departure_name, 
                       al.name AS arrival_name,
                       vt.name AS vehicle_name, vt.icon AS vehicle_icon,
                       p.company_name AS partner_name,
                       ROUND((t.total_seats - t.available_seats) / t.total_seats * 100) AS fill_rate,
                       ABS(TIMESTAMPDIFF(HOUR, t.departure_datetime, ?)) AS time_diff_hours
                FROM trips t
                JOIN locations dl ON t.departure_location_id = dl.id
                JOIN locations al ON t.arrival_location_id = al.id
                JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                JOIN partners p ON t.partner_id = p.id
                WHERE t.status = 'active'
                  AND t.departure_datetime > NOW()
                  AND t.available_seats > 0
                  AND t.id != ?
                  AND (
                      (t.departure_location_id = ? AND t.arrival_location_id = ?)
                      OR (t.arrival_location_id = ?)
                  )
                ORDER BY 
                  -- Ưu tiên 1: Đúng chính xác cả điểm đi và điểm đến
                  CASE WHEN t.departure_location_id = ? AND t.arrival_location_id = ? THEN 0 ELSE 1 END ASC,
                  -- Ưu tiên 2: Thời gian gần với ngày khách mong muốn nhất
                  time_diff_hours ASC,
                  -- Ưu tiên 3: Chỗ ngồi còn nhiều
                  t.available_seats DESC
                LIMIT {$limit}";

        return $this->db->fetchAll($sql, [
            $targetDateTime,
            $excludeTripId,
            $departureId,
            $arrivalId,
            $arrivalId,
            $departureId,
            $arrivalId
        ]);
    }

    /**
     * Gợi ý khách sạn tốt nhất tại điểm đến cho khách đi chuyến đó (Combo Du lịch)
     */
    public function getRecommendedHotelsForDestination(int $arrivalLocationId, ?string $checkInDate = null, int $limit = 3): array
    {
        $sql = "SELECT h.*, 
                       l.name AS location_name,
                       p.company_name AS partner_name,
                       MIN(rt.price_per_night) AS min_price,
                       COUNT(rt.id) AS room_type_count
                FROM hotels h
                JOIN locations l ON h.location_id = l.id
                JOIN partners p ON h.partner_id = p.id
                LEFT JOIN room_types rt ON rt.hotel_id = h.id AND rt.status = 'active'
                WHERE h.location_id = ? AND h.status = 'active'
                GROUP BY h.id
                ORDER BY h.star_rating DESC, min_price ASC
                LIMIT {$limit}";

        $hotels = $this->db->fetchAll($sql, [$arrivalLocationId]);

        foreach ($hotels as $hotel) {
            $hotel->amenities_list = !empty($hotel->amenities) ? json_decode($hotel->amenities, true) : [];
        }

        return $hotels;
    }

    /**
     * Tìm kiếm nhanh tự động hoàn thành (Auto-suggest Live Search)
     */
    public function liveSuggest(string $query, int $limit = 6): array
    {
        $query = trim($query);
        if (empty($query) || mb_strlen($query) < 2) {
            return ['locations' => [], 'trips' => [], 'hotels' => []];
        }

        $param = '%' . $query . '%';

        // 1. Địa điểm
        $locations = $this->db->fetchAll(
            "SELECT id, name, province, image FROM locations 
             WHERE name LIKE ? OR province LIKE ? 
             ORDER BY is_popular DESC LIMIT {$limit}",
            [$param, $param]
        );

        // 2. Chuyến đi
        $trips = $this->db->fetchAll(
            "SELECT t.id, t.trip_code, t.departure_datetime, t.price_per_person,
                    dl.name AS departure_name, al.name AS arrival_name, vt.name AS vehicle_name
             FROM trips t
             JOIN locations dl ON t.departure_location_id = dl.id
             JOIN locations al ON t.arrival_location_id = al.id
             JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
             WHERE (dl.name LIKE ? OR al.name LIKE ? OR t.trip_code LIKE ?)
               AND t.status = 'active' AND t.departure_datetime > NOW()
             ORDER BY t.departure_datetime ASC LIMIT {$limit}",
            [$param, $param, $param]
        );

        // 3. Khách sạn
        $hotels = $this->db->fetchAll(
            "SELECT h.id, h.name, h.star_rating, l.name AS location_name, h.featured_image
             FROM hotels h
             JOIN locations l ON h.location_id = l.id
             WHERE (h.name LIKE ? OR l.name LIKE ?) AND h.status = 'active'
             ORDER BY h.star_rating DESC LIMIT {$limit}",
            [$param, $param]
        );

        return [
            'locations' => $locations,
            'trips'     => $trips,
            'hotels'    => $hotels,
        ];
    }
}
