import React from 'react';

const FeaturesSection = () => {
  return (
    <section className="py-5" style={{ backgroundColor: '#f6f4eb' }}>
      <div className="container py-5">
        <div className="row align-items-center">
          
          {/* Cột Trái: 4 Thẻ Dịch Vụ */}
          <div className="col-lg-6 mb-5 mb-lg-0">
            <div className="row g-4">
              {/* Thẻ 1 */}
              <div className="col-sm-6" data-aos="fade-up" data-aos-delay="0">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-translate-y">
                  <div className="fs-1 mb-3">🍲</div>
                  <h5 className="fw-bold">Ấm Áp & Thưởng Thức</h5>
                  <p className="text-secondary small mb-0">Hương vị tuyệt hảo giữ trọn độ nóng hổi khi đến tay bạn.</p>
                </div>
              </div>
              {/* Thẻ 2 */}
              <div className="col-sm-6" data-aos="fade-up" data-aos-delay="100">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-translate-y">
                  <div className="fs-1 mb-3">🛎️</div>
                  <h5 className="fw-bold">Dịch Vụ Tận Tâm</h5>
                  <p className="text-secondary small mb-0">Chăm sóc khách hàng chu đáo, mang lại trải nghiệm đáng nhớ.</p>
                </div>
              </div>
              {/* Thẻ 3 */}
              <div className="col-sm-6" data-aos="fade-up" data-aos-delay="200">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-translate-y">
                  <div className="fs-1 mb-3">🚚</div>
                  <h5 className="fw-bold">Giao Hàng Nhanh</h5>
                  <p className="text-secondary small mb-0">Đội ngũ giao hàng thần tốc, đảm bảo bữa ăn luôn sẵn sàng (phạm vi dưới 10km quanh chi nhánh).</p>
                </div>
              </div>
              {/* Thẻ 4 */}
              <div className="col-sm-6" data-aos="fade-up" data-aos-delay="300">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-translate-y">
                  <div className="fs-1 mb-3">🥗</div>
                  <h5 className="fw-bold">Thực Phẩm Hữu Cơ</h5>
                  <p className="text-secondary small mb-0">Nguyên liệu tươi sạch, an toàn cho sức khỏe mọi nhà.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Chữ */}
          <div className="col-lg-5 offset-lg-1" data-aos="fade-left">
            <h2 className="font-serif fw-bold display-5 mb-4">
              Sự Lựa Chọn Của <br />
              <span className="text-green">Khách Hàng</span>
            </h2>
            <p className="text-secondary mb-4" style={{ lineHeight: '1.8' }}>
              Chúng tôi luôn nỗ lực không ngừng để mang đến những món ăn ngon nhất cùng dịch vụ hoàn hảo. Hàng ngàn khách hàng đã tin tưởng và lựa chọn Food Lover cho những bữa ăn của gia đình và bạn bè.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;