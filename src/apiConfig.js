// Cấu hình địa chỉ API tập trung
// Khi chạy local: mặc định localhost:5000/api
// Khi deploy lên server cùng backend: set VITE_API_URL='' (trống) để dùng đường dẫn tương đối '/api'
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5000/api';

