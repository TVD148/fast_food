-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 16, 2026 lúc 01:44 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12
-- chay lệnh trước mới import
-- CREATE DATABASE IF NOT EXISTS fast_food DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE fast_food;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `fast_food`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_don_hang`
--

CREATE TABLE `chi_tiet_don_hang` (
  `ma_chi_tiet` int(11) NOT NULL,
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `gia_luc_mua` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chi_tiet_don_hang`
--

INSERT INTO `chi_tiet_don_hang` (`ma_chi_tiet`, `ma_don_hang`, `ma_mon_an`, `so_luong`, `gia_luc_mua`) VALUES
(1, 1, 1, 12, 12.00),
(2, 2, 2, 20, 10.00),
(3, 3, 3, 1, 5.00),
(4, 3, 4, 1, 75000.00),
(5, 3, 7, 1, 65000.00),
(6, 3, 8, 1, 55000.00),
(7, 4, 1, 1, 120000.00),
(8, 4, 2, 1, 100000.00),
(9, 4, 3, 1, 50000.00),
(10, 4, 4, 1, 75000.00),
(11, 5, 1, 1, 120000.00),
(12, 6, 4, 1, 75000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danh_muc`
--

CREATE TABLE `danh_muc` (
  `ma_danh_muc` int(11) NOT NULL,
  `ten_danh_muc` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `danh_muc`
--

INSERT INTO `danh_muc` (`ma_danh_muc`, `ten_danh_muc`, `mo_ta`, `hinh_anh`) VALUES
(1, 'Burger', 'Các loại burger thơm ngon', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'),
(2, 'Đồ Uống', 'Nước giải khát, trà, cà phê', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop'),
(3, 'Gà Rán', NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop'),
(4, 'Combo', NULL, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop'),
(5, 'Mì Ý', NULL, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop'),
(7, 'Bánh Mì Kẹp', NULL, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop'),
(8, 'Ăn Vặt', NULL, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `don_hang`
--

CREATE TABLE `don_hang` (
  `ma_don_hang` int(11) NOT NULL,
  `ma_nguoi_dung` int(11) NOT NULL,
  `tong_tien` decimal(10,2) NOT NULL,
  `trang_thai` enum('cho_duyet','dang_giao','hoan_thanh','da_huy') DEFAULT 'cho_duyet',
  `dia_chi_giao_hang` text NOT NULL,
  `so_dien_thoai_giao` varchar(20) NOT NULL,
  `ngay_dat` datetime DEFAULT current_timestamp(),
  `ghi_chu` text DEFAULT NULL,
  `phuong_thuc_thanh_toan` enum('tien_mat','the','momo') DEFAULT 'tien_mat'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `don_hang`
--

INSERT INTO `don_hang` (`ma_don_hang`, `ma_nguoi_dung`, `tong_tien`, `trang_thai`, `dia_chi_giao_hang`, `so_dien_thoai_giao`, `ngay_dat`, `ghi_chu`, `phuong_thuc_thanh_toan`) VALUES
(1, 3, 144.00, 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', '0911222333', '2026-03-14 19:43:06', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat'),
(2, 3, 200.00, 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', '0911222333', '2026-03-14 22:08:56', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat'),
(3, 3, 195005.00, 'da_huy', 'dadasdasd', '0987654321', '2026-03-15 19:57:27', 'cay', ''),
(4, 3, 345000.00, 'hoan_thanh', 'sad', '0987654321', '2026-03-15 23:20:52', '', ''),
(5, 3, 120000.00, 'dang_giao', '6B', '0911222333', '2026-03-15 23:38:27', '', 'tien_mat'),
(6, 3, 75000.00, 'cho_duyet', 's', '0911222333', '2026-03-15 23:41:50', '', 'the');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `gio_hang`
--

CREATE TABLE `gio_hang` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `gio_hang`
--

INSERT INTO `gio_hang` (`ma_nguoi_dung`, `ma_mon_an`, `so_luong`) VALUES
(3, 7, 1),
(3, 11, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mon_an`
--

CREATE TABLE `mon_an` (
  `ma_mon_an` int(11) NOT NULL,
  `ten_mon` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `gia_ban` decimal(10,2) NOT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `ma_danh_muc` int(11) DEFAULT NULL,
  `trang_thai` enum('con_hang','het_hang') NOT NULL DEFAULT 'con_hang'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mon_an`
--

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

--
-- Cấu trúc bảng cho bảng `nguoi_dung`
--

CREATE TABLE `nguoi_dung` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `vai_tro` enum('khach_hang','nhan_vien','quan_tri') NOT NULL DEFAULT 'khach_hang',
  `token_quen_mat_khau` varchar(255) DEFAULT NULL,
  `han_token` datetime DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoi_dung`
--

INSERT INTO `nguoi_dung` (`ma_nguoi_dung`, `ho_ten`, `email`, `mat_khau`, `so_dien_thoai`, `dia_chi`, `vai_tro`, `token_quen_mat_khau`, `han_token`, `ngay_tao`) VALUES
(3, 'Trần Văn Đình', 'windt0011sv2@gmail.com', 'dinhtran', '0911222333', '3sadas12321231', 'khach_hang', NULL, NULL, '2026-03-14 12:12:35'),
(4, 'Trần Văn Đình', 'dinh@gmail.com', '123456', NULL, NULL, 'khach_hang', NULL, NULL, '2026-03-14 12:15:45'),
(5, 'Trần Văn TOÀN', NULL, '123456', '0911222334', NULL, 'khach_hang', NULL, NULL, '2026-03-14 21:12:19');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD PRIMARY KEY (`ma_chi_tiet`),
  ADD KEY `ma_don_hang` (`ma_don_hang`),
  ADD KEY `ma_mon_an` (`ma_mon_an`);

--
-- Chỉ mục cho bảng `danh_muc`
--
ALTER TABLE `danh_muc`
  ADD PRIMARY KEY (`ma_danh_muc`);

--
-- Chỉ mục cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  ADD PRIMARY KEY (`ma_don_hang`),
  ADD KEY `ma_nguoi_dung` (`ma_nguoi_dung`);

--
-- Chỉ mục cho bảng `gio_hang`
--
ALTER TABLE `gio_hang`
  ADD PRIMARY KEY (`ma_nguoi_dung`,`ma_mon_an`),
  ADD KEY `ma_mon_an` (`ma_mon_an`);

--
-- Chỉ mục cho bảng `mon_an`
--
ALTER TABLE `mon_an`
  ADD PRIMARY KEY (`ma_mon_an`),
  ADD KEY `ma_danh_muc` (`ma_danh_muc`);

--
-- Chỉ mục cho bảng `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  ADD PRIMARY KEY (`ma_nguoi_dung`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `uk_sdt` (`so_dien_thoai`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  MODIFY `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `danh_muc`
--
ALTER TABLE `danh_muc`
  MODIFY `ma_danh_muc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  MODIFY `ma_don_hang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `mon_an`
--
ALTER TABLE `mon_an`
  MODIFY `ma_mon_an` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  MODIFY `ma_nguoi_dung` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_1` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `don_hang`
--
ALTER TABLE `don_hang`
  ADD CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `gio_hang`
--
ALTER TABLE `gio_hang`
  ADD CONSTRAINT `gio_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  ADD CONSTRAINT `gio_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `mon_an`
--
ALTER TABLE `mon_an`
  ADD CONSTRAINT `mon_an_ibfk_1` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
