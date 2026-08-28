<?php
/**
 * TravelGo - Base Controller
 * 
 * Tất cả controller kế thừa từ class này.
 * Cung cấp các method chung: view(), redirect(), json(), ...
 */

namespace App\Core;

class Controller
{
    protected Database $db;
    protected array $appConfig;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->appConfig = require dirname(__DIR__) . '/config/app.php';
    }

    /**
     * Render view file
     * 
     * @param string $view   Đường dẫn view (vd: 'trips/index', 'admin/dashboard')
     * @param array  $data   Dữ liệu truyền vào view
     * @param string $layout Layout sử dụng ('main', 'admin', 'auth', null)
     */
    protected function view(string $view, array $data = [], ?string $layout = 'main'): void
    {
        // Extract data thành biến cho view sử dụng
        extract($data);

        // Thông tin chung
        $appName = $this->appConfig['name'];
        $appUrl = $this->appConfig['url'];
        $currentUser = Session::get('user');
        $flashSuccess = Session::flash('success');
        $flashError = Session::flash('error');
        $flashInfo = Session::flash('info');
        $csrfToken = Session::getCsrfToken();

        // Đường dẫn view
        $viewPath = dirname(__DIR__) . '/views/' . $view . '.php';

        if (!file_exists($viewPath)) {
            throw new \Exception("View not found: {$view}");
        }

        if ($layout) {
            // Render view vào biến $content, sau đó include layout
            ob_start();
            require $viewPath;
            $content = ob_get_clean();

            $layoutPath = dirname(__DIR__) . '/views/layouts/' . $layout . '.php';
            if (!file_exists($layoutPath)) {
                throw new \Exception("Layout not found: {$layout}");
            }
            require $layoutPath;
        } else {
            // Render view không có layout
            require $viewPath;
        }
    }

    /**
     * Redirect đến URL
     */
    protected function redirect(string $url): void
    {
        // Nếu URL bắt đầu bằng / thì thêm base URL
        if (str_starts_with($url, '/')) {
            $url = $this->appConfig['url'] . $url;
        }
        header("Location: {$url}");
        exit;
    }

    /**
     * Redirect về trang trước
     */
    protected function back(): void
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? $this->appConfig['url'];
        header("Location: {$referer}");
        exit;
    }

    /**
     * Trả về JSON response (cho AJAX/API)
     */
    protected function json(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Lấy dữ liệu từ POST request
     */
    protected function input(string $key, mixed $default = null): mixed
    {
        return $_POST[$key] ?? $default;
    }

    /**
     * Lấy dữ liệu từ GET request
     */
    protected function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * Lấy tất cả dữ liệu POST
     */
    protected function allInput(): array
    {
        return $_POST;
    }

    /**
     * Kiểm tra request là POST
     */
    protected function isPost(): bool
    {
        return $_SERVER['REQUEST_METHOD'] === 'POST';
    }

    /**
     * Kiểm tra request là AJAX
     */
    protected function isAjax(): bool
    {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) 
            && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    /**
     * Validate CSRF token
     */
    protected function validateCsrf(): bool
    {
        $token = $this->input('_csrf_token') ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        if (!Session::validateCsrfToken($token)) {
            if ($this->isAjax()) {
                $this->json(['error' => 'Invalid CSRF token'], 403);
            }
            Session::flash('error', 'Phiên làm việc hết hạn. Vui lòng thử lại.');
            $this->back();
            return false;
        }
        return true;
    }

    /**
     * Yêu cầu đăng nhập
     */
    protected function requireAuth(): void
    {
        if (!Auth::check()) {
            Session::flash('error', 'Vui lòng đăng nhập để tiếp tục.');
            Session::set('intended_url', $_SERVER['REQUEST_URI']);
            $this->redirect('/auth/login');
        }
    }

    /**
     * Yêu cầu role cụ thể
     */
    protected function requireRole(string|array $roles): void
    {
        $this->requireAuth();
        
        if (is_string($roles)) {
            $roles = [$roles];
        }

        if (!Auth::hasRole($roles)) {
            http_response_code(403);
            $this->view('errors/403', ['message' => 'Bạn không có quyền truy cập trang này.'], null);
            exit;
        }
    }

    /**
     * Set flash message và redirect
     */
    protected function redirectWithSuccess(string $url, string $message): void
    {
        Session::flash('success', $message);
        $this->redirect($url);
    }

    /**
     * Set flash error và redirect về trang trước
     */
    protected function backWithError(string $message): void
    {
        Session::flash('error', $message);
        $this->back();
    }
}
