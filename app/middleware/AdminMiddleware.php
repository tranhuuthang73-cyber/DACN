<?php
/**
 * TravelGo - Admin Middleware
 */

namespace App\Middleware;

use App\Core\Auth;
use App\Core\Session;

class AdminMiddleware
{
    public static function handle(): bool
    {
        AuthMiddleware::handle();

        if (!Auth::isAdmin()) {
            http_response_code(403);
            require dirname(__DIR__) . '/views/errors/403.php';
            exit;
        }
        return true;
    }
}
