<?php
/**
 * TravelGo - Admin Partner Controller
 * Quản lý và Xét duyệt hồ sơ đối tác
 */

namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Middleware\AdminMiddleware;
use App\Models\PartnerModel;
use App\Core\Auth;
use App\Core\Session;

class AdminPartnerController extends Controller
{
    private PartnerModel $partnerModel;

    public function __construct()
    {
        parent::__construct();
        AdminMiddleware::handle();
        $this->partnerModel = new PartnerModel();
    }

    /**
     * Danh sách đối tác
     */
    public function index(): void
    {
        $status = $this->query('status', '');
        $partners = $this->partnerModel->getPartnersWithUser($status);

        $this->view('admin/partners/index', [
            'pageTitle' => 'Quản lý & Xét duyệt Đối tác',
            'partners'  => $partners,
            'status'    => $status,
        ], 'admin');
    }

    /**
     * Duyệt đối tác
     */
    public function approve(int|string $id = 0): void
    {
        $id = (int)$id;
        $partner = $this->partnerModel->find($id);

        if (!$partner) {
            $this->redirectWithSuccess('/admin/partners', 'Đối tác không tồn tại.');
            return;
        }

        $this->partnerModel->update($id, [
            'status'      => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => date('Y-m-d H:i:s'),
        ]);

        Session::flash('success', "Đã phê duyệt đối tác '{$partner->company_name}' thành công!");
        $this->redirect('/admin/partners');
    }

    /**
     * Từ chối đối tác
     */
    public function reject(int|string $id = 0): void
    {
        $id = (int)$id;
        $reason = trim($this->input('reason') ?? 'Hồ sơ chưa đủ điều kiện.');

        $this->partnerModel->update($id, [
            'status'           => 'rejected',
            'rejection_reason' => $reason,
        ]);

        Session::flash('info', "Đã từ chối hồ sơ đối tác.");
        $this->redirect('/admin/partners');
    }

    /**
     * Tạm ngưng hoặc Kích hoạt lại đối tác
     */
    public function toggle(int|string $id = 0): void
    {
        $id = (int)$id;
        $partner = $this->partnerModel->find($id);

        if ($partner) {
            $newStatus = ($partner->status === 'suspended') ? 'active' : 'suspended';
            $this->partnerModel->update($id, ['status' => $newStatus]);
            Session::flash('success', "Đã thay đổi trạng thái đối tác thành: {$newStatus}");
        }

        $this->redirect('/admin/partners');
    }
}
