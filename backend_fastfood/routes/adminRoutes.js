const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { xacThucToken, kiemTraAdmin } = require('../middleware/authMiddleware');

// Tất cả route admin đều cần xác thực + quyền quản trị
const protect = [xacThucToken, kiemTraAdmin];

// Dashboard
router.get('/dashboard', protect, adminController.getDashboardStats);

// Đơn hàng
router.get('/don-hang', protect, adminController.getAllDonHang);
router.put('/don-hang/:id/trang-thai', protect, adminController.capNhatTrangThaiDonHang);

// Món ăn
router.get('/mon-an', protect, adminController.getAllMonAn);
router.post('/mon-an', protect, adminController.themMonAn);
router.put('/mon-an/:id', protect, adminController.suaMonAn);
router.delete('/mon-an/:id', protect, adminController.xoaMonAn);

// Danh mục
router.get('/danh-muc', protect, adminController.getAllDanhMuc);
router.post('/danh-muc', protect, adminController.themDanhMuc);
router.put('/danh-muc/:id', protect, adminController.suaDanhMuc);
router.delete('/danh-muc/:id', protect, adminController.xoaDanhMuc);

// Người dùng
router.get('/nguoi-dung', protect, adminController.getAllNguoiDung);
router.put('/nguoi-dung/:id/vai-tro', protect, adminController.capNhatVaiTro);
router.delete('/nguoi-dung/:id', protect, adminController.xoaNguoiDung);

module.exports = router;
