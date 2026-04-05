const db = require('../config/db');

// THÊM MÓN ĂN VÀO GIỎ HÀNG
const themVaoGioHang = async (req, res) => {
    try {
        // Lấy mã người dùng từ "Bác bảo vệ" (middleware)
        const ma_nguoi_dung = req.user.id; 
        
        // Frontend gửi lên mã món ăn và số lượng muốn thêm
        const { ma_mon_an, so_luong } = req.body;

        if (!ma_mon_an || !so_luong || so_luong <= 0) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ!' });
        }

        // 1. Kiểm tra xem món ăn này có tồn tại trong cửa hàng không
        const [mon_an] = await db.query('SELECT * FROM MON_AN WHERE ma_mon_an = ? AND trang_thai = \'con_hang\'', [ma_mon_an]);
        if (mon_an.length === 0) {
            return res.status(404).json({ success: false, message: 'Món ăn không tồn tại hoặc đã hết hàng!' });
        }

        // 2. Kiểm tra xem món này đã có trong giỏ hàng của khách này chưa
        const [sanPhamTrongGio] = await db.query(
            'SELECT * FROM GIO_HANG WHERE ma_nguoi_dung = ? AND ma_mon_an = ?', 
            [ma_nguoi_dung, ma_mon_an]
        );

        if (sanPhamTrongGio.length > 0) {
            // NẾU ĐÃ CÓ: Cộng dồn số lượng
            const sqlUpdate = 'UPDATE GIO_HANG SET so_luong = so_luong + ? WHERE ma_nguoi_dung = ? AND ma_mon_an = ?';
            await db.query(sqlUpdate, [so_luong, ma_nguoi_dung, ma_mon_an]);
        } else {
            // NẾU CHƯA CÓ: Thêm dòng mới vào giỏ
            const sqlInsert = 'INSERT INTO GIO_HANG (ma_nguoi_dung, ma_mon_an, so_luong) VALUES (?, ?, ?)';
            await db.query(sqlInsert, [ma_nguoi_dung, ma_mon_an, so_luong]);
        }

        res.status(200).json({ success: true, message: 'Đã thêm món ăn vào giỏ hàng!' });
    } catch (error) {
        console.error('Lỗi thêm giỏ hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
// LẤY DANH SÁCH MÓN ĂN TRONG GIỎ HÀNG
const layGioHang = async (req, res) => {
    try {
        // Lấy mã người dùng từ Token
        const ma_nguoi_dung = req.user.id;

        // Câu lệnh JOIN: Kết hợp bảng GIO_HANG (gh) và MON_AN (m)
        // Đồng thời tự động nhân (Giá bán * Số lượng) để ra Thành tiền của từng món
        const sql = `
            SELECT 
                gh.ma_mon_an, 
                m.ten_mon, 
                m.hinh_anh, 
                m.gia_ban, 
                gh.so_luong, 
                (m.gia_ban * gh.so_luong) AS thanh_tien
            FROM GIO_HANG gh
            JOIN MON_AN m ON gh.ma_mon_an = m.ma_mon_an
            WHERE gh.ma_nguoi_dung = ?
        `;
        
        const [rows] = await db.query(sql, [ma_nguoi_dung]);

        // Tính tổng tiền của toàn bộ giỏ hàng (Cộng dồn tất cả các cột thanh_tien lại)
        const tong_tien_gio_hang = rows.reduce((tong, mon) => tong + Number(mon.thanh_tien), 0);

        res.status(200).json({ 
            success: true, 
            message: 'Lấy giỏ hàng thành công',
            data: rows,
            tong_tien: tong_tien_gio_hang
        });
    } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
// 3. CẬP NHẬT SỐ LƯỢNG MÓN ĂN (Khi bấm nút + hoặc -)
const capNhatSoLuong = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const { ma_mon_an, so_luong } = req.body;

        // Nếu số lượng truyền lên bé hơn 1 thì báo lỗi (Vì nếu = 0 thì gọi hàm Xóa cho chuẩn)
        if (!ma_mon_an || so_luong === undefined || so_luong < 1) {
            return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ!' });
        }

        const sqlUpdate = 'UPDATE GIO_HANG SET so_luong = ? WHERE ma_nguoi_dung = ? AND ma_mon_an = ?';
        const [result] = await db.query(sqlUpdate, [so_luong, ma_nguoi_dung, ma_mon_an]);

        // affectedRows là số dòng bị thay đổi trong DB. Nếu = 0 nghĩa là món đó không có trong giỏ
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn này trong giỏ hàng!' });
        }

        res.status(200).json({ success: true, message: 'Cập nhật số lượng thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 4. XÓA MÓN ĂN KHỎI GIỎ HÀNG (Khi bấm nút Thùng rác)
const xoaKhoiGioHang = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const ma_mon_an = req.params.id; // Lấy mã món ăn trực tiếp từ trên đường dẫn URL

        const sqlDelete = 'DELETE FROM GIO_HANG WHERE ma_nguoi_dung = ? AND ma_mon_an = ?';
        const [result] = await db.query(sqlDelete, [ma_nguoi_dung, ma_mon_an]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn này trong giỏ hàng!' });
        }

        res.status(200).json({ success: true, message: 'Đã xóa món ăn khỏi giỏ hàng!' });
    } catch (error) {
        console.error('Lỗi xóa giỏ hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    themVaoGioHang,
    layGioHang,
    capNhatSoLuong,
    xoaKhoiGioHang
};