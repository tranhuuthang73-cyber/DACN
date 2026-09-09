<?php
/**
 * TravelGo - App Configuration
 */

// Tự động nhận diện URL đang chạy (tương thích mọi máy, mọi thư mục XAMPP/Laragon/PHP CLI)
$autoAppUrl = (function() {
    $envUrl = getenv('APP_URL');
    if ($envUrl && $envUrl !== 'http://localhost/DULICH/public') {
        return rtrim($envUrl, '/');
    }

    if (!empty($_SERVER['HTTP_HOST'])) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $dir = dirname($scriptName);
        $dir = ($dir === '/' || $dir === '\\') ? '' : rtrim(str_replace('\\', '/', $dir), '/');
        
        return $scheme . '://' . $host . $dir;
    }

    return $envUrl ?: 'http://localhost/DULICH/public';
})();

return [
    'name'    => 'TravelGo',
    'url'     => $autoAppUrl,
    'env'     => getenv('APP_ENV') ?: 'development',
    'debug'   => getenv('APP_DEBUG') === 'true',
    'key'     => getenv('APP_KEY') ?: 'travelgo_default_key',
    'version' => '1.0.0',

    // Timezone
    'timezone' => 'Asia/Ho_Chi_Minh',

    // Session
    'session' => [
        'lifetime' => (int)(getenv('SESSION_LIFETIME') ?: 120),
        'name'     => getenv('SESSION_NAME') ?: 'travelgo_session',
    ],

    // Booking
    'booking' => [
        'hold_minutes'          => 15,
        'max_passengers'        => 10,
        'max_rooms'             => 5,
    ],

    // Upload
    'upload' => [
        'max_size'       => 5 * 1024 * 1024, // 5MB
        'allowed_types'  => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'path'           => dirname(__DIR__, 2) . '/storage/uploads',
    ],

    // Pagination
    'per_page' => 12,

    // Currency
    'currency' => [
        'code'     => 'VND',
        'symbol'   => '₫',
        'decimals' => 0,
    ],
];
