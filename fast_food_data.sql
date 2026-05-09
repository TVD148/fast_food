SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Data for `chi_tiet_don_hang` --
INSERT INTO `chi_tiet_don_hang` VALUES 
(1, 1, 1, 12, '12.00'),
(2, 2, 2, 20, '10.00'),
(3, 3, 3, 1, '5.00'),
(4, 3, 4, 1, '75000.00'),
(5, 3, 7, 1, '65000.00'),
(6, 3, 8, 1, '55000.00'),
(7, 4, 1, 1, '120000.00'),
(8, 4, 2, 1, '100000.00'),
(9, 4, 3, 1, '50000.00'),
(10, 4, 4, 1, '75000.00'),
(11, 5, 1, 1, '120000.00'),
(12, 6, 4, 1, '75000.00'),
(13, 7, 7, 1, '65000.00'),
(14, 7, 11, 1, '225000.00'),
(15, 8, 7, 1, '65000.00'),
(16, 8, 11, 1, '225000.00'),
(17, 8, 3, 1, '50000.00'),
(18, 9, 15, 1, '75000.00'),
(19, 9, 14, 1, '95000.00'),
(20, 10, 4, 1, '75000.00'),
(21, 10, 3, 1, '50000.00'),
(22, 11, 4, 1, '75000.00'),
(23, 11, 3, 1, '50000.00'),
(24, 11, 2, 1, '100000.00'),
(25, 12, 2, 1, '100000.00'),
(26, 12, 3, 1, '50000.00'),
(27, 12, 4, 2, '75000.00'),
(28, 13, 2, 2, '100000.00'),
(29, 13, 3, 1, '50000.00'),
(30, 13, 4, 3, '75000.00');

-- Data for `chi_tiet_nhap_kho` --
INSERT INTO `chi_tiet_nhap_kho` VALUES 
(1, 1, 1, '50.00', '150000.00');

-- Data for `chi_tiet_xuat_kho` --
INSERT INTO `chi_tiet_xuat_kho` VALUES 
(1, 1, 24, '111.00');

-- Data for `cong_thuc_mon_an` --
INSERT INTO `cong_thuc_mon_an` VALUES 
(1, 7, '1.00'),
(1, 8, '0.15'),
(1, 13, '1.00'),
(1, 14, '0.02'),
(1, 15, '0.02'),
(2, 7, '1.00'),
(2, 9, '0.12'),
(2, 14, '0.02'),
(2, 15, '0.02'),
(3, 19, '1.00'),
(3, 20, '0.02'),
(3, 21, '0.01'),
(4, 9, '0.20'),
(4, 17, '0.05'),
(4, 18, '0.03'),
(5, 9, '0.20'),
(5, 17, '0.05'),
(5, 18, '0.03'),
(6, 9, '0.20'),
(6, 17, '0.05'),
(6, 18, '0.03'),
(7, 9, '0.20'),
(7, 17, '0.05'),
(7, 18, '0.03'),
(8, 11, '0.10'),
(8, 12, '0.08'),
(9, 11, '0.10'),
(9, 12, '0.08'),
(10, 9, '0.30'),
(10, 10, '0.15'),
(10, 16, '0.50'),
(11, 11, '0.10'),
(11, 12, '0.08'),
(12, 7, '1.00'),
(12, 9, '0.12'),
(12, 14, '0.02'),
(12, 15, '0.02'),
(13, 7, '1.00'),
(13, 9, '0.12'),
(13, 14, '0.02'),
(13, 15, '0.02'),
(14, 7, '1.00'),
(14, 8, '0.15'),
(14, 13, '1.00'),
(14, 14, '0.02'),
(14, 15, '0.02'),
(15, 9, '0.10'),
(15, 18, '0.01'),
(16, 10, '0.25'),
(16, 18, '0.05'),
(17, 10, '0.25'),
(17, 18, '0.05'),
(18, 9, '0.10'),
(18, 18, '0.01'),
(19, 9, '0.10'),
(19, 18, '0.01'),
(20, 16, '0.30'),
(21, 22, '0.03'),
(21, 23, '0.05'),
(21, 24, '0.05'),
(22, 19, '1.00'),
(22, 20, '0.02'),
(22, 21, '0.01'),
(23, 7, '1.00'),
(23, 14, '0.02'),
(23, 15, '0.02');

