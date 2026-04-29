const db = require('../config/db');

// ========== QUẢN LÝ NGUYÊN LIỆU ==========
const getAllNguyenLieu = async (req, res) => {
    try {
        const [nguyenLieus] = await db.query(`SELECT * FROM nguyen_lieu ORDER BY ma_nguyen_lieu DESC`);
        res.json({ success: true, data: nguyenLieus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const themNguyenLieu = async (req, res) => {
    try {
        const { ten_nguyen_lieu, don_vi_tinh, trang_thai } = req.body;
        if (!ten_nguyen_lieu || !don_vi_tinh) {
            return res.status(400).json({ success: false, message: 'Tên và đơn vị tính không được để trống!' });
        }
        const [result] = await db.query(
            'INSERT INTO nguyen_lieu (ten_nguyen_lieu, don_vi_tinh, trang_thai) VALUES (?, ?, ?)',
            [ten_nguyen_lieu, don_vi_tinh, trang_thai || 'hoat_dong']
        );
        res.status(201).json({ success: true, message: 'Thêm nguyên liệu thành công!', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const suaNguyenLieu = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_nguyen_lieu, don_vi_tinh, trang_thai } = req.body;
        if (!ten_nguyen_lieu || !don_vi_tinh) {
            return res.status(400).json({ success: false, message: 'Tên và đơn vị tính không được để trống!' });
        }
        await db.query(
            'UPDATE nguyen_lieu SET ten_nguyen_lieu=?, don_vi_tinh=?, trang_thai=? WHERE ma_nguyen_lieu=?',
            [ten_nguyen_lieu, don_vi_tinh, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật nguyên liệu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const xoaNguyenLieu = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM nguyen_lieu WHERE ma_nguyen_lieu = ?', [id]);
        res.json({ success: true, message: 'Xóa nguyên liệu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server - Có thể nguyên liệu này đang được sử dụng trong công thức' });
    }
};

// ========== NHẬP KHO ==========
const nhapKho = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { nguoi_nhap, ghi_chu, chi_tiet } = req.body;
        // chi_tiet: [{ma_nguyen_lieu, so_luong, don_gia}]

        if (!chi_tiet || chi_tiet.length === 0) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Danh sách nhập kho trống!' });
        }

        let tong_tien = 0;
        for (let item of chi_tiet) {
            tong_tien += item.so_luong * item.don_gia;
        }

        // 1. Tạo phiếu nhập kho
        const [phieu] = await conn.query(
            'INSERT INTO lich_su_nhap_kho (nguoi_nhap, tong_tien, ghi_chu) VALUES (?, ?, ?)',
            [nguoi_nhap || 'Admin', tong_tien, ghi_chu || null]
        );
        const ma_nhap_kho = phieu.insertId;

        // 2. Thêm chi tiết và Cập nhật số lượng tồn, giá nhập
        for (let item of chi_tiet) {
            await conn.query(
                'INSERT INTO chi_tiet_nhap_kho (ma_nhap_kho, ma_nguyen_lieu, so_luong, don_gia) VALUES (?, ?, ?, ?)',
                [ma_nhap_kho, item.ma_nguyen_lieu, item.so_luong, item.don_gia]
            );

            await conn.query(
                'UPDATE nguyen_lieu SET so_luong_ton = so_luong_ton + ?, gia_nhap_gan_nhat = ? WHERE ma_nguyen_lieu = ?',
                [item.so_luong, item.don_gia, item.ma_nguyen_lieu]
            );
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Nhập kho thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi nhập kho' });
    } finally {
        conn.release();
    }
};

const getLichSuNhapKho = async (req, res) => {
    try {
        const [lichSu] = await db.query('SELECT * FROM lich_su_nhap_kho ORDER BY ngay_nhap DESC');
        for (let phieu of lichSu) {
            const [chiTiet] = await db.query(`
                SELECT c.*, n.ten_nguyen_lieu, n.don_vi_tinh 
                FROM chi_tiet_nhap_kho c 
                JOIN nguyen_lieu n ON c.ma_nguyen_lieu = n.ma_nguyen_lieu 
                WHERE c.ma_nhap_kho = ?
            `, [phieu.ma_nhap_kho]);
            phieu.chi_tiet = chiTiet;
        }
        res.json({ success: true, data: lichSu });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getAllNguyenLieu,
    themNguyenLieu,
    suaNguyenLieu,
    xoaNguyenLieu,
    nhapKho,
    getLichSuNhapKho
};
