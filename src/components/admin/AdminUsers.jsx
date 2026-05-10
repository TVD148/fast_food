import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from './ConfirmDialog';

const ROLE_MAP = {
    khach_hang: { label: 'Khách hàng', color: '#6b7280', icon: '👤' },
    nhan_vien: { label: 'Nhân viên', color: '#3b82f6', icon: '🧑‍💼' },
    quan_tri: { label: 'Quản trị', color: '#f59e0b', icon: '👑' }
};

const STATUS_MAP = {
    hoat_dong: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    bi_khoa:   { label: 'Bị khóa',   color: '#f59e0b', bg: '#fef3c7', icon: '🔒' },
    bi_cam:    { label: 'Bị cấm',    color: '#ef4444', bg: '#fee2e2', icon: '🚫' },
};

export default function AdminUsers() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [toast, setToast] = useState(null);

    // Dialog xóa
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
    // Dialog khóa/mở
    const [lockDialog, setLockDialog] = useState({ open: false, id: null, name: '', action: 'bi_khoa', so_ngay: 1 });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setUsers(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ─── Cập nhật vai trò ───
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

    // ─── Xóa tài khoản ───
    const handleConfirmDelete = async () => {
        const { id } = deleteDialog;
        setDeleteDialog({ open: false, id: null, name: '' });
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchUsers(); }
        else showToast(data.message, 'error');
    };

    // ─── Khóa / Mở khóa ───
    const openLockDialog = (id, name, action) => {
        setLockDialog({ open: true, id, name, action, so_ngay: action === 'hoat_dong' ? 0 : 1 });
    };

    const handleConfirmLock = async () => {
        const { id, action, so_ngay } = lockDialog;
        setLockDialog({ open: false, id: null, name: '', action: 'bi_khoa', so_ngay: 1 });
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}/trang-thai`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ trang_thai: action, so_ngay: parseInt(so_ngay) })
        });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchUsers(); }
        else showToast(data.message, 'error');
    };

    // ─── Filter ───
    const filtered = users.filter(u =>
        (u.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.includes(search) ||
            u.so_dien_thoai?.includes(search)) &&
        (filterRole === '' || u.vai_tro === filterRole) &&
        (filterStatus === '' || (u.trang_thai || 'hoat_dong') === filterStatus)
    );

    // Config cho lock dialog
    const lockConfig = {
        bi_khoa: {
            title: 'Khóa tài khoản',
            confirmText: 'Khóa tài khoản',
            type: 'warning',
            icon: '🔒',
            desc: 'Tài khoản sẽ bị khóa tạm thời. Bạn có thể mở khóa lại sau.',
        },
        bi_cam: {
            title: 'Cấm vĩnh viễn',
            confirmText: 'Cấm vĩnh viễn',
            type: 'danger',
            icon: '🚫',
            desc: 'Tài khoản sẽ bị cấm vĩnh viễn và không thể đăng nhập.',
        },
        hoat_dong: {
            title: 'Mở khóa tài khoản',
            confirmText: 'Mở khóa',
            type: 'success',
            icon: '🔓',
            desc: 'Tài khoản sẽ được khôi phục về trạng thái hoạt động bình thường.',
        },
    };

    const lc = lockConfig[lockDialog.action] || lockConfig.bi_khoa;

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}

            {/* Dialog xóa */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="Xóa tài khoản"
                message={<>Bạn có chắc muốn xóa tài khoản <strong>"{deleteDialog.name}"</strong>?<br /><span style={{ color: '#ef4444' }}>Hành động này không thể hoàn tác.</span></>}
                confirmText="Xóa tài khoản"
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteDialog({ open: false, id: null, name: '' })}
            />

            {/* Dialog khóa/mở */}
            <ConfirmDialog
                open={lockDialog.open}
                title={lc.title}
                icon={lc.icon}
                message={
                    <div>
                        Bạn có chắc muốn <strong>{lc.title.toLowerCase()}</strong> <strong>"{lockDialog.name}"</strong>?
                        <br />
                        <span style={{ color: lc.type === 'danger' ? '#ef4444' : lc.type === 'success' ? '#059669' : '#f59e0b' }}>{lc.desc}</span>
                        
                        {lockDialog.action === 'bi_khoa' && (
                            <div style={{marginTop: '15px'}}>
                                <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Thời hạn khóa:</label>
                                <select 
                                    className="admin-select" 
                                    style={{width:'100%'}}
                                    value={lockDialog.so_ngay} 
                                    onChange={e => setLockDialog({...lockDialog, so_ngay: e.target.value})}
                                >
                                    <option value="1">1 ngày</option>
                                    <option value="3">3 ngày</option>
                                    <option value="7">7 ngày</option>
                                    <option value="30">30 ngày</option>
                                    <option value="-1">Vĩnh viễn</option>
                                </select>
                            </div>
                        )}
                    </div>
                }
                confirmText={lc.confirmText}
                type={lc.type}
                onConfirm={handleConfirmLock}
                onCancel={() => setLockDialog({ open: false, id: null, name: '', action: 'bi_khoa', so_ngay: 1 })}
            />

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
                <select className="admin-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="hoat_dong">✅ Hoạt động</option>
                    <option value="bi_khoa">🔒 Bị khóa</option>
                    <option value="bi_cam">🚫 Bị cấm</option>
                </select>
            </div>

            {loading ? <div className="admin-loading">⏳ Đang tải...</div> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Email / SĐT</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Vai trò</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => {
                                const status = u.trang_thai || 'hoat_dong';
                                const sm = STATUS_MAP[status];
                                return (
                                    <tr key={u.ma_nguoi_dung} className={status !== 'hoat_dong' ? 'row-locked' : ''}>
                                        <td>#{u.ma_nguoi_dung}</td>
                                        <td>
                                            <div className="user-avatar-row">
                                                <div className={`user-avatar ${status !== 'hoat_dong' ? 'locked' : ''}`}>
                                                    {u.ho_ten?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <strong>{u.ho_ten}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            {u.email && <div>📧 {u.email}</div>}
                                            {u.so_dien_thoai && <div>📞 {u.so_dien_thoai}</div>}
                                        </td>
                                        <td>{new Date(u.ngay_tao).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className="user-status-badge" style={{ color: sm.color, background: sm.bg }}>
                                                {sm.icon} {sm.label}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="role-select"
                                                value={u.vai_tro}
                                                disabled={u.ma_nguoi_dung === currentUser?.id}
                                                onChange={e => updateRole(u.ma_nguoi_dung, e.target.value)}
                                                style={{ color: ROLE_MAP[u.vai_tro]?.color, opacity: u.ma_nguoi_dung === currentUser?.id ? 0.6 : 1 }}
                                            >
                                                <option value="khach_hang">👤 Khách hàng</option>
                                                <option value="nhan_vien">🧑‍💼 Nhân viên</option>
                                                <option value="quan_tri">👑 Quản trị</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                {/* Nút khóa / mở khóa */}
                                                {u.ma_nguoi_dung !== currentUser?.id && (
                                                    status === 'hoat_dong' ? (
                                                        <button
                                                            className="btn-lock"
                                                            title="Khóa tài khoản"
                                                            onClick={() => openLockDialog(u.ma_nguoi_dung, u.ho_ten, 'bi_khoa')}
                                                        >
                                                            🔒 Khóa
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn-unlock"
                                                            title="Mở khóa"
                                                            onClick={() => openLockDialog(u.ma_nguoi_dung, u.ho_ten, 'hoat_dong')}
                                                        >
                                                            🔓 Mở
                                                        </button>
                                                    )
                                                )}

                                                {/* Nút xóa */}
                                                {u.ma_nguoi_dung !== currentUser?.id && (
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => setDeleteDialog({ open: true, id: u.ma_nguoi_dung, name: u.ho_ten })}
                                                    >
                                                        🗑️ Xóa
                                                    </button>
                                                )}
                                                
                                                {u.ma_nguoi_dung === currentUser?.id && (
                                                    <span style={{color:'#888', fontSize:'0.9em', fontStyle:'italic'}}>Tài khoản đang dùng</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="admin-empty">Không tìm thấy người dùng nào</div>}
                </div>
            )}
        </div>
    );
}
