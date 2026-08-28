<?php
/**
 * TravelGo - Partner Trip Controller
 * Đối tác chỉ được xem các chuyến đi liên kết với chính họ
 */

namespace App\Controllers\Partner;

use App\Core\Controller;
use App\Middleware\PartnerMiddleware;
use App\Models\PartnerModel;
use App\Models\TripModel;
use App\Core\Auth;

class PartnerTripController extends Controller
{
    private PartnerModel $partnerModel;
    private TripModel $tripModel;

    public function __construct()
    {
        parent::__construct();
        PartnerMiddleware::handle();
        $this->partnerModel = new PartnerModel();
        $this->tripModel = new TripModel();
    }

    /**
     * Danh sách chuyến đi của đối tác này
     */
    public function index(): void
    {
        $partner = $this->partnerModel->findByUserId(Auth::id());
        $page = (int)($this->query('page', 1));

        $results = $this->tripModel->getAdminTrips([
            'partner_id' => $partner->id,
            'status'     => $this->query('status'),
        ], $page, 15);

        $this->view('partner/trips/index', [
            'pageTitle' => 'Chuyến đi của đơn vị',
            'trips'     => $results['data'],
            'total'     => $results['total'],
            'pages'     => $results['pages'],
            'current'   => $results['current'],
            'partner'   => $partner,
        ], 'admin');
    }
}
