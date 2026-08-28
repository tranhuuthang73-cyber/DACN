<?php
/**
 * TravelGo - Base Model
 * 
 * Lớp Model cơ sở cung cấp các thao tác CRUD phổ biến.
 * Tất cả Model kế thừa từ class này.
 * 
 * Sử dụng:
 *   class TripModel extends Model {
 *       protected string $table = 'trips';
 *   }
 *   $trip = (new TripModel())->find(1);
 */

namespace App\Core;

class Model
{
    protected Database $db;
    protected string $table = '';
    protected string $primaryKey = 'id';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Tìm record theo ID
     */
    public function find(int $id): ?object
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$id]);
    }

    /**
     * Lấy tất cả records
     */
    public function all(string $orderBy = 'id DESC'): array
    {
        $sql = "SELECT * FROM {$this->table} ORDER BY {$orderBy}";
        return $this->db->fetchAll($sql);
    }

    /**
     * Tìm record theo điều kiện
     * 
     * @param array $conditions ['status' => 'active', 'role' => 'customer']
     */
    public function findWhere(array $conditions, string $orderBy = 'id DESC', ?int $limit = null): array
    {
        $where = [];
        $params = [];
        foreach ($conditions as $column => $value) {
            if ($value === null) {
                $where[] = "{$column} IS NULL";
            } else {
                $where[] = "{$column} = ?";
                $params[] = $value;
            }
        }

        $sql = "SELECT * FROM {$this->table}";
        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " ORDER BY {$orderBy}";
        if ($limit) {
            $sql .= " LIMIT {$limit}";
        }

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Tìm 1 record theo điều kiện
     */
    public function findOneWhere(array $conditions): ?object
    {
        $results = $this->findWhere($conditions, 'id DESC', 1);
        return $results[0] ?? null;
    }

    /**
     * Đếm records theo điều kiện
     */
    public function count(array $conditions = []): int
    {
        $where = [];
        $params = [];
        foreach ($conditions as $column => $value) {
            $where[] = "{$column} = ?";
            $params[] = $value;
        }

        $sql = "SELECT COUNT(*) FROM {$this->table}";
        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        return (int)$this->db->fetchColumn($sql, $params);
    }

    /**
     * Insert record mới
     * 
     * @param array $data ['column' => 'value', ...]
     * @return int ID của record mới
     */
    public function create(array $data): int
    {
        $columns = array_keys($data);
        $placeholders = array_fill(0, count($columns), '?');

        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->table,
            implode(', ', $columns),
            implode(', ', $placeholders)
        );

        return $this->db->insert($sql, array_values($data));
    }

    /**
     * Update record theo ID
     * 
     * @param int   $id   ID record cần update
     * @param array $data ['column' => 'value', ...]
     * @return int Số rows đã update
     */
    public function update(int $id, array $data): int
    {
        $sets = [];
        $params = [];
        foreach ($data as $column => $value) {
            $sets[] = "{$column} = ?";
            $params[] = $value;
        }
        $params[] = $id;

        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s = ?",
            $this->table,
            implode(', ', $sets),
            $this->primaryKey
        );

        return $this->db->execute($sql, $params);
    }

    /**
     * Update theo điều kiện tùy chỉnh
     */
    public function updateWhere(array $conditions, array $data): int
    {
        $sets = [];
        $params = [];

        foreach ($data as $column => $value) {
            $sets[] = "{$column} = ?";
            $params[] = $value;
        }

        $where = [];
        foreach ($conditions as $column => $value) {
            $where[] = "{$column} = ?";
            $params[] = $value;
        }

        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s",
            $this->table,
            implode(', ', $sets),
            implode(' AND ', $where)
        );

        return $this->db->execute($sql, $params);
    }

    /**
     * Xóa record theo ID
     */
    public function delete(int $id): int
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Phân trang
     * 
     * @param int    $page     Trang hiện tại
     * @param int    $perPage  Số record mỗi trang
     * @param string $where    Điều kiện WHERE (optional)
     * @param array  $params   Tham số cho WHERE
     * @param string $orderBy  Sắp xếp
     * @return array ['data' => [], 'total' => int, 'pages' => int, 'current' => int]
     */
    public function paginate(int $page = 1, int $perPage = 12, string $where = '', array $params = [], string $orderBy = 'id DESC'): array
    {
        $page = max(1, $page);
        $offset = ($page - 1) * $perPage;

        // Đếm tổng
        $countSql = "SELECT COUNT(*) FROM {$this->table}";
        if ($where) {
            $countSql .= " WHERE {$where}";
        }
        $total = (int)$this->db->fetchColumn($countSql, $params);

        // Lấy dữ liệu trang
        $dataSql = "SELECT * FROM {$this->table}";
        if ($where) {
            $dataSql .= " WHERE {$where}";
        }
        $dataSql .= " ORDER BY {$orderBy} LIMIT {$perPage} OFFSET {$offset}";
        $data = $this->db->fetchAll($dataSql, $params);

        return [
            'data'    => $data,
            'total'   => $total,
            'pages'   => (int)ceil($total / $perPage),
            'current' => $page,
            'perPage' => $perPage,
        ];
    }

    /**
     * Chạy raw query tùy chỉnh
     */
    public function raw(string $sql, array $params = []): array
    {
        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Kiểm tra record tồn tại
     */
    public function exists(array $conditions): bool
    {
        return $this->count($conditions) > 0;
    }

    /**
     * Bắt đầu transaction
     */
    public function beginTransaction(): void
    {
        $this->db->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit(): void
    {
        $this->db->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback(): void
    {
        $this->db->rollback();
    }
}
