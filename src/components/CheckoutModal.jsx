import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import qrBankImg from '../assets/qr_bank.png';
import { useAuth } from '../context/AuthContext';
import MapPickerModal from './MapPickerModal';
import orderService from '../services/orderService';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cartItems, getCartTotal, closeCart, clearCart } = useCart();
  
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    lat: null,
    lng: null,
    note: '',
    paymentMethod: 'cash'
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState({ text: '', type: '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  React.useEffect(() => {
    if (isOpen && currentUser) {
      // Load info
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || currentUser.ho_ten || '',
        phone: currentUser.phone || currentUser.so_dien_thoai || ''
      }));

      // Fetch saved addresses
      const fetchAddresses = async () => {
        try {
          const token = localStorage.getItem('token');
          const data = await orderService.getSavedAddresses(token);
          if (data.success && data.data.length > 0) {
            setSavedAddresses(data.data);
            const defaultAddr = data.data.find(a => a.la_mac_dinh) || data.data[0];
            setFormData(prev => ({ 
              ...prev, 
              address: defaultAddr.dia_chi_chi_tiet,
              lat: defaultAddr.vi_do,
              lng: defaultAddr.kinh_do
            }));
          }
        } catch (err) { console.error(err); }
      };
      fetchAddresses();
    }
  }, [isOpen, currentUser]);
  
  // step: 'form' | 'qr' | 'success'
  const [step, setStep] = useState('form');
  const [isMapOpen, setIsMapOpen] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherMessage({ text: 'Đang kiểm tra...', type: 'info' });
    try {
      const data = await orderService.verifyVoucher(voucherCode, getCartTotal());
      if (data.success) {
        setDiscountData(data.data);
        setVoucherMessage({ text: data.message, type: 'success' });
      } else {
        setDiscountData(null);
        setVoucherMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setVoucherMessage({ text: 'Lỗi kiểm tra mã giảm giá', type: 'error' });
    }
  };

  const getFinalTotal = () => {
    const base = getCartTotal();
    const discount = discountData ? discountData.so_tien_giam : 0;
    return Math.max(base - discount, 0);
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
        kinh_do: formData.lng,
        vi_do: formData.lat,
        so_dien_thoai_giao: formData.phone,
        ghi_chu: formData.note,
        phuong_thuc_thanh_toan: dbPaymentMethod,
        ma_giam_gia: discountData ? discountData.ma_code : null,
        san_pham: cartItems.map(item => ({ ma_mon_an: item.id, so_luong: item.quantity }))
      };
      
      const data = await orderService.createOrder(payload, token);
      
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
    setVoucherCode('');
    setDiscountData(null);
    setVoucherMessage({ text: '', type: '' });
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
                    <img 
                      src={formData.paymentMethod === 'momo' ? 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' : 'https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189874.png'} 
                      alt="Payment Gateway" 
                      style={{ height: '40px', objectFit: 'contain' }}
                    />
                  </div>

                  <h4 className="fw-bold font-serif mb-2">Cổng thanh toán giả lập</h4>
                  <p className="text-secondary mb-4">
                    Số tiền cần thanh toán: <strong className="text-danger fs-5">{getFinalTotal().toLocaleString('vi-VN')} VNĐ</strong>
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
                        <div className="d-flex justify-content-between align-items-end mb-1">
                          <label className="form-label small text-secondary mb-0">Địa chỉ nhận hàng (*)</label>
                          <div className="d-flex gap-3">
                            {savedAddresses.length > 0 && (
                              <button 
                                type="button" 
                                className="btn btn-sm text-warning d-flex align-items-center gap-1 p-0 fw-bold"
                                onClick={() => setShowAddressPicker(!showAddressPicker)}
                              >
                                <i className="bi bi-journal-text"></i> Sổ địa chỉ
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="btn btn-sm text-danger d-flex align-items-center gap-1 p-0 fw-semibold"
                              onClick={() => setIsMapOpen(true)}
                              title="Chọn vị trí trên bản đồ"
                            >
                              <i className="bi bi-geo-alt-fill"></i> Chọn trên bản đồ
                            </button>
                          </div>
                        </div>

                        {showAddressPicker && savedAddresses.length > 0 && (
                          <div className="bg-light border rounded p-2 mb-2 fade-in" style={{maxHeight: '150px', overflowY: 'auto'}}>
                            {savedAddresses.map(addr => (
                              <div 
                                key={addr.ma_dia_chi} 
                                className="p-2 border-bottom hover-bg-white cursor-pointer small"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    address: addr.dia_chi_chi_tiet,
                                    lat: addr.vi_do,
                                    lng: addr.kinh_do
                                  }));
                                  setShowAddressPicker(false);
                                }}
                              >
                                <div className="fw-bold text-dark">{addr.ten_goi_nho} {addr.la_mac_dinh && <span className="badge bg-warning text-dark ms-1">Mặc định</span>}</div>
                                <div className="text-muted">{addr.dia_chi_chi_tiet}</div>
                              </div>
                            ))}
                          </div>
                        )}
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

                    <div className="mt-3 mb-2">
                      <div className="input-group input-group-sm">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nhập mã giảm giá" 
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        />
                        <button className="btn btn-dark" type="button" onClick={handleApplyVoucher}>Áp dụng</button>
                      </div>
                      {voucherMessage.text && (
                        <div className={`small mt-1 ${voucherMessage.type === 'success' ? 'text-success' : 'text-danger'}`}>
                          {voucherMessage.text}
                        </div>
                      )}
                    </div>

                    {discountData && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Mã giảm giá ({discountData.ma_code}):</span>
                        <span className="fw-semibold">- {discountData.so_tien_giam.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}

                    <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                      <span className="fw-bold fs-5">Tổng cộng:</span>
                      <span className="fw-bold fs-5 text-danger">{getFinalTotal().toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <MapPickerModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onConfirm={(data) => setFormData(prev => ({ ...prev, address: data.address, lat: data.lat, lng: data.lng }))} 
        initialAddress={formData.address}
      />
    </>
  );
};

export default CheckoutModal;

