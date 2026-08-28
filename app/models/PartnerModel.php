<?php
/**
 * TravelGo - Partner Model
 */

namespace App\Models;

use App\Core\Model;

class PartnerModel extends Model
{
    protected string $table = 'partners';

    /**
     * Tìm thông tin đối tác theo user_id
     */
    public function findByUserId(int $userId): ?object
    {
        return $this->findOneWhere(['user_id' => $userId]);
    }

    /**
     * Tạo hồ sơ đối tác mới kèm trạng thái pending
     */
    public function createPartnerProfile(int $userId, array $data): int
    {
        return $this->create([
            'user_id'        => $userId,
            'company_name'   => $data['company_name'],
            'tax_code'       => $data['tax_code'] ?? null,
            'address'        => $data['address'] ?? null,
            'description'    => $data['description'] ?? null,
            'contact_person' => $data['contact_person'] ?? $data['full_name'] ?? null,
            'contact_phone'  => $data['contact_phone'] ?? $data['phone'] ?? null,
            'contact_email'  => $data['contact_email'] ?? $data['email'] ?? null,
            'status'         => 'pending',
        ]);
    }

    /**
     * Lấy danh sách đối tác kèm thông tin User
     */
    public function getPartnersWithUser(string $status = ''): array
    {
        $sql = "SELECT p.*, u.username, u.email as user_email, u.full_name as user_full_name, u.phone as user_phone
                FROM {$this->table} p
                JOIN users u ON p.user_id = u.id";
        
        $params = [];
        if (!empty($status)) {
            $sql .= " WHERE p.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY p.created_at DESC";

        return $this->db->fetchAll($sql, $params);
    }
}
