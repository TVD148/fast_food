const express = require('express');
const router = express.Router();
const monAnController = require('../controllers/monAnController');
const { xacThucNhanVien } = require('../middleware/authMiddleware');

router.get('/ban-chay', monAnController.getTop4MonAnTuanQua);
// Tạo đường dẫn GET /api/mon-an
router.get('/', monAnController.getDanhSachMonAn);

router.get('/danh-muc/:id', monAnController.getMonAnTheoDanhMuc);

// [NHÂN VIÊN] Lấy tất cả món (kể cả hết hàng)
router.get('/nhan-vien/tat-ca', xacThucNhanVien, monAnController.layTatCaMonAnChoNhanVien);
// [NHÂN VIÊN] Toggle ẩn/hiện món ăn
router.put('/:id/trang-thai', xacThucNhanVien, monAnController.toggleTrangThaiMonAn);

module.exports = router;