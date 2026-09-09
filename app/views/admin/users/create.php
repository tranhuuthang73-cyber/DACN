<div style="max-width:760px; margin:0 auto;">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:var(--space-xl);">
        <a href="<?= $appUrl ?>/admin/users" class="btn btn-ghost btn-sm" style="padding:8px 12px;">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Quay lại
        </a>
        <h2 style="font-size:1.5rem; font-weight:800;">Tạo Tài khoản mới & Phân quyền</h2>
    </div>

    <div class="card" style="padding:36px; background:white; border-radius:24px; box-shadow:var(--shadow-md);">
        <form method="POST" action="<?= $appUrl ?>/admin/users/store">
            <input type="hidden" name="_csrf_token" value="<?= $csrfToken ?>">

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Tên đăng nhập <span style="color:var(--danger)">*</span></label>
                    <input type="text" name="username" required placeholder="vd: nv_nguyenvan" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Họ và tên đầy đủ <span style="color:var(--danger)">*</span></label>
                    <input type="text" name="full_name" required placeholder="vd: Nguyễn Văn A" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Địa chỉ Email <span style="color:var(--danger)">*</span></label>
                    <input type="email" name="email" required placeholder="vd: nhanvien@travelgo.vn" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Số điện thoại <span style="color:var(--danger)">*</span></label>
                    <input type="tel" name="phone" required placeholder="vd: 0901234567" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Mật khẩu ban đầu <span style="color:var(--danger)">*</span></label>
                    <input type="password" name="password" required placeholder="Tối thiểu 6 ký tự" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem;">
                </div>
                <div>
                    <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Vai trò (Quyền hạn) <span style="color:var(--danger)">*</span></label>
                    <select name="role" id="roleSelect" onchange="togglePartnerFields()" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem; background:white; font-weight:700;">
                        <option value="employee" selected>💼 Nhân viên nghiệp vụ (Employee)</option>
                        <option value="admin">👑 Quản trị viên hệ thống (Admin)</option>
                        <option value="partner">🤝 Đối tác vận tải / Khách sạn (Partner)</option>
                        <option value="customer">🧑 Khách hàng cá nhân (Customer)</option>
                    </select>
                </div>
            </div>

            <div id="partnerFields" style="display:none; background:var(--gray-50); padding:20px; border-radius:16px; margin-bottom:24px; border-left:4px solid #FB923C;">
                <label style="display:block; font-weight:700; margin-bottom:8px; font-size:0.9rem;">Tên Doanh nghiệp / Hãng xe / Khách sạn</label>
                <input type="text" name="company_name" placeholder="vd: Công ty TNHH Vận tải Phương Trang" style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gray-200); font-size:0.95rem; background:white;">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:12px; padding-top:16px; border-top:1px solid var(--gray-100);">
                <a href="<?= $appUrl ?>/admin/users" class="btn btn-ghost">Hủy bỏ</a>
                <button type="submit" class="btn btn-primary" style="padding:12px 28px; font-weight:800;">
                    ✓ Lưu tài khoản mới
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    function togglePartnerFields() {
        const role = document.getElementById('roleSelect').value;
        const partnerFields = document.getElementById('partnerFields');
        partnerFields.style.display = (role === 'partner') ? 'block' : 'none';
    }
</script>
