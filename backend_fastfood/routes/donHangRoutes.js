const express = require('express');
const router = express.Router();
const nhanVienController = require('../controllers/nhanVienController');
const donHangController = require('../controllers/donHangController');
const { xacThucToken, optionalAuth, xacThucNhanVien } = require('../middleware/authMiddleware');

// ─── KHÁCH HÀNG ───────────────────────────────────────────
// Khách hàng vãng lai vẫn có thể đặt hàng
router.post('/tao-don', optionalAuth, donHangController.taoDonHang);
// Xem lịch sử mua hàng
router.get('/lich-su', xacThucToken, donHangController.layLichSuDonHang);
// Khách hủy đơn (trong 5 phút đầu)
router.put('/khach-hang-huy/:id', xacThucToken, donHangController.khachHangHuyDon);
// Kiểm tra mã giảm giá
router.post('/kiem-tra-ma', optionalAuth, donHangController.kiemTraMaGiamGia);

// ─── NHÂN VIÊN ────────────────────────────────────────────
// Thống kê ca làm hôm nay
router.get('/nhan-vien/thong-ke-ca', xacThucNhanVien, nhanVienController.layThongKeCa);
// Lấy danh sách đơn hàng (filter + pagination + tìm kiếm)
router.get('/nhan-vien/don-hang', xacThucNhanVien, nhanVienController.layDanhSachDonHang);
// Cập nhật trạng thái đơn (chỉ chiều thuận)
router.put('/nhan-vien/:id/trang-thai', xacThucNhanVien, nhanVienController.capNhatTrangThai);
// Gửi hóa đơn email
router.post('/nhan-vien/:id/gui-email', xacThucNhanVien, nhanVienController.guiHoaDonEmail);

module.exports = router;
