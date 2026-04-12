import React, { useState, useEffect } from 'react';
import heroBurgerImg from '../assets/images/hero-burger.png';
import comboGaRanImg from '../assets/images/combo-ga-ran.png';
import comboMiYImg from '../assets/images/combo-mi-y.png';

const getTomorrowMidnight = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d;
};
const getDaysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 0);
  return d;
};

const slides = [
  {
    type: 'hero',
    img: heroBurgerImg,
    title: <>Sự Lựa Chọn Hàng Đầu <br /> Cho Bữa Ăn <span className="text-green">Nhanh & Ngon!</span></>,
    desc: 'Chúng tôi mang đến những món ăn được chế biến từ nguyên liệu tươi ngon nhất, phục vụ nhanh chóng, mang lại trải nghiệm tuyệt vời cho bạn và gia đình...',
    btnText: 'Đặt Hàng Ngay \u2192',
    actionId: 'mat-hang-hot'
  },
  {
    type: 'deal',
    img: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop',
    title: 'Combo Siêu Ưu Đãi',
    desc: 'Burger + Khoai + Nước + Tráng miệng',
    price: 120000,
    originalPrice: 150000,
    btnText: 'Đặt ngay',
    actionId: 'thuc-don',
    holidayName: '⚡ Flash Sale Giờ Vàng',
    endTime: getTomorrowMidnight()
  },
  {
    type: 'deal',
    img: comboGaRanImg,
    title: 'Combo Gà Giòn Đam Mê',
    desc: '3 Miếng Gà Rán + 1 Khoai Chiên + 2 Nước Ngọt',
    price: 99000,
    originalPrice: 135000,
    btnText: 'Đặt ngay',
    actionId: 'thuc-don',
    holidayName: '🎉 Mừng Lễ Lớn 30/4',
    endTime: getDaysFromNow(3)
  },
  {
    type: 'deal',
    img: comboMiYImg,
    title: 'Combo Cặp Đôi Kiểu Ý',
    desc: '2 Mì Ý Hải Sản + 1 Salad + 2 Trà Chanh',
    price: 150000,
    originalPrice: 190000,
    btnText: 'Đặt ngay',
    actionId: 'thuc-don',
    holidayName: '🔥 Ưu Đãi Cuối Tuần',
    endTime: getDaysFromNow(1)
  }
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const differences = {};
      slides.forEach((slide, index) => {
        if (slide.endTime) {
          const difference = +slide.endTime - +new Date();
          if (difference > 0) {
            differences[index] = {
              days: Math.floor(difference / (1000 * 60 * 60 * 24)),
              hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((difference / 1000 / 60) % 60),
              seconds: Math.floor((difference / 1000) % 60),
            };
          } else {
            differences[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
          }
        }
      });
      setTimeLeft(differences);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

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
            {slides[currentIndex].type === 'hero' ? (
              <>
                <h1 className="font-serif fw-bold mb-4" style={{fontSize: '4rem', lineHeight: '1.2'}}>
                  {slides[currentIndex].title}
                </h1>
                <p className="text-secondary mb-5 fs-6" style={{maxWidth: '450px'}}>
                  {slides[currentIndex].desc}
                </p>
              </>
            ) : (
              <div className="fade-in">
                {slides[currentIndex].holidayName && (
                  <div className="d-inline-flex align-items-center gap-2 mb-3 p-2 px-3 rounded-pill shadow-sm" style={{ background: 'linear-gradient(45deg, #ff416c, #ff4b2b)' }}>
                    <span className="text-white fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>{slides[currentIndex].holidayName}</span>
                  </div>
                )}
                <h1 className="font-serif fw-bold mb-3" style={{fontSize: '3.5rem', lineHeight: '1.2', color: '#ffc107'}}>
                  {slides[currentIndex].title}
                </h1>
                <p className="text-light mb-4 fs-5" style={{maxWidth: '450px'}}>
                  {slides[currentIndex].desc}
                </p>

                {timeLeft[currentIndex] && (
                  <div className="d-flex align-items-center mb-4 bg-dark bg-opacity-50 p-2 rounded" style={{ maxWidth: 'fit-content' }}>
                    <span className="me-3 text-white-50 ms-2" style={{fontSize: '0.9rem'}}><i className="bi bi-clock-history me-1"></i> Kết thúc sau:</span>
                    <div className="d-flex gap-2">
                      {timeLeft[currentIndex].days > 0 && (
                        <div className="bg-dark text-white rounded p-2 text-center shadow-sm" style={{ minWidth: '45px', border: '1px solid #444' }}>
                          <span className="d-block fw-bold fs-5 lh-1 text-danger">{String(timeLeft[currentIndex].days).padStart(2, '0')}</span>
                          <small className="text-secondary fw-bold" style={{ fontSize: '0.55rem' }}>NGÀY</small>
                        </div>
                      )}
                      <div className="bg-dark text-white rounded p-2 text-center shadow-sm" style={{ minWidth: '45px', border: '1px solid #444' }}>
                        <span className="d-block fw-bold fs-5 lh-1 text-white">{String(timeLeft[currentIndex].hours).padStart(2, '0')}</span>
                        <small className="text-secondary fw-bold" style={{ fontSize: '0.55rem' }}>GIỜ</small>
                      </div>
                      <div className="bg-dark text-white rounded p-2 text-center shadow-sm" style={{ minWidth: '45px', border: '1px solid #444' }}>
                        <span className="d-block fw-bold fs-5 lh-1 text-white">{String(timeLeft[currentIndex].minutes).padStart(2, '0')}</span>
                        <small className="text-secondary fw-bold" style={{ fontSize: '0.55rem' }}>PHÚT</small>
                      </div>
                      <div className="bg-dark text-white rounded p-2 text-center shadow-sm" style={{ minWidth: '45px', border: '1px solid #444' }}>
                        <span className="d-block fw-bold fs-5 lh-1 text-warning">{String(timeLeft[currentIndex].seconds).padStart(2, '0')}</span>
                        <small className="text-secondary fw-bold" style={{ fontSize: '0.55rem' }}>GIÂY</small>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 d-flex align-items-end">
                  <span className="fs-2 fw-bold text-danger me-3 lh-1">{slides[currentIndex].price.toLocaleString()}₫</span>
                  <span className="text-secondary text-decoration-line-through me-3 mb-1">{slides[currentIndex].originalPrice.toLocaleString()}₫</span>
                  <span className="badge bg-success fs-6 mb-1 px-2 py-1">- {Math.round(((slides[currentIndex].originalPrice - slides[currentIndex].price) / slides[currentIndex].originalPrice) * 100)}%</span>
                </div>
              </div>
            )}
            <button className="btn btn-yellow mb-5" onClick={() => {
              const elem = document.getElementById(slides[currentIndex].actionId);
              if (elem) {
                const headerOffset = 80;
                const elementPosition = elem.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
              }
            }}>{slides[currentIndex].btnText}</button>
            
            {/* Slider Text */}
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold">{`0${currentIndex + 1}`}</span>
              <div style={{ width: '80px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${((currentIndex + 1) / slides.length) * 100}%`, height: '100%', backgroundColor: '#ffc107', transition: 'width 0.4s ease-in-out', position: 'absolute', top: 0, left: 0 }}></div>
              </div>
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
               src={slides[currentIndex].img} 
               alt={typeof slides[currentIndex].title === 'string' ? slides[currentIndex].title : `Slide ${currentIndex + 1}`} 
               className="img-fluid drop-shadow" 
               style={{maxWidth: '100%', filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.5))', transition: 'all 0.5s ease-in-out', objectFit: 'cover', maxHeight: '500px', borderRadius: currentIndex === 0 ? '0' : '20px'}} 
             />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;