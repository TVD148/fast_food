import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/apiConfig';
import { useCart } from '../context/CartContext';

const BestSellingSection = () => {
  const { addToCart } = useCart();
  const [bestSellers, setBestSellers] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [showToast, setShowToast] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddingId(product.id);
    setShowToast(product.name);
    
    setTimeout(() => setAddingId(null), 1500);
    setTimeout(() => setShowToast(null), 2500);
  };

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mon-an/ban-chay`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const bgColors = ['#fef3e3', '#f4f4f4', '#e8f4f8', '#f8e8f4'];
          const formattedData = data.data.map((item, index) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            img: item.image,
            bg: bgColors[index % bgColors.length],
            co_the_ban: item.co_the_ban !== 0
          }));
          setBestSellers(formattedData);
        } else {
           // Fallback content in case db has no orders/metrics yet
           const fallbackData = [
            { id: 1, name: 'Trà Chanh Lạnh', price: 25000, img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop', bg: '#fef3e3' },
            { id: 2, name: 'Mì Ý Sốt Bò Bằm Jollibee', price: 55000, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop', bg: '#f4f4f4' },
            { id: 3, name: 'Combo Bữa Tiệc (6 Gà + 2 Khoai + 3 Nước)', price: 299000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop', bg: '#f4f4f4' },
            { id: 4, name: 'Gà Rán Giòn Cay (2 Miếng)', price: 75000, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', bg: '#f4f4f4' },
          ];
          setBestSellers(fallbackData);
        }
      } catch (error) {
        console.error('Lỗi lấy món bán chạy:', error);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <section className="py-5 bg-white">
      <div className="container py-5 text-center position-relative">
        <div data-aos="fade-up">
          <h2 className="font-serif fw-bold display-5 mb-3">
            Mặt Hàng <span className="text-green">HOT</span>
          </h2>
          <p className="text-secondary mx-auto mb-5" style={{ maxWidth: '600px' }}>
            Khám phá những món ăn được yêu thích nhất tại cửa hàng của chúng tôi
          </p>
        </div>



        {/* Lưới 4 món ăn */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 px-lg-4">
          {bestSellers.map((item, index) => (
            <div className="col" key={item.id} data-aos="zoom-in" data-aos-delay={index * 100}>
              <div className="card h-100 border-0 text-start product-card p-2 position-relative pt-4 pb-2">
                {/* Khối nền vuông chứa hình ảnh */}
                <div className="rounded-4 d-flex justify-content-center align-items-center mb-3 overflow-hidden" style={{ backgroundColor: item.bg, height: '220px' }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="d-block mx-auto hover-scale" />
                </div>
                <h6 className="fw-bold mb-2">{item.name}</h6>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <p className="fw-bold fs-5 mb-0">{item.price.toLocaleString('vi-VN')} <span className="text-secondary fs-6 fw-normal">VNĐ</span></p>
                    {item.co_the_ban !== false ? (
                      <button 
                        className={`btn ${addingId === item.id ? 'btn-success' : 'btn-warning'} rounded-circle btn-sm shadow-sm`} style={{ width: '35px', height: '35px' }}
                        title="Thêm vào giỏ"
                        onClick={() => handleAddToCart(item)}
                      >
                        <i className={`bi ${addingId === item.id ? 'bi-check-lg' : 'bi-plus-lg'} ${addingId === item.id ? 'text-white' : 'text-dark'}`}></i>
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary rounded-circle btn-sm shadow-sm" style={{ width: '35px', height: '35px', opacity: 0.6 }}
                        title="Hết hàng"
                        disabled
                      >
                        <i className="bi bi-dash text-light"></i>
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toast thông báo */}
        <div className={`cart-toast ${showToast ? 'show' : ''}`}>
          <div className="toast-content">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Đã thêm <strong>{showToast}</strong> vào giỏ hàng!
          </div>
        </div>


      </div>
      <style>{`
        .cart-toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: white;
          padding: 12px 24px;
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          z-index: 9999;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid #eee;
        }
        .cart-toast.show {
          transform: translateX(-50%) translateY(0);
        }
        .toast-content {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #333;
        }
      `}</style>
    </section>
  );
};

export default BestSellingSection;