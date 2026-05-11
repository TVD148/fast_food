import React from 'react';

const Footer = ({ onNavigate }) => {
  return (
    <>
      {/* Footer Chính */}
      <footer id="footer-lien-he" className="bg-dark-custom text-white pt-5 pb-3">
        <div className="container pt-4">
          <div className="row g-4 mb-5">
            {/* Cột 1: Thông tin */}
            <div className="col-lg-4 pe-lg-5">
              <div className="d-flex align-items-center gap-2 mb-3" style={{cursor: 'pointer'}} onClick={() => onNavigate('home')}>
                <i className="bi bi-yelp text-green fs-3"></i>
                <h4 className="mb-0 text-yellow font-serif fst-italic">FAST FOOD STORE</h4>
              </div>
             <h6 className="fw-bold mb-4">Liên Hệ Với Chúng Tôi</h6>
              <ul className="list-unstyled text-secondary small">
                <li className="mb-2" style={{cursor: 'pointer'}} onClick={() => { onNavigate('about'); setTimeout(() => document.getElementById('lien-he-chi-tiet')?.scrollIntoView({behavior:'smooth'}), 100); }}>
                  <i className="bi bi-telephone text-yellow me-2"></i> 1900 123 456
                </li>
                <li className="mb-2" style={{cursor: 'pointer'}} onClick={() => onNavigate('about')}>
                  <i className="bi bi-envelope text-yellow me-2"></i> hello@foodlover.com
                </li>
                <li style={{cursor: 'pointer'}} onClick={() => onNavigate('about')}>
                  <i className="bi bi-geo-alt text-yellow me-2"></i> 123 Tên Lửa, TP. HCM
                </li>
              </ul>
            </div>

            {/* Cột 2: Link */}
            <div className="col-lg-2 col-md-4">
              <h6 className="fw-bold mb-4">Chính Sách</h6>
              <ul className="list-unstyled text-secondary small">
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-yellow">&bull; Chính sách của quán</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-yellow">&bull; Bảo mật thông tin</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-yellow">&bull; An toàn thực phẩm</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-yellow">&bull; Điều khoản chung</a></li>
              </ul>
            </div>

            {/* Cột 3: Giờ mở cửa */}
            <div className="col-lg-2 col-md-4">
              <h6 className="fw-bold mb-4">Giờ Mở Cửa</h6>
              <p className="fw-bold small mb-1">Thứ 2 - Thứ 6</p>
              <p className="text-secondary small mb-3">8h00 - 20h00</p>
              <p className="fw-bold small mb-1">Thứ Bảy - Chủ Nhật</p>
              <p className="text-secondary small">6h00 - 22h00</p>
            </div>

            {/* Cột 4: Đăng ký */}
            <div className="col-lg-4 col-md-4">
              <h6 className="fw-bold mb-4">Đăng Ký Nhận Tin</h6>
              <p className="text-secondary small mb-3">Nhập email để nhận thông báo về các mã giảm giá và món mới nhất từ hệ thống.</p>
              <div className="input-group mb-4">
                <input type="email" className="form-control rounded-start-pill py-2" placeholder="Email của bạn..." />
                <button className="btn btn-yellow rounded-end-pill px-4" type="button">
                  <i className="bi bi-send-fill text-dark"></i>
                </button>
              </div>
              <div className="d-flex gap-2">
                <a href="#" className="btn btn-warning rounded-circle btn-sm shadow-sm" title="Facebook"><i className="bi bi-facebook text-dark"></i></a>
                <a href="#" className="btn btn-outline-secondary rounded-circle btn-sm text-white border-secondary shadow-sm" title="TikTok"><i className="bi bi-tiktok"></i></a>
                <a href="#" className="btn btn-outline-secondary rounded-circle btn-sm text-white border-secondary shadow-sm" title="YouTube"><i className="bi bi-youtube"></i></a>
              </div>
            </div>
          </div>

         
          <div className="text-center text-secondary small pt-2">
            &copy; Copyright Fast Food Store 2026 team 08 dh2. All right reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;