import React, { useState, useEffect } from 'react';

const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we've already shown the popup in this session
    const hasShownPopup = sessionStorage.getItem('hasShownExitPopup');

    const handleMouseLeave = (e) => {
      // Trigger if mouse leaves from the top of the viewport
      if (e.clientY <= 0 && !hasShownPopup && !isOpen) {
        setIsOpen(true);
        sessionStorage.setItem('hasShownExitPopup', 'true');
      }
    };

    if (!hasShownPopup) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Định dạng email không hợp lệ.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call for a "real" feel
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // If there was a real API, we would send the email here.
      // fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        backdropFilter: 'blur(5px)',
        zIndex: 1060 
      }} 
      onClick={handleClose}
      tabIndex="-1"
    >
      <div 
        className="modal-dialog modal-dialog-centered" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="modal-content text-center shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          
          {/* Header Image or Color Bar */}
          <div className="bg-warning p-4 position-relative">
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 m-3" 
              aria-label="Close"
              onClick={handleClose}
            ></button>
            <h2 className="fw-bold mb-0 text-dark">
              {isSuccess ? 'Chúc Mừng!' : 'Đừng đi mà!'}
            </h2>
          </div>

          <div className="modal-body p-5">
            {!isSuccess ? (
              <>
                <h4 className="mb-3 text-danger fw-bold">Bạn chưa nhận được quà giảm giá sao?</h4>
                <p className="mb-4 text-muted">
                  Để lại email ngay để nhận <strong>Mã giảm giá 10%</strong> cho đơn hàng đầu tiên của bạn. Đừng bỏ lỡ cơ hội thưởng thức món ngon với giá cực hời!
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3 text-start">
                    <input 
                      type="email" 
                      className={`form-control form-control-lg ${error ? 'is-invalid' : ''}`}
                      placeholder="Nhập email của bạn..." 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={isSubmitting}
                    />
                    {error && <div className="invalid-feedback">{error}</div>}
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-danger btn-lg w-100 fw-bold rounded-pill"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      'Nhận Mã Giảm Giá Ngay!'
                    )}
                  </button>
                </form>
                
                <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                  <a href="#" className="text-decoration-none text-muted" onClick={(e) => { e.preventDefault(); handleClose(); }}>
                    Không, cám ơn. Tôi không muốn tiết kiệm.
                  </a>
                </p>
              </>
            ) : (
              // Success State
              <div className="py-3">
                <div className="mb-4 rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-check-lg" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="fw-bold text-success mb-3">Đăng ký thành công!</h4>
                <p className="mb-4">Sử dụng mã dưới đây khi thanh toán để được giảm <strong>10%</strong>:</p>
                
                <div className="bg-light p-3 border border-success border-2 border-dashed rounded mb-4">
                  <span className="fs-3 fw-bold text-success" style={{ letterSpacing: '2px' }}>WELCOME10</span>
                </div>
                
                <button 
                  className="btn btn-warning btn-lg w-100 fw-bold rounded-pill text-dark"
                  onClick={() => {
                    navigator.clipboard.writeText('WELCOME10');
                    alert('Đã sao chép mã!');
                    handleClose();
                  }}
                >
                  Sao Chép & Tiếp Tục
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
