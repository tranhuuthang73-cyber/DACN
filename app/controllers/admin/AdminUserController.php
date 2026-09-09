<?php
/**
 * TravelGo - Admin User & Role Management Controller
 * Quản lý tài khoản, phân quyền vai trò (Admin, Employee, Partner, Customer) và trạng thái
 */

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Middleware\AdminMiddleware;
use App\Models\UserModel;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Auth;
use App\Core\Session;

class AdminUserController extends Controller
{
    private UserModel $userModel;

    public function __construct()
    {
        parent::__construct();
        AdminMiddleware::handle();
        $this->userModel = new UserModel();
    }

    /**
     * Danh sách tài khoản người dùng và phân quyền
     */
    public function index(): void
    {
        $db = Database::getInstance();
        $role = trim($this->query('role', ''));
        $status = trim($this->query('status', ''));
        $search = trim($this->query('search', ''));
        $page = max(1, (int)$this->query('page', 1));
        $limit = 15;
        $offset = ($page - 1) * $limit;

        $where = ["1=1"];
        $params = [];

        if (!empty($role)) {
            $where[] = "role = ?";
            $params[] = $role;
        }

        if (!empty($status)) {
            $where[] = "status = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $where[] = "(username LIKE ? OR full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
            $keyword = "%{$search}%";
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
        }

        $whereSql = implode(" AND ", $where);

        // Tổng số bản ghi
        $total = (int)$db->fetchColumn("SELECT COUNT(*) FROM users WHERE {$whereSql}", $params);

        // Dữ liệu trang hiện tại
        $sql = "SELECT u.*, 
                       (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count,
                       (SELECT company_name FROM partners WHERE user_id = u.id LIMIT 1) AS partner_company
                FROM users u
                WHERE {$whereSql}
                ORDER BY u.created_at DESC
                LIMIT {$limit} OFFSET {$offset}";

        $users = $db->fetchAll($sql, $params);

        // Thống kê nhanh theo vai trò
        $roleCounts = [
            'all'      => (int)$db->fetchColumn("SELECT COUNT(*) FROM users"),
            'admin'    => (int)$db->fetchColumn("SELECT COUNT(*) FROM users WHERE role = 'admin'"),
            'employee' => (int)$db->fetchColumn("SELECT COUNT(*) FROM users WHERE role = 'employee'"),
            'partner'  => (int)$db->fetchColumn("SELECT COUNT(*) FROM users WHERE role = 'partner'"),
            'customer' => (int)$db->fetchColumn("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
        ];

        $pages = ceil($total / $limit);

        $this->view('admin/users/index', [
            'pageTitle'  => 'Quản lý Tài khoản & Phân quyền',
            'users'      => $users,
            'total'      => $total,
            'pages'      => $pages,
            'current'    => $page,
            'role'       => $role,
            'status'     => $status,
            'search'     => $search,
            'roleCounts' => $roleCounts,
        ], 'admin');
    }

    /**
     * Giao diện thêm tài khoản mới
     */
    public function create(): void
    {
        $this->view('admin/users/create', [
            'pageTitle' => 'Thêm Tài khoản mới',
        ], 'admin');
    }

    /**
     * Xử lý lưu tài khoản mới
     */
    public function store(): void
    {
        if (!$this->validateCsrf()) return;

        $validator = new Validator($_POST, [
            'username'  => 'required|alpha_num|min:3|max:50',
            'full_name' => 'required|min:2|max:100',
            'email'     => 'required|email|max:100',
            'phone'     => 'required|phone',
            'password'  => 'required|min:6',
            'role'      => 'required',
        ], [
            'username'  => 'Tên đăng nhập',
            'full_name' => 'Họ và tên',
            'email'     => 'Email',
            'phone'     => 'Số điện thoại',
            'password'  => 'Mật khẩu',
            'role'      => 'Vai trò',
        ]);

        if ($validator->fails()) {
            Session::flash('error', $validator->firstError());
            $this->create();
            return;
        }

        $username = trim($this->input('username'));
        $email = trim($this->input('email'));

        if ($this->userModel->findByUsername($username)) {
            Session::flash('error', 'Tên đăng nhập này đã tồn tại trong hệ thống.');
            $this->create();
            return;
        }

        if ($this->userModel->findByEmail($email)) {
            Session::flash('error', 'Địa chỉ email này đã được sử dụng.');
            $this->create();
            return;
        }

        $role = $this->input('role');
        if (!in_array($role, ['admin', 'employee', 'partner', 'customer'])) {
            $role = 'customer';
        }

        $userId = $this->userModel->create([
            'username'          => $username,
            'email'             => $email,
            'password'          => password_hash($this->input('password'), PASSWORD_BCRYPT),
            'full_name'         => trim($this->input('full_name')),
            'phone'             => trim($this->input('phone')),
            'role'              => $role,
            'status'            => 'active',
            'email_verified_at' => date('Y-m-d H:i:s'),
        ]);

        // Nếu tạo vai trò partner, tạo luôn record partner
        if ($role === 'partner' && $userId) {
            $companyName = trim($this->input('company_name') ?? $this->input('full_name'));
            $db = Database::getInstance();
            $db->insert(
                "INSERT INTO partners (user_id, company_name, contact_person, contact_phone, contact_email, status, approved_by, approved_at)
                 VALUES (?, ?, ?, ?, ?, 'active', ?, NOW())",
                [$userId, $companyName, $this->input('full_name'), $this->input('phone'), $email, Auth::id()]
            );
        }

        Session::flash('success', "Đã tạo tài khoản {$username} với vai trò '{$role}' thành công!");
        $this->redirect('/admin/users');
    }

    /**
     * Cập nhật nhanh vai trò (Role) của người dùng
     */
    public function updateRole(int|string $id = 0): void
    {
        $id = (int)$id;
        $user = $this->userModel->find($id);

        if (!$user) {
            Session::flash('error', 'Tài khoản không tồn tại.');
            $this->redirect('/admin/users');
            return;
        }

        // Không cho tự hạ quyền chính mình
        if ($user->id === Auth::id()) {
            Session::flash('error', 'Bạn không thể thay đổi vai trò của chính mình.');
            $this->redirect('/admin/users');
            return;
        }

        $newRole = trim($this->input('role') ?? '');
        if (!in_array($newRole, ['admin', 'employee', 'partner', 'customer'])) {
            Session::flash('error', 'Vai trò không hợp lệ.');
            $this->redirect('/admin/users');
            return;
        }

        $this->userModel->update($id, ['role' => $newRole]);

        // Nếu nâng lên partner mà chưa có record trong partners table
        if ($newRole === 'partner') {
            $db = Database::getInstance();
            $hasPartner = $db->fetchColumn("SELECT COUNT(*) FROM partners WHERE user_id = ?", [$id]);
            if (!$hasPartner) {
                $db->insert(
                    "INSERT INTO partners (user_id, company_name, contact_person, contact_phone, contact_email, status, approved_by, approved_at)
                     VALUES (?, ?, ?, ?, ?, 'active', ?, NOW())",
                    [$id, $user->full_name, $user->full_name, $user->phone, $user->email, Auth::id()]
                );
            }
        }

        Session::flash('success', "Đã chuyển vai trò của tài khoản '{$user->username}' sang '{$newRole}'.");
        $this->redirect('/admin/users');
    }

    /**
     * Khóa hoặc Mở khóa tài khoản
     */
    public function toggleStatus(int|string $id = 0): void
    {
        $id = (int)$id;
        $user = $this->userModel->find($id);

        if (!$user) {
            Session::flash('error', 'Tài khoản không tồn tại.');
            $this->redirect('/admin/users');
            return;
        }

        // Không thể khóa tài khoản chính mình
        if ($user->id === Auth::id()) {
            Session::flash('error', 'Bạn không thể khóa tài khoản của chính mình.');
            $this->redirect('/admin/users');
            return;
        }

        $newStatus = ($user->status === 'banned') ? 'active' : 'banned';
        $this->userModel->update($id, ['status' => $newStatus]);

        $msg = ($newStatus === 'banned') 
            ? "Đã khóa tài khoản '{$user->username}' thành công." 
            : "Đã mở khóa và kích hoạt tài khoản '{$user->username}'.";

        Session::flash('success', $msg);
        $this->redirect('/admin/users');
    }
}
