import React, { useState, useEffect, useCallback, useRef } from 'react';
import './StaffDashboard.css';
import { API_BASE_URL } from '../apiConfig';

const POLLING_INTERVAL = 5000;

const STATUS_CFG = {
  cho_duyet:     { label: 'Đang chờ',      icon: '⏳', color: '#f59e0b' },
  dang_che_bien: { label: 'Đang chế biến', icon: '🍳', color: '#3b82f6' },
  dang_giao:     { label: 'Đang giao',     icon: '🛵', color: '#f97316' },
  hoan_thanh:    { label: 'Hoàn thành',    icon: '✅', color: '#10b981' },
  da_huy:        { label: 'Đã hủy',        icon: '❌', color: '#ef4444' },
};

const NEXT_STATUS = { cho_duyet:'dang_che_bien', dang_che_bien:'dang_giao', dang_giao:'hoan_thanh' };
const NEXT_LABEL  = { cho_duyet:'🍳 Bắt đầu chế biến', dang_che_bien:'🛵 Giao hàng', dang_giao:'✅ Hoàn thành' };
const PAY_LABEL   = { tien_mat:'💵 Tiền mặt', the:'💳 Thẻ', momo:'💜 Momo' };

const fmt  = n => Number(n).toLocaleString('vi-VN', { style:'currency', currency:'VND' });
const fmtT = dt => new Date(dt).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
const tok  = () => localStorage.getItem('token');

// ── Toast ──────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`staff-toast ${type}`}><span>{message}</span></div>;
};

// ── Shift Stats Bar ────────────────────────────────────────
const ShiftStats = ({ stats }) => (
  <div className="shift-stats-bar">
    <div className="shift-stat"><div className="shift-stat-num">{stats.tongDonHomNay ?? '—'}</div><div className="shift-stat-lbl">Đơn hôm nay</div></div>
    <div className="shift-stat"><div className="shift-stat-num" style={{color:'#f59e0b'}}>{(stats.danhSachCho ?? 0) + (stats.dangCheB ?? 0)}</div><div className="shift-stat-lbl">Đang xử lý</div></div>
    <div className="shift-stat"><div className="shift-stat-num" style={{color:'#10b981'}}>{stats.hoanThanhHom ?? '—'}</div><div className="shift-stat-lbl">Hoàn thành</div></div>
    <div className="shift-stat"><div className="shift-stat-num" style={{color:'#ff6b35'}}>{fmt(stats.doanhThuCa ?? 0)}</div><div className="shift-stat-lbl">Doanh thu ca</div></div>
  </div>
);

