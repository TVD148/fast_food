-- Schema database Fast Food
-- Tác giả: Antigravity AI
-- Thời gian tạo: 2026-04-27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Cấu trúc bảng `danh_muc`
-- --------------------------------------------------------
CREATE TABLE `danh_muc` (
  `ma_danh_muc` int(11) NOT NULL AUTO_INCREMENT,
  `ten_danh_muc` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ma_danh_muc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `mon_an`
-- --------------------------------------------------------
CREATE TABLE `mon_an` (
  `ma_mon_an` int(11) NOT NULL AUTO_INCREMENT,
  `ten_mon` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `gia_ban` decimal(10,2) NOT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `ma_danh_muc` int(11) DEFAULT NULL,
  `trang_thai` enum('dang_ban','ngung_ban') NOT NULL DEFAULT 'dang_ban',
  PRIMARY KEY (`ma_mon_an`),
  KEY `ma_danh_muc` (`ma_danh_muc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `nguoi_dung`
-- --------------------------------------------------------
CREATE TABLE `nguoi_dung` (
  `ma_nguoi_dung` int(11) NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `vai_tro` enum('khach_hang','nhan_vien','quan_tri') NOT NULL DEFAULT 'khach_hang',
  `trang_thai` enum('hoat_dong','bi_khoa','bi_cam') NOT NULL DEFAULT 'hoat_dong',
  `token_quen_mat_khau` varchar(255) DEFAULT NULL,
  `han_token` datetime DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`ma_nguoi_dung`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uk_sdt` (`so_dien_thoai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `don_hang`
-- --------------------------------------------------------
CREATE TABLE `don_hang` (
  `ma_don_hang` int(11) NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int(11) NOT NULL,
  `tong_tien` decimal(10,2) NOT NULL,
  `trang_thai` enum('cho_duyet','dang_giao','hoan_thanh','da_huy') DEFAULT 'cho_duyet',
  `dia_chi_giao_hang` text NOT NULL,
  `so_dien_thoai_giao` varchar(20) NOT NULL,
  `ngay_dat` datetime DEFAULT current_timestamp(),
  `ghi_chu` text DEFAULT NULL,
  `phuong_thuc_thanh_toan` enum('tien_mat','the','momo') DEFAULT 'tien_mat',
  `ho_ten_nguoi_nhan` varchar(150) NOT NULL DEFAULT '',
  `ma_giam_gia` varchar(50) DEFAULT NULL,
  `so_tien_giam` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`ma_don_hang`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `chi_tiet_don_hang`
-- --------------------------------------------------------
CREATE TABLE `chi_tiet_don_hang` (
  `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `gia_luc_mua` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `ma_don_hang` (`ma_don_hang`),
  KEY `ma_mon_an` (`ma_mon_an`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `chi_tiet_thanh_toan`
-- --------------------------------------------------------
CREATE TABLE `chi_tiet_thanh_toan` (
  `ma_thanh_toan` int(11) NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int(11) NOT NULL,
  `ma_giao_dich_doi_tac` varchar(255) DEFAULT NULL COMMENT 'Mã giao dịch từ Momo/VNPay',
  `so_tien` decimal(10,2) NOT NULL,
  `ngay_thanh_toan` datetime DEFAULT current_timestamp(),
  `ket_qua` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ma_thanh_toan`),
  KEY `ma_don_hang` (`ma_don_hang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `danh_gia`
-- --------------------------------------------------------
CREATE TABLE `danh_gia` (
  `ma_danh_gia` int(11) NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_sao` tinyint(1) NOT NULL CHECK (`so_sao` between 1 and 5),
  `noi_dung` text DEFAULT NULL,
  `ngay_danh_gia` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`ma_danh_gia`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  KEY `ma_mon_an` (`ma_mon_an`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `gio_hang`
-- --------------------------------------------------------
CREATE TABLE `gio_hang` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`ma_nguoi_dung`,`ma_mon_an`),
  KEY `ma_mon_an` (`ma_mon_an`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `ma_giam_gia`
-- --------------------------------------------------------
CREATE TABLE `ma_giam_gia` (
  `ma_giam_gia_id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `loai_giam` enum('tien_mat','phan_tram') NOT NULL DEFAULT 'tien_mat',
  `gia_tri_giam` decimal(10,2) NOT NULL,
  `don_toi_thieu` decimal(10,2) DEFAULT 0.00,
  `giam_toi_da` decimal(10,2) DEFAULT NULL,
  `tong_so_luong` int(11) NOT NULL DEFAULT 1,
  `da_dung` int(11) NOT NULL DEFAULT 0,
  `ngay_bat_dau` datetime DEFAULT NULL,
  `ngay_ket_thuc` datetime DEFAULT NULL,
  PRIMARY KEY (`ma_giam_gia_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `mon_yeu_thich`
-- --------------------------------------------------------
CREATE TABLE `mon_yeu_thich` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `ngay_them` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`ma_nguoi_dung`,`ma_mon_an`),
  KEY `fk_yeuthich_monan` (`ma_mon_an`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `nguyen_lieu`
-- --------------------------------------------------------
CREATE TABLE `nguyen_lieu` (
  `ma_nguyen_lieu` INT AUTO_INCREMENT PRIMARY KEY,
  `ten_nguyen_lieu` VARCHAR(255) NOT NULL,
  `don_vi_tinh` VARCHAR(50) NOT NULL,
  `so_luong_ton` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `gia_nhap_gan_nhat` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `trang_thai` ENUM('hoat_dong', 'ngung_su_dung') NOT NULL DEFAULT 'hoat_dong'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `lich_su_nhap_kho`
-- --------------------------------------------------------
CREATE TABLE `lich_su_nhap_kho` (
  `ma_nhap_kho` INT AUTO_INCREMENT PRIMARY KEY,
  `ngay_nhap` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `nguoi_nhap` VARCHAR(255),
  `tong_tien` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `ghi_chu` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `chi_tiet_nhap_kho`
-- --------------------------------------------------------
CREATE TABLE `chi_tiet_nhap_kho` (
  `ma_chi_tiet` INT AUTO_INCREMENT PRIMARY KEY,
  `ma_nhap_kho` INT NOT NULL,
  `ma_nguyen_lieu` INT NOT NULL,
  `so_luong` DECIMAL(10,2) NOT NULL,
  `don_gia` DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cấu trúc bảng `cong_thuc_mon_an`
-- --------------------------------------------------------
CREATE TABLE `cong_thuc_mon_an` (
  `ma_mon_an` INT NOT NULL,
  `ma_nguyen_lieu` INT NOT NULL,
  `so_luong_can` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`ma_mon_an`, `ma_nguyen_lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Ràng buộc (Foreign Keys)
-- --------------------------------------------------------
ALTER TABLE `mon_an`
  ADD CONSTRAINT `mon_an_ibfk_1` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`) ON DELETE SET NULL;

ALTER TABLE `don_hang`
  ADD CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE;

ALTER TABLE `chi_tiet_don_hang`
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_1` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_don_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE;

ALTER TABLE `chi_tiet_thanh_toan`
  ADD CONSTRAINT `fk_thanhtoan_donhang` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE;

ALTER TABLE `danh_gia`
  ADD CONSTRAINT `fk_danhgia_monan` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_danhgia_nguoidung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE;

ALTER TABLE `gio_hang`
  ADD CONSTRAINT `gio_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  ADD CONSTRAINT `gio_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE;

ALTER TABLE `mon_yeu_thich`
  ADD CONSTRAINT `fk_yeuthich_monan` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_yeuthich_nguoidung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE;

ALTER TABLE `chi_tiet_nhap_kho`
  ADD CONSTRAINT `fk_ctnk_nhapkho` FOREIGN KEY (`ma_nhap_kho`) REFERENCES `lich_su_nhap_kho` (`ma_nhap_kho`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctnk_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE;

ALTER TABLE `cong_thuc_mon_an`
  ADD CONSTRAINT `fk_ctma_monan` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctma_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------
-- Cấu trúc bảng `ma_giam_gia`
-- --------------------------------------------------------
CREATE TABLE `ma_giam_gia` (
  `ma_code` varchar(50) NOT NULL,
  `phan_tram_giam` int(11) NOT NULL DEFAULT 0,
  `giam_toi_da` decimal(10,2) NOT NULL DEFAULT 0.00,
  `don_toi_thieu` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ngay_het_han` datetime NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 100,
  `trang_thai` enum('hoat_dong','ngung_hoat_dong') DEFAULT 'hoat_dong',
  PRIMARY KEY (`ma_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
