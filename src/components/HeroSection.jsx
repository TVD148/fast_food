import React, { useState, useEffect } from 'react';
import heroBurgerImg from '../assets/images/hero-burger.png';

const slides = [
  heroBurgerImg,
  'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop', // Trà Chanh
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop', // Mì Ý
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop'  // Điểm tâm
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  return (
    <section className="bg-dark-custom text-white pt-5 pb-5 overflow-hidden">
      <div className="container mt-4 mb-5">
        <div className="row align-items-center">
          
          {/* Cột chữ (Trái) */}
          <div className="col-md-6 pe-md-5">
            <h1 className="font-serif fw-bold mb-4" style={{fontSize: '4rem', lineHeight: '1.2'}}>
              Sự Lựa Chọn Hàng Đầu <br />
              Cho Bữa Ăn <span className="text-green">Nhanh & Ngon!</span>
            </h1>
            <p className="text-secondary mb-5 fs-6" style={{maxWidth: '450px'}}>
              Chúng tôi mang đến những món ăn được chế biến từ nguyên liệu tươi ngon nhất, phục vụ nhanh chóng, mang lại trải nghiệm tuyệt vời cho bạn và gia đình...
            </p>
            <button className="btn btn-yellow mb-5" onClick={() => {
              const elem = document.getElementById('mat-hang-hot');
              if (elem) {
                const headerOffset = 80;
                const elementPosition = elem.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
              }
            }}>Đặt Hàng Ngay &rarr;</button>
            
            {/* Slider Text */}
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold">{`0${currentIndex + 1}`}</span>
              <div style={{width: '40px', height: '2px', backgroundColor: '#ffc107'}}></div>
              <span className="text-secondary fw-bold">{`0${slides.length}`}</span>
              <button className="btn btn-outline-secondary rounded-circle p-2 ms-2" onClick={handlePrev}><i className="bi bi-arrow-left"></i></button>
              <button className="btn btn-warning rounded-circle p-2" onClick={handleNext}><i className="bi bi-arrow-right"></i></button>
            </div>
          </div>

          {/* Cột ảnh (Phải) */}
          <div className="col-md-6 text-center position-relative mt-5 mt-md-0">
             {/* Mũi tên xanh lá chỉ vào burger */}
             <div className="position-absolute top-50 start-0 translate-middle-y d-none d-md-block">
                <i className="bi bi-arrow-90deg-right text-green" style={{fontSize: '4rem', opacity: '0.8'}}></i>
             </div>
             <img 
               src={slides[currentIndex]} 
               alt={`Slide ${currentIndex + 1}`} 
               className="img-fluid drop-shadow" 
               style={{maxWidth: '100%', filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.5))', transition: 'all 0.5s ease-in-out', objectFit: 'contain', maxHeight: '500px', borderRadius: currentIndex === 0 ? '0' : '20px'}} 
             />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;