// ── Email Modal ────────────────────────────────────────────
const EmailModal = ({ order, onClose, onSend, sending }) => {
  const defaultEmail = order?.email_khach || '';
  const [email, setEmail] = useState(defaultEmail);
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="email-modal">
        <div className="email-modal-header">📧 Gửi hóa đơn Email<button className="modal-close-btn" onClick={onClose}>×</button></div>
        <div className="email-modal-body">
          <p>Đơn hàng <strong>#{order?.ma_don_hang}</strong> — Khách: <strong>{order?.ho_ten_nguoi_nhan}</strong></p>
          <label>Địa chỉ email nhận hóa đơn:</label>
          <input className="email-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="khachhang@email.com" />
        </div>
        <div className="email-modal-footer">
          <button className="btn-cancel-modal" onClick={onClose}>Hủy</button>
          <button className="btn-send-email" onClick={()=>onSend(email)} disabled={sending||!email}>
            {sending ? 'Đang gửi...' : '📧 Gửi ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Bill Modal ─────────────────────────────────────────────
const BillModal = ({ order, onClose, onEmailClick }) => {
  if (!order) return null;
  const tongGoc = (order.chi_tiet||[]).reduce((s,i)=>s+Number(i.thanh_tien),0);
  const giamGia = Number(order.so_tien_giam)||0;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="print-modal">
        <div className="print-modal-header">
          <span>🖨️ Xem trước hóa đơn</span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div id="bill-preview">
          <div className="bill-shop-name">🍔 FAST FOOD</div>
          <div className="bill-shop-sub">Xin cảm ơn quý khách! • ĐT: 0909 123 456</div>
          <hr className="bill-divider"/>
          {[['Đơn #', `#${order.ma_don_hang}`],['Thời gian', fmtT(order.ngay_dat)],
            ['Khách', order.ho_ten_nguoi_nhan||'Khách lẻ'],['SĐT', order.so_dien_thoai_giao],
            ['Địa chỉ', order.dia_chi_giao_hang],['Thanh toán', PAY_LABEL[order.phuong_thuc_thanh_toan]||order.phuong_thuc_thanh_toan]
          ].map(([l,v])=>(
            <div className="bill-row" key={l}><span className="bill-row-label">{l}:</span><span className="bill-row-value">{v}</span></div>
          ))}
          <hr className="bill-divider"/>
          <div className="bill-items-header"><span>Món</span><span>SL × Giá</span><span>T.Tiền</span></div>
          {(order.chi_tiet||[]).map((item,i)=>(
            <div className="bill-item-row" key={i}>
              <span style={{flex:1}}>{item.ten_mon}</span>
              <span style={{whiteSpace:'nowrap',padding:'0 6px'}}>{item.so_luong} × {Number(item.gia_luc_mua).toLocaleString('vi-VN')}</span>
              <span style={{whiteSpace:'nowrap'}}>{Number(item.thanh_tien).toLocaleString('vi-VN')}đ</span>
            </div>
          ))}
          <hr className="bill-divider"/>
          {giamGia>0 && <>
            <div className="bill-row"><span className="bill-row-label">Tổng gốc:</span><span className="bill-row-value">{Number(tongGoc).toLocaleString('vi-VN')}đ</span></div>
            <div className="bill-row" style={{color:'#10b981'}}><span className="bill-row-label">Giảm ({order.ma_giam_gia}):</span><span className="bill-row-value">- {Number(giamGia).toLocaleString('vi-VN')}đ</span></div>
          </>}
          <div className="bill-total-row"><span>TỔNG CỘNG:</span><span>{fmt(order.tong_tien)}</span></div>
          {order.ghi_chu && <div style={{fontSize:'11px',marginTop:6,color:'#888'}}>📝 {order.ghi_chu}</div>}
          <div className="bill-thank-you">⭐ Cảm ơn bạn đã ghé thăm! ⭐<br/>Hẹn gặp lại lần sau!</div>
        </div>
        <div className="print-modal-footer">
          <button className="btn-close-modal" onClick={onClose}>Đóng</button>
          <button className="btn-email-invoice" onClick={()=>onEmailClick(order)}>📧 Gửi Email</button>
          <button className="btn-print-confirm" onClick={()=>window.print()}>🖨️ In hóa đơn</button>
        </div>
      </div>
    </div>
  );
};

// ── Order Card ─────────────────────────────────────────────
const OrderCard = ({ order, onStatusChange, onPrint }) => {
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_CFG[order.trang_thai]||{};
  const next = NEXT_STATUS[order.trang_thai];

  const doChange = async (status) => {
    if (loading) return;
    if (status==='da_huy' && !window.confirm(`Xác nhận HỦY đơn #${order.ma_don_hang}?`)) return;
    setLoading(true);
    await onStatusChange(order.ma_don_hang, status);
    setLoading(false);
  };

  return (
    <div className="staff-order-card" data-status={order.trang_thai}>
      <div className="order-card-header">
        <div>
          <div className="order-id">Đơn #{order.ma_don_hang}</div>
          <div className="order-time">{fmtT(order.ngay_dat)}</div>
        </div>
        <span className={`status-badge status-${order.trang_thai}`}>{cfg.icon} {cfg.label}</span>
      </div>
      <div className="order-card-body">
        <div className="order-customer">
          <div className="order-avatar">{(order.ho_ten_nguoi_nhan||order.ten_khach||'K')[0].toUpperCase()}</div>
          <div className="order-customer-info">
            <div className="order-customer-name">{order.ho_ten_nguoi_nhan||order.ten_khach||'Khách lẻ'} <span className="payment-badge">{PAY_LABEL[order.phuong_thuc_thanh_toan]||order.phuong_thuc_thanh_toan}</span></div>
            <div className="order-customer-phone">{order.so_dien_thoai_giao}</div>
            <div className="order-address">📍 {order.dia_chi_giao_hang}</div>
          </div>
        </div>
        <div className="order-items">
          {(order.chi_tiet||[]).map((item,i)=>(
            <div className="order-item-row" key={i}>
              <span className="order-item-name">{item.ten_mon}</span>
              <span className="order-item-qty">×{item.so_luong}</span>
              <span className="order-item-price">{fmt(item.thanh_tien)}</span>
            </div>
          ))}
        </div>
        <div className="order-total-row">
          <span>Tổng cộng</span>
          <span className="order-total-amount">{fmt(order.tong_tien)}</span>
        </div>
        {order.ghi_chu && <div className="order-note">📝 {order.ghi_chu}</div>}
      </div>
      <div className="order-card-actions">
        {next && <button className="btn-action btn-next-status" onClick={()=>doChange(next)} disabled={loading}>{loading?'...':NEXT_LABEL[order.trang_thai]}</button>}
        <button className="btn-action btn-print" onClick={()=>onPrint(order)} title="Xem & In hóa đơn">🖨️</button>
        {order.trang_thai==='cho_duyet' && <button className="btn-action btn-cancel" onClick={()=>doChange('da_huy')} disabled={loading} title="Hủy đơn">✕</button>}
      </div>
    </div>
  );
};

// ── Inventory Tab ──────────────────────────────────────────
const InventoryTab = ({ token, showToast }) => {
  const [monAn, setMonAn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/mon-an/nhan-vien/tat-ca`,{headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if (d.success) setMonAn(d.data);
    } catch { showToast('Không thể tải danh sách món!','error'); }
    finally { setLoading(false); }
  }, [token, showToast]);

  useEffect(()=>{ fetch_(); },[fetch_]);

  const handleToggle = async (id, ten, trangThai) => {
    setToggling(id);
    try {
      const r = await fetch(`${API_BASE_URL}/mon-an/${id}/trang-thai`,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}});
      const d = await r.json();
      if (d.success) {
        setMonAn(prev=>prev.map(m=>m.ma_mon_an===id?{...m,trang_thai:d.trang_thai_moi}:m));
        showToast(`"${ten}" ${d.trang_thai_moi==='con_hang'?'đã mở bán trở lại!':'đã ẩn khỏi menu!'}`, d.trang_thai_moi==='con_hang'?'success':'info');
      }
    } catch { showToast('Lỗi thay đổi trạng thái!','error'); }
    finally { setToggling(null); }
  };

  if (loading) return <div className="staff-loading"><div className="staff-spinner"/><span>Đang tải...</span></div>;
  const conHang = monAn.filter(m=>m.trang_thai==='con_hang').length;
  return (
    <>
      <div className="staff-stats">
        <div className="stat-card"><div className="stat-number" style={{color:'#10b981'}}>{conHang}</div><div className="stat-label">Đang có hàng</div></div>
        <div className="stat-card"><div className="stat-number" style={{color:'#ef4444'}}>{monAn.length-conHang}</div><div className="stat-label">Đã ẩn</div></div>
        <div className="stat-card"><div className="stat-number" style={{color:'#f59e0b'}}>{monAn.length}</div><div className="stat-label">Tổng món</div></div>
      </div>
      <div className="inventory-grid">
        {monAn.map(mon=>(
          <div key={mon.ma_mon_an} className={`inventory-card ${mon.trang_thai==='het_hang'?'out-of-stock':''}`}>
            {mon.trang_thai==='het_hang' && <div className="inventory-status-overlay">HẾT HÀNG</div>}
            {mon.hinh_anh ? <img src={mon.hinh_anh} alt={mon.ten_mon} className="inventory-img" onError={e=>{e.target.style.display='none'}}/> : <div className="inventory-img-placeholder">🍔</div>}
            <div className="inventory-body">
              <div className="inventory-name">{mon.ten_mon}</div>
              <div className="inventory-category">{mon.ten_danh_muc||'Chưa phân loại'}</div>
              <div className="inventory-price">{fmt(mon.gia_ban)}</div>
              <button className={`inventory-toggle ${mon.trang_thai==='con_hang'?'available':'unavailable'}`} onClick={()=>handleToggle(mon.ma_mon_an,mon.ten_mon,mon.trang_thai)} disabled={toggling===mon.ma_mon_an}>
                {toggling===mon.ma_mon_an?'...' : mon.trang_thai==='con_hang'?'🚫 Ẩn món':'✅ Mở bán lại'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ── MAIN ───────────────────────────────────────────────────
const StaffDashboard = ({ user, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('tat_ca');
  const [searchQ, setSearchQ] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [shiftStats, setShiftStats] = useState({});
  const [printOrder, setPrintOrder] = useState(null);
  const [emailOrder, setEmailOrder] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const prevIds = useRef(new Set());
  const token = tok();

  const showToast = useCallback((message, type='success') => setToast({ message, type, id: Date.now() }), []);

  // Fetch shift stats
  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/thong-ke-ca`,{headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if (d.success) setShiftStats(d.data);
    } catch {}
  }, [token]);

  // Fetch orders
  const fetchOrders = useCallback(async (isPolling=false) => {
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filterStatus !== 'tat_ca') params.append('trang_thai', filterStatus);
      if (searchQ.trim()) params.append('tim_kiem', searchQ.trim());
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/don-hang?${params}`,{headers:{Authorization:`Bearer ${token}`}});
      const d = await r.json();
      if (d.success) {
        if (isPolling && prevIds.current.size > 0) {
          const newIds = new Set(d.data.map(o=>o.ma_don_hang));
          if ([...newIds].some(id=>!prevIds.current.has(id))) showToast('🔔 Có đơn hàng mới!','info');
        }
        prevIds.current = new Set(d.data.map(o=>o.ma_don_hang));
        setOrders(d.data);
        setTotalPages(d.totalPages||1);
        setLastUpdated(new Date());
      }
    } catch { if (!isPolling) showToast('Không thể tải đơn hàng!','error'); }
    finally { if (!isPolling) setLoading(false); }
  }, [token, filterStatus, searchQ, page, showToast]);

  useEffect(() => { setLoading(true); fetchOrders(false); fetchStats(); }, [filterStatus, page]);
  useEffect(() => { setPage(1); }, [filterStatus, searchQ]);

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => { fetchOrders(false); }, 400);
    return () => clearTimeout(t);
  }, [searchQ]);

  // Polling
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const id = setInterval(() => { fetchOrders(true); fetchStats(); }, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [activeTab, fetchOrders, fetchStats]);

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/${orderId}/trang-thai`,{
        method:'PUT', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body: JSON.stringify({trang_thai:newStatus})
      });
      const d = await r.json();
      if (d.success) {
        setOrders(prev=>prev.map(o=>o.ma_don_hang===orderId?{...o,trang_thai:newStatus}:o));
        showToast(`${STATUS_CFG[newStatus]?.icon} Đơn #${orderId}: ${STATUS_CFG[newStatus]?.label}`, 'success');
        fetchStats();
      } else { showToast(d.message||'Lỗi cập nhật!','error'); }
    } catch { showToast('Lỗi kết nối!','error'); }
  }, [token, showToast, fetchStats]);

  const handleSendEmail = async (email) => {
    setEmailSending(true);
    try {
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/${emailOrder.ma_don_hang}/gui-email`,{
        method:'POST', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
        body: JSON.stringify({email})
      });
      const d = await r.json();
      if (d.success) { showToast(d.message,'success'); setEmailOrder(null); setPrintOrder(null); }
      else showToast(d.message||'Lỗi gửi email!','error');
    } catch { showToast('Lỗi kết nối!','error'); }
    finally { setEmailSending(false); }
  };

  const stats = Object.keys(STATUS_CFG).reduce((a,k)=>({...a,[k]:orders.filter(o=>o.trang_thai===k).length}),{});
  const pendingCount = (stats.cho_duyet||0)+(stats.dang_che_bien||0);

  return (
    <div className="staff-wrapper">
      {/* Header */}
      <div className="staff-header">
        <div className="staff-header-left">
          <div className="staff-logo">🧾</div>
          <div>
            <div className="staff-title">Quầy Thu Ngân</div>
            <div className="staff-subtitle">Xin chào, {user?.ho_ten||'Nhân viên'} • {lastUpdated && `Cập nhật: ${lastUpdated.toLocaleTimeString('vi-VN')}`}</div>
          </div>
        </div>
        <button className="staff-back-btn" onClick={onNavigateHome}>← Về trang chủ</button>
      </div>

      {/* Shift Stats */}
      <ShiftStats stats={shiftStats}/>

      {/* Tabs */}
      <div className="staff-tabs">
        <button className={`staff-tab ${activeTab==='orders'?'active':''}`} onClick={()=>setActiveTab('orders')}>
          📋 Đơn hàng {pendingCount>0 && <span className="staff-tab-badge">{pendingCount}</span>}
        </button>
        <button className={`staff-tab ${activeTab==='inventory'?'active':''}`} onClick={()=>setActiveTab('inventory')}>
          🥗 Tồn kho
        </button>
      </div>

      <div className="staff-content">
        {activeTab==='orders' && (
          <>
            {/* Status counts */}
            <div className="staff-stats">
              {Object.entries(STATUS_CFG).map(([k,cfg])=>(
                <div key={k} className={`stat-card ${filterStatus===k?'active':''}`} style={{cursor:'pointer'}} onClick={()=>setFilterStatus(k)}>
                  <div className="stat-number" style={{color:cfg.color}}>{stats[k]||0}</div>
                  <div className="stat-label">{cfg.icon} {cfg.label}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="staff-toolbar">
              <div className="staff-filter-tabs">
                {[{key:'tat_ca',label:'Tất cả'},...Object.entries(STATUS_CFG).map(([k,c])=>({key:k,label:`${c.icon} ${c.label}`}))].map(f=>(
                  <button key={f.key} className={`staff-filter-btn ${filterStatus===f.key?'active':''}`} onClick={()=>setFilterStatus(f.key)}>{f.label}</button>
                ))}
              </div>
              <div className="staff-search-wrap">
                <input className="staff-search" value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Tìm tên / SĐT khách..."/>
                {searchQ && <button className="search-clear" onClick={()=>setSearchQ('')}>×</button>}
              </div>
              <div className="staff-refresh-info"><span className="staff-refresh-dot"/>Tự động cập nhật mỗi 5s</div>
            </div>

            {/* Orders */}
            {loading ? (
              <div className="staff-loading"><div className="staff-spinner"/><span>Đang tải...</span></div>
            ) : orders.length===0 ? (
              <div className="staff-empty"><div className="staff-empty-icon">📭</div><div className="staff-empty-text">Không có đơn hàng nào</div></div>
            ) : (
              <div className="staff-orders-grid">
                {orders.map(o=><OrderCard key={o.ma_don_hang} order={o} onStatusChange={handleStatusChange} onPrint={setPrintOrder}/>)}
              </div>
            )}

            {/* Pagination */}
            {totalPages>1 && (
              <div className="staff-pagination">
                <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹ Trước</button>
                <span className="page-info">Trang {page} / {totalPages}</span>
                <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Sau ›</button>
              </div>
            )}
          </>
        )}

        {activeTab==='inventory' && <InventoryTab token={token} showToast={showToast}/>}
      </div>

      {/* Bill Modal */}
      {printOrder && <BillModal order={printOrder} onClose={()=>setPrintOrder(null)} onEmailClick={o=>{setEmailOrder(o);}}/>}

      {/* Email Modal */}
      {emailOrder && <EmailModal order={emailOrder} onClose={()=>setEmailOrder(null)} onSend={handleSendEmail} sending={emailSending}/>}

      {/* Toast */}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
};

export default StaffDashboard;
