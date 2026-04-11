import React from 'react';
// Using an external placeholder image URL for the deal
const placeholderImg = 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop';

const DealOfDay = () => {
  const deal = {
    title: 'Combo Siêu Ưu Đãi',
    description: 'Burger + Khoai + Nước + Tráng miệng',
    price: 120000,
    originalPrice: 150000,
    img: placeholderImg,
    // optional endTime for countdown can be added later
  };

  const handleOrder = () => {
    const elem = document.getElementById('thuc-don');
    if (elem) {
      const headerOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const discount = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

  return (
    <section className="deal-of-day-section py-5" style={{ background: 'linear-gradient(135deg, #fff7e6, #ffe4b5)' }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <img src={deal.img} alt="Deal of the Day" className="img-fluid rounded" style={{ maxHeight: '400px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }} />
          </div>
          <div className="col-md-6">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#d35400' }}>{deal.title}</h2>
            <p className="fs-5 mb-4" style={{ color: '#555' }}>{deal.description}</p>
            <div className="mb-3">
              <span className="fs-4 fw-bold text-danger me-2">{deal.price.toLocaleString()}₫</span>
              <span className="text-muted text-decoration-line-through">{deal.originalPrice.toLocaleString()}₫</span>
              <span className="badge bg-success ms-3">-{discount}%</span>
            </div>
            <button className="btn btn-warning btn-lg" onClick={handleOrder}>Đặt ngay</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealOfDay;

