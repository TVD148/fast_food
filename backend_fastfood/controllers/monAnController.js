const db = require('../config/db');

const getDanhSachMonAn = async (req, res) => {
    try {
        // Query lấy món ăn và tên danh mục tương ứng
        const sql = `
            SELECT m.*, d.ten_danh_muc,
                   NOT EXISTS (
                       SELECT 1 FROM cong_thuc_mon_an c 
                       JOIN nguyen_lieu n ON c.ma_nguyen_lieu = n.ma_nguyen_lieu 
                       WHERE c.ma_mon_an = m.ma_mon_an AND n.so_luong_ton < c.so_luong_can
                   ) AS co_the_ban
            FROM MON_AN m 
            LEFT JOIN DANH_MUC d ON m.ma_danh_muc = d.ma_danh_muc 
            WHERE m.trang_thai = 'con_hang'
        `;
        const [rows] = await db.query(sql);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách món ăn thành công',
            data: rows
        });
    } catch (error) {
        console.error('Lỗi lấy món ăn:', error);
        res.status(500).json({ success: false, message: 'Lỗi server Backend' });
    }
};
// LẤY DANH SÁCH MÓN ĂN THEO ID DANH MỤC
const getMonAnTheoDanhMuc = async (req, res) => {
    try {
        // Lấy ID danh mục từ đường dẫn URL (vd: /danh-muc/1 thì id = 1)
        const ma_danh_muc = req.params.id; 

        const sql = `
            SELECT m.*, d.ten_danh_muc,
                   NOT EXISTS (
                       SELECT 1 FROM cong_thuc_mon_an c 
                       JOIN nguyen_lieu n ON c.ma_nguyen_lieu = n.ma_nguyen_lieu 
                       WHERE c.ma_mon_an = m.ma_mon_an AND n.so_luong_ton < c.so_luong_can
                   ) AS co_the_ban
            FROM MON_AN m 
            JOIN DANH_MUC d ON m.ma_danh_muc = d.ma_danh_muc 
            WHERE m.trang_thai = 'con_hang' AND m.ma_danh_muc = ?
        `;
        // Truyền ma_danh_muc vào thay cho dấu ?
        const [rows] = await db.query(sql, [ma_danh_muc]);

        // Nếu danh mục đó chưa có món ăn nào
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không có món ăn nào hoặc danh mục không tồn tại!' 
            });
        }

        res.status(200).json({
            success: true,
            message: `Lấy danh sách món ăn thuộc danh mục thành công`,
            data: rows
        });
    } catch (error) {
        console.error('Lỗi lấy món ăn theo danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server Backend' });
    }
};
const getTop4MonAnTuanQua = async (req, res) => {
    try {
        // Query lấy 4 món bán chạy nhất trong 7 ngày qua, chỉ tính các đơn đã hoàn thành
        const query = `
            SELECT 
                m.ma_mon_an AS id, 
                m.ten_mon AS name, 
                m.hinh_anh AS image, 
                m.gia_ban AS price,
                SUM(c.so_luong) AS total_sold,
                NOT EXISTS (
                    SELECT 1 FROM cong_thuc_mon_an ct 
                    JOIN nguyen_lieu n ON ct.ma_nguyen_lieu = n.ma_nguyen_lieu 
                    WHERE ct.ma_mon_an = m.ma_mon_an AND n.so_luong_ton < ct.so_luong_can
                ) AS co_the_ban
            FROM MON_AN m
            JOIN CHI_TIET_DON_HANG c ON m.ma_mon_an = c.ma_mon_an
            JOIN DON_HANG d ON c.ma_don_hang = d.ma_don_hang
            WHERE d.ngay_dat >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
              AND d.trang_thai = 'hoan_thanh'
              AND m.trang_thai = 'con_hang'
            GROUP BY m.ma_mon_an
            ORDER BY total_sold DESC
            LIMIT 4;
        `;

        // Thực thi truy vấn
        const [rows] = await db.execute(query);

        // Trả kết quả về cho Postman
        res.status(200).json({
            success: true,
            message: "Lấy 4 món bán chạy nhất trong 1 tuần qua thành công",
            data: rows
        });
    } catch (error) {
        console.error("Lỗi getTop4MonAnTuanQua:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy dữ liệu món ăn bán chạy" 
        });
    }
};
// [NHÂN VIÊN] LẤY TẤT CẢ MÓN ĂN (KỂ CẢ HẾT HÀNG)
const layTatCaMonAnChoNhanVien = async (req, res) => {
    try {
        const sql = `
            SELECT m.*, d.ten_danh_muc 
            FROM MON_AN m 
            LEFT JOIN DANH_MUC d ON m.ma_danh_muc = d.ma_danh_muc
            ORDER BY m.ma_danh_muc, m.ten_mon
        `;
        const [rows] = await db.query(sql);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Lỗi layTatCaMonAnChoNhanVien:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// [NHÂN VIÊN] ẨN/HIỆN MÓN ĂN NHANH (toggle trang_thai)
const toggleTrangThaiMonAn = async (req, res) => {
    try {
        const { id } = req.params;
        // Lấy trạng thái hiện tại
        const [[monAn]] = await db.query('SELECT trang_thai FROM MON_AN WHERE ma_mon_an = ?', [id]);
        if (!monAn) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn!' });
        }
        const trangThaiMoi = monAn.trang_thai === 'con_hang' ? 'het_hang' : 'con_hang';
        await db.query('UPDATE MON_AN SET trang_thai = ? WHERE ma_mon_an = ?', [trangThaiMoi, id]);
        res.status(200).json({ 
            success: true, 
            message: trangThaiMoi === 'het_hang' ? 'Đã ẩn món khỏi menu!' : 'Đã hiển thị món trở lại!',
            trang_thai_moi: trangThaiMoi
        });
    } catch (error) {
        console.error('Lỗi toggleTrangThaiMonAn:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getDanhSachMonAn,
    getMonAnTheoDanhMuc,
    getTop4MonAnTuanQua,
    layTatCaMonAnChoNhanVien,
    toggleTrangThaiMonAn
};