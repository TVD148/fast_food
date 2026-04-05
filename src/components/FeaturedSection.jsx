import React from 'react';

const FeaturedSection = () => {
  return (
    <section className="py-5 overflow-hidden">
      <div className="container py-5 mt-4">
        <div className="row align-items-center">
          
          {/* Cột Trái: Hai ảnh xếp chồng (Bay từ trái sang) */}
          <div className="col-lg-6 position-relative text-center text-lg-start mb-5 mb-lg-0" data-aos="fade-right">
            
            {/* Ảnh to phía sau (Burger) */}
            <img 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=800&fit=crop" 
              alt="Big Burger" 
              className="img-fluid rounded-4 shadow"
              style={{ width: '80%', maxWidth: '400px', objectFit: 'cover' }}
            />
            
            {/* Ảnh nhỏ phía trước (Xiên nướng) - Đè lên ảnh to */}
            <img 
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" 
              alt="Meat Skewers" 
              className="position-absolute rounded-4 shadow-lg border border-4 border-white"
              style={{ 
                bottom: '-10%', 
                right: '5%', 
                width: '55%', 
                maxWidth: '260px', 
                objectFit: 'cover' 
              }}
            />
          </div>

          {/* Cột Phải: Nội dung chữ (Bay từ phải sang) */}
          <div className="col-lg-6 ps-lg-5 mt-4 mt-lg-0" data-aos="fade-left">
            <h2 className="font-serif fw-bold display-5 mb-4">
              Hương Vị Lôi Cuốn <br />
              <span className="text-green">Được Yêu Thích.</span>
            </h2>
            <p className="text-secondary mb-4" style={{ lineHeight: '1.8' }}>
              Thưởng thức những tuyệt tác ẩm thực được chế biến từ đôi bàn tay khéo léo của các đầu bếp hàng đầu. Chúng tôi cam kết mang đến những điều tuyệt vời nhất cho trải nghiệm ăn uống của bạn.
            </p>
            <div className="d-flex align-items-center gap-4">
              <button className="btn btn-yellow px-4 py-2" onClick={() => {
                const elem = document.getElementById('mat-hang-hot');
                if (elem) {
                  const headerOffset = 80;
                  const elementPosition = elem.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}>Xem thêm &rarr;</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;