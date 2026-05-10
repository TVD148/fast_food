const express = require('express');
const router = express.Router();
const diaChiController = require('../controllers/diaChiController');
const { xacThucToken } = require('../middleware/authMiddleware');

router.use(xacThucToken); // Tất cả các route địa chỉ đều cần đăng nhập

router.get('/', diaChiController.layDanhSach);
router.post('/', diaChiController.themDiaChi);
router.put('/:id', diaChiController.capNhatDiaChi);
router.delete('/:id', diaChiController.xoaDiaChi);
router.patch('/:id/mac-dinh', diaChiController.datMacDinh);

module.exports = router;
