import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  UsersIcon,
  CpuChipIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../api';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [modelUpdates, setModelUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [{ data: userData }, { data: updateData }] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/model-updates')
      ]);
      setUsers(userData);
      setModelUpdates(updateData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'FARMER' : 'ADMIN';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      alert('Lỗi cập nhật vai trò người dùng');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-stone-300 font-bold">
        Đang tải dữ liệu Trung tâm Quản trị...
      </div>
    );
  }

  return (
    <section aria-labelledby="admin-page-title" className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Header Executive Banner */}
      <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-700/60 relative overflow-hidden text-white">
        <div className="relative z-10">
          <h1 id="admin-page-title" className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-amber-400" aria-hidden="true" />
            Trung tâm Quản trị Hệ thống (Admin Command Center)
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 font-medium mt-1">
            Giám sát tài khoản, cấp quyền và theo dõi nhật ký huấn luyện AI SGD (Audit Trail)
          </p>
        </div>

        {/* KPI Counter Pills */}
        <div className="flex gap-4 relative z-10">
          <div className="bg-emerald-900/90 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-emerald-600/60 min-w-[110px] shadow-lg">
            <div className="text-[11px] text-emerald-300 font-extrabold uppercase tracking-wider">Tổng Người dùng</div>
            <div className="text-2xl font-black text-white mt-0.5">{users.length}</div>
          </div>
          <div className="bg-amber-950/80 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-amber-600/60 min-w-[110px] shadow-lg">
            <div className="text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">Log Huấn luyện AI</div>
            <div className="text-2xl font-black text-white mt-0.5">{modelUpdates.length}</div>
          </div>
        </div>
      </header>


      {/* Grid Showcase: Users Table vs AI Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Management Section */}
        <section aria-labelledby="users-management-title" className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
          <h2 id="users-management-title" className="text-xl font-black text-stone-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            Danh sách Người dùng & Phân quyền
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-600">
              <thead className="bg-stone-100 text-stone-700 font-black uppercase text-[11px] tracking-wider rounded-xl">
                <tr>
                  <th scope="col" className="p-3.5 rounded-l-xl">Họ tên</th>
                  <th scope="col" className="p-3.5">Email</th>
                  <th scope="col" className="p-3.5">Thửa đất</th>
                  <th scope="col" className="p-3.5">Vai trò</th>
                  <th scope="col" className="p-3.5 text-right rounded-r-xl">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="p-3.5 font-black text-stone-900">{u.name}</td>
                    <td className="p-3.5 text-stone-600">{u.email}</td>
                    <td className="p-3.5 font-black text-emerald-800">{u._count?.plots || 0}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                          u.role === 'ADMIN'
                            ? 'badge-amber'
                            : 'badge-emerald'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u.id, u.role)}
                        aria-label={`Đổi vai trò của ${u.name} sang ${u.role === 'ADMIN' ? 'FARMER' : 'ADMIN'}`}
                        className="text-xs font-extrabold text-amber-700 hover:text-amber-900 hover:underline min-h-[44px] inline-flex items-center"
                      >
                        Đổi sang {u.role === 'ADMIN' ? 'FARMER' : 'ADMIN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Model Audit Log Section */}
        <section aria-labelledby="ai-audit-title" className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
          <h2 id="ai-audit-title" className="text-xl font-black text-stone-900 flex items-center gap-2">
            <CpuChipIcon className="w-6 h-6 text-amber-600" aria-hidden="true" />
            Giám sát Huấn luyện AI (Audit Trail Log)
          </h2>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {modelUpdates.map((log) => (
              <article
                key={log.id}
                className="p-4 bg-stone-50/90 rounded-2xl border border-stone-200/80 flex items-center justify-between shadow-sm hover:border-amber-400/50 transition-all"
              >
                <div>
                  <div className="font-extrabold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Thửa đất: <strong className="text-emerald-800">{log.plot?.name}</strong> ({log.plot?.user?.name})</span>
                  </div>
                  <div className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-3">
                    <span>Phiên bản AI: <strong className="text-stone-800">v{log.model_version}</strong></span>
                    <span>Sự kiện: <strong className="text-amber-800 font-bold">{log.trigger}</strong></span>
                  </div>
                </div>

                <time dateTime={log.updated_at} className="text-[11px] text-stone-400 font-bold shrink-0">
                  {new Date(log.updated_at).toLocaleString('vi-VN')}
                </time>
              </article>
            ))}

            {modelUpdates.length === 0 && (
              <div className="text-center py-10 text-stone-400 text-sm font-bold">Chưa có dữ liệu huấn luyện AI</div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default AdminPanel;
