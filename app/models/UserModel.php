<?php
/**
 * TravelGo - User Model
 */

namespace App\Models;

use App\Core\Model;

class UserModel extends Model
{
    protected string $table = 'users';

    /**
     * Tìm user theo email
     */
    public function findByEmail(string $email): ?object
    {
        return $this->findOneWhere(['email' => $email]);
    }

    /**
     * Tìm user theo username
     */
    public function findByUsername(string $username): ?object
    {
        return $this->findOneWhere(['username' => $username]);
    }

    /**
     * Tìm user theo email hoặc username
     */
    public function findByLogin(string $login): ?object
    {
        $sql = "SELECT * FROM {$this->table} WHERE email = ? OR username = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$login, $login]);
    }

    /**
     * Xác thực thông tin đăng nhập
     */
    public function authenticate(string $login, string $password): ?object
    {
        $user = $this->findByLogin($login);

        if (!$user) {
            return null;
        }

        // Kiểm tra tài khoản bị khóa tạm thời do nhập sai nhiều lần
        if ($user->locked_until && strtotime($user->locked_until) > time()) {
            return $user; // Trả về user để controller check locked_until
        }

        // Kiểm tra mật khẩu
        if (password_verify($password, $user->password)) {
            // Reset số lần đăng nhập sai & cập nhật thời gian đăng nhập
            $this->update($user->id, [
                'login_attempts' => 0,
                'locked_until'   => null,
                'last_login_at'  => date('Y-m-d H:i:s'),
            ]);
            return $user;
        }

        // Đăng nhập sai: Tăng số lần thử
        $attempts = $user->login_attempts + 1;
        $lockedUntil = null;

        // Khóa 15 phút nếu sai quá 5 lần
        if ($attempts >= 5) {
            $lockedUntil = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        }

        $this->update($user->id, [
            'login_attempts' => $attempts,
            'locked_until'   => $lockedUntil,
        ]);

        return null;
    }

    /**
     * Đăng ký tài khoản khách hàng mới
     */
    public function registerCustomer(array $data): int
    {
        return $this->create([
            'username'   => $data['username'],
            'email'      => $data['email'],
            'password'   => password_hash($data['password'], PASSWORD_BCRYPT),
            'full_name'  => $data['full_name'],
            'phone'      => $data['phone'] ?? null,
            'role'       => 'customer',
            'status'     => 'active',
            'email_verified_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Đăng ký tài khoản đối tác
     */
    public function registerPartnerUser(array $data): int
    {
        return $this->create([
            'username'   => $data['username'],
            'email'      => $data['email'],
            'password'   => password_hash($data['password'], PASSWORD_BCRYPT),
            'full_name'  => $data['full_name'],
            'phone'      => $data['phone'] ?? null,
            'role'       => 'partner',
            'status'     => 'active',
            'email_verified_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Cập nhật mật khẩu
     */
    public function updatePassword(int $userId, string $newPassword): bool
    {
        return $this->update($userId, [
            'password' => password_hash($newPassword, PASSWORD_BCRYPT),
        ]) > 0;
    }
}
