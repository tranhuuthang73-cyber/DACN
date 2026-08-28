<?php
/**
 * TravelGo - Hotel Model
 */

namespace App\Models;

use App\Core\Model;

class HotelModel extends Model
{
    protected string $table = 'hotels';

    /**
     * Lấy chi tiết khách sạn kèm phòng và hình ảnh
     */
    public function getDetail(int $id, ?string $checkIn = null, ?string $checkOut = null): ?object
    {
        $sql = "SELECT h.*, 
                       l.name AS location_name, l.province AS location_province,
                       p.company_name AS partner_name, p.contact_phone AS partner_phone, p.logo AS partner_logo,
                       emp.full_name AS approver_name
                FROM {$this->table} h
                JOIN locations l ON h.location_id = l.id
                JOIN partners p ON h.partner_id = p.id
                LEFT JOIN users emp ON h.approved_by = emp.id
                WHERE h.id = ? LIMIT 1";

        $hotel = $this->db->fetchOne($sql, [$id]);
        if (!$hotel) return null;

        // Decode amenities JSON
        $hotel->amenities_list = !empty($hotel->amenities) ? json_decode($hotel->amenities, true) : [];

        // Lấy danh sách loại phòng kèm tình trạng phòng trống
        $roomModel = new RoomModel();
        $hotel->room_types = $roomModel->getRoomsByHotel($id, $checkIn, $checkOut);

        // Lấy hình ảnh bổ sung
        $hotel->images = $this->db->fetchAll(
            "SELECT * FROM images WHERE imageable_type = 'hotel' AND imageable_id = ? ORDER BY sort_order ASC",
            [$id]
        );

        return $hotel;
    }

    /**
     * Tìm kiếm và lọc danh sách khách sạn
     */
    public function searchHotels(array $filters = [], int $page = 1, int $perPage = 9): array
    {
        $where = ["h.status = 'active'"];
        $params = [];

        if (!empty($filters['location'])) {
            $where[] = "h.location_id = ?";
            $params[] = (int)$filters['location'];
        }

        if (!empty($filters['stars'])) {
            $where[] = "h.star_rating = ?";
            $params[] = (int)$filters['stars'];
        }

        if (!empty($filters['keyword'])) {
            $where[] = "(h.name LIKE ? OR h.address LIKE ?)";
            $keyword = '%' . $filters['keyword'] . '%';
            $params[] = $keyword;
            $params[] = $keyword;
        }

        $whereClause = implode(' AND ', $where);

        $countSql = "SELECT COUNT(DISTINCT h.id) 
                     FROM {$this->table} h 
                     LEFT JOIN room_types rt ON rt.hotel_id = h.id AND rt.status = 'active'
                     WHERE {$whereClause}";
        $total = (int)$this->db->fetchColumn($countSql, $params);

        $sort = $filters['sort'] ?? 'stars_desc';
        $orderBy = match ($sort) {
            'price_asc'  => 'min_price ASC',
            'price_desc' => 'min_price DESC',
            'name_asc'   => 'h.name ASC',
            default      => 'h.star_rating DESC',
        };

        $offset = ($page - 1) * $perPage;
        $sql = "SELECT h.*, 
                       l.name AS location_name, 
                       p.company_name AS partner_name,
                       MIN(rt.price_per_night) AS min_price,
                       MAX(rt.price_per_night) AS max_price,
                       COUNT(rt.id) AS room_type_count
                FROM {$this->table} h
                JOIN locations l ON h.location_id = l.id
                JOIN partners p ON h.partner_id = p.id
                LEFT JOIN room_types rt ON rt.hotel_id = h.id AND rt.status = 'active'
                WHERE {$whereClause}
                GROUP BY h.id
                ORDER BY {$orderBy}
                LIMIT {$perPage} OFFSET {$offset}";

        $data = $this->db->fetchAll($sql, $params);

        // Decode amenities for list cards
        foreach ($data as $item) {
            $item->amenities_list = !empty($item->amenities) ? json_decode($item->amenities, true) : [];
        }

        return [
            'data'    => $data,
            'total'   => $total,
            'pages'   => (int)ceil($total / $perPage),
            'current' => $page,
            'perPage' => $perPage,
        ];
    }

    /**
     * Lấy danh sách khách sạn của đối tác
     */
    public function getPartnerHotels(int $partnerId): array
    {
        $sql = "SELECT h.*, 
                       l.name AS location_name,
                       COUNT(rt.id) AS room_count,
                       MIN(rt.price_per_night) AS min_price
                FROM {$this->table} h
                JOIN locations l ON h.location_id = l.id
                LEFT JOIN room_types rt ON rt.hotel_id = h.id
                WHERE h.partner_id = ?
                GROUP BY h.id
                ORDER BY h.created_at DESC";

        return $this->db->fetchAll($sql, [$partnerId]);
    }
}
