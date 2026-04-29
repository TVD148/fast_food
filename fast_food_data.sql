-- Dữ liệu mẫu database Fast Food
-- Tác giả: Antigravity AI
-- Thời gian tạo: 2026-04-27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `danh_muc`
-- --------------------------------------------------------
INSERT INTO `danh_muc` (`ma_danh_muc`, `ten_danh_muc`, `mo_ta`, `hinh_anh`) VALUES
(1, 'Burger', 'Các loại burger thơm ngon', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'),
(2, 'Đồ Uống', 'Nước giải khát, trà, cà phê', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop'),
(3, 'Gà Rán', NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop'),
(4, 'Combo', NULL, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop'),
(5, 'Mì Ý', NULL, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop'),
(7, 'Bánh Mì Kẹp', NULL, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop'),
(8, 'Ăn Vặt', NULL, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop');

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `mon_an`
-- --------------------------------------------------------
INSERT INTO `mon_an` (`ma_mon_an`, `ten_mon`, `mo_ta`, `gia_ban`, `hinh_anh`, `ma_danh_muc`, `trang_thai`) VALUES
(1, 'Burger Bò Phô Mai', 'Bò nướng lửa hồng kèm phô mai', 120000.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500', 1, 'con_hang'),
(2, 'Burger Gà Giòn', 'Gà chiên giòn rụm', 100000.00, 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&q=80&w=500', 1, 'con_hang'),
(3, 'Trà Chanh Lạnh', 'Giải nhiệt mùa hè', 50000.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=500', 2, 'con_hang'),
(4, 'Gà Rán Giòn Cay (2 Miếng)', NULL, 75000.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', 3, 'con_hang'),
(5, 'Gà Rán Truyền Thống (3 Miếng)', NULL, 105000.00, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=400&fit=crop', 3, 'con_hang'),
(6, 'Cánh Gà Sốt Chua Ngọt', NULL, 85000.00, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop', 3, 'con_hang'),
(7, 'Gà Giòn Không Xương', NULL, 65000.00, 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&h=400&fit=crop', 3, 'con_hang'),
(8, 'Mì Ý Sốt Bò Bằm Jollibee', NULL, 55000.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop', 5, 'con_hang'),
(9, 'Mì Ý Hải Sản Đút Lò', NULL, 95000.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop', 5, 'con_hang'),
(10, 'Combo Bữa Tiệc (6 Gà + 2 Khoai + 3 Nước)', NULL, 299000.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop', 4, 'con_hang'),
(11, 'Combo Siêu Gà (4 Gà + 2 Mì Ý)', NULL, 225000.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=400&fit=crop', 4, 'con_hang'),
(12, 'Combo Đôi Bạn (2 Gà + 1 Burger + 1 Khoai + 2 Nước)', NULL, 165000.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop', 4, 'con_hang'),
(13, 'Burger Gà Zinger Cay', NULL, 65000.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop', 1, 'con_hang'),
(14, 'Burger Bò Pho Mát', NULL, 95000.00, 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop', 1, 'con_hang'),
(15, 'Sandwich Kẹp Thịt Nướng', NULL, 75000.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop', 7, 'con_hang'),
(16, 'Khoai Tây Chiên (Lớn)', NULL, 40000.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop', 8, 'con_hang'),
(17, 'Khoai Tây Lắc Phô Mai', NULL, 50000.00, 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=400&fit=crop', 8, 'con_hang'),
(18, 'Súp Gà Ngô Non', NULL, 25000.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop', 8, 'con_hang'),
(19, 'Bắp Cải Trộn (Coleslaw)', NULL, 20000.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', 8, 'con_hang'),
(20, 'Pepsi / Coca Cola (Cốc Lớn)', NULL, 25000.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop', 2, 'con_hang'),
(21, 'Trà Sữa Thái Xanh', NULL, 35000.00, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop', 2, 'con_hang'),
(22, 'Lipton Đá Chanh', NULL, 25000.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop', 2, 'con_hang');

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `nguoi_dung`
-- --------------------------------------------------------
INSERT INTO `nguoi_dung` (`ma_nguoi_dung`, `ho_ten`, `email`, `mat_khau`, `so_dien_thoai`, `dia_chi`, `vai_tro`, `ngay_tao`) VALUES
(3, 'Trần Văn Đình', 'sv21233@gmail.com', 'dinhtran', '0911222333', '3sadas12321231', 'khach_hang', '2026-03-14 12:12:35'),
(7, 'tvd', '231@gmail.com', '123456', NULL, NULL, 'khach_hang', '2026-03-16 20:47:04');

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `don_hang`
-- --------------------------------------------------------
INSERT INTO `don_hang` (`ma_don_hang`, `ma_nguoi_dung`, `tong_tien`, `trang_thai`, `dia_chi_giao_hang`, `so_dien_thoai_giao`, `ngay_dat`, `ghi_chu`, `phuong_thuc_thanh_toan`, `ho_ten_nguoi_nhan`) VALUES
(1, 3, 144.00, 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', '0911222333', '2026-03-14 19:43:06', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat', ''),
(2, 3, 200.00, 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', '0911222333', '2026-03-14 22:08:56', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat', ''),
(4, 3, 345000.00, 'hoan_thanh', 'sad', '0987654321', '2026-03-15 23:20:52', '', '', ''),
(5, 3, 120000.00, 'dang_giao', '6B', '0911222333', '2026-03-15 23:38:27', '', 'tien_mat', ''),
(6, 3, 75000.00, 'cho_duyet', 's', '0911222333', '2026-03-15 23:41:50', '', 'the', '');

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `chi_tiet_don_hang`
-- --------------------------------------------------------
INSERT INTO `chi_tiet_don_hang` (`ma_chi_tiet`, `ma_don_hang`, `ma_mon_an`, `so_luong`, `gia_luc_mua`) VALUES
(1, 1, 1, 12, 12.00),
(2, 2, 2, 20, 10.00),
(7, 4, 1, 1, 120000.00),
(8, 4, 2, 1, 100000.00),
(9, 4, 3, 1, 50000.00),
(10, 4, 4, 1, 75000.00),
(11, 5, 1, 1, 120000.00),
(12, 6, 4, 1, 75000.00);

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `ma_giam_gia`
-- --------------------------------------------------------
INSERT INTO `ma_giam_gia` (`ma_giam_gia_id`, `code`, `loai_giam`, `gia_tri_giam`, `don_toi_thieu`, `giam_toi_da`, `tong_so_luong`, `da_dung`, `ngay_bat_dau`, `ngay_ket_thuc`) VALUES
(1, 'GIAM20K', 'tien_mat', 20000.00, 100000.00, NULL, 100, 0, '2026-03-01 00:00:00', '2026-12-31 23:59:59'),
(2, 'GIAM10PT', 'phan_tram', 10.00, 150000.00, 50000.00, 50, 0, '2026-03-01 00:00:00', '2026-12-31 23:59:59');

-- --------------------------------------------------------
-- Đổ dữ liệu cho bảng `gio_hang`
-- --------------------------------------------------------
INSERT INTO `gio_hang` (`ma_nguoi_dung`, `ma_mon_an`, `so_luong`) VALUES
(7, 3, 5);

COMMIT;
