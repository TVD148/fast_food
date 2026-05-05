import React, { useState, useEffect, useCallback, useRef } from 'react';
import './StaffDashboard.css';
import { API_BASE_URL } from '../apiConfig';

// ── Hằng số cấu hình ──────────────────────────────────────
const POLLING_INTERVAL = 5000; // ms

const TRANG_THAI_CONFIG = {
  cho_duyet:     { label: '⏳ Đang chờ',       icon: '⏳', color: '#f59e0b' },
  dang_che_bien: { label: '🍳 Đang chế biến',  icon: '🍳', color: '#3b82f6' },
  dang_giao:     { label: '🛵 Đang giao',       icon: '🛵', color: '#f97316' },
  hoan_thanh:    { label: '✅ Đã hoàn thành',  icon: '✅', color: '#10b981' },
  da_huy:        { label: '❌ Đã hủy',          icon: '❌', color: '#ef4444' },
};

// Bước tiếp theo của từng trạng thái
const NEXT_STATUS = {
  cho_duyet:     'dang_che_bien',
  dang_che_bien: 'dang_giao',
  dang_giao:     'hoan_thanh',
};

const NEXT_STATUS_LABEL = {
  cho_duyet:     '🍳 Bắt đầu chế biến',
  dang_che_bien: '🛵 Chuyển giao hàng',
  dang_giao:     '✅ Xác nhận hoàn thành',
};

const PAYMENT_LABEL = {
  tien_mat: '💵 Tiền mặt',
  the:      '💳 Thẻ',
  momo:     '💜 Momo',
};

