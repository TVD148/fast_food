import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import ConfirmDialog from './ConfirmDialog';

const EMPTY_VOUCHER = { 
    ma_code: '', 
    phan_tram_giam: '', 
    giam_toi_da: '0', 
    don_toi_thieu: '0', 
    ngay_het_han: '', 
    so_luong: '100', 
    trang_thai: 'hoat_dong' 
};

export default function AdminVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_VOUCHER);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, code: '' });

    const showToast = (msg, type = 'success') => { 
        setToast({ msg, type }); 
        setTimeout(() => setToast(null), 3000); 
    };

    const fetchVouchers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/ma-giam-gia`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setVouchers(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

    const openAdd = () => { 
        setEditItem(null); 
        setForm(EMPTY_VOUCHER); 
        setShowModal(true); 
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            ma_code: item.ma_code,
            phan_tram_giam: item.phan_tram_giam,
            giam_toi_da: item.giam_toi_da,
            don_toi_thieu: item.don_toi_thieu,
            ngay_het_han: item.ngay_het_han ? item.ngay_het_han.split('T')[0] : '',
            so_luong: item.so_luong,
            trang_thai: item.trang_thai
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.ma_code || !form.phan_tram_giam || !form.ngay_het_han) {
            return showToast('Vui lòng nhập đầy đủ các trường bắt buộc!', 'error');
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        const method = editItem ? 'PUT' : 'POST';
        const url = editItem 
            ? `${API_BASE_URL}/admin/ma-giam-gia/${editItem.ma_code}` 
            : `${API_BASE_URL}/admin/ma-giam-gia`;
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                setShowModal(false);
                fetchVouchers();
            } else {
                showToast(data.message || 'Lỗi!', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối server!', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (code) => {
        setConfirmDialog({ open: true, code });
    };

    const handleConfirmDelete = async () => {
        const { code } = confirmDialog;
        setConfirmDialog({ open: false, code: '' });
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/ma-giam-gia/${code}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                fetchVouchers();
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Lỗi khi xóa!', 'error');
        }
    };

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
            
            <ConfirmDialog
                open={confirmDialog.open}
                title="Xóa mã giảm giá"
                message={<>Bạn có chắc muốn xóa mã <strong>"{confirmDialog.code}"</strong>?</>}
                confirmText="Xóa mã"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ open: false, code: '' })}
            />

            <div className="admin-section-header">
                <h2 className="admin-section-title">🎟️ Quản lý Mã giảm giá</h2>
                <button className="btn-admin-primary" onClick={openAdd}>+ Tạo mã mới</button>
            </div>

            {loading ? <div className="admin-loading">⏳ Đang tải...</div> : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã CODE</th>
                                <th>Giảm (%)</th>
                                <th>Giảm tối đa</th>
                                <th>Đơn tối thiểu</th>
                                <th>Ngày hết hạn</th>
                                <th>Số lượng</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map(v => (
                                <tr key={v.ma_code}>
                                    <td><strong className="text-primary">{v.ma_code}</strong></td>
                                    <td>{v.phan_tram_giam}%</td>
                                    <td>{new Intl.NumberFormat('vi-VN').format(v.giam_toi_da)}đ</td>
                                    <td>{new Intl.NumberFormat('vi-VN').format(v.don_toi_thieu)}đ</td>
                                    <td>{new Date(v.ngay_het_han).toLocaleDateString('vi-VN')}</td>
                                    <td>{v.so_luong}</td>
                                    <td>
                                        <span className={`status-badge ${v.trang_thai}`}>
                                            {v.trang_thai === 'hoat_dong' ? 'Đang chạy' : 'Ngưng'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button className="btn-icon-edit" onClick={() => openEdit(v)} title="Sửa">✏️</button>
                                            <button className="btn-icon-delete" onClick={() => handleDelete(v.ma_code)} title="Xóa">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {vouchers.length === 0 && (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">Chưa có mã giảm giá nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem ? '✏️ Sửa mã giảm giá' : '➕ Tạo mã giảm giá mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Mã CODE *</label>
                                <input 
                                    value={form.ma_code} 
                                    onChange={e => setForm({ ...form, ma_code: e.target.value.toUpperCase() })} 
                                    placeholder="VD: FASTFOOD50" 
                                    disabled={!!editItem}
                                />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>% Giảm giá *</label>
                                    <input type="number" value={form.phan_tram_giam} onChange={e => setForm({ ...form, phan_tram_giam: e.target.value })} placeholder="VD: 10" />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng mã *</label>
                                    <input type="number" value={form.so_luong} onChange={e => setForm({ ...form, so_luong: e.target.value })} placeholder="100" />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Giảm tối đa (đ)</label>
                                    <input type="number" value={form.giam_toi_da} onChange={e => setForm({ ...form, giam_toi_da: e.target.value })} placeholder="50000" />
                                </div>
                                <div className="form-group">
                                    <label>Đơn tối thiểu (đ)</label>
                                    <input type="number" value={form.don_toi_thieu} onChange={e => setForm({ ...form, don_toi_thieu: e.target.value })} placeholder="100000" />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Ngày hết hạn *</label>
                                    <input type="date" value={form.ngay_het_han} onChange={e => setForm({ ...form, ngay_het_han: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select value={form.trang_thai} onChange={e => setForm({ ...form, trang_thai: e.target.value })}>
                                        <option value="hoat_dong">✅ Hoạt động</option>
                                        <option value="ngung_hoat_dong">❌ Ngưng hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? '⏳ Đang lưu...' : '💾 Lưu mã'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
