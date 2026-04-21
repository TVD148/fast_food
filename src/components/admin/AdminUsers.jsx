import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../apiConfig';

const ROLE_MAP = { khach_hang: { label: 'Khách hàng', color: '#6b7280', icon: '👤' }, nhan_vien: { label: 'Nhân viên', color: '#3b82f6', icon: '🧑‍💼' }, quan_tri: { label: 'Quản trị', color: '#f59e0b', icon: '👑' } };

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setUsers(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const updateRole = async (id, role) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}/vai-tro`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ vai_tro: role })
        });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchUsers(); }
        else showToast(data.message, 'error');
    };

    const deleteUser = async (id, name) => {
        if (!window.confirm(`Xóa tài khoản "${name}"?`)) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchUsers(); }
        else showToast(data.message, 'error');
    };

    const filtered = users.filter(u =>
        (u.ho_ten?.toLowerCase().includes(search.toLowerCase()) || u.email?.includes(search) || u.so_dien_thoai?.includes(search)) &&
        (filterRole === '' || u.vai_tro === filterRole)
    );

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
            <div className="admin-section-header">
                <h2 className="admin-section-title">👥 Quản lý Người dùng</h2>
                <span className="admin-count-badge">{users.length} tài khoản</span>
            </div>

            <div className="admin-toolbar">
                <input className="admin-search" placeholder="🔍 Tìm tên, email, SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="admin-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                    <option value="">Tất cả vai trò</option>
                    <option value="khach_hang">Khách hàng</option>
                    <option value="nhan_vien">Nhân viên</option>
                    <option value="quan_tri">Quản trị</option>
                </select>
            </div>

            {loading ? <div className="admin-loading">⏳ Đang tải...</div> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Họ tên</th><th>Email / SĐT</th><th>Địa chỉ</th><th>Ngày tạo</th><th>Vai trò</th><th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.ma_nguoi_dung}>
                                    <td>#{u.ma_nguoi_dung}</td>
                                    <td>
                                        <div className="user-avatar-row">
                                            <div className="user-avatar">{u.ho_ten?.charAt(0)?.toUpperCase()}</div>
                                            <strong>{u.ho_ten}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        {u.email && <div>📧 {u.email}</div>}
                                        {u.so_dien_thoai && <div>📞 {u.so_dien_thoai}</div>}
                                    </td>
                                    <td><span className="cell-sub">{u.dia_chi || '—'}</span></td>
                                    <td>{new Date(u.ngay_tao).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <select className="role-select" value={u.vai_tro} onChange={e => updateRole(u.ma_nguoi_dung, e.target.value)}
                                            style={{ color: ROLE_MAP[u.vai_tro]?.color }}>
                                            <option value="khach_hang">👤 Khách hàng</option>
                                            <option value="nhan_vien">🧑‍💼 Nhân viên</option>
                                            <option value="quan_tri">👑 Quản trị</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="btn-delete" onClick={() => deleteUser(u.ma_nguoi_dung, u.ho_ten)}>🗑️ Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="admin-empty">Không tìm thấy người dùng nào</div>}
                </div>
            )}
        </div>
    );
}
