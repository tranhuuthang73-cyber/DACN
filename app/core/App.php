<?php
/**
 * TravelGo - Router / Front Controller
 * 
 * Phân tích URL và điều hướng đến Controller/Action phù hợp.
 * URL format: /controller/action/param1/param2
 * 
 * Ví dụ:
 *   /trips/detail/5     → TripController::detail(5)
 *   /admin/trips/create → Admin\AdminTripController::create()
 *   /auth/login         → AuthController::login()
 */

namespace App\Core;

class App
{
    protected string $controllerName = 'HomeController';
    protected string $actionName = 'index';
    protected array $params = [];
    protected array $routes = [];

    /**
     * Khởi chạy ứng dụng
     */
    public function run(): void
    {
        // Load env
        $this->loadEnv();

        // Start session
        Session::start();

        // Parse URL
        $url = $this->parseUrl();

        // Resolve controller và action
        $this->resolve($url);

        // Tạo controller instance và gọi action
        $this->dispatch();
    }

    /**
     * Load file .env đơn giản
     */
    protected function loadEnv(): void
    {
        $envFile = dirname(__DIR__, 2) . '/.env';
        if (!file_exists($envFile)) {
            $envFile = dirname(__DIR__, 2) . '/.env.example';
        }
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || str_starts_with($line, '#') || str_starts_with($line, '//') || str_starts_with($line, '<?')) {
                    continue;
                }
                if (str_contains($line, '=')) {
                    [$key, $value] = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    if (!empty($key)) {
                        putenv("$key=$value");
                        $_ENV[$key] = $value;
                    }
                }
            }
        }

        // Set timezone
        date_default_timezone_set('Asia/Ho_Chi_Minh');
    }

    /**
     * Parse URL từ query string
     */
    protected function parseUrl(): array
    {
        $url = $_GET['url'] ?? '';
        $url = rtrim($url, '/');
        $url = filter_var($url, FILTER_SANITIZE_URL);
        return $url ? explode('/', $url) : [];
    }

    /**
     * Resolve controller và action từ URL segments
     */
    protected function resolve(array $url): void
    {
        if (empty($url)) {
            $this->controllerName = 'HomeController';
            $this->actionName = 'index';
            return;
        }

        $segment1 = strtolower($url[0] ?? '');
        $segment2 = strtolower($url[1] ?? '');
        $segment3 = $url[2] ?? null;

        // Route cho admin panel: /admin/trips/create
        if ($segment1 === 'admin') {
            $controllerBase = !empty($segment2) ? $segment2 : 'dashboard';
            $pascal = $this->toPascalCase($controllerBase);
            $this->controllerName = 'Admin\\Admin' . $pascal . 'Controller';
            $this->actionName = $segment3 ?? 'index';
            $this->params = array_slice($url, 3);
            return;
        }

        // Route cho employee: /employee/trips
        if ($segment1 === 'employee') {
            $controllerBase = !empty($segment2) ? $segment2 : 'dashboard';
            $pascal = $this->toPascalCase($controllerBase);
            // Hỗ trợ cả EmployeeDashboardController và EmpTripController
            $empClass = 'Employee\\Emp' . $pascal . 'Controller';
            $employeeClass = 'Employee\\Employee' . $pascal . 'Controller';
            $empFile = dirname(__DIR__) . '/controllers/' . str_replace('\\', '/', $empClass) . '.php';
            
            $this->controllerName = file_exists($empFile) ? $empClass : $employeeClass;
            $this->actionName = $segment3 ?? 'index';
            $this->params = array_slice($url, 3);
            return;
        }

        // Route cho partner: /partner/hotels/edit/5
        if ($segment1 === 'partner') {
            $controllerBase = !empty($segment2) ? $segment2 : 'dashboard';
            $this->controllerName = 'Partner\\Partner' . $this->toPascalCase($controllerBase) . 'Controller';
            $this->actionName = $segment3 ?? 'index';
            $this->params = array_slice($url, 3);
            return;
        }

        // Route cho API: /api/trips/search
        if ($segment1 === 'api') {
            $controllerBase = !empty($segment2) ? $segment2 : 'home';
            $this->controllerName = 'Api\\Api' . $this->toPascalCase($controllerBase) . 'Controller';
            $this->actionName = $segment3 ?? 'index';
            $this->params = array_slice($url, 3);
            return;
        }

        // Route mặc định: /trips/detail/5
        $this->controllerName = $this->toPascalCase($segment1) . 'Controller';
        $this->actionName = !empty($segment2) ? $segment2 : 'index';
        $this->params = array_slice($url, 2);
    }

    /**
     * Tạo controller instance và gọi action
     */
    protected function dispatch(): void
    {
        $controllerClass = 'App\\Controllers\\' . $this->controllerName;
        $controllerFile = dirname(__DIR__) . '/controllers/' . str_replace('\\', '/', $this->controllerName) . '.php';

        // Kiểm tra file controller tồn tại
        if (!file_exists($controllerFile)) {
            $this->notFound("Controller not found: {$this->controllerName}");
            return;
        }

        require_once $controllerFile;

        // Kiểm tra class tồn tại
        if (!class_exists($controllerClass)) {
            $this->notFound("Controller class not found: {$controllerClass}");
            return;
        }

        $controller = new $controllerClass();

        // Chuyển action-name thành camelCase
        $action = $this->toCamelCase($this->actionName);

        // Kiểm tra method tồn tại
        if (!method_exists($controller, $action)) {
            $this->notFound("Action not found: {$action} in {$controllerClass}");
            return;
        }

        // Gọi action với params
        call_user_func_array([$controller, $action], $this->params);
    }

    /**
     * Hiển thị trang 404
     */
    protected function notFound(string $message = ''): void
    {
        http_response_code(404);
        $debug = getenv('APP_DEBUG') === 'true';
        
        // Load view 404 nếu có
        $view404 = dirname(__DIR__) . '/views/errors/404.php';
        if (file_exists($view404)) {
            require $view404;
        } else {
            echo '<h1>404 - Page Not Found</h1>';
            if ($debug && $message) {
                echo '<p style="color:red">' . htmlspecialchars($message) . '</p>';
            }
        }
    }

    /**
     * Convert "trip-services" → "TripServices"
     */
    protected function toPascalCase(string $str): string
    {
        return str_replace(['-', '_', ' '], '', ucwords($str, '-_ '));
    }

    /**
     * Convert "trip-detail" → "tripDetail"
     */
    protected function toCamelCase(string $str): string
    {
        $pascal = $this->toPascalCase($str);
        return lcfirst($pascal);
    }
}
