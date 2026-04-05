const express = require('express');
const router = express.Router();
const monAnController = require('../controllers/monAnController');

router.get('/ban-chay', monAnController.getTop4MonAnTuanQua);
// Tạo đường dẫn GET /api/mon-an
router.get('/', monAnController.getDanhSachMonAn);

router.get('/danh-muc/:id', monAnController.getMonAnTheoDanhMuc);

module.exports = router;