<?php
/**
 * TravelGo - Database Singleton (PDO)
 * 
 * Sử dụng Singleton pattern để đảm bảo chỉ có 1 kết nối DB 
 * trong suốt lifecycle của request. Tất cả query đều dùng 
 * Prepared Statements để chống SQL Injection.
 */

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?Database $instance = null;
    private PDO $pdo;

    /**
     * Private constructor - chỉ gọi qua getInstance()
     */
    private function __construct()
    {
        $config = require dirname(__DIR__) . '/config/database.php';

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $config['host'],
            $config['port'],
            $config['database'],
            $config['charset']
        );

        try {
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        } catch (PDOException $e) {
            if (getenv('APP_DEBUG') === 'true') {
                die('Database connection failed: ' . $e->getMessage());
            }
            die('Database connection failed. Please try again later.');
        }
    }

    /**
     * Lấy instance duy nhất
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Lấy PDO connection
     */
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /**
     * Thực thi query với prepared statement
     * 
     * @param string $sql     SQL query với placeholder ?
     * @param array  $params  Mảng tham số
     * @return \PDOStatement
     */
    public function query(string $sql, array $params = []): \PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Lấy 1 record
     */
    public function fetchOne(string $sql, array $params = []): ?object
    {
        $result = $this->query($sql, $params)->fetch();
        return $result ?: null;
    }

    /**
     * Lấy nhiều records
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Lấy giá trị đơn (COUNT, SUM, ...)
     */
    public function fetchColumn(string $sql, array $params = [])
    {
        return $this->query($sql, $params)->fetchColumn();
    }

    /**
     * Insert và trả về last insert ID
     */
    public function insert(string $sql, array $params = []): int
    {
        $this->query($sql, $params);
        return (int)$this->pdo->lastInsertId();
    }

    /**
     * Update/Delete và trả về số rows bị ảnh hưởng
     */
    public function execute(string $sql, array $params = []): int
    {
        return $this->query($sql, $params)->rowCount();
    }

    /**
     * Bắt đầu transaction
     */
    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback(): bool
    {
        return $this->pdo->rollBack();
    }

    /**
     * Kiểm tra đang trong transaction hay không
     */
    public function inTransaction(): bool
    {
        return $this->pdo->inTransaction();
    }

    /**
     * Chống clone và unserialize
     */
    private function __clone() {}
    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize singleton");
    }
}
