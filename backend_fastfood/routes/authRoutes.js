const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { xacThucToken } = require('../middleware/authMiddleware');

router.post('/dang-ky', authController.dangKy);
router.post('/dang-nhap', authController.dangNhap);
router.post('/quen-mat-khau', authController.quenMatKhau);
router.post('/dat-lai-mat-khau', authController.datLaiMatKhau);
router.put('/doi-mat-khau', xacThucToken, authController.doiMatKhau);
router.put('/cap-nhat', xacThucToken, authController.capNhatThongTin);

module.exports = router;