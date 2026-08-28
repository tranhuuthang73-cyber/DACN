<?php
/**
 * TravelGo - Front Controller
 * 
 * Entry point duy nhất của ứng dụng.
 * Mọi request đều đi qua file này nhờ .htaccess rewrite.
 */

// Hiển thị lỗi trong development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Định nghĩa base path
define('ROOT_PATH', dirname(__DIR__));
define('APP_PATH', ROOT_PATH . '/app');
define('PUBLIC_PATH', __DIR__);
define('STORAGE_PATH', ROOT_PATH . '/storage');

// Autoloader đơn giản
spl_autoload_register(function (string $class) {
    // Convert namespace thành đường dẫn file
    // App\Core\Database → app/core/Database.php
    // App\Controllers\HomeController → app/controllers/HomeController.php
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) return;

    $relativeClass = substr($class, strlen($prefix));
    $file = APP_PATH . '/' . str_replace('\\', '/', $relativeClass) . '.php';

    // Thử tìm với lowercase thư mục
    if (!file_exists($file)) {
        $parts = explode('/', str_replace('\\', '/', $relativeClass));
        $className = array_pop($parts);
        $dirs = array_map('strtolower', $parts);
        $file = APP_PATH . '/' . implode('/', $dirs) . '/' . $className . '.php';
    }

    if (file_exists($file)) {
        require_once $file;
    }
});

// Require core files
require_once APP_PATH . '/core/Helper.php';

// Khởi chạy ứng dụng
$app = new \App\Core\App();
$app->run();
