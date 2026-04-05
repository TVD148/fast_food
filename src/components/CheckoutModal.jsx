import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../apiConfig';
import qrBankImg from '../assets/qr_bank.png';
import { useAuth } from '../contexts/AuthContext';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cartItems, getCartTotal, closeCart, clearCart } = useCart();
  
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'cash' // Changed from 'tien_mat' in UI mapping previously, but backend maps it anyway? Wait, backend needs 'tien_mat', we should send 'tien_mat'. I'll map it to DB ENUM later.
  });

  React.useEffect(() => {
    if (isOpen && currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || currentUser.ho_ten || '',
        phone: currentUser.phone || currentUser.so_dien_thoai || '',
        address: currentUser.address || currentUser.dia_chi || ''
      }));
    }
  }, [isOpen, currentUser]);
  
  // step: 'form' | 'qr' | 'success'
  const [step, setStep] = useState('form');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.paymentMethod === 'bank' || formData.paymentMethod === 'momo') {
      // Chuyển sang trang QR
      setStep('qr');
    } else {
      // Tiền mặt → Hoàn tất luôn
      submitOrder();
    }
  };

  const submitOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      // Chuyển đổi paymentMethod từ dạng form ('cash', 'bank', 'momo') sang ENUM database ('tien_mat', 'the', 'momo')
      const dbPaymentMethod = formData.paymentMethod === 'cash' ? 'tien_mat' : (formData.paymentMethod === 'bank' ? 'the' : 'momo');
      
      const payload = {
        ho_ten_nguoi_nhan: formData.name,
        dia_chi_giao_hang: formData.address,
        so_dien_thoai_giao: formData.phone,
        ghi_chu: formData.note,
        phuong_thuc_thanh_toan: dbPaymentMethod,
        san_pham: cartItems.map(item => ({ ma_mon_an: item.id, so_luong: item.quantity }))
      };
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/don-hang/tao-don`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        handleOrderSuccess();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối server!');
    }
  };

  // Bước 2 (QR): Bấm Xác nhận thanh toán sau khi quét
  const handleConfirmPayment = () => {
    submitOrder();
  };

  // Hoàn tất đơn hàng
  const handleOrderSuccess = () => {
    setStep('success');
    closeCart();
    setTimeout(() => {
      clearCart();
      resetAndClose();
    }, 4000);
  };

  const resetAndClose = () => {
    setStep('form');
    setFormData({ name: '', phone: '', address: '', note: '', paymentMethod: 'cash' });
    onClose();
  };

  const handleCancel = () => {
    resetAndClose();
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  const paymentMethods = [
    { id: 'cash', label: 'Tiền Mặt', icon: 'bi-cash-stack', color: '#28a745' },
    { id: 'bank', label: 'Thẻ', icon: 'bi-credit-card-2-front', color: '#0d6efd' },
    { id: 'momo', label: 'MoMo', icon: 'bi-wallet', color: '#d63384' },
  ];

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            
            <div className="modal-header bg-dark-custom text-white border-0 py-3">
              <h5 className="modal-title font-serif fw-bold text-yellow d-flex align-items-center gap-2">
                <i className="bi bi-wallet2"></i> Đơn Hàng
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={handleCancel}
              ></button>
            </div>

            <div className="modal-body p-0">

              {/* ===== BƯỚC 3: THÀNH CÔNG ===== */}
              {step === 'success' && (
                <div className="text-center py-5">
                  <div className="display-1 text-success mb-3">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h3 className="fw-bold font-serif mb-3">Đặt hàng thành công!</h3>
                  <p className="text-secondary mb-4">
                    Cảm ơn <strong>{formData.name}</strong>. Đơn hàng của bạn sẽ được giao đến địa chỉ <br/>
                    <strong>{formData.address}</strong> trong thời gian sớm nhất.<br/>
                    <span className="mt-2 d-inline-block">
                      Phương thức thanh toán: <strong>
                        {formData.paymentMethod === 'cash' ? 'Tiền mặt khi nhận hàng' : 
                         formData.paymentMethod === 'bank' ? 'Chuyển khoản Ngân hàng' : 'Ví MoMo'}
                      </strong>
                    </span>
                  </p>
                  <p className="small text-muted">Cửa sổ sẽ tự đóng sau vài giây...</p>
                </div>
              )}

              {/* ===== BƯỚC 2: TRANG QR CODE ===== */}
              {step === 'qr' && (
                <div className="text-center py-5 px-4">
                  <div className="mb-3">
                    <span 
                      className="badge rounded-pill px-3 py-2 fs-6"
                      style={{ 
                        backgroundColor: formData.paymentMethod === 'momo' ? '#d63384' : '#0d6efd',
                        color: '#fff'
                      }}
                    >
                      <i className={`bi ${formData.paymentMethod === 'momo' ? 'bi-wallet' : 'bi-credit-card-2-front'} me-2`}></i>
                      Thanh toán qua {formData.paymentMethod === 'momo' ? 'MoMo' : 'Ngân hàng'}
                    </span>
                  </div>

                  <h4 className="fw-bold font-serif mb-2">Quét mã QR để thanh toán</h4>
                  <p className="text-secondary mb-4">
                    Số tiền: <strong className="text-danger fs-5">{getCartTotal().toLocaleString('vi-VN')} VNĐ</strong>
                  </p>

                  <div 
                    className="d-inline-block p-3 rounded-4 shadow mb-4"
                    style={{ 
                      backgroundColor: formData.paymentMethod === 'momo' ? '#fef0f5' : '#f0f4ff',
                      border: `2px solid ${formData.paymentMethod === 'momo' ? '#d63384' : '#0d6efd'}`
                    }}
                  >
                    <img 
                      src={qrBankImg} 
                      alt="QR Code Thanh Toán"
                      className="img-fluid rounded"
                      style={{ maxWidth: '220px' }}
                    />
                  </div>

                  <p className="text-muted small mb-4">
                    Mở ứng dụng {formData.paymentMethod === 'momo' ? 'MoMo' : 'Ngân hàng'} và quét mã QR phía trên.<br/>
                    Sau khi thanh toán xong, nhấn nút bên dưới để hoàn tất đơn hàng.
                  </p>

                  <div className="d-flex justify-content-center gap-3">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold"
                      onClick={handleBackToForm}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Quay lại
                    </button>
                    <button 
                      type="button"
                      className="btn text-white rounded-pill px-4 py-2 fw-bold shadow-sm"
                      style={{ backgroundColor: '#dc3545' }}
                      onClick={handleConfirmPayment}
                    >
                      <i className="bi bi-check-lg me-1"></i> Xác Nhận Thanh Toán
                    </button>
                  </div>
                </div>
              )}

              {/* ===== BƯỚC 1: FORM THÔNG TIN ===== */}
              {step === 'form' && (
                <div className="row g-0">
                  {/* Cột trái: Form thông tin */}
                  <div className="col-md-7 p-4 p-md-5">
                    <h5 className="fw-bold mb-4">Thông tin giao hàng</h5>
                    <form onSubmit={handleSubmit} id="checkoutForm">
                      <div className="mb-3">
                        <label className="form-label small text-secondary">Họ và Tên (*)</label>
                        <input 
                          type="text" className="form-control" name="name"
                          value={formData.name} onChange={handleChange}
                          required placeholder="Mời nhập họ tên"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-secondary">Số điện thoại (*)</label>
                        <input 
                          type="tel" className="form-control" name="phone"
                          value={formData.phone} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              setFormData(prev => ({ ...prev, phone: val }));
                            }
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="11"
                          required placeholder="Mời nhập số điện thoại"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-secondary">Địa chỉ nhận hàng (*)</label>
                        <textarea 
                          className="form-control" rows="2" name="address"
                          value={formData.address} onChange={handleChange}
                          required placeholder="Số nhà, Tên đường, Phường/Xã..."
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-secondary">Ghi chú thêm (Tùy chọn)</label>
                        <textarea 
                          className="form-control" rows="2" name="note"
                          value={formData.note} onChange={handleChange}
                          placeholder="Ví dụ: Lấy ít cay, không hành..."
                        ></textarea>
                      </div>

                      {/* Phương Thức Thanh Toán - Dạng Thẻ */}
                      <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center gap-2">
                          <i className="bi bi-credit-card text-secondary"></i> Phương Thức Thanh Toán
                        </label>
                        <div className="d-flex gap-2 flex-wrap">
                          {paymentMethods.map(method => (
                            <div 
                              key={method.id}
                              className="flex-fill text-center p-3 rounded-3"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                              style={{
                                cursor: 'pointer',
                                border: formData.paymentMethod === method.id 
                                  ? '2px solid #dc3545' 
                                  : '2px solid #dee2e6',
                                backgroundColor: formData.paymentMethod === method.id 
                                  ? '#fff5f5' 
                                  : '#fff',
                                transition: 'all 0.2s ease',
                                minWidth: '90px'
                              }}
                            >
                              <i className={`bi ${method.icon} fs-4 d-block mb-1`} style={{ color: method.color }}></i>
                              <span className="small fw-semibold">{method.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Nút Hủy + Xác nhận */}
                      <div className="d-flex gap-3 mt-3">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary flex-fill py-2 fw-bold rounded-pill"
                          onClick={handleCancel}
                        >
                          Hủy
                        </button>
                        <button 
                          type="submit" 
                          className="btn text-white flex-fill py-2 fw-bold rounded-pill shadow-sm"
                          style={{ backgroundColor: '#dc3545' }}
                        >
                          Xác Nhận Đặt Hàng
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Cột phải: Tóm tắt đơn hàng */}
                  <div className="col-md-5 bg-light p-4 p-md-5 border-start">
                    <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                    <div className="overflow-auto mb-3" style={{ maxHeight: '250px' }}>
                      {cartItems.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between mb-2 small text-secondary">
                          <span className="pe-2 text-break flex-grow-1">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="fw-semibold text-dark text-nowrap">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-2 text-secondary">
                      <span>Phí giao hàng:</span>
                      <span className="fw-semibold text-dark">Miễn phí</span>
                    </div>
                    <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                      <span className="fw-bold fs-5">Tổng cộng:</span>
                      <span className="fw-bold fs-5 text-danger">{getCartTotal().toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
