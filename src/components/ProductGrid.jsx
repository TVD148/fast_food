import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import CategoryList from './CategoryList';
import productService from '../services/productService';

const ProductGrid = () => {
  const { addToCart } = useCart();
  const { searchQuery, categoryFilter } = useSearch();
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [showToast, setShowToast] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddingId(product.id);
    setShowToast(product.name);
    
    // Reset hiệu ứng sau 1.5s
    setTimeout(() => {
      setAddingId(null);
    }, 1500);

    setTimeout(() => {
      setShowToast(null);
    }, 2500);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        if (data.success) {
          const formattedProducts = data.data.map(p => ({
            id: p.ma_mon_an,
            name: p.ten_mon,
            price: Number(p.gia_ban),
            img: p.hinh_anh,
            category: p.ten_danh_muc,
            co_the_ban: p.co_the_ban !== 0 // 1 or undefined means can sell, 0 means out of stock
          }));
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách món ăn:', error);
      }
    };
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo từ khóa tìm kiếm HOẶC theo danh mục
  const filteredProducts = products.filter(p => {
    if (categoryFilter) {
      return p.category === categoryFilter;
    }
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <section className="py-5" id="ket-qua-tim-kiem">
      <div className="container py-5">
        <div className="text-center mb-3">
          <h2 className="font-serif fw-bold display-5">
            {categoryFilter ? (
              <>
                Danh Mục: <br />
                <span className="text-green">{categoryFilter}</span>
              </>
            ) : searchQuery ? (
              <>
                Kết Quả Tìm Kiếm: <br />
                <span className="text-green h3">"{searchQuery}"</span>
              </>
            ) : (
              <>
                Những món ăn tại <br />
                <span className="text-green">Fast food store</span>
              </>
            )}
          </h2>
        </div>

        {/* Thanh phân loại ngay dưới tiêu đề */}
        <CategoryList />

        {filteredProducts.length === 0 ? (
          <div className="text-center text-muted col-12 py-4">
            <i className="bi bi-search display-1 text-light"></i>
            <p className="mt-3 fs-5">Rất tiếc, không tìm thấy món ăn nào phù hợp.</p>
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
            {filteredProducts.map(p => (
              <div className="col" key={p.id}>
                <div className="card h-100 product-card shadow-sm p-2 p-md-3 text-center d-flex flex-column border-0">
                  <div className="mb-2 mb-md-3 overflow-hidden rounded-circle mx-auto product-img-container">
                    <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="d-block mx-auto hover-scale" />
                  </div>
                  <h6 className="card-title fw-bold text-dark product-title">{p.name}</h6>
                  <p className="fw-bold product-price mb-2 mb-md-3 mt-auto">{p.price.toLocaleString('vi-VN')} <span className="text-secondary fw-normal price-unit">VNĐ</span></p>
                  <div>
                    {p.co_the_ban ? (
                      <button 
                        className={`btn ${addingId === p.id ? 'btn-success' : 'btn-outline-secondary'} rounded-pill btn-sm px-2 px-md-4 py-1 py-md-2 hover-yellow-bg w-100 product-btn`}
                        onClick={() => handleAddToCart(p)}
                      >
                        {addingId === p.id ? 'Đã thêm ✅' : 'Đặt ngay'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary rounded-pill btn-sm px-2 px-md-4 py-1 py-md-2 w-100 product-btn"
                        disabled
                        style={{opacity: 0.6}}
                      >
                        Hết hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast thông báo */}
        <div className={`cart-toast ${showToast ? 'show' : ''}`}>
          <div className="toast-content">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Đã thêm <strong>{showToast}</strong> vào giỏ hàng!
          </div>
        </div>
      </div>
      <style>{`
        .product-img-container {
          width: 100px;
          height: 100px;
        }
        .product-title {
          font-size: 14px;
        }
        .product-price {
          font-size: 14px;
        }
        .price-unit {
          font-size: 10px;
        }
        .product-btn {
          font-size: 12px;
          transition: all 0.3s;
        }
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
        @media (min-width: 768px) {
          .product-img-container {
            width: 150px;
            height: 150px;
          }
          .product-title {
            font-size: 16px;
          }
          .product-price {
            font-size: 20px;
          }
          .price-unit {
            font-size: 14px;
          }
          .product-btn {
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductGrid;