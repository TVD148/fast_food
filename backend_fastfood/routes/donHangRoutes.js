const express = require('express');
const router = express.Router();
const donHangController = require('../controllers/donHangController');
const { xacThucToken, optionalAuth } = require('../middleware/authMiddleware');

// Khách hàng vãng lai vẫn có thể đặt hàng
router.post('/tao-don', optionalAuth, donHangController.taoDonHang);
// Xem lịch sử mua hàng
router.get('/lich-su', xacThucToken, donHangController.layLichSuDonHang);

module.exports = router;