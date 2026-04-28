import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onLoginClick, onNavigate }) => {
  const { getCartCount, toggleCart } = useCart();
  const { searchQuery, setSearchQuery, setCategoryFilter, isSearchOpen, toggleSearch } = useSearch();
  const { currentUser, isLoggedIn, logout } = useAuth();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCategoryFilter(''); // Xóa lọc danh mục khi tìm kiếm bằng text
    // Chuyển về trang chủ nếu đang ở profile
    onNavigate('home', 'info');
    // Cuộn tới mục kết quả
    setTimeout(() => {
        const elem = document.getElementById('ket-qua-tim-kiem');
        if (elem) {
          const headerOffset = 80;
          const elementPosition = elem.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
    }, 100);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    onNavigate('home', 'info'); // Đảm bảo chuyển về trang chủ (nếu đang ở Profile)
    
    setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
            const headerOffset = 80;
            const elementPosition = elem.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else if (targetId === 'trang-chu') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 100);
  };

  return (
    <header className="bg-dark-custom text-white py-3 sticky-top shadow-sm" style={{ zIndex: 1040 }}>
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <div className="d-flex align-items-center gap-2" style={{cursor: 'pointer'}}>
          <i className="bi bi-yelp text-green fs-3"></i>
          <h4 className="mb-0 text-yellow font-serif fst-italic">FAST FOOD</h4>
        </div>

        {/* Menu (Ẩn trên mobile) */}
        {!isSearchOpen && (
          <nav className="d-none d-lg-flex gap-4 fade-in align-items-center">
            <a href="#trang-chu" onClick={(e) => handleNavClick(e, 'trang-chu')} className="text-white text-decoration-none hover-yellow fw-semibold">Trang Chủ</a>
            <a href="#ve-chung-toi" onClick={(e) => handleNavClick(e, 've-chung-toi')} className="text-white text-decoration-none hover-yellow fw-semibold">Về Chúng Tôi</a>
            <a href="#thuc-don" onClick={(e) => handleNavClick(e, 'thuc-don')} className="text-white text-decoration-none hover-yellow fw-semibold">Thực Đơn</a>
            <a href="#footer-lien-he" onClick={(e) => handleNavClick(e, 'footer-lien-he')} className="text-white text-decoration-none hover-yellow fw-semibold">Liên Hệ</a>
          </nav>
        )}

        {/* Ô Tìm Kiếm */}
        {isSearchOpen && (
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-grow-1 px-4 fade-in d-none d-md-block"
            style={{ maxWidth: '500px' }}
          >
            <div className="input-group">
              <input 
                type="text" 
                className="form-control rounded-start-pill py-2" 
                placeholder="Tìm kiếm món ăn (VD: Burger, Pizza...)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-yellow rounded-end-pill px-4">
                Tìm
              </button>
            </div>
          </form>
        )}

        {/* Icon & Button */}
        <div className="d-flex align-items-center gap-3 gap-md-4">
          <i 
            className={`bi ${isSearchOpen ? 'bi-x-lg text-danger' : 'bi-search text-white'} fs-5 icon-hover`} 
            style={{cursor: 'pointer', transition: '0.3s'}}
            onClick={toggleSearch}
            title="Tìm kiếm"
          ></i>
          
          <div className="position-relative icon-hover" onClick={toggleCart} style={{cursor: 'pointer'}}>
            <i className="bi bi-bag text-white fs-5"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark shadow-sm">
              {getCartCount()}
            </span>
          </div>
          
          {isLoggedIn ? (
            <div className="dropdown">
              <button 
                className="btn btn-outline-warning fw-bold d-flex align-items-center gap-2 dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle fs-5"></i>
                <span className="d-none d-md-inline text-truncate" style={{maxWidth: '120px'}}>{'Tài khoản'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{minWidth: '220px'}}>
                <li className="px-3 py-2 bg-light border-bottom mb-1">
                  <div className="fw-bold text-dark text-break">{currentUser?.name || currentUser?.ho_ten || 'Khách hàng'}</div>
                  <div className="small text-muted text-break mt-1">
                    <i className={`bi ${currentUser?.email ? 'bi-envelope' : 'bi-telephone'} me-1`}></i>
                    {currentUser?.email || currentUser?.so_dien_thoai || 'Chưa cập nhật'}
                  </div>
                  {/* Badge vai trò */}
                  {(currentUser?.vai_tro === 'nhan_vien' || currentUser?.vai_tro === 'quan_tri') && (
                    <span className="badge bg-warning text-dark mt-1" style={{fontSize: '10px'}}>
                      {currentUser?.vai_tro === 'quan_tri' ? '👑 Quản trị viên' : '🧾 Nhân viên'}
                    </span>
                  )}
                </li>
                {/* Nút Quầy Thu Ngân - chỉ hiện với nhân viên / quản trị */}
                {(currentUser?.vai_tro === 'nhan_vien' || currentUser?.vai_tro === 'quan_tri') && (
                  <li>
                    <button
                      className="dropdown-item fw-semibold py-2 text-warning"
                      onClick={() => onNavigate('staff')}
                    >
                      <i className="bi bi-display me-2"></i>Quầy Thu Ngân
                    </button>
                  </li>
                )}
                <li>
                  <button className="dropdown-item fw-semibold py-2" onClick={() => onNavigate('profile', 'info')}>
                    <i className="bi bi-person-lines-fill me-2"></i>Thông tin tài khoản
                  </button>
                </li>
                <li>
                  <button className="dropdown-item fw-semibold py-2" onClick={() => onNavigate('profile', 'history')}>
                    <i className="bi bi-clock-history me-2"></i>Lịch sử đặt hàng
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger fw-semibold py-2" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </button>
                </li>
              </ul>
            </div>

          ) : (
            <button 
              className="btn btn-yellow fw-bold" 
              onClick={onLoginClick}
            >
              Đăng nhập  
            </button>
          )}
        </div>
      </div>
      
      {/* Search Bar cho Mobile (Rớt xuống dưới Header nếu bật) */}
      {isSearchOpen && (
        <div className="d-md-none bg-dark-custom p-3 border-top border-secondary">
           <form onSubmit={handleSearchSubmit}>
            <div className="input-group">
              <input 
                type="text" 
                className="form-control rounded-start-pill py-2" 
                placeholder="Tìm món ăn..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-yellow rounded-end-pill px-3">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;