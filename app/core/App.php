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

        // Route cho admin panel: /admin/trips/create hoặc /admin/users
        if ($segment1 === 'admin') {
            $controllerBase = !empty($segment2) ? $segment2 : 'dashboard';
            $pascalPlural = $this->toPascalCase($controllerBase);
            $singularBase = (str_ends_with($controllerBase, 's') && !str_ends_with($controllerBase, 'ss')) ? substr($controllerBase, 0, -1) : $controllerBase;
            $pascalSingular = $this->toPascalCase($singularBase);

            $this->controllerName = $this->findFirstExistingController([
                'Admin\\Admin' . $pascalSingular . 'Controller',
                'Admin\\Admin' . $pascalPlural . 'Controller',
            ]);
            $this->actionName = $segment3 ?? 'index';
            $this->params = array_slice($url, 3);
            return;
        }

        // Route cho employee: /employee/trips, /employee/bookings, /employee/qr
        if ($segment1 === 'employee') {
            $controllerBase = !empty($segment2) ? $segment2 : 'dashboard';
            $pascalPlural = $this->toPascalCase($controllerBase);
            $singularBase = (str_ends_with($controllerBase, 's') && !str_ends_with($controllerBase, 'ss')) ? substr($controllerBase, 0, -1) : $controllerBase;
            $pascalSingular = $this->toPascalCase($singularBase);

            $this->controllerName = $this->findFirstExistingController([
                'Employee\\Emp' . $pascalSingular . 'Controller',
                'Employee\\Emp' . $pascalPlural . 'Controller',
                'Employee\\Employee' . $pascalSingular . 'Controller',
                'Employee\\Employee' . $pascalPlural . 'Controller',
            ]);
            $this->actionName = $segment3 ?? 'index';
            $this->params = array_slice($url, 3);
            return;
        }

        // Route cho partner: /partner/hotels/create, /partner/trips
        if ($segment1 === 'partner') {
            $controllerBase = !empty($segment2) ? $segment2 : 'dashboard';
            $pascalPlural = $this->toPascalCase($controllerBase);
            $singularBase = (str_ends_with($controllerBase, 's') && !str_ends_with($controllerBase, 'ss')) ? substr($controllerBase, 0, -1) : $controllerBase;
            $pascalSingular = $this->toPascalCase($singularBase);

            $this->controllerName = $this->findFirstExistingController([
                'Partner\\Partner' . $pascalSingular . 'Controller',
                'Partner\\Partner' . $pascalPlural . 'Controller',
            ]);
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
        // Route trực tiếp cho profile cá nhân: /profile -> AuthController::profile
        if ($segment1 === 'profile') {
            $this->controllerName = 'AuthController';
            $this->actionName = 'profile';
            $this->params = array_slice($url, 1);
            return;
        }

        // Route mặc định: /trips/detail/5, /hotels
        $pascalPlural = $this->toPascalCase($segment1);
        $singularBase = (str_ends_with($segment1, 's') && !str_ends_with($segment1, 'ss')) ? substr($segment1, 0, -1) : $segment1;
        $pascalSingular = $this->toPascalCase($singularBase);

        $this->controllerName = $this->findFirstExistingController([
            $pascalSingular . 'Controller',
            $pascalPlural . 'Controller',
        ]);
        $this->actionName = !empty($segment2) ? $segment2 : 'index';
        $this->params = array_slice($url, 2);
    }

    /**
     * Tìm controller đầu tiên có file tồn tại trong thư mục app/controllers
     */
    protected function findFirstExistingController(array $candidates): string
    {
        $baseDir = dirname(__DIR__) . '/controllers/';
        foreach ($candidates as $candidate) {
            $file = $baseDir . str_replace('\\', '/', $candidate) . '.php';
            if (file_exists($file)) {
                return $candidate;
            }
        }
        return $candidates[0];
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
