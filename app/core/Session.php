<?php
/**
 * TravelGo - Session Manager
 * 
 * Quản lý session PHP với bảo mật:
 * - HTTP-only cookies
 * - Session regeneration
 * - CSRF token
 * - Flash messages (hiển thị 1 lần)
 */

namespace App\Core;

class Session
{
    private static bool $started = false;

    /**
     * Khởi động session
     */
    public static function start(): void
    {
        if (self::$started) return;

        // Cấu hình session an toàn
        ini_set('session.use_strict_mode', '1');
        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_samesite', 'Lax');
        ini_set('session.use_only_cookies', '1');

        $sessionName = getenv('SESSION_NAME') ?: 'travelgo_session';
        session_name($sessionName);

        session_start();
        self::$started = true;

        // Regenerate session ID định kỳ (mỗi 30 phút)
        $regenerateInterval = 1800;
        if (!isset($_SESSION['_last_regenerate'])) {
            $_SESSION['_last_regenerate'] = time();
        } elseif (time() - $_SESSION['_last_regenerate'] > $regenerateInterval) {
            session_regenerate_id(true);
            $_SESSION['_last_regenerate'] = time();
        }
    }

    /**
     * Lấy giá trị từ session
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return $_SESSION[$key] ?? $default;
    }

    /**
     * Gán giá trị vào session
     */
    public static function set(string $key, mixed $value): void
    {
        $_SESSION[$key] = $value;
    }

    /**
     * Kiểm tra key tồn tại
     */
    public static function has(string $key): bool
    {
        return isset($_SESSION[$key]);
    }

    /**
     * Xóa key khỏi session
     */
    public static function remove(string $key): void
    {
        unset($_SESSION[$key]);
    }

    /**
     * Xóa toàn bộ session (logout)
     */
    public static function destroy(): void
    {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        self::$started = false;
    }

    /**
     * Flash message - lưu message hiển thị 1 lần
     * 
     * Ghi: Session::flash('success', 'Đặt chỗ thành công!')
     * Đọc: $msg = Session::flash('success') → trả về và xóa
     */
    public static function flash(string $key, ?string $message = null): ?string
    {
        $flashKey = '_flash_' . $key;

        if ($message !== null) {
            // Ghi flash message
            $_SESSION[$flashKey] = $message;
            return null;
        }

        // Đọc và xóa flash message
        $value = $_SESSION[$flashKey] ?? null;
        unset($_SESSION[$flashKey]);
        return $value;
    }

    /**
     * Tạo CSRF token
     */
    public static function getCsrfToken(): string
    {
        if (!isset($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf_token'];
    }

    /**
     * Validate CSRF token
     */
    public static function validateCsrfToken(string $token): bool
    {
        if (empty($token) || empty($_SESSION['_csrf_token'])) {
            return false;
        }
        $valid = hash_equals($_SESSION['_csrf_token'], $token);
        // Regenerate token sau khi validate (one-time use)
        unset($_SESSION['_csrf_token']);
        return $valid;
    }

    /**
     * Regenerate session ID (dùng sau login)
     */
    public static function regenerate(): void
    {
        session_regenerate_id(true);
        $_SESSION['_last_regenerate'] = time();
    }
}
