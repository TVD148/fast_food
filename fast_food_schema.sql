SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `chi_tiet_don_hang`;
CREATE TABLE `chi_tiet_don_hang` (
  `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `gia_luc_mua` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `ma_don_hang` (`ma_don_hang`),
  KEY `ma_mon_an` (`ma_mon_an`),
  CONSTRAINT `chi_tiet_don_hang_ibfk_1` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  CONSTRAINT `chi_tiet_don_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `chi_tiet_nhap_kho`;
CREATE TABLE `chi_tiet_nhap_kho` (
  `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT,
  `ma_nhap_kho` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
  `so_luong` decimal(10,2) NOT NULL,
  `don_gia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `ma_nhap_kho` (`ma_nhap_kho`),
  KEY `ma_nguyen_lieu` (`ma_nguyen_lieu`),
  CONSTRAINT `chi_tiet_nhap_kho_ibfk_1` FOREIGN KEY (`ma_nhap_kho`) REFERENCES `lich_su_nhap_kho` (`ma_nhap_kho`) ON DELETE CASCADE,
  CONSTRAINT `chi_tiet_nhap_kho_ibfk_2` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `chi_tiet_xuat_kho`;
CREATE TABLE `chi_tiet_xuat_kho` (
  `ma_chi_tiet` int(11) NOT NULL AUTO_INCREMENT,
  `ma_xuat_kho` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
  `so_luong` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctxk_xuatkho` (`ma_xuat_kho`),
  KEY `fk_ctxk_nguyenlieu` (`ma_nguyen_lieu`),
  CONSTRAINT `fk_ctxk_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctxk_xuatkho` FOREIGN KEY (`ma_xuat_kho`) REFERENCES `lich_su_xuat_kho` (`ma_xuat_kho`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cong_thuc_mon_an`;
CREATE TABLE `cong_thuc_mon_an` (
  `ma_mon_an` int(11) NOT NULL,
  `ma_nguyen_lieu` int(11) NOT NULL,
  `so_luong_can` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ma_mon_an`,`ma_nguyen_lieu`),
  KEY `ma_nguyen_lieu` (`ma_nguyen_lieu`),
  CONSTRAINT `cong_thuc_mon_an_ibfk_1` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE,
  CONSTRAINT `cong_thuc_mon_an_ibfk_2` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `danh_muc`;
CREATE TABLE `danh_muc` (
  `ma_danh_muc` int(11) NOT NULL AUTO_INCREMENT,
  `ten_danh_muc` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `dia_chi_nguoi_dung`;
CREATE TABLE `dia_chi_nguoi_dung` (
  `ma_dia_chi` int(11) NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int(11) NOT NULL,
  `ten_goi_nho` varchar(100) DEFAULT 'Địa chỉ của tôi',
  `dia_chi_chi_tiet` text NOT NULL,
  `kinh_do` decimal(10,8) DEFAULT NULL,
  `vi_do` decimal(11,8) DEFAULT NULL,
  `la_mac_dinh` tinyint(1) DEFAULT 0,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`ma_dia_chi`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  CONSTRAINT `dia_chi_nguoi_dung_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `don_hang`;
CREATE TABLE `don_hang` (
  `ma_don_hang` int(11) NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int(11) DEFAULT NULL,
  `tong_tien` decimal(10,2) NOT NULL,
  `trang_thai` enum('cho_duyet','dang_che_bien','dang_giao','hoan_thanh','da_huy') NOT NULL DEFAULT 'cho_duyet',
  `dia_chi_giao_hang` text NOT NULL,
  `kinh_do` decimal(10,8) DEFAULT NULL,
  `vi_do` decimal(11,8) DEFAULT NULL,
  `so_dien_thoai_giao` varchar(20) NOT NULL,
  `ngay_dat` datetime DEFAULT current_timestamp(),
  `ghi_chu` text DEFAULT NULL,
  `phuong_thuc_thanh_toan` enum('tien_mat','the','momo') DEFAULT 'tien_mat',
  `ho_ten_nguoi_nhan` varchar(150) NOT NULL DEFAULT '',
  `ma_giam_gia` varchar(50) DEFAULT NULL,
  `so_tien_giam` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`ma_don_hang`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  CONSTRAINT `don_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `gio_hang`;
CREATE TABLE `gio_hang` (
  `ma_nguoi_dung` int(11) NOT NULL,
  `ma_mon_an` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`ma_nguoi_dung`,`ma_mon_an`),
  KEY `ma_mon_an` (`ma_mon_an`),
  CONSTRAINT `gio_hang_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `gio_hang_ibfk_2` FOREIGN KEY (`ma_mon_an`) REFERENCES `mon_an` (`ma_mon_an`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lich_su_nhap_kho`;
CREATE TABLE `lich_su_nhap_kho` (
  `ma_nhap_kho` int(11) NOT NULL AUTO_INCREMENT,
  `ngay_nhap` datetime DEFAULT current_timestamp(),
  `nguoi_nhap` varchar(255) DEFAULT NULL,
  `tong_tien` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ghi_chu` text DEFAULT NULL,
  PRIMARY KEY (`ma_nhap_kho`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lich_su_xuat_kho`;
CREATE TABLE `lich_su_xuat_kho` (
  `ma_xuat_kho` int(11) NOT NULL AUTO_INCREMENT,
  `ngay_xuat` datetime DEFAULT current_timestamp(),
  `nguoi_xuat` varchar(255) DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  PRIMARY KEY (`ma_xuat_kho`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ma_giam_gia`;
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

DROP TABLE IF EXISTS `mon_an`;
CREATE TABLE `mon_an` (
  `ma_mon_an` int(11) NOT NULL AUTO_INCREMENT,
  `ten_mon` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `gia_ban` decimal(10,2) NOT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `ma_danh_muc` int(11) DEFAULT NULL,
  `trang_thai` enum('con_hang','het_hang') NOT NULL DEFAULT 'con_hang',
  PRIMARY KEY (`ma_mon_an`),
  KEY `ma_danh_muc` (`ma_danh_muc`),
  CONSTRAINT `mon_an_ibfk_1` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `nguoi_dung`;
CREATE TABLE `nguoi_dung` (
  `ma_nguoi_dung` int(11) NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `hinh_anh` longtext DEFAULT NULL,
  `vai_tro` enum('khach_hang','nhan_vien','quan_tri') NOT NULL DEFAULT 'khach_hang',
  `token_quen_mat_khau` varchar(255) DEFAULT NULL,
  `han_token` datetime DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `trang_thai` enum('hoat_dong','bi_khoa','bi_cam') NOT NULL DEFAULT 'hoat_dong',
  `khoa_den_ngay` datetime DEFAULT NULL,
  PRIMARY KEY (`ma_nguoi_dung`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `uk_sdt` (`so_dien_thoai`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `nguyen_lieu`;
CREATE TABLE `nguyen_lieu` (
  `ma_nguyen_lieu` int(11) NOT NULL AUTO_INCREMENT,
  `ten_nguyen_lieu` varchar(255) NOT NULL,
  `don_vi_tinh` varchar(50) NOT NULL,
  `so_luong_ton` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gia_nhap_gan_nhat` decimal(10,2) NOT NULL DEFAULT 0.00,
  `trang_thai` enum('hoat_dong','ngung_su_dung') NOT NULL DEFAULT 'hoat_dong',
  PRIMARY KEY (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
