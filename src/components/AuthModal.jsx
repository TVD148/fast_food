import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=OTP, 3=new password
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Form fields
  const [hoDem, setHoDem] = useState('');
  const [ten, setTen] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, login, sendOTP, verifyAndResetPassword, loginWithGoogle, loginWithApple } = useAuth();

  if (!isOpen) return null;

  const resetForm = () => {
    setHoDem('');
    setTen('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setForgotEmail('');
    setMessage({ text: '', type: '' });
    setForgotStep(1);
    setLoading(false);
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    resetForm();
  };

  const handleClose = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    resetForm();
    onClose();
  };

  // === FORGOT PASSWORD HANDLERS ===
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail || forgotEmail.trim() === '') {
      setMessage({ text: 'Vui lòng nhập email!', type: 'error' });
      return;
    }
    setLoading(true);
    const result = await sendOTP(forgotEmail);
    setLoading(false);
    setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        setForgotStep(2);
      }, 1000);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim() === '' || otp.length < 6) {
      setMessage({ text: 'Vui lòng nhập đủ mã xác nhận 6 chữ số!', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' });
    setForgotStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 4) {
      setMessage({ text: 'Mật khẩu phải có ít nhất 4 ký tự!', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Mật khẩu xác nhận không khớp!', type: 'error' });
      return;
    }
    setLoading(true);
    const result = await verifyAndResetPassword(forgotEmail, otp, password);
    setLoading(false);
    setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        resetForm();
      }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const result = await login(email, password);
      setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
      if (result.success) {
        // Gọi callback để App.jsx nhận user và xử lý redirect
        const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (onLoginSuccess && savedUser) onLoginSuccess(savedUser);
        setTimeout(() => { handleClose(); }, 800);
      }
    } else {
      if (password !== confirmPassword) {
        setMessage({ text: 'Mật khẩu xác nhận không khớp!', type: 'error' });
        return;
      }
      if (password.length < 6) {
        setMessage({ text: 'Mật khẩu phải có ít nhất 6 ký tự!', type: 'error' });
        return;
      }
      const fullName = `${hoDem} ${ten}`.trim();
      const result = await register(fullName, email, password);
      setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
      if (result.success) {
        const loginResult = await login(email, password);
        if (loginResult.success) {
          setMessage({ text: 'Đăng ký thành công! Đang đăng nhập...', type: 'success' });
          setTimeout(() => { handleClose(); }, 1500);
        }
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    let result;
    if (provider === 'google') {
      result = await loginWithGoogle();
    } else {
      result = await loginWithApple();
    }
    setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setTimeout(() => { handleClose(); }, 1000);
    }
  };

  // Step indicator for forgot password
  const renderStepIndicator = () => (
    <div className="d-flex justify-content-center mb-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="d-flex align-items-center">
          <div 
            className={`rounded-circle d-flex justify-content-center align-items-center fw-bold ${
              forgotStep >= step ? 'bg-warning text-dark' : 'bg-secondary text-white'
            }`}
            style={{ width: '32px', height: '32px', fontSize: '14px' }}
          >
            {forgotStep > step ? <i className="bi bi-check-lg"></i> : step}
          </div>
          {step < 3 && (
            <div 
              className={`mx-2 ${forgotStep > step ? 'bg-warning' : 'bg-secondary'}`}
              style={{ width: '40px', height: '3px', borderRadius: '2px' }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
        onClick={handleClose}
      >
        <div 
          className="modal-dialog modal-dialog-centered" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-dark-custom text-yellow border-0">
              <h5 className="modal-title font-serif fst-italic">
                {isForgotPassword 
                  ? 'Quên mật khẩu' 
                  : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={handleClose}
              ></button>
            </div>
            
            <div className="modal-body p-4 bg-light">
              {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small d-flex align-items-center gap-2`}>
                  <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                  {message.text}
                </div>
              )}

              {isForgotPassword ? (
                <>
                  {renderStepIndicator()}

                  {/* STEP 1: Nhập email */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleSendOTP}>
                      <p className="text-muted small mb-3">
                        Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã xác nhận 6 chữ số qua email cho bạn.
                      </p>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">Email <span className="text-danger">*</span></label>
                        <input 
                          type="email" 
                          className="form-control" 
                          placeholder="Nhập email của bạn" 
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required 
                        />
                      </div>
                      <button type="submit" className="btn btn-yellow w-100 fw-bold py-2 mb-3" disabled={loading}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</>
                        ) : (
                          <>Gửi mã xác nhận <i className="bi bi-envelope-fill ms-1"></i></>
                        )}
                      </button>
                      <div className="text-center text-muted small">
                        <span 
                          className="text-success fw-bold" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => { setIsForgotPassword(false); setIsLogin(true); resetForm(); }}
                        >
                          Quay lại Đăng nhập
                        </span>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: Nhập mã OTP */}
                  {forgotStep === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                      <p className="text-muted small mb-3">
                        Mã xác nhận đã được gửi đến <strong>{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư (kể cả thư rác) và nhập mã 6 chữ số.
                      </p>
                      <p className="text-danger small mb-3">
                        <i className="bi bi-clock me-1"></i>Mã có hiệu lực trong 5 phút.
                      </p>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">Mã xác nhận</label>
                        <input 
                          type="text" 
                          className="form-control text-center fw-bold fs-4" 
                          placeholder="_ _ _ _ _ _" 
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          required
                          style={{ letterSpacing: '8px' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-yellow w-100 fw-bold py-2 mb-3">
                        Xác nhận mã
                      </button>
                      <div className="text-center text-muted small">
                        <span 
                          className="text-success fw-bold" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => { setForgotStep(1); setOtp(''); setMessage({ text: '', type: '' }); }}
                        >
                          <i className="bi bi-arrow-left me-1"></i>Quay lại nhập email
                        </span>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: Nhập mật khẩu mới */}
                  {forgotStep === 3 && (
                    <form onSubmit={handleResetPassword}>
                      <p className="text-muted small mb-3">
                        Nhập mật khẩu mới cho tài khoản <strong>{forgotEmail}</strong>.
                      </p>
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">Mật khẩu mới</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Nhập mật khẩu mới" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-dark">Xác nhận mật khẩu mới</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="Nhập lại mật khẩu mới" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required 
                        />
                      </div>
                      <button type="submit" className="btn btn-yellow w-100 fw-bold py-2 mb-3" disabled={loading}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                        ) : (
                          'Đặt lại mật khẩu'
                        )}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="row g-2 mb-3">
                      <div className="col-8">
                        <label className="form-label fw-semibold text-dark">Họ và tên đệm</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nguyễn Văn" 
                          value={hoDem}
                          onChange={(e) => setHoDem(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label fw-semibold text-dark">Tên</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="A" 
                          value={ten}
                          onChange={(e) => setTen(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">Email hoặc Số điện thoại</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nhập email hoặc số điện thoại" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">Mật khẩu</label>
                    <div className="position-relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control pe-5" 
                        placeholder="Nhập mật khẩu" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ zIndex: 10 }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Xác nhận mật khẩu</label>
                      <div className="position-relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className="form-control pe-5" 
                          placeholder="Nhập lại mật khẩu" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required 
                        />
                        <button 
                          type="button" 
                          className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ zIndex: 10 }}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div className="d-flex justify-content-end align-items-center mb-4">
                      <span 
                        className="text-decoration-none text-success small fw-semibold" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setIsForgotPassword(true); resetForm(); }}
                      >
                        Quên mật khẩu?
                      </span>
                    </div>
                  )}
                  
                  <button type="submit" className="btn btn-yellow w-100 fw-bold py-2 mb-3">
                    {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                  </button>
                  
                  <div className="text-center text-muted small mb-4">
                    {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"} {' '}
                    <span 
                      className="text-success fw-bold" 
                      style={{ cursor: 'pointer' }} 
                      onClick={handleToggle}
                    >
                      {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </span>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted small">hoặc</span>
                    <hr className="flex-grow-1" />
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <i className="bi bi-google text-danger"></i>
                      Đăng nhập bằng Google
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                      onClick={() => handleSocialLogin('apple')}
                    >
                      <i className="bi bi-apple"></i>
                      Đăng nhập bằng Apple
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
