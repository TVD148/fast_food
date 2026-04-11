import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DealOfDay from './components/DealOfDay';
import FeaturedSection from './components/FeaturedSection';
import BestSellingSection from './components/BestSellingSection';
import FeaturesSection from './components/FeaturesSection';
import ProductGrid from './components/ProductGrid';
import InstagramGallery from './components/InstagramGallery';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import AuthModal from './components/AuthModal';
import CartOffcanvas from './components/CartOffcanvas';
import CheckoutModal from './components/CheckoutModal';
import CustomerProfilePage from './components/CustomerProfilePage';
import ExitIntentPopup from './components/ExitIntentPopup';

function App() {
  // State for UI
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pageState, setPageState] = useState({ page: 'home', profileTab: 'info' });

  const navigateTo = (page, profileTab = 'info') => {
    setPageState({ page, profileTab });
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }, []);

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
            <DealOfDay />
            {/* Deal of the Day appears right after Hero Section */}
          </div>
          
          <div id="ve-chung-toi">
            <FeaturedSection />
          </div>

          <div id="mat-hang-hot">
            <BestSellingSection />
          </div>

          <FeaturesSection />

          <div id="thuc-don">
            <ProductGrid />
          </div>

          <InstagramGallery />
        </>
      ) : (
        <CustomerProfilePage 
          initialTab={pageState.profileTab} 
          onNavigateHome={() => navigateTo('home')} 
        />
      )}
      <Footer />                   {/* 10. Chân trang */}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Tính năng giỏ hàng */}
      <CartOffcanvas onCheckoutClick={() => setIsCheckoutOpen(true)} />

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