<?php
/**
 * TravelGo - Employee Middleware
 */

namespace App\Middleware;

use App\Core\Auth;

class EmployeeMiddleware
{
    public static function handle(): bool
    {
        AuthMiddleware::handle();

        if (!Auth::isStaff()) {
            http_response_code(403);
            require dirname(__DIR__) . '/views/errors/403.php';
            exit;
        }
        return true;
    }
}