// ── Tiện ích ──────────────────────────────────────────────
const formatCurrency = (n) =>
  Number(n).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatTime = (dt) => {
  const d = new Date(dt);
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const getToken = () => localStorage.getItem('token');

// ── Component Toast ───────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  return (
    <div className={`staff-toast ${type}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

// ── Component Bill Preview ────────────────────────────────
const BillModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => window.print();

  return (
    <div className="print-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="print-modal">
        <div className="print-modal-header">
          <span className="print-modal-title">🖨️ Xem trước hóa đơn</span>
          <button className="print-modal-close" onClick={onClose}>×</button>
        </div>

        <div id="bill-preview">
          <div className="bill-shop-name">🍔 FAST FOOD</div>
          <div className="bill-shop-sub">Xin cảm ơn quý khách!</div>
          <div className="bill-shop-sub">ĐT: 0909 123 456</div>
          <hr className="bill-divider" />

          <div className="bill-row">
            <span className="bill-row-label">Đơn #:</span>
            <span className="bill-row-value">#{order.ma_don_hang}</span>
          </div>
          <div className="bill-row">
            <span className="bill-row-label">Thời gian:</span>
            <span className="bill-row-value">{formatTime(order.ngay_dat)}</span>
          </div>
          <div className="bill-row">
            <span className="bill-row-label">Khách:</span>
            <span className="bill-row-value">{order.ho_ten_nguoi_nhan || order.ten_khach || 'Khách lẻ'}</span>
          </div>
          <div className="bill-row">
            <span className="bill-row-label">SĐT:</span>
            <span className="bill-row-value">{order.so_dien_thoai_giao}</span>
          </div>
          <div className="bill-row">
            <span className="bill-row-label">Địa chỉ:</span>
            <span className="bill-row-value" style={{ maxWidth: '55%', textAlign: 'right', fontSize: '11px' }}>
              {order.dia_chi_giao_hang}
            </span>
          </div>
          <div className="bill-row">
            <span className="bill-row-label">Thanh toán:</span>
            <span className="bill-row-value">{PAYMENT_LABEL[order.phuong_thuc_thanh_toan] || order.phuong_thuc_thanh_toan}</span>
          </div>

          <hr className="bill-divider" />

          <div className="bill-items-header">
            <span>Món</span>
            <span>SL × Giá</span>
            <span>T.Tiền</span>
          </div>

          {(order.chi_tiet || []).map((item, idx) => (
            <div className="bill-item-row" key={idx}>
              <span style={{ flex: 1, paddingRight: 6 }}>{item.ten_mon}</span>
              <span style={{ whiteSpace: 'nowrap', paddingRight: 6 }}>
                {item.so_luong} × {Number(item.gia_luc_mua).toLocaleString('vi-VN')}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>
                {Number(item.thanh_tien).toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}

          <hr className="bill-divider" />

          <div className="bill-total-row">
            <span>TỔNG CỘNG:</span>
            <span>{formatCurrency(order.tong_tien)}</span>
          </div>

          {order.ghi_chu && (
            <>
              <hr className="bill-divider" />
              <div style={{ fontSize: '11px', color: 'var(--staff-muted)' }}>
                📝 Ghi chú: {order.ghi_chu}
              </div>
            </>
          )}

          <div className="bill-thank-you">
            ⭐ Cảm ơn bạn đã ghé thăm! ⭐
            <br />Hẹn gặp lại lần sau!
          </div>
        </div>

        <div className="print-modal-footer">
          <button className="btn-close-modal" onClick={onClose}>Đóng</button>
          <button className="btn-print-confirm" onClick={handlePrint}>
            🖨️ In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Component Order Card ──────────────────────────────────
const OrderCard = ({ order, onStatusChange, onPrint }) => {
  const [loading, setLoading] = useState(false);
  const cfg = TRANG_THAI_CONFIG[order.trang_thai] || {};
  const nextStatus = NEXT_STATUS[order.trang_thai];
  const nextLabel = NEXT_STATUS_LABEL[order.trang_thai];

  const handleNextStatus = async () => {
    if (!nextStatus || loading) return;
    setLoading(true);
    await onStatusChange(order.ma_don_hang, nextStatus);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (loading) return;
    if (!window.confirm(`Xác nhận HỦY đơn #${order.ma_don_hang}?`)) return;
    setLoading(true);
    await onStatusChange(order.ma_don_hang, 'da_huy');
    setLoading(false);
  };

  const initials = (order.ho_ten_nguoi_nhan || order.ten_khach || 'K')
    .split(' ').slice(-1)[0]?.[0]?.toUpperCase() || 'K';

  return (
    <div className="staff-order-card" data-status={order.trang_thai}>
      <div className="order-card-header">
        <div>
          <div className="order-id">Đơn #{order.ma_don_hang}</div>
          <div className="order-time">{formatTime(order.ngay_dat)}</div>
        </div>
        <span className={`status-badge status-${order.trang_thai}`}>
          {cfg.icon} {cfg.label?.split(' ').slice(1).join(' ')}
        </span>
      </div>

      <div className="order-card-body">
        <div className="order-customer">
          <div className="order-avatar">{initials}</div>
          <div className="order-customer-info">
            <div className="order-customer-name">
              {order.ho_ten_nguoi_nhan || order.ten_khach || 'Khách lẻ'}
              <span className="payment-badge">
                {PAYMENT_LABEL[order.phuong_thuc_thanh_toan] || order.phuong_thuc_thanh_toan}
              </span>
            </div>
            <div className="order-customer-phone">{order.so_dien_thoai_giao}</div>
          </div>
        </div>

        <div className="order-items">
          {(order.chi_tiet || []).map((item, idx) => (
            <div className="order-item-row" key={idx}>
              <span className="order-item-name">{item.ten_mon}</span>
              <span className="order-item-qty">×{item.so_luong}</span>
              <span className="order-item-price">{formatCurrency(item.thanh_tien)}</span>
            </div>
          ))}
        </div>

        <div className="order-total-row">
          <span className="order-total-label">Tổng cộng</span>
          <span className="order-total-amount">{formatCurrency(order.tong_tien)}</span>
        </div>

        {order.ghi_chu && (
          <div className="order-note">📝 {order.ghi_chu}</div>
        )}
      </div>

      <div className="order-card-actions">
        {nextStatus && (
          <button
            className="btn-action btn-next-status"
            onClick={handleNextStatus}
            disabled={loading}
          >
            {loading ? '...' : nextLabel}
          </button>
        )}

        <button className="btn-action btn-print" onClick={() => onPrint(order)} title="In hóa đơn">
          🖨️
        </button>

        {order.trang_thai !== 'hoan_thanh' && order.trang_thai !== 'da_huy' && (
          <button className="btn-action btn-cancel" onClick={handleCancel} disabled={loading} title="Hủy đơn">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// ── Component Inventory Tab ───────────────────────────────
const InventoryTab = ({ token, showToast }) => {
  const [monAn, setMonAn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchMonAn = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mon-an/nhan-vien/tat-ca`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMonAn(data.data);
    } catch {
      showToast('Không thể tải danh sách món ăn!', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => { fetchMonAn(); }, [fetchMonAn]);

  const handleToggle = async (ma_mon_an, tenMon, trangThaiHienTai) => {
    setToggling(ma_mon_an);
    try {
      const res = await fetch(`${API_BASE_URL}/mon-an/${ma_mon_an}/trang-thai`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setMonAn(prev => prev.map(m =>
          m.ma_mon_an === ma_mon_an ? { ...m, trang_thai: data.trang_thai_moi } : m
        ));
        const action = trangThaiHienTai === 'con_hang' ? 'ẩn khỏi menu' : 'hiện trở lại';
        showToast(`"${tenMon}" đã được ${action}!`, trangThaiHienTai === 'con_hang' ? 'info' : 'success');
      }
    } catch {
      showToast('Lỗi khi thay đổi trạng thái!', 'error');
    } finally {
      setToggling(null);
    }
  };

  const conHang = monAn.filter(m => m.trang_thai === 'con_hang').length;
  const hetHang = monAn.filter(m => m.trang_thai === 'het_hang').length;

  if (loading) return (
    <div className="staff-loading"><div className="staff-spinner" /><span>Đang tải...</span></div>
  );

  return (
    <>
      <div className="staff-stats">
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#10b981' }}>{conHang}</div>
          <div className="stat-label">Đang có hàng</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ef4444' }}>{hetHang}</div>
          <div className="stat-label">Đã ẩn / Hết hàng</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f59e0b' }}>{monAn.length}</div>
          <div className="stat-label">Tổng món</div>
        </div>
      </div>

      <div className="inventory-grid">
        {monAn.map(mon => (
          <div
            key={mon.ma_mon_an}
            className={`inventory-card ${mon.trang_thai === 'het_hang' ? 'out-of-stock' : ''}`}
          >
            {mon.trang_thai === 'het_hang' && (
              <div className="inventory-status-overlay">HẾT HÀNG</div>
            )}
            {mon.hinh_anh
              ? <img src={mon.hinh_anh} alt={mon.ten_mon} className="inventory-img"
                  onError={e => { e.target.style.display='none'; }} />
              : <div className="inventory-img-placeholder">🍔</div>
            }
            <div className="inventory-body">
              <div className="inventory-name">{mon.ten_mon}</div>
              <div className="inventory-category">{mon.ten_danh_muc || 'Chưa phân loại'}</div>
              <div className="inventory-price">{formatCurrency(mon.gia_ban)}</div>
              <button
                className={`inventory-toggle ${mon.trang_thai === 'con_hang' ? 'available' : 'unavailable'}`}
                onClick={() => handleToggle(mon.ma_mon_an, mon.ten_mon, mon.trang_thai)}
                disabled={toggling === mon.ma_mon_an}
              >
                {toggling === mon.ma_mon_an
                  ? '...'
                  : mon.trang_thai === 'con_hang'
                    ? '🚫 Ẩn món (hết nguyên liệu)'
                    : '✅ Mở bán trở lại'
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────
const StaffDashboard = ({ user, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('tat_ca');
  const [loading, setLoading] = useState(true);
  const [printOrder, setPrintOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const prevOrderIds = useRef(new Set());
  const token = getToken();

  // ── Toast helper ──
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ── Fetch orders ──
  const fetchOrders = useCallback(async (isPolling = false) => {
    try {
      const url = filterStatus !== 'tat_ca'
        ? `${API_BASE_URL}/don-hang/tat-ca?trang_thai=${filterStatus}`
        : `${API_BASE_URL}/don-hang/tat-ca`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const newOrders = data.data;
        // Phát hiện đơn mới khi polling
        if (isPolling && prevOrderIds.current.size > 0) {
          const newIds = new Set(newOrders.map(o => o.ma_don_hang));
          const hasNew = [...newIds].some(id => !prevOrderIds.current.has(id));
          if (hasNew) showToast('🔔 Có đơn hàng mới!', 'info');
        }
        prevOrderIds.current = new Set(newOrders.map(o => o.ma_don_hang));
        setOrders(newOrders);
        setLastUpdated(new Date());
      }
    } catch {
      if (!isPolling) showToast('Không thể tải đơn hàng!', 'error');
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [token, filterStatus, showToast]);

  // Lần đầu load + khi filter thay đổi
  useEffect(() => {
    setLoading(true);
    fetchOrders(false).finally(() => setLoading(false));
  }, [filterStatus]);

  // Polling mỗi 5 giây
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const id = setInterval(() => fetchOrders(true), POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [activeTab, fetchOrders]);

  // ── Cập nhật trạng thái đơn hàng ──
  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/don-hang/${orderId}/trang-thai`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trang_thai: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o =>
          o.ma_don_hang === orderId ? { ...o, trang_thai: newStatus } : o
        ));
        const cfg = TRANG_THAI_CONFIG[newStatus];
        showToast(`${cfg?.icon} Đơn #${orderId}: ${cfg?.label}`, 'success');
      } else {
        showToast(data.message || 'Lỗi cập nhật!', 'error');
      }
    } catch {
      showToast('Lỗi kết nối server!', 'error');
    }
  }, [token, showToast]);

  // ── Thống kê ──
  const stats = Object.keys(TRANG_THAI_CONFIG).reduce((acc, key) => {
    acc[key] = orders.filter(o => o.trang_thai === key).length;
    return acc;
  }, {});
  const pendingCount = (stats.cho_duyet || 0) + (stats.dang_che_bien || 0);

  const displayOrders = filterStatus === 'tat_ca'
    ? orders
    : orders.filter(o => o.trang_thai === filterStatus);

  return (
    <div className="staff-wrapper">
      {/* Header */}
      <div className="staff-header">
        <div className="staff-header-left">
          <div className="staff-logo">🧾</div>
          <div>
            <div className="staff-title">Quầy Thu Ngân</div>
            <div className="staff-subtitle">
              Xin chào, {user?.ho_ten || 'Nhân viên'} •{' '}
              {lastUpdated && `Cập nhật: ${lastUpdated.toLocaleTimeString('vi-VN')}`}
            </div>
          </div>
        </div>
        <button className="staff-back-btn" onClick={onNavigateHome}>
          ← Về trang chủ
        </button>
      </div>

      {/* Tabs */}
      <div className="staff-tabs">
        <button
          className={`staff-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Đơn hàng
          {pendingCount > 0 && (
            <span className="staff-tab-badge">{pendingCount}</span>
          )}
        </button>
        <button
          className={`staff-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          🥗 Tồn kho
        </button>
      </div>

      <div className="staff-content">
        {/* ── TAB ĐƠN HÀNG ── */}
        {activeTab === 'orders' && (
          <>
            {/* Stats */}
            <div className="staff-stats">
              {Object.entries(TRANG_THAI_CONFIG).map(([key, cfg]) => (
                <div
                  key={key}
                  className="stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFilterStatus(key)}
                >
                  <div className="stat-number" style={{ color: cfg.color }}>{stats[key] || 0}</div>
                  <div className="stat-label">{cfg.label}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="staff-toolbar">
              <div className="staff-filter-tabs">
                {[
                  { key: 'tat_ca', label: 'Tất cả' },
                  { key: 'cho_duyet', label: '⏳ Chờ' },
                  { key: 'dang_che_bien', label: '🍳 Chế biến' },
                  { key: 'dang_giao', label: '🛵 Đang giao' },
                  { key: 'hoan_thanh', label: '✅ Hoàn thành' },
                  { key: 'da_huy', label: '❌ Đã hủy' },
                ].map(f => (
                  <button
                    key={f.key}
                    className={`staff-filter-btn ${filterStatus === f.key ? 'active' : ''}`}
                    onClick={() => setFilterStatus(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="staff-refresh-info">
                <span className="staff-refresh-dot" />
                Tự động cập nhật mỗi 5 giây
              </div>
            </div>

            {/* Orders */}
            {loading ? (
              <div className="staff-loading">
                <div className="staff-spinner" />
                <span>Đang tải đơn hàng...</span>
              </div>
            ) : displayOrders.length === 0 ? (
              <div className="staff-empty">
                <div className="staff-empty-icon">📭</div>
                <div className="staff-empty-text">Không có đơn hàng nào</div>
              </div>
            ) : (
              <div className="staff-orders-grid">
                {displayOrders.map(order => (
                  <OrderCard
                    key={order.ma_don_hang}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onPrint={setPrintOrder}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB TỒN KHO ── */}
        {activeTab === 'inventory' && (
          <InventoryTab token={token} showToast={showToast} />
        )}
      </div>

      {/* Bill Modal */}
      {printOrder && (
        <BillModal order={printOrder} onClose={() => setPrintOrder(null)} />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
