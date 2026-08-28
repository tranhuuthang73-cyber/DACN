<?php
/**
 * TravelGo - Authentication Helper
 * 
 * Quản lý đăng nhập/đăng xuất và kiểm tra quyền.
 * Dữ liệu user được lưu trong session sau khi login.
 */

namespace App\Core;

class Auth
{
    /**
     * Đăng nhập - lưu user info vào session
     */
    public static function login(object $user): void
    {
        // Regenerate session ID để chống session fixation
        Session::regenerate();

        Session::set('user', [
            'id'        => $user->id,
            'username'  => $user->username,
            'email'     => $user->email,
            'full_name' => $user->full_name,
            'phone'     => $user->phone,
            'avatar'    => $user->avatar,
            'role'      => $user->role,
        ]);

        Session::set('logged_in_at', time());
    }

    /**
     * Đăng xuất
     */
    public static function logout(): void
    {
        Session::destroy();
    }

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    public static function check(): bool
    {
        return Session::has('user');
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public static function user(): ?array
    {
        return Session::get('user');
    }

    /**
     * Lấy user ID
     */
    public static function id(): ?int
    {
        $user = self::user();
        return $user['id'] ?? null;
    }

    /**
     * Lấy role
     */
    public static function role(): ?string
    {
        $user = self::user();
        return $user['role'] ?? null;
    }

    /**
     * Lấy tên hiển thị
     */
    public static function name(): ?string
    {
        $user = self::user();
        return $user['full_name'] ?? null;
    }

    /**
     * Kiểm tra user có role nào đó
     * 
     * Auth::hasRole('admin')
     * Auth::hasRole(['admin', 'employee'])
     */
    public static function hasRole(string|array $roles): bool
    {
        $currentRole = self::role();
        if (!$currentRole) return false;

        if (is_string($roles)) {
            return $currentRole === $roles;
        }

        return in_array($currentRole, $roles);
    }

    /**
     * Kiểm tra có phải admin không
     */
    public static function isAdmin(): bool
    {
        return self::hasRole('admin');
    }

    /**
     * Kiểm tra có phải nhân viên không
     */
    public static function isEmployee(): bool
    {
        return self::hasRole('employee');
    }

    /**
     * Kiểm tra có phải đối tác không
     */
    public static function isPartner(): bool
    {
        return self::hasRole('partner');
    }

    /**
     * Kiểm tra có phải khách hàng không
     */
    public static function isCustomer(): bool
    {
        return self::hasRole('customer');
    }

    /**
     * Kiểm tra có phải staff (admin hoặc employee) không
     */
    public static function isStaff(): bool
    {
        return self::hasRole(['admin', 'employee']);
    }

    /**
     * Cập nhật thông tin user trong session (sau khi edit profile)
     */
    public static function refresh(object $user): void
    {
        Session::set('user', [
            'id'        => $user->id,
            'username'  => $user->username,
            'email'     => $user->email,
            'full_name' => $user->full_name,
            'phone'     => $user->phone,
            'avatar'    => $user->avatar,
            'role'      => $user->role,
        ]);
    }
}
