import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import ConfirmDialog from './ConfirmDialog';

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const EMPTY_FORM = { ten_danh_muc: '', mo_ta: '', hinh_anh: '' };

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, name: '' });

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/danh-muc`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setCategories(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const openAdd = () => { setEditCat(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (cat) => { setEditCat(cat); setForm({ ten_danh_muc: cat.ten_danh_muc, mo_ta: cat.mo_ta || '', hinh_anh: cat.hinh_anh || '' }); setShowModal(true); };

    const handleSave = async () => {
        if (!form.ten_danh_muc) return showToast('Tên danh mục không được để trống!', 'error');
        setSaving(true);
        const token = localStorage.getItem('token');
        const method = editCat ? 'PUT' : 'POST';
        const url = editCat ? `${API_BASE_URL}/admin/danh-muc/${editCat.ma_danh_muc}` : `${API_BASE_URL}/admin/danh-muc`;
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        const data = await res.json();
        if (data.success) { showToast(data.message); setShowModal(false); fetchCategories(); }
        else showToast(data.message || 'Lỗi!', 'error');
        setSaving(false);
    };

    const handleDelete = (id, name) => {
        setConfirmDialog({ open: true, id, name });
    };

    const handleConfirmDelete = async () => {
        const { id } = confirmDialog;
        setConfirmDialog({ open: false, id: null, name: '' });
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/danh-muc/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchCategories(); }
        else showToast(data.message, 'error');
    };

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
            <ConfirmDialog
                open={confirmDialog.open}
                title="Xóa danh mục"
                message={<>Bạn có chắc muốn xóa danh mục <strong>"{confirmDialog.name}"</strong>?<br/><span style={{color:'#ef4444'}}>Các món ăn trong danh mục sẽ bị mất liên kết.</span></>}
                confirmText="Xóa danh mục"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ open: false, id: null, name: '' })}
            />
            <div className="admin-section-header">
                <h2 className="admin-section-title">📂 Quản lý Danh mục</h2>
                <button className="btn-admin-primary" onClick={openAdd}>+ Thêm danh mục</button>
            </div>

            {loading ? <div className="admin-loading">⏳ Đang tải...</div> : (
                <div className="cat-grid">
                    {categories.map(cat => (
                        <div key={cat.ma_danh_muc} className="cat-card">
                            <div className="cat-img-wrap">
                                <img src={cat.hinh_anh || 'https://via.placeholder.com/200x120?text=No+Image'} alt={cat.ten_danh_muc}
                                    onError={e => e.target.src = 'https://via.placeholder.com/200x120?text=No+Image'} />
                            </div>
                            <div className="cat-body">
                                <h4 className="cat-name">{cat.ten_danh_muc}</h4>
                                <div className="cat-count">{cat.so_mon || 0} món ăn</div>
                                {cat.mo_ta && <p className="cat-desc">{cat.mo_ta}</p>}
                                <div className="cat-actions">
                                    <button className="btn-edit" onClick={() => openEdit(cat)}>✏️ Sửa</button>
                                    <button className="btn-delete" onClick={() => handleDelete(cat.ma_danh_muc, cat.ten_danh_muc)}>🗑️ Xóa</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editCat ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên danh mục *</label>
                                <input value={form.ten_danh_muc} onChange={e => setForm({ ...form, ten_danh_muc: e.target.value })} placeholder="VD: Burger, Gà Rán..." />
                            </div>
                            <div className="form-group">
                                <label>URL Hình ảnh</label>
                                <input value={form.hinh_anh} onChange={e => setForm({ ...form, hinh_anh: e.target.value })} placeholder="https://..." />
                                {form.hinh_anh && <img src={form.hinh_anh} alt="preview" className="img-preview" onError={e => e.target.style.display = 'none'} />}
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea rows={3} value={form.mo_ta} onChange={e => setForm({ ...form, mo_ta: e.target.value })} placeholder="Mô tả về danh mục..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
