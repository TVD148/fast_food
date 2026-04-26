import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../apiConfig';

const CustomerProfilePage = ({ initialTab = 'info', onNavigateHome }) => {
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [avatar, setAvatar] = useState(null);

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

  // Sync initial tab if it changes from Parent
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.ho_ten || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || currentUser.so_dien_thoai || '');
      setAddress(currentUser.address || currentUser.dia_chi || '');
      setAvatar(currentUser.hinh_anh || currentUser.avatar || null);
    }
  }, [currentUser]);

  useEffect(() => {
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
        body: JSON.stringify({ ho_ten: name, email, so_dien_thoai: phone, dia_chi: address, hinh_anh: avatar })
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
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark small">Địa chỉ giao hàng mặc định</label>
                          <textarea 
                            className="form-control bg-light" 
                            rows="3"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Nhập địa chỉ của bạn"
                          ></textarea>
                        </div>
                        
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
                        <div className="bg-secondary rounded-circle d-inline-flex justify-content-center align-items-center mb-3 text-white overflow-hidden" style={{width: '100px', height: '100px'}}>
                          {avatar ? (
                            <img src={avatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : (
                            <i className="bi bi-person-fill" style={{fontSize: '4rem'}}></i>
                          )}
                        </div>
                        <p className="small text-muted fst-italic mb-2">{avatar ? 'Đã cập nhật' : 'Chưa cập nhật'}</p>
                        <label className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-camera me-1"></i> Đổi ảnh
                          <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                        </label>
                    </div>
                  </div>
                </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order, idx) => (
                          <tr key={idx}>
                            <td className="fw-bold text-dark small">#ORD-{order.ma_don_hang}</td>
                            <td>{new Date(order.ngay_dat).toLocaleDateString('vi-VN')}</td>
                            <td className="text-danger fw-semibold">{Number(order.tong_tien).toLocaleString('vi-VN')} đ</td>
                            <td><span className={`badge rounded-pill ${getStatusBadgeClass(order.trang_thai)} px-3 py-2`}>{getStatusText(order.trang_thai)}</span></td>
                          </tr>
                        ))
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
    </div>
  );
};

export default CustomerProfilePage;
