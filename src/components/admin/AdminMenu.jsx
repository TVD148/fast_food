import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import ConfirmDialog from './ConfirmDialog';

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const EMPTY_FORM = { ten_mon: '', mo_ta: '', gia_ban: '', hinh_anh: '', ma_danh_muc: '', trang_thai: 'con_hang', cong_thuc: [] };

export default function AdminMenu() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [nguyenLieu, setNguyenLieu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, name: '' });

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchData = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [r1, r2, r3] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/mon-an`, { headers }),
            fetch(`${API_BASE_URL}/admin/danh-muc`, { headers }),
            fetch(`${API_BASE_URL}/admin/nguyen-lieu`, { headers })
        ]);
        const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
        if (d1.success) setItems(d1.data);
        if (d2.success) setCategories(d2.data);
        if (d3.success) setNguyenLieu(d3.data.filter(n => n.trang_thai === 'hoat_dong'));
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (item) => {
        setEditItem(item);
        setForm({ 
            ten_mon: item.ten_mon, mo_ta: item.mo_ta || '', gia_ban: item.gia_ban, 
            hinh_anh: item.hinh_anh || '', ma_danh_muc: item.ma_danh_muc || '', trang_thai: item.trang_thai,
            cong_thuc: item.cong_thuc || [] 
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.ten_mon || !form.gia_ban) return showToast('Vui lòng nhập tên và giá!', 'error');
        
        const validCongThuc = form.cong_thuc.filter(ct => ct.ma_nguyen_lieu && ct.so_luong_can > 0);
        if (validCongThuc.length === 0) return showToast('Món ăn bắt buộc phải có ít nhất 1 nguyên liệu!', 'error');

        const submitForm = { ...form, cong_thuc: validCongThuc };

        setSaving(true);
        const token = localStorage.getItem('token');
        const method = editItem ? 'PUT' : 'POST';
        const url = editItem ? `${API_BASE_URL}/admin/mon-an/${editItem.ma_mon_an}` : `${API_BASE_URL}/admin/mon-an`;
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(submitForm) });
        const data = await res.json();
        if (data.success) { showToast(data.message); setShowModal(false); fetchData(); }
        else showToast(data.message || 'Lỗi!', 'error');
        setSaving(false);
    };

    const handleAddIngredient = () => {
        setForm(prev => ({ ...prev, cong_thuc: [...prev.cong_thuc, { ma_nguyen_lieu: '', so_luong_can: '' }] }));
    };

    const handleRemoveIngredient = (index) => {
        setForm(prev => {
            const newCongThuc = [...prev.cong_thuc];
            newCongThuc.splice(index, 1);
            return { ...prev, cong_thuc: newCongThuc };
        });
    };

    const handleIngredientChange = (index, field, value) => {
        setForm(prev => {
            const newCongThuc = [...prev.cong_thuc];
            newCongThuc[index][field] = value;
            return { ...prev, cong_thuc: newCongThuc };
        });
    };

    const handleDelete = (id, name) => {
        setConfirmDialog({ open: true, id, name });
    };

    const handleConfirmDelete = async () => {
        const { id } = confirmDialog;
        setConfirmDialog({ open: false, id: null, name: '' });
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/mon-an/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchData(); }
        else showToast(data.message, 'error');
    };

    const filtered = items.filter(i =>
        i.ten_mon.toLowerCase().includes(search.toLowerCase()) &&
        (filterCat === '' || String(i.ma_danh_muc) === String(filterCat))
    );

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
            <ConfirmDialog
                open={confirmDialog.open}
                title="Xóa món ăn"
                message={<>Bạn có chắc muốn xóa món <strong>"{confirmDialog.name}"</strong>?<br/><span style={{color:'#ef4444'}}>Hành động này không thể hoàn tác.</span></>}
                confirmText="Xóa món"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ open: false, id: null, name: '' })}
            />
            <div className="admin-section-header">
                <h2 className="admin-section-title">🍔 Quản lý Thực đơn</h2>
                <button className="btn-admin-primary" onClick={openAdd}>+ Thêm món</button>
            </div>

            <div className="admin-toolbar">
                <input className="admin-search" placeholder="🔍 Tìm tên món..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="admin-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map(c => <option key={c.ma_danh_muc} value={c.ma_danh_muc}>{c.ten_danh_muc}</option>)}
                </select>
                <span className="admin-count">{filtered.length} món</span>
            </div>

            {loading ? <div className="admin-loading">⏳ Đang tải...</div> : (
                <div className="menu-grid">
                    {filtered.map(item => (
                        <div key={item.ma_mon_an} className={`menu-card ${item.trang_thai === 'het_hang' ? 'out-of-stock' : ''}`}>
                            <div className="menu-card-img-wrap">
                                <img src={item.hinh_anh || 'https://via.placeholder.com/200x140?text=No+Image'} alt={item.ten_mon}
                                    onError={e => e.target.src = 'https://via.placeholder.com/200x140?text=No+Image'} />
                                <span className={`menu-status-tag ${item.trang_thai}`}>
                                    {item.trang_thai === 'con_hang' ? '✅ Đang bán' : '❌ Ngừng bán'}
                                </span>
                            </div>
                            <div className="menu-card-body">
                                <div className="menu-card-cat">{item.ten_danh_muc || 'Chưa phân loại'}</div>
                                <h4 className="menu-card-name">{item.ten_mon}</h4>
                                <div className="menu-card-price">{formatMoney(item.gia_ban)}</div>
                                {item.mo_ta && <p className="menu-card-desc">{item.mo_ta}</p>}
                                <div className="menu-card-actions">
                                    <button className="btn-edit" onClick={() => openEdit(item)}>✏️ Sửa</button>
                                    <button className="btn-delete" onClick={() => handleDelete(item.ma_mon_an, item.ten_mon)}>🗑️ Xóa</button>
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
                            <h3>{editItem ? '✏️ Sửa món ăn' : '➕ Thêm món mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên món *</label>
                                <input value={form.ten_mon} onChange={e => setForm({ ...form, ten_mon: e.target.value })} placeholder="VD: Burger Bò Phô Mai" />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Giá bán (VNĐ) *</label>
                                    <input type="number" value={form.gia_ban} onChange={e => setForm({ ...form, gia_ban: e.target.value })} placeholder="120000" />
                                </div>
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <select value={form.ma_danh_muc} onChange={e => setForm({ ...form, ma_danh_muc: e.target.value })}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c.ma_danh_muc} value={c.ma_danh_muc}>{c.ten_danh_muc}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Hình ảnh (Tối đa 2MB)</label>
                                <div className="d-flex gap-2">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="form-control"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    alert('Hình ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setForm({ ...form, hinh_anh: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mt-2 text-muted small">Hoặc nhập URL:</div>
                                <input value={form.hinh_anh?.startsWith('data:') ? '' : form.hinh_anh} onChange={e => setForm({ ...form, hinh_anh: e.target.value })} placeholder="https://..." />
                                {form.hinh_anh && <img src={form.hinh_anh} alt="preview" className="img-preview mt-2" style={{maxHeight: '150px', objectFit: 'contain'}} onError={e => e.target.style.display = 'none'} />}
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea rows={3} value={form.mo_ta} onChange={e => setForm({ ...form, mo_ta: e.target.value })} placeholder="Mô tả ngắn về món ăn..." />
                            </div>
                            <div className="form-group">
                                <label>Tình trạng kinh doanh</label>
                                <select value={form.trang_thai} onChange={e => setForm({ ...form, trang_thai: e.target.value })}>
                                    <option value="con_hang">✅ Đang bán</option>
                                    <option value="het_hang">❌ Tạm ngừng bán</option>
                                </select>
                            </div>

                            <hr style={{margin: '20px 0', borderColor: '#eee'}} />
                            
                            <h4>Nguyên Liệu Cấu Thành *</h4>
                            <p style={{fontSize: '0.85em', color: '#666', marginBottom: '10px'}}>Thêm ít nhất 1 nguyên liệu để tạo món.</p>
                            <div className="recipe-list">
                                {form.cong_thuc.map((ct, idx) => (
                                    <div key={idx} style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                                        <select style={{flex: 2}} value={ct.ma_nguyen_lieu} onChange={e => handleIngredientChange(idx, 'ma_nguyen_lieu', e.target.value)}>
                                            <option value="">-- Chọn Nguyên Liệu --</option>
                                            {nguyenLieu.map(nl => <option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>{nl.ten_nguyen_lieu} ({nl.don_vi_tinh})</option>)}
                                        </select>
                                        <input type="number" style={{flex: 1}} min="0.1" step="0.1" value={ct.so_luong_can} onChange={e => handleIngredientChange(idx, 'so_luong_can', e.target.value)} placeholder="Số lượng" />
                                        <button className="btn-delete" style={{padding:'8px 12px'}} onClick={() => handleRemoveIngredient(idx)}>✕</button>
                                    </div>
                                ))}
                                <button className="btn-admin-secondary" onClick={handleAddIngredient} style={{fontSize: '0.9em', padding: '5px 10px'}}>+ Thêm nguyên liệu</button>
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
