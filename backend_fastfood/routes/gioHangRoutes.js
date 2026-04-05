const express = require('express');
const router = express.Router();
const gioHangController = require('../controllers/gioHangController');

// Phải gọi Bác bảo vệ xacThucToken ra gác cổng
const { xacThucToken } = require('../middleware/authMiddleware');

// lấy danh sách giỏ hàng
router.get('/', xacThucToken, gioHangController.layGioHang);
// Khách phải có token mới được thêm vào giỏ
router.post('/them', xacThucToken, gioHangController.themVaoGioHang);
// Cập nhật số lượng món ăn trong giỏ
router.put('/cap-nhat', xacThucToken, gioHangController.capNhatSoLuong);
// Xóa món ăn khỏi giỏ hàng
router.delete('/xoa/:id', xacThucToken, gioHangController.xoaKhoiGioHang);

module.exports = router;