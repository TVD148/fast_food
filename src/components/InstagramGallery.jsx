import React from 'react';

const InstagramGallery = () => {
  const images = [
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&h=400&fit=crop', // Gà nướng / Cánh gà
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=400&fit=crop', // Xiên nướng
    'https://images.unsplash.com/photo-1628191137573-dee64e727614?w=500&h=400&fit=crop', // Bít tết / Thịt nướng (Có icon Instagram ở giữa)
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop', // Salad / Ức gà
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=400&fit=crop', // Mì Ý
  ];

  return (
    <div className="container-fluid p-0 mt-5">
      <div className="d-flex flex-nowrap overflow-auto hide-scrollbar instagram-row">
        {images.map((img, index) => (
          <div className="gallery-col position-relative" key={index}>
            <div 
              className="w-100 h-100 image-gallery-item"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer'
              }}
            >
              {/* Thêm overlay mờ và icon Instagram khi hover */}
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 opacity-0 overlay-hover transition-all"
                style={{ transition: 'opacity 0.3s' }}
              >
                <i className="bi bi-instagram text-white display-4"></i>
              </div>

              {/* Icon Instagram cố định ở hình giữa (như trong mẫu mockup) */}
              {index === 2 && (
                <div className="position-absolute top-50 start-50 translate-middle pointer-events-none d-none d-md-block">
                  <i className="bi bi-instagram text-white shadow-sm" style={{ fontSize: '3rem' }}></i>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .image-gallery-item:hover .overlay-hover {
          opacity: 1 !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .gallery-col {
          flex: 0 0 75vw;
          height: 300px;
          scroll-snap-align: center;
        }
        .instagram-row {
          scroll-snap-type: x mandatory;
        }
        @media (min-width: 768px) {
          .gallery-col {
            flex: 1;
          }
          .instagram-row {
            scroll-snap-type: none;
          }
        }
      `}</style>
    </div>
  );
};

export default InstagramGallery;
