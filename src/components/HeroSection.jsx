import React from 'react';
import heroBurgerImg from '../assets/images/hero-burger.png';

const HeroSection = () => {
  const heroContent = {
    img: heroBurgerImg,
    title: <>Sự Lựa Chọn Hàng Đầu <br /> Cho Bữa Ăn <span className="text-green">Nhanh & Ngon!</span></>,
    desc: 'Chúng tôi mang đến những món ăn được chế biến từ nguyên liệu tươi ngon nhất, phục vụ nhanh chóng, mang lại trải nghiệm tuyệt vời cho bạn và gia đình. Chất lượng hàng đầu, hương vị khó quên.',
    btnText: 'Đặt Hàng Ngay \u2192',
    actionId: 'mat-hang-hot'
  };

  const handleAction = () => {
    const elem = document.getElementById(heroContent.actionId);
    if (elem) {
      const headerOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-dark-custom text-white pt-5 pb-5 overflow-hidden">
      <div className="container mt-4 mb-5">
        <div className="row align-items-center">
          
          {/* Cột chữ (Trái) */}
          <div className="col-md-6 pe-md-5" data-aos="fade-right">
            <h1 className="font-serif fw-bold mb-4" style={{fontSize: '3.8rem', lineHeight: '1.2'}}>
              {heroContent.title}
            </h1>
            <p className="text-secondary mb-5 fs-5" style={{maxWidth: '500px', lineHeight: '1.7'}}>
              {heroContent.desc}
            </p>
            <div className="d-flex gap-3 align-items-center">
                <button className="btn btn-yellow btn-lg px-5 py-3 fw-bold shadow-lg" onClick={handleAction}>
                    {heroContent.btnText}
                </button>
            </div>
          </div>

          {/* Cột ảnh (Phải) */}
          <div className="col-md-6 text-center position-relative mt-5 mt-md-0 d-flex align-items-center justify-content-center" style={{minHeight: '550px'}} data-aos="fade-left">
             {/* Mũi tên xanh lá */}
             <div className="position-absolute top-50 start-0 translate-middle-y d-none d-lg-block" style={{zIndex: 2, marginLeft: '-30px'}}>
                <i className="bi bi-arrow-90deg-right text-green" style={{fontSize: '4.5rem', opacity: '0.6'}}></i>
             </div>
             
             {/* Vòng tròn trang trí phía sau */}
             <div className="position-absolute rounded-circle bg-yellow bg-opacity-10" style={{width: '500px', height: '500px', filter: 'blur(80px)', zIndex: 0}}></div>
             
             <div className="w-100 h-100 d-flex align-items-center justify-content-center position-relative" style={{zIndex: 1}}>
               <img 
                 src={heroContent.img} 
                 alt="Hero Burger" 
                 className="img-fluid drop-shadow floating-animation" 
                 style={{
                   maxWidth: '100%', 
                   maxHeight: '500px',
                   filter: 'drop-shadow(0px 30px 40px rgba(0,0,0,0.6))', 
                   objectFit: 'contain', 
                 }} 
               />
               
               {/* Badge trang trí */}
               <div className="position-absolute top-0 end-0 bg-white text-dark p-3 rounded-4 shadow-lg d-none d-md-block" style={{marginTop: '50px', transform: 'rotate(10deg)'}}>
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-green p-2 rounded-circle">
                            <i className="bi bi-lightning-fill text-white"></i>
                        </div>
                        <div>
                            <p className="fw-bold mb-0 small">Giao cực nhanh</p>
                            <p className="small text-muted mb-0" style={{fontSize: '0.7rem'}}>Chỉ từ 15-30 phút</p>
                        </div>
                    </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;