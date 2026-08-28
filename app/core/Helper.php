<?php
/**
 * TravelGo - Helper Functions
 * 
 * Các hàm tiện ích dùng chung trong toàn bộ ứng dụng.
 * File này được require trong index.php.
 */

namespace App\Core;

class Helper
{
    /**
     * Format số tiền VND
     * formatMoney(1500000) → "1.500.000₫"
     */
    public static function formatMoney(float|int|null $amount): string
    {
        if ($amount === null) return '0₫';
        return number_format($amount, 0, ',', '.') . '₫';
    }

    /**
     * Format ngày tháng tiếng Việt
     * formatDate('2026-09-10') → "10/09/2026"
     */
    public static function formatDate(?string $date, string $format = 'd/m/Y'): string
    {
        if (!$date) return '';
        return date($format, strtotime($date));
    }

    /**
     * Format ngày giờ
     * formatDateTime('2026-09-10 07:00:00') → "10/09/2026 07:00"
     */
    public static function formatDateTime(?string $datetime): string
    {
        if (!$datetime) return '';
        return date('d/m/Y H:i', strtotime($datetime));
    }

    /**
     * Format thời gian tương đối
     * timeAgo('2026-08-28 10:00:00') → "3 giờ trước"
     */
    public static function timeAgo(string $datetime): string
    {
        $diff = time() - strtotime($datetime);
        
        if ($diff < 60) return 'Vừa xong';
        if ($diff < 3600) return floor($diff / 60) . ' phút trước';
        if ($diff < 86400) return floor($diff / 3600) . ' giờ trước';
        if ($diff < 604800) return floor($diff / 86400) . ' ngày trước';
        if ($diff < 2592000) return floor($diff / 604800) . ' tuần trước';
        return self::formatDate($datetime);
    }

    /**
     * Escape HTML output (chống XSS)
     */
    public static function e(?string $value): string
    {
        return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
    }

    /**
     * Tạo slug từ chuỗi tiếng Việt
     * slug('Đà Lạt đẹp lắm') → "da-lat-dep-lam"
     */
    public static function slug(string $str): string
    {
        // Bảng chuyển đổi tiếng Việt
        $vietnamese = [
            'à','á','ạ','ả','ã','â','ầ','ấ','ậ','ẩ','ẫ','ă','ằ','ắ','ặ','ẳ','ẵ',
            'è','é','ẹ','ẻ','ẽ','ê','ề','ế','ệ','ể','ễ',
            'ì','í','ị','ỉ','ĩ',
            'ò','ó','ọ','ỏ','õ','ô','ồ','ố','ộ','ổ','ỗ','ơ','ờ','ớ','ợ','ở','ỡ',
            'ù','ú','ụ','ủ','ũ','ư','ừ','ứ','ự','ử','ữ',
            'ỳ','ý','ỵ','ỷ','ỹ',
            'đ',
            'À','Á','Ạ','Ả','Ã','Â','Ầ','Ấ','Ậ','Ẩ','Ẫ','Ă','Ằ','Ắ','Ặ','Ẳ','Ẵ',
            'È','É','Ẹ','Ẻ','Ẽ','Ê','Ề','Ế','Ệ','Ể','Ễ',
            'Ì','Í','Ị','Ỉ','Ĩ',
            'Ò','Ó','Ọ','Ỏ','Õ','Ô','Ồ','Ố','Ộ','Ổ','Ỗ','Ơ','Ờ','Ớ','Ợ','Ở','Ỡ',
            'Ù','Ú','Ụ','Ủ','Ũ','Ư','Ừ','Ứ','Ự','Ử','Ữ',
            'Ỳ','Ý','Ỵ','Ỷ','Ỹ',
            'Đ'
        ];
        $ascii = [
            'a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a',
            'e','e','e','e','e','e','e','e','e','e','e',
            'i','i','i','i','i',
            'o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o',
            'u','u','u','u','u','u','u','u','u','u','u',
            'y','y','y','y','y',
            'd',
            'A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A',
            'E','E','E','E','E','E','E','E','E','E','E',
            'I','I','I','I','I',
            'O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O',
            'U','U','U','U','U','U','U','U','U','U','U',
            'Y','Y','Y','Y','Y',
            'D'
        ];

        $str = str_replace($vietnamese, $ascii, $str);
        $str = strtolower($str);
        $str = preg_replace('/[^a-z0-9\s-]/', '', $str);
        $str = preg_replace('/[\s-]+/', '-', $str);
        return trim($str, '-');
    }

    /**
     * Tạo mã code ngẫu nhiên
     * generateCode('TG') → "TG-20260910-ABC123"
     */
    public static function generateCode(string $prefix = 'TG'): string
    {
        return sprintf(
            '%s-%s-%s',
            $prefix,
            date('Ymd'),
            strtoupper(bin2hex(random_bytes(3)))
        );
    }

    /**
     * Tạo mã booking
     */
    public static function generateBookingCode(): string
    {
        return self::generateCode('BK');
    }

    /**
     * Tạo mã đơn hàng
     */
    public static function generateOrderCode(): string
    {
        return self::generateCode('ORD');
    }

    /**
     * Tạo mã chuyến
     */
    public static function generateTripCode(): string
    {
        return self::generateCode('TRIP');
    }

