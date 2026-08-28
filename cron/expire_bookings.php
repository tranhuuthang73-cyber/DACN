<?php
/**
 * TravelGo - Cron Job: Xử lý booking hết hạn
 * 
 * Chạy mỗi phút để kiểm tra và hủy các booking 
 * đã quá 15 phút mà chưa thanh toán.
 * 
 * Crontab: * * * * * php /path/to/DULICH/cron/expire_bookings.php
 * Hoặc chạy thủ công khi test: php cron/expire_bookings.php
 */

// Setup path
define('ROOT_PATH', dirname(__DIR__));
define('APP_PATH', ROOT_PATH . '/app');

// Load env
$envFile = ROOT_PATH . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || str_starts_with($line, '#') || str_starts_with($line, '//') || str_starts_with($line, '<?')) continue;
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

date_default_timezone_set('Asia/Ho_Chi_Minh');

// Autoloader
spl_autoload_register(function (string $class) {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) return;
    $relativeClass = substr($class, strlen($prefix));
    $file = APP_PATH . '/' . str_replace('\\', '/', $relativeClass) . '.php';
    if (!file_exists($file)) {
        $parts = explode('/', str_replace('\\', '/', $relativeClass));
        $className = array_pop($parts);
        $dirs = array_map('strtolower', $parts);
        $file = APP_PATH . '/' . implode('/', $dirs) . '/' . $className . '.php';
    }
    if (file_exists($file)) require_once $file;
});

use App\Core\Database;

$now = date('Y-m-d H:i:s');
echo "[{$now}] Starting expire bookings cron job...\n";

try {
    $db = Database::getInstance();

    // Gọi stored procedure
    $db->query("CALL sp_expire_pending_bookings()");

    // Đếm số booking đã hết hạn trong lần chạy này
    $count = $db->fetchColumn(
        "SELECT COUNT(*) FROM bookings WHERE status = 'expired' AND updated_at >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)"
    );

    echo "[{$now}] Done. Expired {$count} booking(s).\n";

} catch (\Exception $e) {
    echo "[{$now}] ERROR: " . $e->getMessage() . "\n";
    // Log to file
    $logFile = ROOT_PATH . '/storage/logs/cron_' . date('Y-m-d') . '.log';
    @mkdir(dirname($logFile), 0755, true);
    file_put_contents($logFile, "[{$now}] ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    exit(1);
}
