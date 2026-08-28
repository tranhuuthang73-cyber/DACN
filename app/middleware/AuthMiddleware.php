<?php
/**
 * TravelGo - Auth Middleware
 */

namespace App\Middleware;

use App\Core\Auth;
use App\Core\Session;

class AuthMiddleware
{
    public static function handle(): bool
    {
        if (!Auth::check()) {
            Session::flash('error', 'Vui lòng đăng nhập để tiếp tục.');
            Session::set('intended_url', $_SERVER['REQUEST_URI'] ?? '/');
            header('Location: ' . (getenv('APP_URL') ?: 'http://localhost/DULICH/public') . '/auth/login');
            exit;
        }
        return true;
    }
}
