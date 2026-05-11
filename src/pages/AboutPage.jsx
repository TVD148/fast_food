import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const AboutPage = () => {
  const [contactType, setContactType] = useState('gop_y');
  const [customSubject, setCustomSubject] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const founders = [
    { name: 'Trần Văn Đình', role: 'CEO & Founder', bio: 'Chuyên gia ẩm thực với hơn 10 năm kinh nghiệm trong ngành F&B. Người đặt nền móng cho triết lý nấu ăn sạch và ngon tại Food Lover.' },
    { name: 'Trịnh Nhật Hoàng', role: 'CTO & Co-Founder', bio: 'Kiến trúc sư hệ thống, người đứng sau công nghệ vận hành hiện đại và quy trình quản lý chất lượng nghiêm ngặt của nhà hàng.' },
    { name: 'Đỗ Thị Mai Hương', role: 'COO & Co-Founder', bio: 'Chuyên gia vận hành dịch vụ khách hàng. Với tâm niệm "Khách hàng là người thân", chị luôn đảm bảo trải nghiệm tốt nhất cho mọi thực khách.' },
  ];

  const getInitial = (name) => {
    const parts = name.split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fade-in pb-5" style={{ backgroundColor: '#fefaf0' }}>
      {/* Banner */}
      <section className="py-5 bg-dark-custom text-white text-center position-relative overflow-hidden">
        <div className="container py-5 position-relative" style={{ zIndex: 1 }}>
          <h1 className="display-3 font-serif fw-bold mb-3 mt-5" data-aos="zoom-in">Về <span className="text-yellow">Chúng Tôi</span></h1>
          <p className="lead mx-auto" style={{ maxWidth: '700px', color: '#ccc' }} data-aos="fade-up" data-aos-delay="100">
            Hành trình mang tinh hoa ẩm thực nhanh đến bàn ăn của mọi gia đình Việt.
          </p>
        </div>
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=1600&h=400&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
      </section>

      {/* Câu chuyện của chúng tôi */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="font-serif fw-bold display-5 mb-4">Câu Chuyện Của <span className="text-green">Food Lover</span></h2>
              <p className="text-secondary mb-4 fs-5" style={{ lineHeight: '1.8' }}>
                Bắt đầu từ một cửa hàng nhỏ tại TP. Hồ Chí Minh vào năm 2020, Food Lover được ra đời với sứ mệnh định nghĩa lại khái niệm "Thức ăn nhanh". Chúng tôi tin rằng bữa ăn nhanh không chỉ là sự tiện lợi, mà còn phải là sự thưởng thức tinh tế từ nguồn nguyên liệu sạch và tươi ngon nhất.
              </p>
              <p className="text-secondary mb-4" style={{ lineHeight: '1.8' }}>
                Mỗi món ăn tại Food Lover đều là kết quả của sự kết hợp hoàn mỹ giữa công thức truyền thống và kỹ thuật chế biến hiện đại. Chúng tôi không ngừng sáng tạo để mang đến những hương vị mới lạ, đáp ứng khẩu vị đa dạng của khách hàng. Với hơn 50 chi nhánh trên toàn quốc, chúng tôi tự hào là lựa chọn tin cậy cho hàng triệu thực khách.
              </p>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop" 
                className="img-fluid rounded-4 shadow-lg" 
                alt="Nhà hàng"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Đội ngũ sáng lập */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="font-serif fw-bold display-5">Những Người <span className="text-green">Sáng Lập</span></h2>
            <p className="text-muted">Đội ngũ tâm huyết đứng sau sự thành công của Food Lover</p>
          </div>
          <div className="row g-4 justify-content-center">
            {founders.map((f, i) => (
              <div className="col-md-4" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center h-100 founder-card">
                  <div className="p-4">
                    <div className="mb-3 position-relative d-inline-block">
                        <div 
                            className="rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold text-white mb-2" 
                            style={{ 
                                width: '160px', 
                                height: '160px', 
                                fontSize: '4rem', 
                                backgroundColor: getAvatarColor(f.name),
                                margin: '0 auto'
                            }}
                        >
                            {getInitial(f.name)}
                        </div>
                        <div className="position-absolute bottom-0 end-0 bg-yellow rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', border: '3px solid white'}}>
                            <i className="bi bi-star-fill text-white"></i>
                        </div>
                    </div>
                    <h4 className="fw-bold mb-1">{f.name}</h4>
                    <p className="text-green fw-semibold mb-3">{f.role}</p>
                    <p className="text-secondary small" style={{lineHeight: '1.6'}}>{f.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="py-5" style={{ backgroundColor: '#f6f4eb' }}>
        <div className="container py-4 text-center">
          <h2 className="font-serif fw-bold display-5 mb-5" data-aos="fade-up">Giá Trị <span className="text-green">Cốt Lõi</span></h2>
          <div className="row g-4">
            <div className="col-sm-6 col-lg-3" data-aos="fade-up">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-translate-y">
                <div className="fs-1 mb-3">🍲</div>
                <h5 className="fw-bold">Ấm Áp & Thưởng Thức</h5>
                <p className="text-secondary small mb-0">Hương vị tuyệt hảo giữ trọn độ nóng hổi khi đến tay bạn.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-translate-y">
                <div className="fs-1 mb-3">🛎️</div>
                <h5 className="fw-bold">Dịch Vụ Tận Tâm</h5>
                <p className="text-secondary small mb-0">Chăm sóc khách hàng chu đáo, mang lại trải nghiệm đáng nhớ.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-translate-y">
                <div className="fs-1 mb-3">🚚</div>
                <h5 className="fw-bold">Giao Hàng Nhanh</h5>
                <p className="text-secondary small mb-0">Đội ngũ giao hàng thần tốc trong phạm vi 10km.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-translate-y">
                <div className="fs-1 mb-3">🥗</div>
                <h5 className="fw-bold">Thực Phẩm Hữu Cơ</h5>
                <p className="text-secondary small mb-0">Nguyên liệu tươi sạch, an toàn cho sức khỏe mọi nhà.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liên hệ & Bản đồ */}
      <section className="py-5 bg-white" id="lien-he-chi-tiet">
        <div className="container py-4">
          <div className="row g-5">
            {/* Form Liên hệ */}
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="font-serif fw-bold display-5 mb-4">Gửi <span className="text-green">Liên Hệ</span></h2>
              {formSubmitted ? (
                <div className="alert alert-success rounded-4 p-4 fade-in">
                  <h5 className="fw-bold"><i className="bi bi-check-circle-fill me-2"></i>Cảm ơn bạn!</h5>
                  <p className="mb-0">Lời nhắn của bạn đã được gửi thành công. Đội ngũ chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3 bg-light p-4 rounded-4 shadow-sm border">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Họ và tên</label>
                    <input type="text" className="form-control rounded-3 p-2" required placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control rounded-3 p-2" required placeholder="email@example.com" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Loại liên hệ</label>
                    <select 
                      className="form-select rounded-3 p-2" 
                      value={contactType} 
                      onChange={(e) => setContactType(e.target.value)}
                    >
                      <option value="bao_cao">Báo cáo lỗi/vấn đề</option>
                      <option value="gop_y">Góp ý dịch vụ</option>
                      <option value="khac">Yêu cầu khác</option>
                    </select>
                  </div>
                  {contactType === 'khac' && (
                    <div className="col-12 fade-in">
                      <label className="form-label fw-semibold">Tiêu đề yêu cầu</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3 p-2 border-warning" 
                        required 
                        placeholder="Nhập tiêu đề bạn muốn..."
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Nội dung tin nhắn</label>
                    <textarea className="form-control rounded-3 p-2" rows="5" required placeholder="Chúng tôi có thể giúp gì cho bạn?"></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-yellow w-100 py-3 fw-bold rounded-3 shadow-sm">
                      Gửi Tin Nhắn <i className="bi bi-send ms-2"></i>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bản đồ & Thông tin */}
            <div className="col-lg-6" data-aos="fade-left">
              <div className="bg-white rounded-4 p-4 h-100 shadow border">
                <h4 className="fw-bold mb-4"><i className="bi bi-geo-alt-fill text-danger me-2"></i>Vị Trí Cửa Hàng</h4>
                <div style={{ height: '350px', borderRadius: '15px', overflow: 'hidden' }} className="mb-4 shadow-sm border border-white border-4">
                  <MapContainer center={[10.762622, 106.660172]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; Google Maps'
                      url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    />
                    <Marker position={[10.762622, 106.660172]}>
                      <Popup>
                        <div className="fw-bold">Food Lover Restaurant</div>
                        <div className="small">Số 123 Đường Tên Lửa, TP. HCM</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p className="mb-1 fw-bold text-dark"><i className="bi bi-clock-fill me-2 text-warning"></i>Giờ mở cửa:</p>
                    <p className="text-secondary small">08:00 - 22:00 (Hàng ngày)</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1 fw-bold text-dark"><i className="bi bi-telephone-fill me-2 text-warning"></i>Hotline:</p>
                    <p className="text-secondary small">1900 123 456</p>
                  </div>
                  <div className="col-12">
                    <p className="mb-1 fw-bold text-dark"><i className="bi bi-envelope-fill me-2 text-warning"></i>Email hỗ trợ:</p>
                    <p className="text-secondary small">support@foodlover.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
