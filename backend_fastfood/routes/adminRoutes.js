const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const inventoryController = require('../controllers/inventoryController');
const { xacThucToken, kiemTraAdmin } = require('../middleware/authMiddleware');

// Tất cả route admin đều cần xác thực + quyền quản trị
const protect = [xacThucToken, kiemTraAdmin];

// Dashboard
router.get('/dashboard', protect, adminController.getDashboardStats);
router.get('/dashboard/doanh-thu', protect, adminController.getDoanhThuChart);

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
router.put('/nguoi-dung/:id/trang-thai', protect, adminController.khoaTaiKhoan);
router.delete('/nguoi-dung/:id', protect, adminController.xoaNguoiDung);

// Quản lý Kho Hàng
router.get('/nguyen-lieu', protect, inventoryController.getAllNguyenLieu);
router.post('/nguyen-lieu', protect, inventoryController.themNguyenLieu);
router.put('/nguyen-lieu/:id', protect, inventoryController.suaNguyenLieu);
router.delete('/nguyen-lieu/:id', protect, inventoryController.xoaNguyenLieu);

// Nhập kho
router.post('/nhap-kho', protect, inventoryController.nhapKho);
router.get('/lich-su-nhap-kho', protect, inventoryController.getLichSuNhapKho);

module.exports = router;
