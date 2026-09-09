<?php
/**
 * TravelGo - Admin Settings Controller
 * Cấu hình tham số hệ thống: Giữ chỗ 15 phút, Cổng thanh toán, Thông tin liên hệ
 */

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Middleware\AdminMiddleware;
use App\Core\Database;
use App\Core\Session;

class AdminSettingsController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        AdminMiddleware::handle();
    }

    /**
     * Giao diện cấu hình hệ thống
     */
    public function index(): void
    {
        $db = Database::getInstance();
        $rawSettings = $db->fetchAll("SELECT * FROM system_settings");
        
        $settings = [];
        foreach ($rawSettings as $row) {
            $settings[$row->setting_key] = $row->setting_value;
        }

        $policies = $db->fetchAll("SELECT * FROM cancellation_policies ORDER BY sort_order ASC");

        $this->view('admin/settings/index', [
            'pageTitle' => 'Cấu hình Hệ thống',
            'settings'  => $settings,
            'policies'  => $policies,
        ], 'admin');
    }

    /**
     * Cập nhật cấu hình hệ thống
     */
    public function update(): void
    {
        if (!$this->validateCsrf()) return;

        $db = Database::getInstance();
        $fields = [
            'site_name',
            'booking_hold_minutes',
            'contact_email',
            'contact_phone',
            'vnpay_enabled',
            'momo_enabled',
            'max_passengers_per_booking',
            'max_rooms_per_booking',
        ];

        foreach ($fields as $field) {
            $val = $this->input($field);
            if ($field === 'vnpay_enabled' || $field === 'momo_enabled') {
                $val = !empty($val) ? '1' : '0';
            }
            if ($val !== null) {
                $db->execute(
                    "INSERT INTO system_settings (setting_key, setting_value) 
                     VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
                    [$field, $val]
                );
            }
        }

        Session::flash('success', 'Đã lưu và cập nhật cấu hình hệ thống thành công!');
        $this->redirect('/admin/settings');
    }
}