    /**
     * Truncate text
     * truncate('Lorem ipsum dolor sit amet', 20) → "Lorem ipsum dolor..."
     */
    public static function truncate(string $text, int $length = 100, string $suffix = '...'): string
    {
        if (mb_strlen($text) <= $length) return $text;
        return mb_substr($text, 0, $length) . $suffix;
    }

    /**
     * Lấy URL hiện tại
     */
    public static function currentUrl(): string
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        return $protocol . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    /**
     * Kiểm tra URL hiện tại có match pattern không (active menu)
     */
    public static function isActive(string $pattern): string
    {
        $url = $_GET['url'] ?? '';
        if (str_starts_with($url, ltrim($pattern, '/'))) {
            return 'active';
        }
        return '';
    }

    /**
     * Map trạng thái booking sang tiếng Việt và màu
     */
    public static function bookingStatus(string $status): array
    {
        return match($status) {
            'pending_payment' => ['label' => 'Chờ thanh toán', 'color' => 'warning', 'icon' => 'clock'],
            'paid'           => ['label' => 'Đã thanh toán', 'color' => 'info', 'icon' => 'credit-card'],
            'confirmed'      => ['label' => 'Đã xác nhận', 'color' => 'success', 'icon' => 'check-circle'],
            'in_progress'    => ['label' => 'Đang diễn ra', 'color' => 'primary', 'icon' => 'play-circle'],
            'completed'      => ['label' => 'Hoàn thành', 'color' => 'success', 'icon' => 'check-circle-2'],
            'cancel_requested' => ['label' => 'Yêu cầu hủy', 'color' => 'warning', 'icon' => 'alert-circle'],
            'cancelled'      => ['label' => 'Đã hủy', 'color' => 'danger', 'icon' => 'x-circle'],
            'refunded'       => ['label' => 'Đã hoàn tiền', 'color' => 'secondary', 'icon' => 'rotate-ccw'],
            'expired'        => ['label' => 'Hết hạn', 'color' => 'secondary', 'icon' => 'timer-off'],
            default          => ['label' => $status, 'color' => 'secondary', 'icon' => 'help-circle'],
        };
    }

    /**
     * Map trạng thái trip sang tiếng Việt
     */
    public static function tripStatus(string $status): array
    {
        return match($status) {
            'draft'            => ['label' => 'Nháp', 'color' => 'secondary'],
            'pending_approval' => ['label' => 'Chờ duyệt', 'color' => 'warning'],
            'approved'         => ['label' => 'Đã duyệt', 'color' => 'info'],
            'rejected'         => ['label' => 'Từ chối', 'color' => 'danger'],
            'active'           => ['label' => 'Đang mở', 'color' => 'success'],
            'departed'         => ['label' => 'Đã khởi hành', 'color' => 'primary'],
            'completed'        => ['label' => 'Hoàn thành', 'color' => 'success'],
            'cancelled'        => ['label' => 'Đã hủy', 'color' => 'danger'],
            default            => ['label' => $status, 'color' => 'secondary'],
        };
    }

    /**
     * Lấy IP address thật
     */
    public static function getClientIp(): string
    {
        $headers = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }
        return '127.0.0.1';
    }

    /**
     * Tính tỷ lệ hoàn tiền dựa trên số ngày trước khởi hành
     */
    public static function calculateRefundPercentage(int $daysBefore): float
    {
        if ($daysBefore >= 7) return 100.0;
        if ($daysBefore >= 3) return 50.0;
        if ($daysBefore >= 1) return 20.0;
        return 0.0;
    }

    /**
     * Map amenities key sang tiếng Việt
     */
    public static function amenityLabel(string $key): string
    {
        return match($key) {
            'wifi'           => 'Wi-Fi miễn phí',
            'pool'           => 'Hồ bơi',
            'spa'            => 'Spa & Wellness',
            'restaurant'     => 'Nhà hàng',
            'bar'            => 'Quầy bar',
            'parking'        => 'Bãi đỗ xe',
            'gym'            => 'Phòng gym',
            'room_service'   => 'Dịch vụ phòng',
            'laundry'        => 'Giặt ủi',
            'conference'     => 'Phòng hội nghị',
            'beach_access'   => 'Gần biển',
            'private_beach'  => 'Bãi biển riêng',
            'kids_club'      => 'Khu vui chơi trẻ em',
            'shuttle'        => 'Xe đưa đón',
            'ac'             => 'Điều hòa',
            'tv'             => 'TV',
            'minibar'        => 'Minibar',
            'safe'           => 'Két sắt',
            'hairdryer'      => 'Máy sấy tóc',
            'bathtub'        => 'Bồn tắm',
            'balcony'        => 'Ban công',
            'lake_view'      => 'View hồ',
            'sea_view'       => 'View biển',
            'mountain_view'  => 'View núi',
            'living_room'    => 'Phòng khách',
            'jacuzzi'        => 'Bồn sục',
            'private_pool'   => 'Hồ bơi riêng',
            'garden'         => 'Vườn',
            'kitchen'        => 'Bếp',
            'butler'         => 'Quản gia riêng',
            'outdoor_shower' => 'Vòi sen ngoài trời',
            'heater'         => 'Máy sưởi',
            'hot_water'      => 'Nước nóng',
            'fireplace'      => 'Lò sưởi',
            'trekking'       => 'Trekking',
            'water_sports'   => 'Thể thao nước',
            'pool_access'    => 'Sử dụng hồ bơi',
            default          => ucfirst(str_replace('_', ' ', $key)),
        };
    }
}
