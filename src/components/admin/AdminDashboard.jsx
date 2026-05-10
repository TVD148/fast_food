import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../../apiConfig';

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatMoneyShort = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
    return String(n);
};

const STATUS_MAP = { cho_duyet: { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' }, dang_giao: { label: 'Đang giao', color: '#3b82f6', bg: '#dbeafe' }, hoan_thanh: { label: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' }, da_huy: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' } };

const STAT_CARDS = [
    { key: 'tongDonHom', label: 'Đơn hôm nay', icon: '📦', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    { key: 'doanhThu', label: 'Doanh thu tổng', icon: '💰', gradient: 'linear-gradient(135deg, #10b981, #34d399)', isMoney: true },
    { key: 'choDuyet', label: 'Chờ duyệt', icon: '⏳', gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { key: 'tongMonAn', label: 'Tổng món ăn', icon: '🍔', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { key: 'tongKhachHang', label: 'Khách hàng', icon: '👥', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { key: 'tongDonHang', label: 'Tổng đơn hàng', icon: '🛒', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
];

const CHART_TABS = [
    { key: '7ngay', label: '7 ngày' },
    { key: '4tuan', label: '4 tuần' },
    { key: '12thang', label: '12 tháng' },
];

// ===== SVG LINE CHART COMPONENT =====
function LineChart({ data, chartTab }) {
    const [tooltip, setTooltip] = useState(null);
    const svgRef = useRef(null);

    const W = 560, H = 200, PAD = { top: 20, right: 20, bottom: 36, left: 56 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    if (!data || data.length === 0) {
        return <div className="admin-empty" style={{ padding: '40px 0' }}>Chưa có dữ liệu</div>;
    }

    const revenues = data.map(d => parseFloat(d.doanh_thu) || 0);
    const orders = data.map(d => parseInt(d.so_don) || 0);
    const maxRev = Math.max(...revenues, 1);
    const maxOrd = Math.max(...orders, 1);

    const xPos = (i) => PAD.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const yRevPos = (v) => PAD.top + innerH - (v / maxRev) * innerH;
    const yOrdPos = (v) => PAD.top + innerH - (v / maxOrd) * innerH;

    const revPoints = data.map((d, i) => `${xPos(i)},${yRevPos(parseFloat(d.doanh_thu) || 0)}`).join(' ');
    const ordPoints = data.map((d, i) => `${xPos(i)},${yOrdPos(parseInt(d.so_don) || 0)}`).join(' ');

    // Smooth polyline path using bezier
    const makePath = (points) => {
        const pts = points.split(' ').map(p => p.split(',').map(Number));
        if (pts.length < 2) return `M${pts[0]?.join(',')}`;
        let d = `M${pts[0].join(',')}`;
        for (let i = 1; i < pts.length; i++) {
            const [x0, y0] = pts[i - 1];
            const [x1, y1] = pts[i];
            const cpx = (x0 + x1) / 2;
            d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
        }
        return d;
    };

    const revPath = makePath(revPoints);
    const ordPath = makePath(ordPoints);

    // Gradient area paths
    const makeAreaPath = (pts, yBottom) => {
        const p = pts.split(' ').map(p => p.split(',').map(Number));
        let d = `M${p[0].join(',')}`;
        for (let i = 1; i < p.length; i++) {
            const [x0, y0] = p[i - 1];
            const [x1, y1] = p[i];
            const cpx = (x0 + x1) / 2;
            d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
        }
        d += ` L${p[p.length - 1][0]},${yBottom} L${p[0][0]},${yBottom} Z`;
        return d;
    };

    const revAreaPath = makeAreaPath(revPoints, PAD.top + innerH);
    const ordAreaPath = makeAreaPath(ordPoints, PAD.top + innerH);

    const formatLabel = (d) => {
        const date = new Date(d.ngay);
        if (chartTab === '7ngay') return `${date.getDate()}/${date.getMonth() + 1}`;
        if (chartTab === '4tuan') return `T${date.getDate()}/${date.getMonth() + 1}`;
        return `T${date.getMonth() + 1}`;
    };

    const yGridLines = 4;

    return (
        <div style={{ position: 'relative' }}>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
                    <span style={{ width: 20, height: 3, background: 'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius: 2, display: 'inline-block' }}></span>
                    Doanh thu
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
                    <span style={{ width: 20, height: 3, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2, display: 'inline-block' }}></span>
                    Số đơn hàng
                </div>
            </div>

            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient id="ordLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {Array.from({ length: yGridLines + 1 }, (_, i) => {
                    const y = PAD.top + (innerH / yGridLines) * i;
                    const val = maxRev - (maxRev / yGridLines) * i;
                    return (
                        <g key={i}>
                            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                                {formatMoneyShort(val)}
                            </text>
                        </g>
                    );
                })}

                {/* Area fills */}
                <path d={revAreaPath} fill="url(#revGrad)" />
                <path d={ordAreaPath} fill="url(#ordGrad)" />

                {/* Lines */}
                <path d={revPath} fill="none" stroke="url(#revLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={ordPath} fill="none" stroke="url(#ordLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />

                {/* Dots + hover zones */}
                {data.map((d, i) => {
                    const x = xPos(i);
                    const yR = yRevPos(parseFloat(d.doanh_thu) || 0);
                    const yO = yOrdPos(parseInt(d.so_don) || 0);
                    return (
                        <g key={i}>
                            {/* Revenue dot */}
                            <circle cx={x} cy={yR} r="4" fill="#fff" stroke="#f97316" strokeWidth="2.5" />
                            {/* Order dot */}
                            <circle cx={x} cy={yO} r="4" fill="#fff" stroke="#3b82f6" strokeWidth="2.5" />
                            {/* X label */}
                            <text x={x} y={PAD.top + innerH + 14} textAnchor="middle" fontSize="9.5" fill="#9ca3af" fontWeight="500">
                                {formatLabel(d)}
                            </text>
                            {/* Invisible hover zone */}
                            <rect
                                x={x - innerW / data.length / 2}
                                y={PAD.top}
                                width={innerW / data.length}
                                height={innerH}
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => {
                                    const rect = svgRef.current?.getBoundingClientRect();
                                    setTooltip({ i, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0), d });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div className="line-chart-tooltip" style={{ left: tooltip.x, top: tooltip.y - 80 }}>
                    <div className="lct-date">{formatLabel(tooltip.d)}</div>
                    <div className="lct-row lct-rev">💰 {formatMoney(tooltip.d.doanh_thu)}</div>
                    <div className="lct-row lct-ord">📦 {tooltip.d.so_don} đơn</div>
                </div>
            )}
        </div>
    );
}

// ===== MAIN DASHBOARD =====
export default function AdminDashboard({ onNavigate }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartTab, setChartTab] = useState('7ngay');
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);

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

    const fetchChartData = useCallback(async (tab) => {
        setChartLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/dashboard/doanh-thu?kieu=${tab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setChartData(data.data);
        } catch (e) { console.error(e); }
        setChartLoading(false);
    }, []);

    useEffect(() => { fetchChartData(chartTab); }, [chartTab, fetchChartData]);

    const chartTitle = {
        '7ngay': '📈 Doanh thu & Đơn hàng — 7 ngày gần nhất',
        '4tuan': '📈 Doanh thu & Đơn hàng — 4 tuần gần nhất',
        '12thang': '📈 Doanh thu & Đơn hàng — 12 tháng gần nhất',
    }[chartTab];

    if (loading) return <div className="admin-loading">⏳ Đang tải dữ liệu dashboard...</div>;
    if (!stats) return <div className="admin-empty">Không thể tải dữ liệu</div>;

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
                {/* Line Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title" style={{ margin: 0 }}>{chartTitle}</h3>
                        <div className="chart-tab-group">
                            {CHART_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`chart-tab-btn ${chartTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setChartTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {chartLoading ? (
                        <div className="admin-loading" style={{ padding: '40px 20px' }}>⏳ Đang tải...</div>
                    ) : (
                        <LineChart data={chartData} chartTab={chartTab} />
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
