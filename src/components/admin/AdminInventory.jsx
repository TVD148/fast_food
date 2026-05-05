import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import ConfirmDialog from './ConfirmDialog';

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

export default function AdminInventory() {
    const [activeTab, setActiveTab] = useState('danh-sach'); // 'danh-sach', 'nhap-kho', 'lich-su'
    const [nguyenLieu, setNguyenLieu] = useState([]);
    const [lichSu, setLichSu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modal Add/Edit Nguyen Lieu
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formNL, setFormNL] = useState({ ten_nguyen_lieu: '', don_vi_tinh: '', trang_thai: 'hoat_dong' });
    
    // Nhập kho state
    const [phieuNhap, setPhieuNhap] = useState([{ ma_nguyen_lieu: '', so_luong: '', don_gia: '' }]);
    const [ghiChu, setGhiChu] = useState('');
    const [saving, setSaving] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, name: '' });

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchNguyenLieu = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguyen-lieu`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setNguyenLieu(data.data);
        setLoading(false);
    }, []);

    const fetchLichSu = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/lich-su-nhap-kho`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setLichSu(data.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (activeTab === 'danh-sach' || activeTab === 'nhap-kho') fetchNguyenLieu();
        if (activeTab === 'lich-su') fetchLichSu();
    }, [activeTab, fetchNguyenLieu, fetchLichSu]);

    // ===== CRUD Nguyên Liệu =====
    const openAddNL = () => { setEditItem(null); setFormNL({ ten_nguyen_lieu: '', don_vi_tinh: '', trang_thai: 'hoat_dong' }); setShowModal(true); };
    const openEditNL = (item) => { setEditItem(item); setFormNL(item); setShowModal(true); };
    
    const handleSaveNL = async () => {
        if (!formNL.ten_nguyen_lieu || !formNL.don_vi_tinh) return showToast('Vui lòng nhập tên và đơn vị tính', 'error');
        setSaving(true);
        const token = localStorage.getItem('token');
        const method = editItem ? 'PUT' : 'POST';
        const url = editItem ? `${API_BASE_URL}/admin/nguyen-lieu/${editItem.ma_nguyen_lieu}` : `${API_BASE_URL}/admin/nguyen-lieu`;
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formNL) });
        const data = await res.json();
        if (data.success) { showToast(data.message); setShowModal(false); fetchNguyenLieu(); }
        else showToast(data.message, 'error');
        setSaving(false);
    };

    const handleDeleteNL = async () => {
        const { id } = confirmDialog;
        setConfirmDialog({ open: false, id: null, name: '' });
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nguyen-lieu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { showToast(data.message); fetchNguyenLieu(); }
        else showToast(data.message, 'error');
    };

    // ===== NHẬP KHO =====
    const handleAddRow = () => setPhieuNhap([...phieuNhap, { ma_nguyen_lieu: '', so_luong: '', don_gia: '' }]);
    const handleRemoveRow = (index) => setPhieuNhap(phieuNhap.filter((_, i) => i !== index));
    const handleRowChange = (index, field, value) => {
        const newPhieu = [...phieuNhap];
        newPhieu[index][field] = value;
        setPhieuNhap(newPhieu);
    };

    const handleSubmitNhapKho = async () => {
        const chiTiet = phieuNhap.filter(p => p.ma_nguyen_lieu && p.so_luong > 0 && p.don_gia >= 0);
        if (chiTiet.length === 0) return showToast('Vui lòng nhập ít nhất 1 dòng hợp lệ', 'error');
        
        setSaving(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/nhap-kho`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ chi_tiet: chiTiet, ghi_chu: ghiChu, nguoi_nhap: 'Admin' })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message);
            setPhieuNhap([{ ma_nguyen_lieu: '', so_luong: '', don_gia: '' }]);
            setGhiChu('');
            setActiveTab('danh-sach');
        } else {
            showToast(data.message, 'error');
        }
        setSaving(false);
    };

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
            <ConfirmDialog
                open={confirmDialog.open} title="Xóa Nguyên Liệu"
                message={<>Bạn có chắc muốn xóa <strong>"{confirmDialog.name}"</strong>? Việc này có thể lỗi nếu nó đang nằm trong công thức món ăn.</>}
                confirmText="Xóa" onConfirm={handleDeleteNL} onCancel={() => setConfirmDialog({ open: false, id: null, name: '' })}
            />
            
            <div className="admin-section-header">
                <h2 className="admin-section-title">📦 Quản lý Kho Hàng</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <button className={`btn-admin-tab ${activeTab === 'danh-sach' ? 'active' : ''}`} onClick={() => setActiveTab('danh-sach')}>Danh Sách</button>
                    <button className={`btn-admin-tab ${activeTab === 'nhap-kho' ? 'active' : ''}`} onClick={() => setActiveTab('nhap-kho')}>Nhập Kho</button>
                    <button className={`btn-admin-tab ${activeTab === 'lich-su' ? 'active' : ''}`} onClick={() => setActiveTab('lich-su')}>Lịch Sử</button>
                </div>
            </div>

            {loading ? <div className="admin-loading">⏳ Đang tải...</div> : (
                <div className="admin-content-box">
                    
                    {/* TAB DANH SÁCH */}
                    {activeTab === 'danh-sach' && (
                        <>
                            <div style={{display:'flex', justifyContent:'flex-end', marginBottom: '15px'}}>
                                <button className="btn-admin-primary" onClick={openAddNL}>+ Thêm Nguyên Liệu</button>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên Nguyên Liệu</th>
                                        <th>Tồn Kho</th>
                                        <th>ĐVT</th>
                                        <th>Giá Nhập Gần Nhất</th>
                                        <th>Trạng Thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nguyenLieu.map(nl => (
                                        <tr key={nl.ma_nguyen_lieu}>
                                            <td>#{nl.ma_nguyen_lieu}</td>
                                            <td><strong>{nl.ten_nguyen_lieu}</strong></td>
                                            <td>
                                                <span style={{color: nl.so_luong_ton <= 10 ? '#ef4444' : '#10b981', fontWeight:'bold'}}>
                                                    {nl.so_luong_ton}
                                                </span>
                                            </td>
                                            <td>{nl.don_vi_tinh}</td>
                                            <td>{formatMoney(nl.gia_nhap_gan_nhat)}</td>
                                            <td>
                                                <span className={`status-badge ${nl.trang_thai === 'hoat_dong' ? 'hoan_thanh' : 'da_huy'}`}>
                                                    {nl.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Ngưng SD'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-edit" onClick={() => openEditNL(nl)}>Sửa</button>
                                                <button className="btn-delete" onClick={() => setConfirmDialog({ open: true, id: nl.ma_nguyen_lieu, name: nl.ten_nguyen_lieu })}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {nguyenLieu.length === 0 && <tr><td colSpan="7" style={{textAlign:'center'}}>Chưa có nguyên liệu nào.</td></tr>}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* TAB NHẬP KHO */}
                    {activeTab === 'nhap-kho' && (
                        <div className="inventory-import-form">
                            <h3>Tạo Phiếu Nhập Kho</h3>
                            <div className="import-rows">
                                {phieuNhap.map((row, idx) => (
                                    <div key={idx} className="import-row" style={{display:'flex', gap:'15px', marginBottom:'15px', alignItems:'flex-end'}}>
                                        <div className="form-group" style={{flex: 2, margin: 0}}>
                                            <label>Nguyên Liệu</label>
                                            <select value={row.ma_nguyen_lieu} onChange={e => handleRowChange(idx, 'ma_nguyen_lieu', e.target.value)}>
                                                <option value="">-- Chọn Nguyên Liệu --</option>
                                                {nguyenLieu.filter(n => n.trang_thai === 'hoat_dong').map(nl => (
                                                    <option key={nl.ma_nguyen_lieu} value={nl.ma_nguyen_lieu}>{nl.ten_nguyen_lieu} ({nl.don_vi_tinh})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{flex: 1, margin: 0}}>
                                            <label>Số Lượng Nhập</label>
                                            <input type="number" min="0.1" step="0.1" value={row.so_luong} onChange={e => handleRowChange(idx, 'so_luong', e.target.value)} placeholder="0" />
                                        </div>
                                        <div className="form-group" style={{flex: 1, margin: 0}}>
                                            <label>Đơn Giá (VNĐ)</label>
                                            <input type="number" min="0" value={row.don_gia} onChange={e => handleRowChange(idx, 'don_gia', e.target.value)} placeholder="Giá/ĐVT" />
                                        </div>
                                        <div className="form-group" style={{margin: 0}}>
                                            <button className="btn-delete" style={{padding:'10px'}} onClick={() => handleRemoveRow(idx)}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-admin-secondary" onClick={handleAddRow} style={{marginBottom:'20px'}}>+ Thêm dòng</button>
                            
                            <div className="form-group">
                                <label>Ghi chú phiếu nhập</label>
                                <input value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Lý do nhập, nguồn gốc..." />
                            </div>

                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center'}}>
                                <strong>Tổng ước tính: <span style={{color:'#ef4444', fontSize:'1.2em'}}>
                                    {formatMoney(phieuNhap.reduce((sum, item) => sum + (Number(item.so_luong || 0) * Number(item.don_gia || 0)), 0))}
                                </span></strong>
                                <button className="btn-save" onClick={handleSubmitNhapKho} disabled={saving}>{saving ? '⏳ Đang xử lý...' : '💾 Xác Nhận Nhập Kho'}</button>
                            </div>
                        </div>
                    )}

                    {/* TAB LỊCH SỬ */}
                    {activeTab === 'lich-su' && (
                        <div className="history-list">
                            {lichSu.map(phieu => (
                                <div key={phieu.ma_nhap_kho} className="admin-card" style={{marginBottom:'20px', padding:'20px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #ddd', paddingBottom:'10px', marginBottom:'10px'}}>
                                        <h4>Phiếu Nhập #{phieu.ma_nhap_kho}</h4>
                                        <span style={{color:'#666'}}>{new Date(phieu.ngay_nhap).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <p><strong>Người nhập:</strong> {phieu.nguoi_nhap}</p>
                                    <p><strong>Ghi chú:</strong> {phieu.ghi_chu || 'Không có'}</p>
                                    <table className="admin-table" style={{marginTop:'10px'}}>
                                        <thead>
                                            <tr>
                                                <th>Nguyên Liệu</th>
                                                <th>Số Lượng</th>
                                                <th>Đơn Giá</th>
                                                <th>Thành Tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {phieu.chi_tiet.map(ct => (
                                                <tr key={ct.ma_chi_tiet}>
                                                    <td>{ct.ten_nguyen_lieu}</td>
                                                    <td>{ct.so_luong} {ct.don_vi_tinh}</td>
                                                    <td>{formatMoney(ct.don_gia)}</td>
                                                    <td>{formatMoney(ct.so_luong * ct.don_gia)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" style={{textAlign:'right'}}><strong>Tổng Cộng:</strong></td>
                                                <td><strong style={{color:'#ef4444'}}>{formatMoney(phieu.tong_tien)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ))}
                            {lichSu.length === 0 && <p style={{textAlign:'center'}}>Chưa có lịch sử nhập kho nào.</p>}
                        </div>
                    )}

                </div>
            )}

            {/* MODAL THÊM SỬA NGUYÊN LIỆU */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem ? '✏️ Sửa Nguyên Liệu' : '➕ Thêm Nguyên Liệu'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên Nguyên Liệu *</label>
                                <input value={formNL.ten_nguyen_lieu} onChange={e => setFormNL({...formNL, ten_nguyen_lieu: e.target.value})} placeholder="Thịt bò mĩ, Bánh mì..." />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Đơn Vị Tính *</label>
                                    <input value={formNL.don_vi_tinh} onChange={e => setFormNL({...formNL, don_vi_tinh: e.target.value})} placeholder="kg, cái, hộp..." />
                                </div>
                                <div className="form-group">
                                    <label>Trạng Thái</label>
                                    <select value={formNL.trang_thai} onChange={e => setFormNL({...formNL, trang_thai: e.target.value})}>
                                        <option value="hoat_dong">Hoạt động</option>
                                        <option value="ngung_su_dung">Ngưng sử dụng</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-save" onClick={handleSaveNL} disabled={saving}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
