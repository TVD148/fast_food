import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../apiConfig';

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const STATUS_MAP = { cho_duyet: { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' }, dang_giao: { label: 'Đang giao', color: '#3b82f6', bg: '#dbeafe' }, hoan_thanh: { label: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' }, da_huy: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' } };

const STAT_CARDS = [
    { key: 'tongDonHom', label: 'Đơn hôm nay', icon: '📦', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    { key: 'doanhThu', label: 'Doanh thu tổng', icon: '💰', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)', isMoney: true },
    { key: 'choDuyet', label: 'Chờ duyệt', icon: '⏳', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { key: 'tongMonAn', label: 'Tổng món ăn', icon: '🍔', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { key: 'tongKhachHang', label: 'Khách hàng', icon: '👥', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { key: 'tongDonHang', label: 'Tổng đơn hàng', icon: '🛒', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
];

export default function AdminDashboard({ onNavigate }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                if (data.success) setStats(data.data);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">⏳ Đang tải dữ liệu dashboard...</div>;
    if (!stats) return <div className="admin-empty">Không thể tải dữ liệu</div>;

    // Vẽ biểu đồ doanh thu đơn giản bằng CSS bars
    const maxRevenue = Math.max(...(stats.doanhThu7Ngay?.map(d => parseFloat(d.doanh_thu)) || [1]));

    return (
        <div className="admin-section">
            <h2 className="admin-section-title" style={{ marginBottom: '24px' }}>📊 Tổng quan</h2>

            {/* Stat Cards */}
            <div className="stat-grid">
                {STAT_CARDS.map(card => (
                    <div key={card.key} className="stat-card" style={{ background: card.gradient }}>
                        <div className="stat-icon">{card.icon}</div>
                        <div className="stat-info">
                            <div className="stat-value">{card.isMoney ? formatMoney(stats[card.key]) : (stats[card.key] ?? 0)}</div>
                            <div className="stat-label">{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-bottom">
                {/* Biểu đồ doanh thu 7 ngày */}
                <div className="chart-card">
                    <h3 className="chart-title">📈 Doanh thu 7 ngày gần nhất</h3>
                    {stats.doanhThu7Ngay?.length === 0 ? (
                        <div className="admin-empty" style={{ padding: '20px' }}>Chưa có dữ liệu</div>
                    ) : (
                        <div className="bar-chart">
                            {stats.doanhThu7Ngay?.map((d, i) => {
                                const pct = maxRevenue > 0 ? (parseFloat(d.doanh_thu) / maxRevenue) * 100 : 0;
                                const date = new Date(d.ngay);
                                const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
                                return (
                                    <div key={i} className="bar-col">
                                        <div className="bar-label-top">{pct > 5 ? formatMoney(d.doanh_thu).replace('₫', '').trim() : ''}</div>
                                        <div className="bar-wrap">
                                            <div className="bar-fill" style={{ height: `${Math.max(pct, 3)}%` }} title={formatMoney(d.doanh_thu)}></div>
                                        </div>
                                        <div className="bar-date">{dateStr}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top món bán chạy */}
                <div className="chart-card">
                    <h3 className="chart-title">🔥 Top món bán chạy</h3>
                    <div className="top-items-list">
                        {stats.topMon?.map((m, i) => (
                            <div key={i} className="top-item-row">
                                <span className="top-rank">{i + 1}</span>
                                <img src={m.hinh_anh} alt={m.ten_mon} onError={e => e.target.src = 'https://via.placeholder.com/36'} />
                                <span className="top-name">{m.ten_mon}</span>
                                <span className="top-qty">{m.tong_ban} bán</span>
                            </div>
                        ))}
                        {(!stats.topMon || stats.topMon.length === 0) && <div className="admin-empty">Chưa có dữ liệu</div>}
                    </div>
                </div>
            </div>

            {/* Đơn hàng gần nhất */}
            <div className="recent-orders-card">
                <div className="recent-header">
                    <h3 className="chart-title" style={{ margin: 0 }}>🛒 Đơn hàng gần nhất</h3>
                    <button className="btn-see-all" onClick={() => onNavigate('orders')}>Xem tất cả →</button>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Mã ĐH</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr>
                        </thead>
                        <tbody>
                            {stats.donHangGanNhat?.map(o => (
                                <tr key={o.ma_don_hang}>
                                    <td><strong>#{o.ma_don_hang}</strong></td>
                                    <td>{o.ho_ten_nguoi_nhan || 'Khách vãng lai'}</td>
                                    <td>{new Date(o.ngay_dat).toLocaleDateString('vi-VN')}</td>
                                    <td><strong className="text-money">{formatMoney(o.tong_tien)}</strong></td>
                                    <td>
                                        <span className="status-badge" style={{ color: STATUS_MAP[o.trang_thai]?.color, background: STATUS_MAP[o.trang_thai]?.bg }}>
                                            {STATUS_MAP[o.trang_thai]?.label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!stats.donHangGanNhat || stats.donHangGanNhat.length === 0) && <div className="admin-empty">Chưa có đơn hàng</div>}
                </div>
            </div>
        </div>
    );
}
