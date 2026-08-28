<?php
/**
 * TravelGo - Cart Controller
 * Quản lý giỏ hàng kết hợp (Chuyến đi + Khách sạn / Phòng) trong cùng 1 đơn hàng
 */

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Session;
use App\Models\TripModel;
use App\Models\HotelModel;
use App\Models\RoomModel;

class CartController extends Controller
{
    private TripModel $tripModel;
    private HotelModel $hotelModel;
    private RoomModel $roomModel;

    public function __construct()
    {
        parent::__construct();
        $this->tripModel = new TripModel();
        $this->hotelModel = new HotelModel();
        $this->roomModel = new RoomModel();
    }

    /**
     * Xem giỏ hàng
     */
    public function index(): void
    {
        $cart = Session::get('cart', []);
        $totalAmount = 0;

        foreach ($cart as $item) {
            $totalAmount += (float)$item['subtotal'];
        }

        $this->view('cart/index', [
            'pageTitle'   => 'Giỏ hàng của bạn',
            'cart'        => $cart,
            'totalAmount' => $totalAmount,
        ]);
    }

    /**
     * Thêm chuyến đi vào giỏ hàng
     */
    public function addTrip(): void
    {
        if (!$this->validateCsrf()) return;

        $tripId = (int)$this->input('trip_id');
        $quantity = max(1, (int)$this->input('quantity', 1));

        $trip = $this->tripModel->getDetail($tripId);
        if (!$trip || $trip->status !== 'active') {
            Session::flash('error', 'Chuyến đi không tồn tại hoặc đã đóng đặt chỗ.');
            $this->back();
            return;
        }

        if ($trip->available_seats < $quantity) {
            Session::flash('error', "Chuyến đi chỉ còn {$trip->available_seats} chỗ trống.");
            $this->back();
            return;
        }

        $cart = Session::get('cart', []);
        $itemKey = 'trip_' . $tripId;

        $cart[$itemKey] = [
            'key'         => $itemKey,
            'type'        => 'trip',
            'trip_id'     => $tripId,
            'title'       => "{$trip->departure_name} → {$trip->arrival_name}",
            'subtitle'    => "{$trip->vehicle_name} • {$trip->partner_name}",
            'time'        => $trip->departure_datetime,
            'unit_price'  => (float)$trip->price_per_person,
            'quantity'    => $quantity,
            'subtotal'    => (float)$trip->price_per_person * $quantity,
            'image'       => $trip->featured_image,
        ];

        Session::set('cart', $cart);
        Session::flash('success', "Đã thêm chuyến đi vào giỏ hàng!");
        $this->redirect('/cart');
    }

    /**
     * Thêm khách sạn / phòng vào giỏ hàng
     */
    public function addHotel(): void
    {
        if (!$this->validateCsrf()) return;

        $hotelId = (int)$this->input('hotel_id');
        $roomTypeId = (int)$this->input('room_type_id');
        $checkIn = $this->input('check_in');
        $checkOut = $this->input('check_out');
        $quantity = max(1, (int)$this->input('quantity', 1));

        if (empty($checkIn) || empty($checkOut) || strtotime($checkIn) >= strtotime($checkOut)) {
            Session::flash('error', 'Ngày nhận phòng và trả phòng không hợp lệ.');
            $this->back();
            return;
        }

        $hotel = $this->hotelModel->find($hotelId);
        $check = $this->roomModel->checkAvailability($roomTypeId, $checkIn, $checkOut, $quantity);

        if (!$check['available']) {
            Session::flash('error', "Loại phòng này chỉ còn {$check['available_count']} phòng trống trong khoảng ngày đã chọn.");
            $this->back();
            return;
        }

        $room = $check['room'];
        $nights = max(1, (int)round((strtotime($checkOut) - strtotime($checkIn)) / 86400));
        $subtotal = (float)$room->price_per_night * $quantity * $nights;

        $cart = Session::get('cart', []);
        $itemKey = 'hotel_' . $hotelId . '_room_' . $roomTypeId;

        $cart[$itemKey] = [
            'key'          => $itemKey,
            'type'         => 'hotel',
            'hotel_id'     => $hotelId,
            'room_type_id' => $roomTypeId,
            'title'        => "{$hotel->name} - {$room->name}",
            'subtitle'     => "{$quantity} phòng • {$nights} đêm ({$checkIn} đến {$checkOut})",
            'check_in'     => $checkIn,
            'check_out'    => $checkOut,
            'nights'       => $nights,
            'unit_price'   => (float)$room->price_per_night,
            'quantity'     => $quantity,
            'subtotal'     => $subtotal,
            'image'        => $hotel->featured_image,
        ];

        Session::set('cart', $cart);
        Session::flash('success', "Đã thêm phòng khách sạn vào giỏ hàng!");
        $this->redirect('/cart');
    }

    /**
     * Xóa một mục khỏi giỏ hàng
     */
    public function remove(string $key = ''): void
    {
        $cart = Session::get('cart', []);
        if (isset($cart[$key])) {
            unset($cart[$key]);
            Session::set('cart', $cart);
            Session::flash('success', 'Đã xóa mục khỏi giỏ hàng.');
        }
        $this->redirect('/cart');
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    public function clear(): void
    {
        Session::remove('cart');
        Session::flash('info', 'Đã xóa toàn bộ giỏ hàng.');
        $this->redirect('/cart');
    }
}
