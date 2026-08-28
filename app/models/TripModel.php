<?php
/**
 * TravelGo - Trip Model
 */

namespace App\Models;

use App\Core\Model;

class TripModel extends Model
{
    protected string $table = 'trips';

    /**
     * Lấy chi tiết chuyến đi kèm thông tin liên quan
     */
    public function getDetail(int $id): ?object
    {
        $sql = "SELECT t.*, 
                       dl.name AS departure_name, dl.province AS departure_province,
                       al.name AS arrival_name, al.province AS arrival_province,
                       vt.name AS vehicle_name, vt.icon AS vehicle_icon, vt.slug AS vehicle_slug,
                       p.company_name AS partner_name, p.contact_phone AS partner_phone, p.logo AS partner_logo,
                       u.full_name AS creator_name,
                       ROUND((t.total_seats - t.available_seats) / t.total_seats * 100) AS fill_rate
                FROM {$this->table} t
                JOIN locations dl ON t.departure_location_id = dl.id
                JOIN locations al ON t.arrival_location_id = al.id
                JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                JOIN partners p ON t.partner_id = p.id
                JOIN users u ON t.created_by = u.id
                WHERE t.id = ? LIMIT 1";

        $trip = $this->db->fetchOne($sql, [$id]);
        if (!$trip) return null;

        // Lấy dịch vụ đi kèm
        $trip->services = $this->db->fetchAll(
            "SELECT * FROM trip_services WHERE trip_id = ? ORDER BY is_included DESC, id ASC",
            [$id]
        );

        // Lấy hình ảnh bổ sung
        $trip->images = $this->db->fetchAll(
            "SELECT * FROM images WHERE imageable_type = 'trip' AND imageable_id = ? ORDER BY sort_order ASC",
            [$id]
        );

        return $trip;
    }

    /**
     * Tìm kiếm và lọc danh sách chuyến đi có phân trang
     */
    public function searchTrips(array $filters = [], int $page = 1, int $perPage = 9): array
    {
        $where = ["t.status = 'active'", "t.departure_datetime > NOW()", "t.available_seats > 0"];
        $params = [];

        // Lọc điểm đi
        if (!empty($filters['departure'])) {
            $where[] = "t.departure_location_id = ?";
            $params[] = (int)$filters['departure'];
        }

        // Lọc điểm đến
        if (!empty($filters['arrival'])) {
            $where[] = "t.arrival_location_id = ?";
            $params[] = (int)$filters['arrival'];
        }

        // Lọc ngày đi (trong cùng ngày)
        if (!empty($filters['date'])) {
            $where[] = "DATE(t.departure_datetime) = ?";
            $params[] = $filters['date'];
        }

        // Lọc loại phương tiện
        if (!empty($filters['vehicle'])) {
            $where[] = "t.vehicle_type_id = ?";
            $params[] = (int)$filters['vehicle'];
        }

        // Lọc khoảng giá
        if (!empty($filters['min_price'])) {
            $where[] = "t.price_per_person >= ?";
            $params[] = (float)$filters['min_price'];
        }
        if (!empty($filters['max_price'])) {
            $where[] = "t.price_per_person <= ?";
            $params[] = (float)$filters['max_price'];
        }

        // Lọc số chỗ cần tối thiểu
        if (!empty($filters['passengers'])) {
            $where[] = "t.available_seats >= ?";
            $params[] = (int)$filters['passengers'];
        }

        // Sắp xếp
        $sort = $filters['sort'] ?? 'date_asc';
        $orderBy = match ($sort) {
            'price_asc'  => 't.price_per_person ASC',
            'price_desc' => 't.price_per_person DESC',
            'date_desc'  => 't.departure_datetime DESC',
            'popular'    => 'fill_rate DESC',
            default      => 't.departure_datetime ASC',
        };

        $whereClause = implode(' AND ', $where);

        // Đếm tổng số records
        $countSql = "SELECT COUNT(*) FROM {$this->table} t WHERE {$whereClause}";
        $total = (int)$this->db->fetchColumn($countSql, $params);

        // Lấy dữ liệu trang
        $offset = ($page - 1) * $perPage;
        $sql = "SELECT t.*, 
                       dl.name AS departure_name, 
                       al.name AS arrival_name,
                       vt.name AS vehicle_name, vt.icon AS vehicle_icon,
                       p.company_name AS partner_name,
                       ROUND((t.total_seats - t.available_seats) / t.total_seats * 100) AS fill_rate
                FROM {$this->table} t
                JOIN locations dl ON t.departure_location_id = dl.id
                JOIN locations al ON t.arrival_location_id = al.id
                JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                JOIN partners p ON t.partner_id = p.id
                WHERE {$whereClause}
                ORDER BY {$orderBy}
                LIMIT {$perPage} OFFSET {$offset}";

        $data = $this->db->fetchAll($sql, $params);

        return [
            'data'    => $data,
            'total'   => $total,
            'pages'   => (int)ceil($total / $perPage),
            'current' => $page,
            'perPage' => $perPage,
        ];
    }

