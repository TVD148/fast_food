import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../apiConfig';
import MapPickerModal from './MapPickerModal';

const CustomerProfilePage = ({ initialTab = 'info', onNavigateHome }) => {
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [avatar, setAvatar] = useState(null);

  // Address Management States
  const [addresses, setAddresses] = useState([]);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Nén ảnh xuống tối đa 250x250
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Chuyển thành JPEG với chất lượng 80% (rất nhẹ, thường < 20KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setAvatar(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState({ isOpen: false, ma_mon_an: null, ten_mon: '', so_sao: 5, binh_luan: '' });

  // Sync initial tab if it changes from Parent
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.ho_ten || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || currentUser.so_dien_thoai || '');
      setAvatar(currentUser.hinh_anh || currentUser.avatar || null);
    }
  }, [currentUser]);

  // Fetch addresses when tab changes
  useEffect(() => {
    if (activeTab === 'address' && currentUser) {
      fetchAddresses();
    }
    if (activeTab === 'history' && currentUser) {
      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/don-hang/lich-su`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setOrders(data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchHistory();
    }
  }, [activeTab, currentUser]);

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dia-chi`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAddresses(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Bạn có muốn xóa địa chỉ này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dia-chi/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
        setMessage({ text: 'Đã xóa địa chỉ!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dia-chi/${id}/mac-dinh`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
        setMessage({ text: 'Đã cập nhật địa chỉ mặc định!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMapConfirm = async (locationData) => {
    try {
      const { address: addr, lat, lng } = locationData;
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/dia-chi`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          ten_goi_nho: 'Địa chỉ mới', 
          dia_chi_chi_tiet: addr,
          kinh_do: lng, // Backend uses kinh_do (longitude), vi_do (latitude)
          vi_do: lat,
          la_mac_dinh: addresses.length === 0
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
        setMessage({ text: 'Đã thêm địa chỉ mới!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/don-hang/khach-hang-huy/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        // Refresh orders
        const historyRes = await fetch(`${API_BASE_URL}/don-hang/lich-su`, { headers: { 'Authorization': `Bearer ${token}` } });
        const historyData = await historyRes.json();
        if (historyData.success) setOrders(historyData.data);
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Lỗi server khi hủy đơn', type: 'error' });
    }
  };

  // Removed reservations fetch logic

    const handleSaveInfo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/cap-nhat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ho_ten: name, email, so_dien_thoai: phone, hinh_anh: avatar })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (data.success) {
            setMessage({ text: 'Cập nhật thông tin thành công!', type: 'success' });
            updateUser(data.user);
          } else {
            setMessage({ text: data.message || 'Cập nhật thất bại', type: 'error' });
          }
      } else {
          const text = await res.text();
          setMessage({ text: `Lỗi bất ngờ từ máy chủ (Mã: ${res.status}): ${text.substring(0, 50)}`, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `Lỗi kết nối hoặc Trình duyệt: ${err.message}`, type: 'error' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/danh-gia/tao-moi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ma_mon_an: reviewModal.ma_mon_an,
          so_sao: reviewModal.so_sao,
          binh_luan: reviewModal.binh_luan
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Đánh giá thành công!');
        setReviewModal({ isOpen: false, ma_mon_an: null, ten_mon: '', so_sao: 5, binh_luan: '' });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Lỗi khi gửi đánh giá');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ text: 'Mật khẩu xác nhận không khớp!', type: 'error' });
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/doi-mat-khau`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mat_khau_hien_tai: currentPassword,
          mat_khau_moi: newPassword,
          xac_nhan_mat_khau_moi: confirmPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'Đổi mật khẩu thất bại', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Lỗi máy chủ', type: 'error' });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'cho_duyet': return 'Chờ duyệt';
      case 'dang_giao': return 'Đang giao';
      case 'hoan_thanh': return 'Hoàn thành';
      case 'da_huy': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'cho_duyet': return 'bg-warning text-dark';
      case 'dang_giao': return 'bg-info text-dark';
      case 'hoan_thanh': return 'bg-success';
      case 'da_huy': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h3 className="mb-0 fw-bold font-serif">Trang Cá Nhân</h3>
      </div>
      
      <div className="row g-4">
        {/* Cột trái (Sidebar) - 3 grid */}
        <div className="col-lg-3">
          <div className="bg-white rounded shadow-sm border p-3">
            <div className="text-center mb-4 mt-2 border-bottom pb-4">
              <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-2 overflow-hidden" style={{width: '90px', height: '90px'}}>
                {avatar ? (
                  <img src={avatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <i className="bi bi-person-fill text-muted" style={{fontSize: '3.5rem'}}></i>
                )}
              </div>
              <h5 className="fw-bold mb-1">{currentUser?.name || currentUser?.ho_ten || 'Khách hàng'}</h5>
              <small className="text-muted">{currentUser?.email || currentUser?.so_dien_thoai || 'Chưa cập nhật'}</small>
            </div>
            
            <div className="nav flex-column nav-pills gap-2">
              <button 
                className={`nav-link text-start rounded px-3 py-2 ${activeTab === 'info' ? 'active bg-warning text-dark fw-bold border-warning' : 'text-dark border border-transparent hover-bg-light'}`}
                onClick={() => setActiveTab('info')}
              >
                <i className="bi bi-person-lines-fill me-2"></i>
                Thông tin tài khoản
              </button>
              <button 
                className={`nav-link text-start rounded px-3 py-2 ${activeTab === 'history' ? 'active bg-warning text-dark fw-bold border-warning' : 'text-dark border border-transparent hover-bg-light'}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="bi bi-clock-history me-2"></i>
                Lịch sử đặt hàng
              </button>
              <button 
                className={`nav-link text-start rounded px-3 py-2 ${activeTab === 'address' ? 'active bg-warning text-dark fw-bold border-warning' : 'text-dark border border-transparent hover-bg-light'}`}
                onClick={() => setActiveTab('address')}
              >
                <i className="bi bi-geo-alt me-2"></i>
                Địa chỉ giao hàng
              </button>
              <button 
                className={`nav-link text-start rounded px-3 py-2 ${activeTab === 'password' ? 'active bg-warning text-dark fw-bold border-warning' : 'text-dark border border-transparent hover-bg-light'}`}
                onClick={() => setActiveTab('password')}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Đổi mật khẩu
              </button>
              
              <hr className="my-2" />
              
              <button 
                className="nav-link text-start text-danger hover-bg-light rounded px-3 py-2"
                onClick={() => {
                   // Gọi hàm đăng xuất hoặc chuyển hướng
                   onNavigateHome(); 
                }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Về Trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải (Content) - 9 grid */}
        <div className="col-lg-9">
          <div className="bg-white rounded shadow-sm border p-4" style={{ minHeight: '600px' }}>
            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small d-flex align-items-center gap-2 mb-4`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                {message.text}
              </div>
            )}

            {/* TAB THÔNG TIN CÁ NHÂN */}
            {activeTab === 'info' && (
              <div className="fade-in">
                <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom">THÔNG TIN CHUNG</h4>
                <div className="row">
                  <div className="col-md-8">
                    <form onSubmit={handleSaveInfo}>
                      <div className="row g-4">
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark small">Họ và tên</label>
                          <input 
                            type="text" 
                            className="form-control bg-light" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small">Số điện thoại</label>
                          <input 
                            type="tel" 
                            className="form-control bg-light" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Chưa cập nhật"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark small">Email</label>
                          <input 
                            type="email" 
                            className="form-control bg-light" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Chưa cập nhật"
                          />
                        </div>
                        {/* Address field removed from general info */}
                        
                        <div className="col-12 mt-4">
                          <button type="submit" className="btn btn-yellow fw-bold px-4 py-2">
                            Lưu thông tin tài khoản
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="col-md-4 d-none d-md-block border-start ps-4">
                    <p className="fw-semibold small text-muted mb-2">Avatar</p>
                    <div className="bg-light border text-center p-3 rounded mb-2">
                        <div className="bg-secondary rounded-circle d-inline-flex justify-content-center align-items-center mb-3 text-white shadow-sm overflow-hidden" style={{width: '120px', height: '120px'}}>
                          {avatar ? (
                            <img src={avatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : (
                            <i className="bi bi-person-fill" style={{fontSize: '5rem'}}></i>
                          )}
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <label className="btn btn-sm btn-yellow fw-bold">
                            <i className="bi bi-camera me-1"></i> {avatar ? 'Đổi ảnh mới' : 'Tải ảnh lên'}
                            <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                          </label>
                          {avatar && (
                            <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => setAvatar(null)}>
                              <i className="bi bi-trash me-1"></i> Xóa ảnh
                            </button>
                          )}
                        </div>
                        <p className="small text-muted mt-3 fst-italic">Nhấn "Lưu thông tin" sau khi đổi ảnh để xác nhận thay đổi.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB QUẢN LÝ ĐỊA CHỈ */}
            {activeTab === 'address' && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <h4 className="fw-bold text-dark mb-0">ĐỊA CHỈ GIAO HÀNG</h4>
                  <button className="btn btn-dark btn-sm fw-bold px-3 py-2 rounded-pill" onClick={() => setIsMapOpen(true)}>
                    <i className="bi bi-plus-lg me-1"></i> Thêm địa chỉ
                  </button>
                </div>

                {addressLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status"></div>
                    <p className="text-muted mt-2">Đang tải danh sách địa chỉ...</p>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="row g-3">
                    {addresses.map((addr) => (
                      <div key={addr.ma_dia_chi} className="col-12">
                        <div className={`card border ${addr.la_mac_dinh ? 'border-warning shadow-sm' : ''} p-3 position-relative`}>
                          {addr.la_mac_dinh && (
                            <span className="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 small fw-bold rounded-start" style={{fontSize: '10px'}}>
                              MẶC ĐỊNH
                            </span>
                          )}
                          <div className="d-flex align-items-start gap-3">
                            <div className="bg-light rounded-circle p-2 text-warning fs-4">
                              <i className={`bi ${addr.ten_goi_nho === 'Nhà' ? 'bi-house-fill' : addr.ten_goi_nho === 'Công ty' ? 'bi-briefcase-fill' : 'bi-geo-alt-fill'}`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold mb-1">{addr.ten_goi_nho}</h6>
                              <p className="text-muted small mb-2">{addr.dia_chi_chi_tiet}</p>
                              <div className="d-flex gap-3">
                                {!addr.la_mac_dinh && (
                                  <button className="btn btn-link p-0 text-decoration-none small text-warning fw-bold" onClick={() => handleSetDefaultAddress(addr.ma_dia_chi)}>
                                    Đặt làm mặc định
                                  </button>
                                )}
                                <button className="btn btn-link p-0 text-decoration-none small text-danger fw-bold" onClick={() => handleDeleteAddress(addr.ma_dia_chi)}>
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 bg-light rounded border border-dashed">
                    <i className="bi bi-geo-alt display-1 text-muted opacity-25"></i>
                    <p className="text-muted mt-3">Bạn chưa có địa chỉ giao hàng nào.</p>
                    <button className="btn btn-yellow fw-bold" onClick={() => setIsMapOpen(true)}>
                      Thêm địa chỉ ngay
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB LỊCH SỬ ĐƠN HÀNG */}
            {activeTab === 'history' && (
              <div className="fade-in">
                <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom">LỊCH SỬ ĐẶT HÀNG</h4>
                <div className="table-responsive mt-3">
                  <table className="table table-hover border text-center align-middle bg-white">
                    <thead className="table-light">
                      <tr className="small text-uppercase fw-semibold text-muted">
                        <th className="py-3">Mã Đơn</th>
                        <th className="py-3">Ngày Đặt</th>
                        <th className="py-3">Tổng Tiền</th>
                        <th className="py-3">Trạng Thái</th>
                        <th className="py-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order, idx) => {
                          const orderTime = new Date(order.ngay_dat);
                          const diffMins = (new Date() - orderTime) / 60000;
                          const canCancel = order.trang_thai === 'cho_duyet' && diffMins <= 5;
                          return (
                          <React.Fragment key={idx}>
                          <tr>
                            <td className="fw-bold text-dark small">#ORD-{order.ma_don_hang}</td>
                            <td>{orderTime.toLocaleDateString('vi-VN')} {orderTime.toLocaleTimeString('vi-VN')}</td>
                            <td className="text-danger fw-semibold">{Number(order.tong_tien).toLocaleString('vi-VN')} đ</td>
                            <td><span className={`badge rounded-pill ${getStatusBadgeClass(order.trang_thai)} px-3 py-2`}>{getStatusText(order.trang_thai)}</span></td>
                            <td>
                              {canCancel && (
                                <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.ma_don_hang); }}>
                                  Hủy đơn
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-outline-secondary rounded-pill ms-2"
                                onClick={() => setExpandedOrder(expandedOrder === order.ma_don_hang ? null : order.ma_don_hang)}
                              >
                                {expandedOrder === order.ma_don_hang ? 'Đóng' : 'Chi tiết'}
                              </button>
                            </td>
                          </tr>
                          {expandedOrder === order.ma_don_hang && (
                            <tr className="bg-light">
                              <td colSpan="5">
                                <div className="p-3 text-start">
                                  <h6 className="fw-bold mb-3">Chi tiết đơn hàng #{order.ma_don_hang}</h6>
                                  {order.ma_giam_gia && (
                                    <p className="small text-success mb-2">Đã áp dụng mã: {order.ma_giam_gia} (Giảm {Number(order.so_tien_giam).toLocaleString('vi-VN')} đ)</p>
                                  )}
                                  <div className="table-responsive">
                                    <table className="table table-sm table-borderless align-middle">
                                      <tbody>
                                        {order.chi_tiet && order.chi_tiet.map((ct, idx2) => (
                                          <tr key={idx2} className="border-bottom">
                                            <td style={{width: '60px'}}>
                                              <img src={ct.hinh_anh || 'https://via.placeholder.com/60'} alt={ct.ten_mon} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px'}} />
                                            </td>
                                            <td>
                                              <p className="mb-0 fw-bold small">{ct.ten_mon}</p>
                                              <p className="mb-0 small text-muted">{ct.so_luong} x {Number(ct.gia_luc_mua).toLocaleString('vi-VN')} đ</p>
                                            </td>
                                            <td className="text-end">
                                              {order.trang_thai === 'hoan_thanh' && (
                                                <button 
                                                  className="btn btn-sm btn-warning rounded-pill py-0 px-3"
                                                  onClick={() => setReviewModal({ isOpen: true, ma_mon_an: ct.ma_mon_an, ten_mon: ct.ten_mon, so_sao: 5, binh_luan: '' })}
                                                >
                                                  Đánh giá
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        )})
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-muted py-5 text-center">
                            <i className="bi bi-bag-x display-4 d-block mb-3 text-light"></i>
                            Bạn chưa có đơn hàng nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Removed LỊCH SỬ ĐẶT BÀN */}

            {/* TAB ĐỔI MẬT KHẨU */}
            {activeTab === 'password' && (
              <div className="fade-in">
                <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom">BẢO MẬT & MẬT KHẨU</h4>
                <div className="row">
                  <div className="col-md-7">
                    <form onSubmit={handleChangePassword}>
                      <div className="row g-4">
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark small">Mật khẩu hiện tại</label>
                          <input 
                            type="password" 
                            className="form-control bg-light" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark small">Mật khẩu mới</label>
                          <input 
                            type="password" 
                            className="form-control bg-light" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark small">Xác nhận mật khẩu mới</label>
                          <input 
                            type="password" 
                            className="form-control bg-light" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12 mt-4">
                          <button type="submit" className="btn btn-dark fw-bold px-4 py-2">
                            Xác nhận đổi mật Khẩu
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="col-md-5 d-none d-md-flex align-items-center justify-content-center flex-column text-center text-muted p-4">
                    <i className="bi bi-shield-lock display-1 mb-3 opacity-25"></i>
                    <p className="small px-3">Mật khẩu phải từ 4 đến 24 ký tự. Bạn nên kết hợp chữ hoa, chữ thường và số để tăng thêm tính bảo mật cho tài khoản.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      {reviewModal.isOpen && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      )}
      {reviewModal.isOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-dark-custom text-white border-0 py-3">
                <h5 className="modal-title font-serif fw-bold text-yellow">
                  Đánh giá: {reviewModal.ten_mon}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3 text-center">
                    <label className="form-label fw-bold d-block">Chất lượng món ăn</label>
                    <div className="d-flex justify-content-center gap-2 fs-2 text-warning">
                      {[1, 2, 3, 4, 5].map(star => (
                        <i 
                          key={star} 
                          className={star <= reviewModal.so_sao ? "bi bi-star-fill" : "bi bi-star"}
                          style={{cursor: 'pointer'}}
                          onClick={() => setReviewModal({...reviewModal, so_sao: star})}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Nhận xét của bạn (Tùy chọn)</label>
                    <textarea 
                      className="form-control bg-light" 
                      rows="3" 
                      placeholder="Chia sẻ cảm nhận của bạn về món ăn..."
                      value={reviewModal.binh_luan}
                      onChange={(e) => setReviewModal({...reviewModal, binh_luan: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2 shadow-sm">
                    Gửi Đánh Giá
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPickerModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onConfirm={handleMapConfirm}
      />
    </div>
  );
};

export default CustomerProfilePage;
