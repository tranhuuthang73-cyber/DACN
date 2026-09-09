<?php
/**
 * TravelGo - Notification Service
 * 
 * Dịch vụ gửi thông báo tập trung cho toàn bộ hệ thống (Customer, Admin, Employee, Partner).
 */

namespace App\Services;

use App\Models\NotificationModel;
use App\Core\Database;

class NotificationService
{
    private NotificationModel $model;
    private Database $db;

    public function __construct()
    {
        $this->model = new NotificationModel();
        $this->db = Database::getInstance();
    }

    /**
     * Gửi thông báo tới 1 người dùng cụ thể
     */
    public function send(int $userId, string $title, string $message, string $type = 'system', ?string $refType = null, ?int $refId = null): int
    {
        return $this->model->createNotification($userId, $title, $message, $type, $refType, $refId);
    }

    /**
     * Gửi thông báo tới toàn bộ Quản trị viên (Admin)
     */
    public function notifyAdmins(string $title, string $message, string $type = 'system', ?string $refType = null, ?int $refId = null): int
    {
        $admins = $this->db->fetchAll("SELECT id FROM users WHERE role = 'admin' AND status = 'active'");
        $count = 0;
        foreach ($admins as $admin) {
            $this->model->createNotification($admin->id, $title, $message, $type, $refType, $refId);
            $count++;
        }
        return $count;
    }

    /**
     * Gửi thông báo tới toàn bộ Nhân viên (Employee)
     */
    public function notifyEmployees(string $title, string $message, string $type = 'system', ?string $refType = null, ?int $refId = null): int
    {
        $employees = $this->db->fetchAll("SELECT id FROM users WHERE role = 'employee' AND status = 'active'");
        $count = 0;
        foreach ($employees as $emp) {
            $this->model->createNotification($emp->id, $title, $message, $type, $refType, $refId);
            $count++;
        }
        return $count;
    }

    /**
     * Gửi thông báo tới Đối tác sở hữu dịch vụ
     */
    public function notifyPartner(int $partnerUserId, string $title, string $message, string $type = 'system', ?string $refType = null, ?int $refId = null): int
    {
        return $this->model->createNotification($partnerUserId, $title, $message, $type, $refType, $refId);
    }
}
