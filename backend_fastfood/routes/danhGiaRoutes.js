const express = require('express');
const router = express.Router();
const danhGiaController = require('../controllers/danhGiaController');

// Import middleware để chặn những ai chưa đăng nhập
const { xacThucToken } = require('../middleware/authMiddleware');

// API tạo đánh giá mới (Cần có token ở Header)
router.post('/tao-moi', xacThucToken, danhGiaController.taoDanhGia);

module.exports = router;