-- Data for `danh_muc` --
INSERT INTO `danh_muc` VALUES 
(1, 'Burger', 'Các loại burger thơm ngon', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'),
(2, 'Đồ Uống', 'Nước giải khát, trà, cà phê', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop'),
(3, 'Gà Rán', NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop'),
(4, 'Combo', NULL, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop'),
(5, 'Mì Ý', NULL, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop'),
(7, 'Bánh Mì Kẹp', NULL, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop'),
(8, 'Ăn Vặt', NULL, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop');

-- Data for `dia_chi_nguoi_dung` --
INSERT INTO `dia_chi_nguoi_dung` VALUES 
(2, 3, 'Địa chỉ mới', 'Đường Bình Mỹ, Xã Bình Mỹ, Thành phố Hồ Chí Minh, Việt Nam', '99.99999999', '10.92447360', 0, '2026-05-08 16:07:12'),
(3, 3, 'Địa chỉ mới', 'ấp 21 hẻ, 8Xã Bình Mỹ, Thành phố Hồ Chí Minh, Việt Nam', '99.99999999', '10.98016650', 1, '2026-05-09 14:12:14');

-- Data for `don_hang` --
INSERT INTO `don_hang` VALUES 
(1, 3, '144.00', 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', NULL, NULL, '0911222333', '2026-03-14 12:43:06', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat', '', NULL, '0.00'),
(2, 3, '200.00', 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', NULL, NULL, '0911222333', '2026-03-14 15:08:56', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat', '', NULL, '0.00'),
(3, 3, '195005.00', 'da_huy', 'dadasdasd', NULL, NULL, '0987654321', '2026-03-15 12:57:27', 'cay', '', '', NULL, '0.00'),
(4, 3, '345000.00', 'hoan_thanh', 'sad', NULL, NULL, '0987654321', '2026-03-15 16:20:52', '', '', '', NULL, '0.00'),
(5, 3, '120000.00', 'dang_giao', '6B', NULL, NULL, '0911222333', '2026-03-15 16:38:27', '', 'tien_mat', '', NULL, '0.00'),
(6, 3, '75000.00', 'dang_giao', 's', NULL, NULL, '0911222333', '2026-03-15 16:41:50', '', 'the', '', NULL, '0.00'),
(7, 3, '290000.00', 'dang_giao', '3sadas12321231', NULL, NULL, '0911222333', '2026-04-04 15:50:10', '', 'tien_mat', 'Trần Văn Đình', NULL, '0.00'),
(8, 3, '340000.00', 'hoan_thanh', '3sadas12321231', NULL, NULL, '0911222333', '2026-04-12 11:34:31', '', 'tien_mat', 'Trần Văn Đình', NULL, '0.00'),
(9, 3, '170000.00', 'hoan_thanh', '3sadas12321231', NULL, NULL, '0911222333', '2026-04-12 13:29:01', '', 'tien_mat', 'Trần Văn Đình', NULL, '0.00'),
(10, 3, '125000.00', 'dang_che_bien', '3sadas12321231', NULL, NULL, '0911222333', '2026-04-27 07:16:32', '', 'tien_mat', 'Trần Văn Đình', NULL, '0.00'),
(11, 3, '225000.00', 'cho_duyet', '3sadas12321231', NULL, NULL, '0911222333', '2026-04-27 07:16:52', '', 'the', 'Trần Văn Đình', NULL, '0.00'),
(12, 3, '300000.00', 'da_huy', 'Đường Bình Mỹ, Xã Bình Mỹ, Thành phố Hồ Chí Minh, Việt Nam', '99.99999999', '10.92447360', '0911222333', '2026-05-09 13:56:09', '', 'tien_mat', 'Trần Văn Đình', NULL, '0.00'),
(13, 3, '425000.00', 'cho_duyet', 'ấp 21 hẻ, 8Xã Bình Mỹ, Thành phố Hồ Chí Minh, Việt Nam', '99.99999999', '10.98016650', '0911222333', '2026-05-09 15:49:08', '', 'tien_mat', 'Trần Văn Đình', 'SALE20', '50000.00');

-- Data for `gio_hang` --
INSERT INTO `gio_hang` VALUES 
(3, 3, 2),
(7, 3, 5);

-- Data for `lich_su_nhap_kho` --
INSERT INTO `lich_su_nhap_kho` VALUES 
(1, '2026-04-29 05:11:41', 'Admin', '7500000.00', 'Nhap kho dau thang');

-- Data for `lich_su_xuat_kho` --
INSERT INTO `lich_su_xuat_kho` VALUES 
(1, '2026-05-09 15:24:42', 'Admin', NULL);

-- Data for `ma_giam_gia` --
INSERT INTO `ma_giam_gia` VALUES 
('GIAM10K', 100, '10000.00', '50000.00', '2026-05-29 10:57:04', 999, 'hoat_dong'),
('SALE20', 20, '50000.00', '100000.00', '2026-05-29 10:57:04', 49, 'hoat_dong');

-- Data for `mon_an` --
INSERT INTO `mon_an` VALUES 
(1, 'Burger Bò Phô Mai', 'Bò nướng lửa hồng kèm phô mai', '120000.00', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500', 1, 'con_hang'),
(2, 'Burger Gà Giòn', 'Gà chiên giòn rụm', '100000.00', 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&q=80&w=500', 1, 'con_hang'),
(3, 'Trà Chanh Lạnh', 'Giải nhiệt mùa hè', '50000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=500', 2, 'con_hang'),
(4, 'Gà Rán Giòn Cay (2 Miếng)', NULL, '75000.00', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', 3, 'con_hang'),
(5, 'Gà Rán Truyền Thống (3 Miếng)', NULL, '105000.00', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=400&fit=crop', 3, 'con_hang'),
(6, 'Cánh Gà Sốt Chua Ngọt', NULL, '85000.00', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop', 3, 'con_hang'),
(7, 'Gà Giòn Không Xương', NULL, '65000.00', 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&h=400&fit=crop', 3, 'con_hang'),
(8, 'Mì Ý Sốt Bò Bằm Jollibee', NULL, '55000.00', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop', 5, 'con_hang'),
(9, 'Mì Ý Hải Sản Đút Lò', NULL, '95000.00', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop', 5, 'con_hang'),
(10, 'Combo Bữa Tiệc (6 Gà + 2 Khoai + 3 Nước)', NULL, '299000.00', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop', 4, 'con_hang'),
(11, 'Combo Siêu Gà (4 Gà + 2 Mì Ý)', NULL, '225000.00', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=400&fit=crop', 4, 'con_hang'),
(12, 'Combo Đôi Bạn (2 Gà + 1 Burger + 1 Khoai + 2 Nước)', NULL, '165000.00', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop', 4, 'con_hang'),
(13, 'Burger Gà Zinger Cay', NULL, '65000.00', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop', 1, 'con_hang'),
(14, 'Burger Bò Pho Mát', NULL, '95000.00', 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop', 1, 'con_hang'),
(15, 'Sandwich Kẹp Thịt Nướng', NULL, '75000.00', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop', 7, 'con_hang'),
(16, 'Khoai Tây Chiên (Lớn)', NULL, '40000.00', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop', 8, 'con_hang'),
(17, 'Khoai Tây Lắc Phô Mai', NULL, '50000.00', 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=400&fit=crop', 8, 'con_hang'),
(18, 'Súp Gà Ngô Non', NULL, '25000.00', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop', 8, 'con_hang'),
(19, 'Bắp Cải Trộn (Coleslaw)', NULL, '20000.00', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', 8, 'con_hang'),
(20, 'Pepsi / Coca Cola (Cốc Lớn)', NULL, '25000.00', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop', 2, 'con_hang'),
(21, 'Trà Sữa Thái Xanh', '', '35000.00', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop', 2, 'con_hang'),
(22, 'Lipton Đá Chanh', NULL, '25000.00', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop', 2, 'con_hang'),
(23, 'Burger Bo Moi', NULL, '150000.00', NULL, NULL, 'con_hang');

-- Data for `nguoi_dung` --
INSERT INTO `nguoi_dung` VALUES 
(3, 'Trần Văn Đình', 'sv21233@gmail.com', 'dinhtran', '0911222333', NULL, 'data:image/jpeg;base64,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', 'nhan_vien', NULL, NULL, '2026-03-14 05:12:35', 'hoat_dong', NULL),
(7, 'tvd', '231@gmail.com', '123456', NULL, NULL, NULL, 'quan_tri', NULL, NULL, '2026-03-16 13:47:04', 'hoat_dong', NULL);

-- Data for `nguyen_lieu` --
INSERT INTO `nguyen_lieu` VALUES 
(1, 'Thit Bo My', 'kg', '100.00', '150000.00', 'hoat_dong'),
(2, 'Thịt & Thực phẩm chính', 'kg', '9999.00', '15000.00', 'hoat_dong'),
(3, 'Rau củ các loại', 'kg', '9999.00', '15000.00', 'hoat_dong'),
(4, 'Gia vị & Sốt', 'lít', '9999.00', '15000.00', 'hoat_dong'),
(5, 'Bánh & Bột', 'kg', '9999.00', '15000.00', 'hoat_dong'),
(6, 'Nước giải khát', 'lon/chai', '9999.00', '15000.00', 'hoat_dong'),
(7, 'Bánh mì Burger', 'cái', '498.00', '5000.00', 'hoat_dong'),
(8, 'Thịt bò xay', 'kg', '500.00', '220000.00', 'hoat_dong'),
(9, 'Thịt gà tươi', 'kg', '499.16', '95000.00', 'hoat_dong'),
(10, 'Khoai tây tươi', 'kg', '500.00', '35000.00', 'hoat_dong'),
(11, 'Mì Ý (Dry)', 'kg', '500.00', '45000.00', 'hoat_dong'),
(12, 'Sốt bò bằm (Hũ)', 'kg', '500.00', '80000.00', 'hoat_dong'),
(13, 'Phô mai lát', 'miếng', '500.00', '8000.00', 'hoat_dong'),
(14, 'Xà lách tươi', 'kg', '499.96', '30000.00', 'hoat_dong'),
(15, 'Cà chua', 'kg', '499.96', '25000.00', 'hoat_dong'),
(16, 'Nước ngọt (Syrup)', 'lít', '500.00', '120000.00', 'hoat_dong'),
(17, 'Bột chiên xù', 'kg', '499.85', '40000.00', 'hoat_dong'),
(18, 'Dầu ăn', 'lít', '499.91', '45000.00', 'hoat_dong'),
(19, 'Trà túi lọc', 'gói', '499.00', '2000.00', 'hoat_dong'),
(20, 'Đường cát', 'kg', '499.98', '22000.00', 'hoat_dong'),
(21, 'Chanh tươi', 'kg', '499.99', '30000.00', 'hoat_dong'),
(22, 'Bột trà sữa Thái', 'kg', '500.00', '150000.00', 'hoat_dong'),
(23, 'Sữa đặc', 'hộp', '500.00', '18000.00', 'hoat_dong'),
(24, 'Trân châu đen', 'kg', '389.00', '60000.00', 'hoat_dong');

SET FOREIGN_KEY_CHECKS = 1;