    /**
     * Gợi ý các chuyến thay thế (cùng địa điểm ngày khác hoặc chuyến gần nhất)
     */
    public function getAlternativeTrips(int $departureId, int $arrivalId, ?string $targetDate = null, int $excludeTripId = 0, int $limit = 4): array
    {
        $sql = "SELECT t.*, 
                       dl.name AS departure_name, 
                       al.name AS arrival_name,
                       vt.name AS vehicle_name, vt.icon AS vehicle_icon,
                       p.company_name AS partner_name,
                       ROUND((t.total_seats - t.available_seats) / t.total_seats * 100) AS fill_rate
                FROM {$this->table} t
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
                  CASE WHEN t.departure_location_id = ? AND t.arrival_location_id = ? THEN 0 ELSE 1 END,
                  ABS(TIMESTAMPDIFF(HOUR, t.departure_datetime, IFNULL(?, NOW()))) ASC
                LIMIT {$limit}";

        return $this->db->fetchAll($sql, [
            $excludeTripId, 
            $departureId, 
            $arrivalId, 
            $arrivalId,
            $departureId,
            $arrivalId,
            $targetDate ? $targetDate . ' 00:00:00' : date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Lấy toàn bộ chuyến cho Admin / Employee quản lý
     */
    public function getAdminTrips(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $where = ["1=1"];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = "t.status = ?";
            $params[] = $filters['status'];
        }
        if (!empty($filters['partner_id'])) {
            $where[] = "t.partner_id = ?";
            $params[] = (int)$filters['partner_id'];
        }
        if (!empty($filters['search'])) {
            $where[] = "(t.trip_code LIKE ? OR dl.name LIKE ? OR al.name LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = implode(' AND ', $where);

        $countSql = "SELECT COUNT(*) 
                     FROM {$this->table} t 
                     JOIN locations dl ON t.departure_location_id = dl.id
                     JOIN locations al ON t.arrival_location_id = al.id
                     WHERE {$whereClause}";
        $total = (int)$this->db->fetchColumn($countSql, $params);

        $offset = ($page - 1) * $perPage;
        $sql = "SELECT t.*, 
                       dl.name AS departure_name, 
                       al.name AS arrival_name,
                       vt.name AS vehicle_name,
                       p.company_name AS partner_name,
                       u.full_name AS creator_name,
                       emp.full_name AS approver_name
                FROM {$this->table} t
                JOIN locations dl ON t.departure_location_id = dl.id
                JOIN locations al ON t.arrival_location_id = al.id
                JOIN vehicle_types vt ON t.vehicle_type_id = vt.id
                JOIN partners p ON t.partner_id = p.id
                JOIN users u ON t.created_by = u.id
                LEFT JOIN users emp ON t.approved_by = emp.id
                WHERE {$whereClause}
                ORDER BY t.created_at DESC
                LIMIT {$perPage} OFFSET {$offset}";

        $data = $this->db->fetchAll($sql, $params);

        return [
            'data'    => $data,
            'total'   => $total,
            'pages'   => (int)ceil($total / $perPage),
            'current' => $page,
            'perPage' => $perPage,
        ];
    }
}
