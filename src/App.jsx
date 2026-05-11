import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Header from './layout/Header';
import HeroSection from './components/HeroSection';
import FeaturedSection from './components/FeaturedSection';
import BestSellingSection from './components/BestSellingSection';
import FeaturesSection from './components/FeaturesSection';
import ProductGrid from './components/ProductGrid';
import InstagramGallery from './components/InstagramGallery';
import Footer from './layout/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import AuthModal from './components/AuthModal';
import CartOffcanvas from './components/CartOffcanvas';
import CheckoutModal from './components/CheckoutModal';
import CustomerProfilePage from './pages/CustomerProfilePage';
import ExitIntentPopup from './components/ExitIntentPopup';
import AdminPage from './pages/admin/AdminPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AboutPage from './pages/AboutPage';
import { useAuth } from './context/AuthContext';

function App() {
  // State for UI
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Khởi tạo state từ localStorage nếu có
  const [pageState, setPageState] = useState(() => {
    const saved = localStorage.getItem('currentPageState');
    return saved ? JSON.parse(saved) : { page: 'home', profileTab: 'info' };
  });

  const [forceCustomer, setForceCustomer] = useState(() => {
    return localStorage.getItem('forceCustomer') === 'true';
  });

  const { currentUser } = useAuth();

  // Đồng bộ forceCustomer vào localStorage
  useEffect(() => {
    localStorage.setItem('forceCustomer', forceCustomer);
  }, [forceCustomer]);

  // Đồng bộ pageState vào localStorage
  useEffect(() => {
    localStorage.setItem('currentPageState', JSON.stringify(pageState));
  }, [pageState]);

  const navigateTo = (page, profileTab = 'info') => {
    if (page === 'admin') {
      setForceCustomer(false); // quay lại trang admin
      return;
    }
    const newPageState = { page, profileTab };
    setPageState(newPageState);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }, []);

  // Nếu là quản trị viên → hiển thị trang Admin (trừ khi đang ép xem trang khách)
  if (currentUser?.vai_tro === 'quan_tri' && !forceCustomer) {
    return <AdminPage onExitAdmin={() => setForceCustomer(true)} />;
  }

  // Màn hình nhân viên (toàn trang, không có header/footer chung)
  if (pageState.page === 'staff' && currentUser?.vai_tro === 'nhan_vien') {
    return (
      <StaffDashboard
        user={currentUser}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  return (
    <div className="font-sans" style={{ backgroundColor: '#fefaf0' }}>
      <Header 
        onLoginClick={() => setIsAuthModalOpen(true)} 
        onNavigate={navigateTo} 
      />
      
      {pageState.page === 'home' ? (
        <>
          <div id="trang-chu">
            <HeroSection />
          </div>
          
          <div id="mat-hang-hot">
            <BestSellingSection />
          </div>

          <div id="thuc-don">
            <ProductGrid />
          </div>

          <InstagramGallery />
        </>
      ) : pageState.page === 'about' ? (
        <AboutPage />
      ) : (
        <CustomerProfilePage 
          initialTab={pageState.profileTab} 
          onNavigateHome={() => navigateTo('home')} 
        />
      )}
      <Footer onNavigate={navigateTo} />                   {/* 10. Chân trang */}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          // Nếu là nhân viên, tự động chuyển sang trang staff
          if (user?.vai_tro === 'nhan_vien') {
            navigateTo('staff');
          }
          // Nếu là quản trị, forceCustomer sẽ là false nên tự động hiển thị AdminPage
        }}
      />
      
      {/* Tính năng giỏ hàng */}
      <CartOffcanvas 
        onCheckoutClick={() => setIsCheckoutOpen(true)} 
        onNavigate={navigateTo}
      />

      {/* Điều hướng Mobile */}
      <MobileBottomNav onCartClick={() => {
        const cartBtn = document.querySelector('[data-bs-target="#cartOffcanvas"]');
        if (cartBtn) cartBtn.click();
      }} />

      {/* Tính năng thanh toán */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Pop-up Khuyến mãi khi định thoát */}
      <ExitIntentPopup />
    </div>
  );
}

export default App;