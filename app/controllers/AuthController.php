<?php
/**
 * TravelGo - Auth Controller
 * Xử lý Đăng nhập, Đăng ký (Khách hàng & Đối tác), Đăng xuất, Hồ sơ cá nhân
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Validator;
use App\Models\UserModel;
use App\Models\PartnerModel;

class AuthController extends Controller
{
    private UserModel $userModel;
    private PartnerModel $partnerModel;

    public function __construct()
    {
        parent::__construct();
        $this->userModel = new UserModel();
        $this->partnerModel = new PartnerModel();
    }

    /**
     * Đăng nhập (GET: form, POST: xử lý)
     */
    public function login(): void
    {
        if (Auth::check()) {
            $this->redirectBasedOnRole();
            return;
        }

        if ($this->isPost()) {
            if (!$this->validateCsrf()) return;

            $validator = new Validator($_POST, [
                'login'    => 'required',
                'password' => 'required',
            ], [
                'login' => 'Tên đăng nhập hoặc Email',
            ]);

            if ($validator->fails()) {
                $this->view('auth/login', [
                    'pageTitle' => 'Đăng nhập',
                    'errors'    => $validator->errors(),
                    'old'       => $_POST,
                ], 'auth');
                return;
            }

            $login = trim($this->input('login'));
            $password = $this->input('password');

            // Kiểm tra user có tồn tại và có bị khóa tạm thời không
            $userCheck = $this->userModel->findByLogin($login);
            if ($userCheck && $userCheck->locked_until && strtotime($userCheck->locked_until) > time()) {
                $minutesLeft = ceil((strtotime($userCheck->locked_until) - time()) / 60);
                Session::flash('error', "Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau {$minutesLeft} phút.");
                $this->view('auth/login', ['pageTitle' => 'Đăng nhập', 'old' => $_POST], 'auth');
                return;
            }

            if ($userCheck && $userCheck->status === 'banned') {
                Session::flash('error', 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
                $this->view('auth/login', ['pageTitle' => 'Đăng nhập'], 'auth');
                return;
            }

            $user = $this->userModel->authenticate($login, $password);

            if ($user) {
                Auth::login($user);
                Session::flash('success', 'Chào mừng ' . $user->full_name . ' đã quay trở lại!');

                $intended = Session::get('intended_url');
                if ($intended) {
                    Session::remove('intended_url');
                    $this->redirect($intended);
                    return;
                }

                $this->redirectBasedOnRole();
                return;
            } else {
                Session::flash('error', 'Tên đăng nhập hoặc mật khẩu không chính xác.');
                $this->view('auth/login', [
                    'pageTitle' => 'Đăng nhập',
                    'old'       => ['login' => $login],
                ], 'auth');
                return;
            }
        }

        $this->view('auth/login', [
            'pageTitle' => 'Đăng nhập',
        ], 'auth');
    }

    /**
     * Đăng ký tài khoản Khách hàng (GET: form, POST: xử lý)
     */
    public function register(): void
    {
        if (Auth::check()) {
            $this->redirect('/');
            return;
        }

        if ($this->isPost()) {
            if (!$this->validateCsrf()) return;

            $validator = new Validator($_POST, [
                'username'  => 'required|alpha_num|min:3|max:30',
                'full_name' => 'required|min:2|max:100',
                'email'     => 'required|email|max:100',
                'phone'     => 'required|phone',
                'password'  => 'required|min:6|max:50|confirmed',
            ]);

            $errors = $validator->errors();

            // Kiểm tra trùng username / email
            if (empty($errors['username']) && $this->userModel->findByUsername($this->input('username'))) {
                $errors['username'] = 'Tên đăng nhập này đã được sử dụng.';
            }

            if (empty($errors['email']) && $this->userModel->findByEmail($this->input('email'))) {
                $errors['email'] = 'Địa chỉ email này đã được đăng ký.';
            }

            if (!empty($errors)) {
                $this->view('auth/register', [
                    'pageTitle' => 'Đăng ký tài khoản',
                    'errors'    => $errors,
                    'old'       => $_POST,
                ], 'auth');
                return;
            }

            $userId = $this->userModel->registerCustomer([
                'username'  => trim($this->input('username')),
                'full_name' => trim($this->input('full_name')),
                'email'     => trim($this->input('email')),
                'phone'     => trim($this->input('phone')),
                'password'  => $this->input('password'),
            ]);

            if ($userId) {
                $user = $this->userModel->find($userId);
                Auth::login($user);
                Session::flash('success', 'Đăng ký tài khoản thành công! Chúc bạn có những chuyến đi tuyệt vời.');
                $this->redirect('/');
                return;
            }

            Session::flash('error', 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.');
        }

        $this->view('auth/register', [
            'pageTitle' => 'Đăng ký tài khoản',
        ], 'auth');
    }

    /**
     * Đăng ký đối tác (GET: form, POST: xử lý)
     */
    public function registerPartner(): void
    {
        if (Auth::check() && !Auth::isPartner()) {
            $this->redirect('/');
            return;
        }

        if ($this->isPost()) {
            if (!$this->validateCsrf()) return;

            $validator = new Validator($_POST, [
                'company_name' => 'required|min:3|max:150',
                'username'     => 'required|alpha_num|min:3|max:30',
                'full_name'    => 'required|min:2|max:100',
                'email'        => 'required|email|max:100',
                'phone'        => 'required|phone',
                'address'      => 'required|min:5|max:255',
                'password'     => 'required|min:6|max:50|confirmed',
            ], [
                'company_name' => 'Tên doanh nghiệp / Đối tác',
            ]);

            $errors = $validator->errors();

            if (empty($errors['username']) && $this->userModel->findByUsername($this->input('username'))) {
                $errors['username'] = 'Tên đăng nhập này đã được sử dụng.';
            }

            if (empty($errors['email']) && $this->userModel->findByEmail($this->input('email'))) {
                $errors['email'] = 'Địa chỉ email này đã được đăng ký.';
            }

            if (!empty($errors)) {
                $this->view('auth/register_partner', [
                    'pageTitle' => 'Đăng ký Đối tác',
                    'errors'    => $errors,
                    'old'       => $_POST,
                ], 'auth');
                return;
            }

            try {
                $this->db->beginTransaction();

                // Tạo user partner
                $userId = $this->userModel->registerPartnerUser([
                    'username'  => trim($this->input('username')),
                    'full_name' => trim($this->input('full_name')),
                    'email'     => trim($this->input('email')),
                    'phone'     => trim($this->input('phone')),
                    'password'  => $this->input('password'),
                ]);

                // Tạo hồ sơ partner
                $this->partnerModel->createPartnerProfile($userId, [
                    'company_name'   => trim($this->input('company_name')),
                    'tax_code'       => trim($this->input('tax_code') ?? ''),
                    'address'        => trim($this->input('address')),
                    'description'    => trim($this->input('description') ?? ''),
                    'contact_person' => trim($this->input('full_name')),
                    'contact_phone'  => trim($this->input('phone')),
                    'contact_email'  => trim($this->input('email')),
                ]);

                $this->db->commit();

                Session::flash('success', 'Đăng ký đối tác thành công! Hồ sơ của bạn đã được gửi và đang chờ Quản trị viên xét duyệt.');
                $this->redirect('/auth/login');
                return;
            } catch (\Exception $e) {
                $this->db->rollback();
                Session::flash('error', 'Lỗi trong quá trình đăng ký đối tác: ' . $e->getMessage());
            }
        }

        $this->view('auth/register_partner', [
            'pageTitle' => 'Đăng ký Đối tác cung cấp dịch vụ',
        ], 'auth');
    }

    /**
     * Đăng xuất
     */
    public function logout(): void
    {
        Auth::logout();
        Session::flash('success', 'Bạn đã đăng xuất thành công.');
        $this->redirect('/');
    }

    /**
     * Xem & Cập nhật Hồ sơ cá nhân
     */
    public function profile(): void
    {
        $this->requireAuth();
        $user = $this->userModel->find(Auth::id());

        if ($this->isPost()) {
            if (!$this->validateCsrf()) return;

            $action = $this->input('action_type', 'profile');

            if ($action === 'change_password') {
                $validator = new Validator($_POST, [
                    'current_password' => 'required',
                    'new_password'     => 'required|min:6|confirmed',
                ], [
                    'current_password' => 'Mật khẩu hiện tại',
                    'new_password'     => 'Mật khẩu mới',
                ]);

                if ($validator->fails()) {
                    $this->view('auth/profile', [
                        'pageTitle' => 'Hồ sơ cá nhân',
                        'user'      => $user,
                        'errors'    => $validator->errors(),
                        'activeTab' => 'security',
                    ]);
                    return;
                }

                if (!password_verify($this->input('current_password'), $user->password)) {
                    $this->view('auth/profile', [
                        'pageTitle' => 'Hồ sơ cá nhân',
                        'user'      => $user,
                        'errors'    => ['current_password' => 'Mật khẩu hiện tại không đúng.'],
                        'activeTab' => 'security',
                    ]);
                    return;
                }

                $this->userModel->updatePassword($user->id, $this->input('new_password'));
                Session::flash('success', 'Đổi mật khẩu thành công!');
                $this->redirect('/auth/profile');
                return;
            } else {
                // Cập nhật thông tin cơ bản
                $validator = new Validator($_POST, [
                    'full_name' => 'required|min:2|max:100',
                    'phone'     => 'required|phone',
                ]);

                if ($validator->fails()) {
                    $this->view('auth/profile', [
                        'pageTitle' => 'Hồ sơ cá nhân',
                        'user'      => $user,
                        'errors'    => $validator->errors(),
                        'activeTab' => 'profile',
                    ]);
                    return;
                }

                $this->userModel->update($user->id, [
                    'full_name' => trim($this->input('full_name')),
                    'phone'     => trim($this->input('phone')),
                ]);

                $updatedUser = $this->userModel->find($user->id);
                Auth::refresh($updatedUser);

                Session::flash('success', 'Cập nhật thông tin cá nhân thành công!');
                $this->redirect('/auth/profile');
                return;
            }
        }

        $partnerInfo = null;
        if (Auth::isPartner()) {
            $partnerInfo = $this->partnerModel->findByUserId(Auth::id());
        }

        $this->view('auth/profile', [
            'pageTitle'   => 'Hồ sơ cá nhân',
            'user'        => $user,
            'partnerInfo' => $partnerInfo,
            'activeTab'   => 'profile',
        ]);
    }

    /**
     * Điều hướng thông minh dựa vào vai trò người dùng
     */
    private function redirectBasedOnRole(): void
    {
        if (Auth::isAdmin()) {
            $this->redirect('/admin');
        } elseif (Auth::isEmployee()) {
            $this->redirect('/employee');
        } elseif (Auth::isPartner()) {
            $this->redirect('/partner');
        } else {
            $this->redirect('/dashboard');
        }
    }
}
