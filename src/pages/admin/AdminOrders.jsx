import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';

const STATUS_MAP = {
    cho_duyet: { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    dang_giao: { label: 'Đang giao', color: '#3b82f6', bg: '#dbeafe' },
    hoan_thanh: { label: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' },
    da_huy: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = { page, limit: 12 };
            if (filterStatus) params.trang_thai = filterStatus;
            if (search) params.search = search;
            const data = await adminService.getOrders(params, token);
            if (data.success) {
                setOrders(data.data);
                setTotalPages(data.totalPages);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [page, filterStatus, search]);

    useEffect(() => { 
        const delay = setTimeout(() => fetchOrders(), 300);
        return () => clearTimeout(delay);
    }, [fetchOrders]);

    const updateStatus = async (id, trang_thai) => {
        setUpdatingId(id);
        try {
            const token = localStorage.getItem('token');
            const data = await adminService.updateOrderStatus(id, trang_thai, token);
            if (data.success) { showToast('Cập nhật trạng thái thành công!'); fetchOrders(); }
            else showToast(data.message || 'Lỗi!', 'error');
        } catch (e) { showToast('Lỗi kết nối server', 'error'); }
        setUpdatingId(null);
    };

    return (
        <div className="admin-section">
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
            <div className="admin-section-header">
                <h2 className="admin-section-title">🛒 Quản lý Đơn hàng</h2>
                <div className="admin-toolbar" style={{marginTop: '10px'}}>
                    <input 
                        className="admin-search" 
                        placeholder="🔍 Tìm mã ĐH, tên khách, SĐT..." 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setPage(1); }} 
                        style={{minWidth: '300px'}}
                    />
                    <div className="admin-filter-row">
                        {['', 'cho_duyet', 'dang_giao', 'hoan_thanh', 'da_huy'].map(s => (
                            <button key={s} className={`admin-filter-btn ${filterStatus === s ? 'active' : ''}`}
                                onClick={() => { setFilterStatus(s); setPage(1); }}>
                                {s ? STATUS_MAP[s].label : 'Tất cả'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">⏳ Đang tải dữ liệu...</div>
            ) : orders.length === 0 ? (
                <div className="admin-empty">Không có đơn hàng nào</div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <React.Fragment key={o.ma_don_hang}>
                                    <tr className={expandedOrder === o.ma_don_hang ? 'row-expanded' : ''}>
                                        <td><strong>#{o.ma_don_hang}</strong></td>
                                        <td>
                                            <div className="cell-name">{o.ho_ten_nguoi_nhan || o.ten_khach || 'Khách vãng lai'}</div>
                                            <div className="cell-sub">{o.so_dien_thoai_giao}</div>
                                        </td>
                                        <td>{formatDate(o.ngay_dat)}</td>
                                        <td><strong className="text-money">{formatMoney(o.tong_tien)}</strong></td>
                                        <td>
                                            <span className="badge-payment">{o.phuong_thuc_thanh_toan === 'tien_mat' ? '💵 Tiền mặt' : o.phuong_thuc_thanh_toan === 'the' ? '💳 Thẻ' : '📱 Momo'}</span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ color: STATUS_MAP[o.trang_thai]?.color, background: STATUS_MAP[o.trang_thai]?.bg }}>
                                                {STATUS_MAP[o.trang_thai]?.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                <button className="btn-icon" title="Xem chi tiết" onClick={() => setExpandedOrder(expandedOrder === o.ma_don_hang ? null : o.ma_don_hang)}>👁</button>
                                                {o.trang_thai === 'cho_duyet' && (
                                                    <>
                                                        <button className="btn-action approve" onClick={() => updateStatus(o.ma_don_hang, 'dang_giao')} disabled={updatingId === o.ma_don_hang}>✅ Duyệt</button>
                                                        <button className="btn-action cancel" onClick={() => updateStatus(o.ma_don_hang, 'da_huy')} disabled={updatingId === o.ma_don_hang}>❌ Hủy</button>
                                                    </>
                                                )}
                                                {o.trang_thai === 'dang_giao' && (
                                                    <button className="btn-action done" onClick={() => updateStatus(o.ma_don_hang, 'hoan_thanh')} disabled={updatingId === o.ma_don_hang}>🏁 Hoàn thành</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedOrder === o.ma_don_hang && (
                                        <tr className="row-detail">
                                            <td colSpan={7}>
                                                <div className="order-detail-box">
                                                    <div className="order-detail-info">
                                                        <div><strong>📍 Địa chỉ:</strong> {o.dia_chi_giao_hang}</div>
                                                        {o.ghi_chu && <div><strong>📝 Ghi chú:</strong> {o.ghi_chu}</div>}
                                                    </div>
                                                    <div className="order-items">
                                                        {o.chi_tiet?.map((item, i) => (
                                                            <div key={i} className="order-item-row">
                                                                <img src={item.hinh_anh} alt={item.ten_mon} onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                                                                <span className="item-name">{item.ten_mon}</span>
                                                                <span className="item-qty">x{item.so_luong}</span>
                                                                <span className="item-price">{formatMoney(item.gia_luc_mua * item.so_luong)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="admin-pagination">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Trước</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau →</button>
                </div>
            )}
        </div>
    );
}
