import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import CategoryList from './CategoryList';

const ProductGrid = () => {
  const { addToCart } = useCart();
  const { searchQuery, categoryFilter } = useSearch();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mon-an`);
        const data = await response.json();
        if (data.success) {
          const formattedProducts = data.data.map(p => ({
            id: p.ma_mon_an,
            name: p.ten_mon,
            price: Number(p.gia_ban),
            img: p.hinh_anh,
            category: p.ten_danh_muc, 
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
                  <div className="text-warning mb-1 mb-md-2" style={{fontSize: '10px'}}>
                    <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                  </div>
                  <p className="fw-bold product-price mb-2 mb-md-3 mt-auto">{p.price.toLocaleString('vi-VN')} <span className="text-secondary fw-normal price-unit">VNĐ</span></p>
                  <div>
                    <button 
                      className="btn btn-outline-secondary rounded-pill btn-sm px-2 px-md-4 py-1 py-md-2 hover-yellow-bg w-100 product-btn"
                      onClick={() => addToCart(p)}
                    >
                      Đặt ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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