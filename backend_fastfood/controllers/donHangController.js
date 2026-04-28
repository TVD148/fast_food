const db = require('../config/db');

// TẠO ĐƠN HÀNG MỚI (CHECKOUT)
const taoDonHang = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user ? req.user.id : null;
        
        const { 
            ho_ten_nguoi_nhan,
            dia_chi_giao_hang, 
            so_dien_thoai_giao, 
            ghi_chu, 
            phuong_thuc_thanh_toan,
            san_pham
        } = req.body;

        if (!ho_ten_nguoi_nhan || !dia_chi_giao_hang || !so_dien_thoai_giao || !san_pham || san_pham.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin giao hàng và đảm bảo giỏ hàng không trống!' });
        }

        // Lấy giá các món ăn từ database để tính tổng tiền bảo mật (tránh client sửa giá)
        const dsMaMonAn = san_pham.map(sp => sp.ma_mon_an);
        const placeholders = dsMaMonAn.map(() => '?').join(',');
        
        const sqlGiaBieu = `SELECT ma_mon_an, gia_ban FROM MON_AN WHERE ma_mon_an IN (${placeholders})`;
        const [giaBanList] = await db.query(sqlGiaBieu, dsMaMonAn);
        
        const mapGiaBan = {};
        giaBanList.forEach(m => {
             mapGiaBan[m.ma_mon_an] = m.gia_ban;
        });

        const sanPhamTrongGio = san_pham.map(sp => ({
            ...sp,
            gia_ban: mapGiaBan[sp.ma_mon_an] || 0
        }));

        const tong_tien = sanPhamTrongGio.reduce((tong, item) => tong + (item.gia_ban * item.so_luong), 0);

        const sqlDonHang = `
            INSERT INTO DON_HANG (ma_nguoi_dung, tong_tien, ho_ten_nguoi_nhan, dia_chi_giao_hang, so_dien_thoai_giao, ghi_chu, phuong_thuc_thanh_toan) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const pt_thanh_toan = phuong_thuc_thanh_toan || 'tien_mat'; 
        
        const [ketQuaDonHang] = await db.query(sqlDonHang, [
            ma_nguoi_dung, tong_tien, ho_ten_nguoi_nhan, dia_chi_giao_hang, so_dien_thoai_giao, ghi_chu, pt_thanh_toan
        ]);
        
        const ma_don_hang_moi = ketQuaDonHang.insertId;

        const sqlChiTiet = 'INSERT INTO CHI_TIET_DON_HANG (ma_don_hang, ma_mon_an, so_luong, gia_luc_mua) VALUES (?, ?, ?, ?)';
        for (let item of sanPhamTrongGio) {
            await db.query(sqlChiTiet, [ma_don_hang_moi, item.ma_mon_an, item.so_luong, item.gia_ban]);
        }

        // XÓA SẠCH GIỎ HÀNG trên database NẾU NGUỜI DÙNG ĐÃ ĐĂNG NHẬP
        if (ma_nguoi_dung) {
            await db.query('DELETE FROM GIO_HANG WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Đặt hàng thành công! Quán đang chuẩn bị món cho bạn.',
            ma_don_hang: ma_don_hang_moi
        });

    } catch (error) {
        console.error('Lỗi tạo đơn hàng - Chi tiết:', error.message, '| SQL:', error.sql, '| Code:', error.code);
        res.status(500).json({ success: false, message: 'Lỗi server khi đặt hàng: ' + error.message });
    }
};
// XEM LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH HÀNG
const layLichSuDonHang = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;

        // 1. Lấy danh sách tất cả các ĐƠN HÀNG (Hóa đơn mẹ) của người này
        // Sắp xếp theo ngay_dat DESC (Đơn hàng mới nhất lên đầu)
        const sqlDonHang = `SELECT * FROM DON_HANG WHERE ma_nguoi_dung = ? ORDER BY ngay_dat DESC`;
        const [danhSachDonHang] = await db.query(sqlDonHang, [ma_nguoi_dung]);

        // Nếu khách chưa từng mua hàng
        if (danhSachDonHang.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'Bạn chưa có đơn hàng nào.', 
                data: [] 
            });
        }

        // 2. Dùng vòng lặp mở từng tờ hóa đơn ra để lấy CHI TIẾT
        for (let i = 0; i < danhSachDonHang.length; i++) {
            const ma_don_hang = danhSachDonHang[i].ma_don_hang;

            // Truy vấn lấy Chi tiết đơn hàng + Nối với bảng Món Ăn để lấy Tên và Hình ảnh
            // Chú ý: Ta lấy "gia_luc_mua" ở bảng chi tiết để đảm bảo hóa đơn cũ không bị sai giá
            const sqlChiTiet = `
                SELECT 
                    ct.ma_mon_an, 
                    m.ten_mon, 
                    m.hinh_anh, 
                    ct.so_luong, 
                    ct.gia_luc_mua,
                    (ct.so_luong * ct.gia_luc_mua) AS thanh_tien
                FROM CHI_TIET_DON_HANG ct
                JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
                WHERE ct.ma_don_hang = ?
            `;
            
            const [chiTietDonHang] = await db.query(sqlChiTiet, [ma_don_hang]);

            // Gắn mảng chi tiết này vào bên trong object hóa đơn mẹ
            danhSachDonHang[i].chi_tiet = chiTietDonHang;
        }

        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử đơn hàng thành công',
            data: danhSachDonHang
        });

    } catch (error) {
        console.error('Lỗi lấy lịch sử đơn hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};


// [NHÂN VIÊN] LẤY TẤT CẢ ĐƠN HÀNG (kèm chi tiết món)
const layTatCaDonHang = async (req, res) => {
    try {
        const { trang_thai } = req.query;
        let sql = `
            SELECT dh.*, nd.ho_ten AS ten_khach
            FROM DON_HANG dh
            LEFT JOIN NGUOI_DUNG nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
        `;
        const params = [];
        if (trang_thai && trang_thai !== 'tat_ca') {
            sql += ' WHERE dh.trang_thai = ?';
            params.push(trang_thai);
        }
        sql += ' ORDER BY dh.ngay_dat DESC';

        const [danhSachDonHang] = await db.query(sql, params);

        // Lấy chi tiết từng đơn
        for (let i = 0; i < danhSachDonHang.length; i++) {
            const ma_don_hang = danhSachDonHang[i].ma_don_hang;
            const sqlChiTiet = `
                SELECT ct.ma_mon_an, m.ten_mon, m.hinh_anh, ct.so_luong, ct.gia_luc_mua,
                       (ct.so_luong * ct.gia_luc_mua) AS thanh_tien
                FROM CHI_TIET_DON_HANG ct
                JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
                WHERE ct.ma_don_hang = ?
            `;
            const [chiTiet] = await db.query(sqlChiTiet, [ma_don_hang]);
            danhSachDonHang[i].chi_tiet = chiTiet;
        }

        res.status(200).json({ success: true, data: danhSachDonHang });
    } catch (error) {
        console.error('Lỗi layTatCaDonHang:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// [NHÂN VIÊN] CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
const capNhatTrangThai = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;
        const dsHopLe = ['cho_duyet', 'dang_che_bien', 'dang_giao', 'hoan_thanh', 'da_huy'];
        if (!dsHopLe.includes(trang_thai)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
        }
        const [result] = await db.query('UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?', [trang_thai, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }
        res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
        console.error('Lỗi capNhatTrangThai:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    taoDonHang,
    layLichSuDonHang,
    layTatCaDonHang,
    capNhatTrangThai
};