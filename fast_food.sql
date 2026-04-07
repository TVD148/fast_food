-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 07, 2026 at 08:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fast_food`
--

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_don_hang`
--

CREATE TABLE `chi_tiet_don_hang` (
  `ma_chi_tiet` int(11) NOT NULL,
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `gia_luc_mua` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chi_tiet_don_hang`
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
-- Table structure for table `chi_tiet_thanh_toan`
--

CREATE TABLE `chi_tiet_thanh_toan` (
  `ma_thanh_toan` int(11) NOT NULL,
  `ma_don_hang` int(11) NOT NULL,
  `ma_giao_dich_doi_tac` varchar(255) DEFAULT NULL COMMENT 'Mã giao dịch từ Momo/VNPay',
  `so_tien` decimal(10,2) NOT NULL,
  `ngay_thanh_toan` datetime DEFAULT current_timestamp(),
  `ket_qua` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `danh_gia`
--

CREATE TABLE `danh_gia` (
  `ma_danh_gia` int(11) NOT NULL,
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_sao` tinyint(1) NOT NULL CHECK (`so_sao` between 1 and 5),
  `noi_dung` text DEFAULT NULL,
  `ngay_danh_gia` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `danh_muc`
--

CREATE TABLE `danh_muc` (
  `ma_danh_muc` int(11) NOT NULL,
  `ten_danh_muc` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `danh_muc`
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
-- Table structure for table `don_hang`
--

CREATE TABLE `don_hang` (
  `ma_don_hang` int(11) NOT NULL,
  `ma_nguoi_dung` int(11) NOT NULL,
  `tong_tien` decimal(10,2) NOT NULL,
  `ma_giam_gia_id` int(11) DEFAULT NULL,
  `so_tien_giam` decimal(10,2) DEFAULT 0.00,
  `trang_thai` enum('cho_duyet','dang_giao','hoan_thanh','da_huy') DEFAULT 'cho_duyet',
  `dia_chi_giao_hang` text NOT NULL,
  `so_dien_thoai_giao` varchar(20) NOT NULL,
  `ngay_dat` datetime DEFAULT current_timestamp(),
  `ngay_cap_nhat` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ghi_chu` text DEFAULT NULL,
  `phuong_thuc_thanh_toan` enum('tien_mat','the','momo') DEFAULT 'tien_mat',
  `trang_thai_thanh_toan` enum('chua_thanh_toan','da_thanh_toan','that_bai','hoan_tien') DEFAULT 'chua_thanh_toan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `don_hang`
--

INSERT INTO `don_hang` (`ma_don_hang`, `ma_nguoi_dung`, `tong_tien`, `ma_giam_gia_id`, `so_tien_giam`, `trang_thai`, `dia_chi_giao_hang`, `so_dien_thoai_giao`, `ngay_dat`, `ngay_cap_nhat`, `ghi_chu`, `phuong_thuc_thanh_toan`, `trang_thai_thanh_toan`) VALUES
(1, 3, 144.00, NULL, 0.00, 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', '0911222333', '2026-03-14 19:43:06', '2026-03-31 14:06:50', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat', 'chua_thanh_toan'),
(2, 3, 200.00, NULL, 0.00, 'hoan_thanh', 'Số 10, Đường ABC, Phường XYZ, Nam Định', '0911222333', '2026-03-14 22:08:56', '2026-03-31 14:06:50', 'Cho em thêm xíu tương ớt, không lấy hành nha shop', 'tien_mat', 'chua_thanh_toan'),
(3, 3, 195005.00, NULL, 0.00, 'da_huy', 'dadasdasd', '0987654321', '2026-03-15 19:57:27', '2026-03-31 14:06:50', 'cay', '', 'chua_thanh_toan'),
(4, 3, 345000.00, NULL, 0.00, 'hoan_thanh', 'sad', '0987654321', '2026-03-15 23:20:52', '2026-03-31 14:06:50', '', '', 'chua_thanh_toan'),
(5, 3, 120000.00, NULL, 0.00, 'dang_giao', '6B', '0911222333', '2026-03-15 23:38:27', '2026-03-31 14:06:50', '', 'tien_mat', 'chua_thanh_toan'),
(6, 3, 75000.00, NULL, 0.00, 'cho_duyet', 's', '0911222333', '2026-03-15 23:41:50', '2026-03-31 14:06:50', '', 'the', 'chua_thanh_toan');

-- --------------------------------------------------------

--
-- Table structure for table `gio_hang`
--

CREATE TABLE `gio_hang` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gio_hang`
--

INSERT INTO `gio_hang` (`ma_nguoi_dung`, `ma_mon_an`, `so_luong`) VALUES
(3, 7, 1),
(3, 11, 1),
(7, 3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `ma_giam_gia`
--

CREATE TABLE `ma_giam_gia` (
  `ma_giam_gia_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `loai_giam` enum('tien_mat','phan_tram') NOT NULL DEFAULT 'tien_mat',
  `gia_tri_giam` decimal(10,2) NOT NULL,
  `don_toi_thieu` decimal(10,2) DEFAULT 0.00,
  `giam_toi_da` decimal(10,2) DEFAULT NULL,
  `tong_so_luong` int(11) NOT NULL DEFAULT 1,
  `da_dung` int(11) NOT NULL DEFAULT 0,
  `ngay_bat_dau` datetime DEFAULT NULL,
  `ngay_ket_thuc` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ma_giam_gia`
--

INSERT INTO `ma_giam_gia` (`ma_giam_gia_id`, `code`, `loai_giam`, `gia_tri_giam`, `don_toi_thieu`, `giam_toi_da`, `tong_so_luong`, `da_dung`, `ngay_bat_dau`, `ngay_ket_thuc`) VALUES
(1, 'GIAM20K', 'tien_mat', 20000.00, 100000.00, NULL, 100, 0, '2026-03-01 00:00:00', '2026-12-31 23:59:59'),
(2, 'GIAM10PT', 'phan_tram', 10.00, 150000.00, 50000.00, 50, 0, '2026-03-01 00:00:00', '2026-12-31 23:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `mon_an`
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
-- Dumping data for table `mon_an`
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
-- Table structure for table `mon_yeu_thich`
--

CREATE TABLE `mon_yeu_thich` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `ngay_them` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nguoi_dung`
--

CREATE TABLE `nguoi_dung` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `anh_dai_dien` varchar(255) DEFAULT NULL,
  `vai_tro` enum('khach_hang','nhan_vien','quan_tri') NOT NULL DEFAULT 'khach_hang',
  `token_quen_mat_khau` varchar(255) DEFAULT NULL,
  `han_token` datetime DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nguoi_dung`
--

INSERT INTO `nguoi_dung` (`ma_nguoi_dung`, `ho_ten`, `email`, `mat_khau`, `so_dien_thoai`, `dia_chi`, `anh_dai_dien`, `vai_tro`, `token_quen_mat_khau`, `han_token`, `ngay_tao`) VALUES
(3, 'Trần Văn Đình', 'windt0011sv2@gmail.com', 'dinhtran', '0911222333', '3sadas12321231', NULL, 'khach_hang', NULL, NULL, '2026-03-14 12:12:35'),
(4, 'Trần Văn Đình', 'dinh@gmail.com', '123456', NULL, NULL, NULL, 'khach_hang', NULL, NULL, '2026-03-14 12:15:45'),
(5, 'Trần Văn TOÀN', NULL, '123456', '0911222334', NULL, NULL, 'khach_hang', NULL, NULL, '2026-03-14 21:12:19'),
(7, 'mai hương', NULL, '123456', '0339259573', NULL, NULL, 'khach_hang', NULL, NULL, '2026-03-31 14:10:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD PRIMARY KEY (`ma_chi_tiet`),
  ADD KEY `ma_don_hang` (`ma_don_hang`),
  ADD KEY `ma_mon_an` (`ma_mon_an`);

--
-- Indexes for table `chi_tiet_thanh_toan`
--
ALTER TABLE `chi_tiet_thanh_toan`
  ADD PRIMARY KEY (`ma_thanh_toan`),
  ADD KEY `ma_don_hang` (`ma_don_hang`);

--
-- Indexes for table `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD PRIMARY KEY (`ma_danh_gia`),
  ADD KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  ADD KEY `ma_mon_an` (`ma_mon_an`);

--
-- Indexes for table `danh_muc`
--
ALTER TABLE `danh_muc`
  ADD PRIMARY KEY (`ma_danh_muc`);

--
-- Indexes for table `don_hang`
--
ALTER TABLE `don_hang`
  ADD PRIMARY KEY (`ma_don_hang`),
  ADD KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  ADD KEY `don_hang_ibfk_2` (`ma_giam_gia_id`);

--
-- Indexes for table `gio_hang`
--
ALTER TABLE `gio_hang`
  ADD PRIMARY KEY (`ma_nguoi_dung`,`ma_mon_an`),
  ADD KEY `ma_mon_an` (`ma_mon_an`);

--
-- Indexes for table `ma_giam_gia`
--
ALTER TABLE `ma_giam_gia`
  ADD PRIMARY KEY (`ma_giam_gia_id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `mon_an`
--
ALTER TABLE `mon_an`
  ADD PRIMARY KEY (`ma_mon_an`),
  ADD KEY `ma_danh_muc` (`ma_danh_muc`);

--
-- Indexes for table `mon_yeu_thich`
--
ALTER TABLE `mon_yeu_thich`
  ADD PRIMARY KEY (`ma_nguoi_dung`,`ma_mon_an`),
  ADD KEY `fk_yeuthich_monan` (`ma_mon_an`);

--
-- Indexes for table `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  ADD PRIMARY KEY (`ma_nguoi_dung`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `uk_sdt` (`so_dien_thoai`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  MODIFY `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `chi_tiet_thanh_toan`
--
ALTER TABLE `chi_tiet_thanh_toan`
  MODIFY `ma_thanh_toan` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `danh_gia`
--
ALTER TABLE `danh_gia`
  MODIFY `ma_danh_gia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `danh_muc`
--
ALTER TABLE `danh_muc`
  MODIFY `ma_danh_muc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `don_hang`
--
ALTER TABLE `don_hang`
  MODIFY `ma_don_hang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ma_giam_gia`
--
ALTER TABLE `ma_giam_gia`
  MODIFY `ma_giam_gia_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `mon_an`
--
ALTER TABLE `mon_an`
  MODIFY `ma_mon_an` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `nguoi_dung`
--
ALTER TABLE `nguoi_dung`
  MODIFY `ma_nguoi_dung` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chi_tiet_don_hang`
--
ALTER TABLE `chi_tiet_don_hang`
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_1` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE;

--
-- Constraints for table `chi_tiet_thanh_toan`
--
ALTER TABLE `chi_tiet_thanh_toan`
  ADD CONSTRAINT `fk_thanhtoan_donhang` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE;

--
-- Constraints for table `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD CONSTRAINT `fk_danhgia_monan` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_danhgia_nguoidung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE;

--
-- Constraints for table `don_hang`
--
ALTER TABLE `don_hang`
  ADD CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  ADD CONSTRAINT `don_hang_ibfk_2` FOREIGN KEY (`ma_giam_gia_id`) REFERENCES `ma_giam_gia` (`ma_giam_gia_id`) ON DELETE SET NULL;

--
-- Constraints for table `gio_hang`
--
ALTER TABLE `gio_hang`
  ADD CONSTRAINT `gio_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  ADD CONSTRAINT `gio_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE;

--
-- Constraints for table `mon_an`
--
ALTER TABLE `mon_an`
  ADD CONSTRAINT `mon_an_ibfk_1` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`) ON DELETE SET NULL;

--
-- Constraints for table `mon_yeu_thich`
--
ALTER TABLE `mon_yeu_thich`
  ADD CONSTRAINT `fk_yeuthich_monan` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_yeuthich_nguoidung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
