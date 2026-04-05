import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { useSearch } from '../contexts/SearchContext';
const CategoryList = () => {
  const { categoryFilter, selectCategory, clearFilters } = useSearch();
  const scrollRef = React.useRef(null);
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/danh-muc`);
        const data = await response.json();
        if (data.success) {
          const formattedCategories = data.data.map(cat => ({
            name: cat.ten_danh_muc,
            icon: cat.hinh_anh
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Lỗi lấy danh mục:', error);
      }
    };
    fetchCategories();
  }, []);


  // Nhân bản mảng 3 lần để tạo cảm giác vòng lặp vô tận
  const infiniteCategories = categories.length > 0 ? [...categories, ...categories, ...categories] : [];

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Canh giữa lúc đầu (khoảng 1/3 mảng)
    const middleOffset = container.scrollWidth / 3;
    container.scrollLeft = middleOffset;

    const handleScroll = () => {
      // Nếu cuộn sát mép trái, nhảy về giữa
      if (container.scrollLeft <= 0) {
        container.scrollLeft = middleOffset;
      } 
      // Nếu cuộn sát mép phải, nhảy về giữa
      else if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 5) {
        container.scrollLeft = middleOffset - container.clientWidth; // nhảy về ngay đoạn giữa
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -150, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
  };

  const handleCategoryClick = (catName) => {
    // Nếu bấm lại danh mục đang chọn → bỏ lọc
    if (categoryFilter === catName) {
      clearFilters();
    } else {
      selectCategory(catName);
    }
    // Cuộn xuống phần kết quả
    setTimeout(() => {
      const elem = document.getElementById('ket-qua-tim-kiem');
      if (elem) {
        const headerOffset = 80;
        const elementPosition = elem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="container py-4 position-relative px-4 px-md-5">
      {/* Nút mũi tên trái */}
      <button 
        className="btn btn-outline-warning rounded-circle d-none d-md-flex justify-content-center align-items-center position-absolute top-50 start-0 translate-middle-y z-1 bg-white shadow-sm" 
        style={{width: '40px', height: '40px', color: '#ffc107', marginLeft: '5px'}}
        onClick={scrollLeft}
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* Danh sách các danh mục cuộn ngang vô tận */}
      <div 
        ref={scrollRef}
        className="d-flex flex-nowrap overflow-auto hide-scrollbar gap-3 gap-md-5 align-items-center py-3" 
        style={{ 
          scrollSnapType: 'x mandatory', 
          scrollBehavior: 'auto' // Bỏ smooth để lúc nhảy về không bị trượt lộ liễu
        }}
      >
        {infiniteCategories.map((cat, index) => (
          <div 
            key={index} 
            className="d-flex flex-column align-items-center category-item"
            style={{
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              opacity: categoryFilter && categoryFilter !== cat.name ? 0.5 : 1,
              transform: categoryFilter === cat.name ? 'translateY(-5px)' : 'none',
              flex: '0 0 auto',
              width: '28%', // khoảng 3 items trên mobile
              minWidth: '85px',
              maxWidth: '120px',
              scrollSnapAlign: 'start'
            }}
            onClick={() => handleCategoryClick(cat.name)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = categoryFilter === cat.name ? 'translateY(-5px)' : 'translateY(0)'}
          >
            <div 
              className="mb-2 rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center bg-white"
              style={{
                width: '65px', height: '65px',
                border: categoryFilter === cat.name ? '3px solid #dc3545' : '2px solid transparent',
              }}
            >
              <img src={cat.icon} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span 
              className="fw-bold text-center" 
              style={{
                fontSize: '13px', 
                color: categoryFilter === cat.name ? '#dc3545' : '#333',
                whiteSpace: 'normal',
                lineHeight: '1.2'
              }}
            >
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Nút mũi tên phải */}
      <button 
        className="btn btn-warning rounded-circle d-none d-md-flex justify-content-center align-items-center position-absolute top-50 end-0 translate-middle-y z-1 shadow-sm" 
        style={{width: '40px', height: '40px', marginRight: '5px'}}
        onClick={scrollRight}
      >
        <i className="bi bi-arrow-right"></i>
      </button>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default CategoryList;