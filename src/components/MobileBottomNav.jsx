import React from 'react';

const MobileBottomNav = ({ onCartClick }) => {
  return (
    <>
      <div className="mobile-bottom-nav d-md-none bg-white shadow-lg fixed-bottom border-top" style={{ zIndex: 1040 }}>
        <div className="d-flex justify-content-around align-items-center py-2">
          
          <a href="#trang-chu" className="nav-item text-center text-decoration-none text-dark d-flex flex-column align-items-center">
            <i className="bi bi-house-door fs-4 mb-1"></i>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Trang Chủ</span>
          </a>

          <a href="#thuc-don" className="nav-item text-center text-decoration-none text-dark d-flex flex-column align-items-center">
            <i className="bi bi-grid fs-4 mb-1 d-block"></i>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Thực Đơn</span>
          </a>

          <div 
            className="nav-item text-center text-decoration-none text-dark d-flex flex-column align-items-center position-relative"
            onClick={onCartClick}
            style={{ cursor: 'pointer', transform: 'translateY(-15px)' }}
          >
            <div className="bg-warning rounded-circle d-flex justify-content-center align-items-center shadow p-3 border border-3 border-white">
               <i className="bi bi-cart3 fs-3 text-dark"></i>
            </div>
          </div>

          <a href="#bai-viet" className="nav-item text-center text-decoration-none text-dark d-flex flex-column align-items-center">
             <i className="bi bi-journal-text fs-4 mb-1 d-block"></i>
             <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Tin Tức</span>
          </a>

          <a href="#" className="nav-item text-center text-decoration-none text-dark d-flex flex-column align-items-center" onClick={(e) => { e.preventDefault(); document.getElementById('login-btn')?.click(); }}>
            <i className="bi bi-person fs-4 mb-1"></i>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Tài Khoản</span>
          </a>

        </div>
      </div>
      
      {/* Spacer to prevent content from hiding behind the bottom nav */}
      <div className="d-md-none" style={{ height: '70px' }}></div>
      <style>{`
        .mobile-bottom-nav .nav-item {
          color: #6c757d !important;
          transition: 0.2s all;
        }
        .mobile-bottom-nav .nav-item:hover, .mobile-bottom-nav .nav-item:active {
          color: #ffc107 !important;
        }
      `}</style>
    </>
  );
};

export default MobileBottomNav;
