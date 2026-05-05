const express = require('express');
const router = express.Router();
const donHangController = require('../controllers/donHangController');
const { xacThucToken, optionalAuth, xacThucNhanVien } = require('../middleware/authMiddleware');

// --- KHÁCH HÀNG ---
// Khách hàng vãng lai vẫn có thể đặt hàng
router.post('/tao-don', optionalAuth, donHangController.taoDonHang);
// Xem lịch sử mua hàng
router.get('/lich-su', xacThucToken, donHangController.layLichSuDonHang);
// Khách hủy đơn (trong 5 phút đầu)
router.put('/khach-hang-huy/:id', xacThucToken, donHangController.khachHangHuyDon);
// Kiểm tra mã giảm giá
router.post('/kiem-tra-ma', optionalAuth, donHangController.kiemTraMaGiamGia);

// --- NHÂN VIÊN ---
// Lấy tất cả đơn hàng
router.get('/tat-ca', xacThucNhanVien, donHangController.layTatCaDonHang);
// Cập nhật trạng thái đơn hàng
router.put('/:id/trang-thai', xacThucNhanVien, donHangController.capNhatTrangThai);

module.exports = router;
