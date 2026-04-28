const express = require('express');
const router = express.Router();
const donHangController = require('../controllers/donHangController');
const { xacThucToken, optionalAuth, xacThucNhanVien } = require('../middleware/authMiddleware');

// Khách hàng vãng lai vẫn có thể đặt hàng
router.post('/tao-don', optionalAuth, donHangController.taoDonHang);
// Xem lịch sử mua hàng
router.get('/lich-su', xacThucToken, donHangController.layLichSuDonHang);

// [NHÂN VIÊN] Lấy tất cả đơn hàng
router.get('/tat-ca', xacThucNhanVien, donHangController.layTatCaDonHang);
// [NHÂN VIÊN] Cập nhật trạng thái đơn hàng
router.put('/:id/trang-thai', xacThucNhanVien, donHangController.capNhatTrangThai);

module.exports = router;