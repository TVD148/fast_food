import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon cho Leaflet với Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Icon marker đỏ custom
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component để di chuyển map khi tọa độ thay đổi từ bên ngoài (GPS)
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { animate: true, duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

// Component xử lý click trên map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Debounce function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const MapPickerModal = ({ isOpen, onClose, onConfirm, initialAddress }) => {
  // TP.HCM mặc định
  const defaultPosition = [10.7769, 106.7009];
  const [markerPos, setMarkerPos] = useState(null);
  const [address, setAddress] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const debouncedSearch = useDebounce(searchText, 500);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setMarkerPos(null);
      setAddress('');
      setSearchText(initialAddress || '');
      setSearchResults([]);
      setFlyTo(null);
      setShowDropdown(false);
    }
  }, [isOpen, initialAddress]);

  // Tìm kiếm địa chỉ khi người dùng gõ
  useEffect(() => {
    if (debouncedSearch.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const query = encodeURIComponent(debouncedSearch + ', Việt Nam');
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5&countrycodes=vn`,
          { headers: { 'Accept-Language': 'vi' } }
        );
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  // Tìm kiếm trực tiếp lấy vị trí đầu tiên
  const handleSearchSubmit = async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    try {
      const query = encodeURIComponent(searchText + ', Việt Nam');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1&countrycodes=vn`,
        { headers: { 'Accept-Language': 'vi' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        handleSelectResult(data[0]);
      } else {
        alert("Không tìm thấy địa điểm này. Vui lòng rút gọn từ khóa (VD: '505 Lê Hồng Phong, Phú Hòa').");
      }
    } catch {
      alert("Lỗi khi tìm kiếm địa chỉ.");
    } finally {
      setIsSearching(false);
      setShowDropdown(false);
    }
  };

  // Reverse geocode: tọa độ → địa chỉ
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'vi' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.display_name;
        setAddress(addr);
        setSearchText(addr);
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Xử lý khi click map
  const handleLocationSelect = useCallback((lat, lng) => {
    setMarkerPos([lat, lng]);
    reverseGeocode(lat, lng);
    setShowDropdown(false);
  }, [reverseGeocode]);

  // Xử lý chọn kết quả tìm kiếm
  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarkerPos([lat, lng]);
    setAddress(result.display_name);
    setSearchText(result.display_name);
    setFlyTo([lat, lng]);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Lấy vị trí GPS hiện tại
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị GPS!');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPos([lat, lng]);
        setFlyTo([lat, lng]);
        reverseGeocode(lat, lng);
        setIsGettingLocation(false);
      },
      (err) => {
        setIsGettingLocation(false);
        if (err.code === 1) {
          alert('Bạn cần cho phép truy cập vị trí trong trình duyệt.');
        } else {
          alert('Không thể lấy vị trí. Vui lòng thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Xác nhận địa chỉ
  const handleConfirm = () => {
    if (!markerPos && !address.trim()) {
      alert('Vui lòng chọn hoặc tìm kiếm vị trí giao hàng trên bản đồ!');
      return;
    }
    onConfirm(address || searchText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(95vw, 900px)',
          height: 'min(90vh, 620px)',
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc3545 0%, #b71c1c 100%)',
          color: '#fff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          <i className="bi bi-geo-alt-fill fs-5" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Chọn vị trí giao hàng</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              Tìm kiếm địa chỉ, nhấp lên bản đồ hoặc bật GPS
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: '50%',
              width: 32, height: 32,
              color: '#fff', cursor: 'pointer',
              fontSize: '1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Search bar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          flexShrink: 0,
          position: 'relative',
        }}
          ref={searchRef}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <i className="bi bi-search" style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                color: '#999', fontSize: '0.9rem',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={searchText}
                onChange={e => {
                  setSearchText(e.target.value);
                  setAddress('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Nhập địa chỉ của bạn vào đây..."
                style={{
                  width: '100%',
                  padding: '10px 70px 10px 36px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocusCapture={e => e.currentTarget.style.borderColor = '#dc3545'}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              />
              <button
                type="button"
                onClick={handleSearchSubmit}
                style={{
                  position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)',
                  background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '5px 12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer',
                  zIndex: 10
                }}
              >
                TÌM
              </button>
              {isSearching && (
                <div style={{
                  position: 'absolute', right: 70, top: '50%',
                  transform: 'translateY(-50%)',
                }}>
                  <div style={{
                    width: 16, height: 16,
                    border: '2px solid #dc3545',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              )}
            </div>

            {/* GPS button */}
            <button
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              title="Lấy vị trí hiện tại của tôi"
              style={{
                padding: '0 14px',
                background: isGettingLocation ? '#6c757d' : 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
              }}
            >
              {isGettingLocation
                ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang quét...</>
                : <><i className="bi bi-crosshair2" /> Lấy vị trí của tôi</>
              }
            </button>
          </div>

          {/* Dropdown gợi ý */}
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%', left: 16, right: 16,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100,
              maxHeight: 220,
              overflowY: 'auto',
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={r.place_id || i}
                  onClick={() => handleSelectResult(r)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: i < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <i className="bi bi-geo-alt text-danger" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>
                      {r.display_name.split(',')[0]}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                      {r.display_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <MapContainer
            center={defaultPosition}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            {flyTo && <FlyToLocation position={flyTo} />}
            {markerPos && (
              <Marker position={markerPos} icon={redIcon} />
            )}
          </MapContainer>

          {/* Hint overlay */}
          {!markerPos && (
            <div style={{
              position: 'absolute',
              bottom: 16, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: '0.8rem',
              pointerEvents: 'none',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap',
            }}>
              <i className="bi bi-hand-index-thumb me-1" />
              Nhấp trực tiếp vào bản đồ để ghim điểm giao hàng
            </div>
          )}

          {/* Geocoding loading */}
          {isGeocoding && (
            <div style={{
              position: 'absolute',
              top: 12, left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 1000,
            }}>
              <div style={{
                width: 14, height: 14,
                border: '2px solid #dc3545',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              Đang phân tích địa chỉ của bạn...
            </div>
          )}
        </div>

        {/* Footer: địa chỉ đã chọn + nút xác nhận */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          flexShrink: 0,
          background: '#fafafa',
        }}>
          {address && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              marginBottom: 10,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '10px 12px',
            }}>
              <i className="bi bi-pin-map-fill text-danger" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.85rem', color: '#374151' }}>
                <div style={{ fontWeight: 600, color: '#111', marginBottom: 2 }}>Địa chỉ sẽ giao đến:</div>
                {address}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #dee2e6',
                borderRadius: 10,
                background: '#fff',
                color: '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6b7280'; e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.style.background = '#fff'; }}
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!markerPos && !address}
              style={{
                flex: 2,
                padding: '10px',
                border: 'none',
                borderRadius: 10,
                background: (!markerPos && !address) ? '#e5e7eb' : 'linear-gradient(135deg, #dc3545, #b71c1c)',
                color: (!markerPos && !address) ? '#9ca3af' : '#fff',
                fontWeight: 700,
                cursor: (!markerPos && !address) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <i className="bi bi-check-circle-fill" />
              Lưu địa chỉ này
            </button>
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default MapPickerModal;
