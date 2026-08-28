<?php
/**
 * TravelGo - App Configuration
 */

return [
    'name'    => 'TravelGo',
    'url'     => getenv('APP_URL') ?: 'http://localhost/DULICH/public',
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
