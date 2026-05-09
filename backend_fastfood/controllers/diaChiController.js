const db = require('../config/db');

// 1. LẤY DANH SÁCH ĐỊA CHỈ CỦA USER
const layDanhSach = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM dia_chi_nguoi_dung WHERE ma_nguoi_dung = ? ORDER BY la_mac_dinh DESC, ngay_tao DESC',
            [ma_nguoi_dung]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 2. THÊM ĐỊA CHỈ MỚI
const themDiaChi = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const { ten_goi_nho, dia_chi_chi_tiet, kinh_do, vi_do, la_mac_dinh } = req.body;

        if (!dia_chi_chi_tiet) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ chi tiết!' });
        }

        // Nếu đặt là mặc định, reset các cái khác
        if (la_mac_dinh) {
            await db.query('UPDATE dia_chi_nguoi_dung SET la_mac_dinh = FALSE WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        }

        // Nếu là địa chỉ đầu tiên, tự động cho làm mặc định
        const [existing] = await db.query('SELECT * FROM dia_chi_nguoi_dung WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        const setAsDefault = existing.length === 0 ? true : la_mac_dinh;

        await db.query(
            'INSERT INTO dia_chi_nguoi_dung (ma_nguoi_dung, ten_goi_nho, dia_chi_chi_tiet, kinh_do, vi_do, la_mac_dinh) VALUES (?, ?, ?, ?, ?, ?)',
            [ma_nguoi_dung, ten_goi_nho || 'Địa chỉ mới', dia_chi_chi_tiet, kinh_do, vi_do, setAsDefault]
        );

        res.json({ success: true, message: 'Thêm địa chỉ thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 3. CẬP NHẬT ĐỊA CHỈ
const capNhatDiaChi = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const { id } = req.params;
        const { ten_goi_nho, dia_chi_chi_tiet, kinh_do, vi_do, la_mac_dinh } = req.body;

        if (la_mac_dinh) {
            await db.query('UPDATE dia_chi_nguoi_dung SET la_mac_dinh = FALSE WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        }

        await db.query(
            'UPDATE dia_chi_nguoi_dung SET ten_goi_nho = ?, dia_chi_chi_tiet = ?, kinh_do = ?, vi_do = ?, la_mac_dinh = ? WHERE ma_dia_chi = ? AND ma_nguoi_dung = ?',
            [ten_goi_nho, dia_chi_chi_tiet, kinh_do, vi_do, la_mac_dinh, id, ma_nguoi_dung]
        );

        res.json({ success: true, message: 'Cập nhật địa chỉ thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 4. XÓA ĐỊA CHỈ
const xoaDiaChi = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const { id } = req.params;

        // Không cho xóa nếu là địa chỉ mặc định duy nhất (hoặc bắt chọn cái khác làm mặc định trước)
        const [target] = await db.query('SELECT la_mac_dinh FROM dia_chi_nguoi_dung WHERE ma_dia_chi = ? AND ma_nguoi_dung = ?', [id, ma_nguoi_dung]);
        if (target.length > 0 && target[0].la_mac_dinh) {
            // Thử chọn 1 cái khác làm mặc định
            const [others] = await db.query('SELECT ma_dia_chi FROM dia_chi_nguoi_dung WHERE ma_nguoi_dung = ? AND ma_dia_chi != ? LIMIT 1', [ma_nguoi_dung, id]);
            if (others.length > 0) {
                await db.query('UPDATE dia_chi_nguoi_dung SET la_mac_dinh = TRUE WHERE ma_dia_chi = ?', [others[0].ma_dia_chi]);
            }
        }

        await db.query('DELETE FROM dia_chi_nguoi_dung WHERE ma_dia_chi = ? AND ma_nguoi_dung = ?', [id, ma_nguoi_dung]);
        res.json({ success: true, message: 'Xóa địa chỉ thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 5. ĐẶT MẶC ĐỊNH
const datMacDinh = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const { id } = req.params;

        await db.query('UPDATE dia_chi_nguoi_dung SET la_mac_dinh = FALSE WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        await db.query('UPDATE dia_chi_nguoi_dung SET la_mac_dinh = TRUE WHERE ma_dia_chi = ? AND ma_nguoi_dung = ?', [id, ma_nguoi_dung]);

        res.json({ success: true, message: 'Đã đặt làm địa chỉ mặc định!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    layDanhSach,
    themDiaChi,
    capNhatDiaChi,
    xoaDiaChi,
    datMacDinh
};
