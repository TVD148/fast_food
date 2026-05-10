import React from 'react';
import { useCart } from '../contexts/CartContext';

const CartOffcanvas = ({ onCheckoutClick, onNavigate }) => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const handleExploreMenu = () => {
    closeCart();
    // Chuyển về trang chủ trước
    if (onNavigate) onNavigate('home');
    
    // Đợi một chút để trang home render xong rồi mới scroll
    setTimeout(() => {
      const elem = document.getElementById('thuc-don');
      if (elem) {
        const offset = elem.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, 300);
  };

  const handleCheckoutBtnClick = () => {
    closeCart(); // Đóng thanh menu giỏ hàng
    if (onCheckoutClick) onCheckoutClick(); // Bật popup Modal Thanh toán
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="offcanvas-backdrop fade show" 
          onClick={closeCart}
          style={{ zIndex: 1045 }}
        ></div>
      )}

      {/* Offcanvas panel */}
      <div 
        className={`offcanvas offcanvas-end ${isCartOpen ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ zIndex: 1050, visibility: isCartOpen ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold font-serif d-flex align-items-center gap-2">
            <i className="bi bi-cart3 text-green"></i> Giỏ Hàng Của Bạn
          </h5>
          <button type="button" className="btn-close" onClick={closeCart}></button>
        </div>
        
        <div className="offcanvas-body d-flex flex-column">
          {cartItems.length === 0 ? (
            <div className="text-center my-auto py-5">
              <i className="bi bi-basket2 text-muted" style={{ fontSize: '4rem' }}></i>
              <p className="mt-3 text-muted">Giỏ hàng đang trống.</p>
              <button className="btn btn-yellow mt-2" onClick={handleExploreMenu}>Khám phá thực đơn</button>
            </div>
          ) : (
            <div className="flex-grow-1 overflow-auto">
              {cartItems.map(item => (
                <div key={item.id} className="d-flex align-items-center mb-3 border bg-light rounded p-2">
                  <div className="bg-white rounded p-1 me-3 fs-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold text-truncate" style={{ maxWidth: '150px' }}>{item.name}</h6>
                    <span className="text-success fw-bold small">
                      {item.price.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <button className="btn btn-sm text-danger p-0 mb-2" onClick={() => removeFromCart(item.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                    <div className="input-group input-group-sm" style={{ width: '80px' }}>
                      <button className="btn btn-outline-secondary px-2" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span className="form-control text-center px-1 bg-white">{item.quantity}</span>
                      <button className="btn btn-outline-secondary px-2" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Giỏ hàng */}
          {cartItems.length > 0 && (
            <div className="border-top pt-3 mt-auto">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold fs-5">Tổng tiền:</span>
                <span className="fw-bold fs-5 text-danger">{getCartTotal().toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <button 
                className="btn btn-yellow w-100 fw-bold py-2 shadow-sm"
                onClick={handleCheckoutBtnClick}
              >
                Tiến Hành Thanh Toán
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartOffcanvas;
