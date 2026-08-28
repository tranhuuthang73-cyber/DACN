<?php
/**
 * TravelGo - Partner Middleware
 */

namespace App\Middleware;

use App\Core\Auth;
use App\Models\PartnerModel;

class PartnerMiddleware
{
    public static function handle(): bool
    {
        AuthMiddleware::handle();

        if (!Auth::isPartner()) {
            http_response_code(403);
            require dirname(__DIR__) . '/views/errors/403.php';
            exit;
        }

        // Kiểm tra đối tác đã được Admin duyệt chưa
        $partnerModel = new PartnerModel();
        $partner = $partnerModel->findByUserId(Auth::id());

        if (!$partner || !in_array($partner->status, ['approved', 'active'])) {
            http_response_code(403);
            $message = 'Tài khoản đối tác của bạn đang chờ Admin xét duyệt hoặc đã bị tạm ngưng.';
            require dirname(__DIR__) . '/views/errors/403.php';
            exit;
        }

        return true;
    }
}
