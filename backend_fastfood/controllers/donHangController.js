const db = require('../config/db');

// TẠO ĐƠN HÀNG MỚI (CHECKOUT)
const taoDonHang = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const ma_nguoi_dung = req.user ? req.user.id : null;
        
        const { 
            ho_ten_nguoi_nhan,
            dia_chi_giao_hang, 
            so_dien_thoai_giao, 
            ghi_chu, 
            phuong_thuc_thanh_toan,
            san_pham,
            ma_giam_gia // Voucher code if any
        } = req.body;

        if (!ho_ten_nguoi_nhan || !dia_chi_giao_hang || !so_dien_thoai_giao || !san_pham || san_pham.length === 0) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin giao hàng và đảm bảo giỏ hàng không trống!' });
        }

        // Lấy giá các món ăn từ database để tính tổng tiền bảo mật (tránh client sửa giá)
        const dsMaMonAn = san_pham.map(sp => sp.ma_mon_an);
        const placeholders = dsMaMonAn.map(() => '?').join(',');
        
        const sqlGiaBieu = `SELECT ma_mon_an, gia_ban, ten_mon FROM MON_AN WHERE ma_mon_an IN (${placeholders})`;
        const [giaBanList] = await conn.query(sqlGiaBieu, dsMaMonAn);
        
        const mapGiaBan = {};
        const mapTenMon = {};
        giaBanList.forEach(m => {
             mapGiaBan[m.ma_mon_an] = m.gia_ban;
             mapTenMon[m.ma_mon_an] = m.ten_mon;
        });

        const sanPhamTrongGio = san_pham.map(sp => ({
            ...sp,
            gia_ban: mapGiaBan[sp.ma_mon_an] || 0,
            ten_mon: mapTenMon[sp.ma_mon_an] || 'Món ăn'
        }));

        // BƯỚC QUAN TRỌNG: KIỂM TRA VÀ TRỪ TỒN KHO NGUYÊN LIỆU
        // Tổng hợp tất cả nguyên liệu cần thiết cho toàn bộ giỏ hàng
        const yeuCauNguyenLieu = {}; // { ma_nguyen_lieu: tong_so_luong_can }
        
        for (let item of sanPhamTrongGio) {
            const [congThuc] = await conn.query('SELECT ma_nguyen_lieu, so_luong_can FROM cong_thuc_mon_an WHERE ma_mon_an = ?', [item.ma_mon_an]);
            
            if (congThuc.length === 0) {
                // Nếu món không có công thức, vẫn có thể bán (hoặc tùy logic doanh nghiệp)
                // Theo hệ thống mới, bắt buộc phải có, nhưng đề phòng dữ liệu cũ.
                continue;
            }

            for (let ct of congThuc) {
                if (!yeuCauNguyenLieu[ct.ma_nguyen_lieu]) yeuCauNguyenLieu[ct.ma_nguyen_lieu] = 0;
                yeuCauNguyenLieu[ct.ma_nguyen_lieu] += ct.so_luong_can * item.so_luong;
            }
        }

        // Kiểm tra tồn kho cho từng nguyên liệu yêu cầu
        for (const [ma_nguyen_lieu, tong_can] of Object.entries(yeuCauNguyenLieu)) {
            const [nl] = await conn.query('SELECT ten_nguyen_lieu, so_luong_ton FROM nguyen_lieu WHERE ma_nguyen_lieu = ? FOR UPDATE', [ma_nguyen_lieu]);
            if (nl.length === 0 || nl[0].so_luong_ton < tong_can) {
                await conn.rollback();
                await conn.release();
                return res.status(400).json({ 
                    success: false, 
                    message: `Xin lỗi, nhà hàng vừa hết nguyên liệu "${nl[0] ? nl[0].ten_nguyen_lieu : 'N/A'}". Vui lòng chọn món khác.` 
                });
            }
        }

        // Đã đủ nguyên liệu -> Tiến hành trừ kho
        for (const [ma_nguyen_lieu, tong_can] of Object.entries(yeuCauNguyenLieu)) {
            await conn.query('UPDATE nguyen_lieu SET so_luong_ton = so_luong_ton - ? WHERE ma_nguyen_lieu = ?', [tong_can, ma_nguyen_lieu]);
        }

        // Tính toán giảm giá nếu có mã giảm giá
        let so_tien_giam = 0;
        let ma_giam_gia_hop_le = null;
        const tong_tien_ban_dau = sanPhamTrongGio.reduce((tong, item) => tong + (item.gia_ban * item.so_luong), 0);

        if (ma_giam_gia) {
            const [voucher] = await conn.query('SELECT * FROM ma_giam_gia WHERE ma_code = ? AND trang_thai = "hoat_dong" AND ngay_het_han >= NOW() AND so_luong > 0 FOR UPDATE', [ma_giam_gia]);
            if (voucher.length > 0) {
                const v = voucher[0];
                if (tong_tien_ban_dau >= v.don_toi_thieu) {
                    so_tien_giam = Math.min(tong_tien_ban_dau * (v.phan_tram_giam / 100), v.giam_toi_da);
                    ma_giam_gia_hop_le = v.ma_code;
                    // Trừ số lượng mã giảm giá
                    await conn.query('UPDATE ma_giam_gia SET so_luong = so_luong - 1 WHERE ma_code = ?', [v.ma_code]);
                }
            }
        }

        const tong_tien_thanh_toan = Math.max(tong_tien_ban_dau - so_tien_giam, 0);

        const sqlDonHang = `
            INSERT INTO DON_HANG (ma_nguoi_dung, tong_tien, ho_ten_nguoi_nhan, dia_chi_giao_hang, so_dien_thoai_giao, ghi_chu, phuong_thuc_thanh_toan, ma_giam_gia, so_tien_giam) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const pt_thanh_toan = phuong_thuc_thanh_toan || 'tien_mat'; 
        
        const [ketQuaDonHang] = await conn.query(sqlDonHang, [
            ma_nguoi_dung, tong_tien_thanh_toan, ho_ten_nguoi_nhan, dia_chi_giao_hang, so_dien_thoai_giao, ghi_chu, pt_thanh_toan, ma_giam_gia_hop_le, so_tien_giam
        ]);
        
        const ma_don_hang_moi = ketQuaDonHang.insertId;

        const sqlChiTiet = 'INSERT INTO CHI_TIET_DON_HANG (ma_don_hang, ma_mon_an, so_luong, gia_luc_mua) VALUES (?, ?, ?, ?)';
        for (let item of sanPhamTrongGio) {
            await conn.query(sqlChiTiet, [ma_don_hang_moi, item.ma_mon_an, item.so_luong, item.gia_ban]);
        }

        // XÓA SẠCH GIỎ HÀNG trên database NẾU NGUỜI DÙNG ĐÃ ĐĂNG NHẬP
        if (ma_nguoi_dung) {
            await conn.query('DELETE FROM GIO_HANG WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        }

        await conn.commit();
        res.status(200).json({ 
            success: true, 
            message: 'Đặt hàng thành công! Quán đang chuẩn bị món cho bạn.',
            ma_don_hang: ma_don_hang_moi
        });

    } catch (error) {
        await conn.rollback();
        console.error('Lỗi tạo đơn hàng - Chi tiết:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server khi đặt hàng: ' + error.message });
    } finally {
        conn.release();
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

const khachHangHuyDon = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const ma_don_hang = req.params.id;
        const ma_nguoi_dung = req.user.id;

        // Fetch order to check status and time
        const [donHang] = await conn.query('SELECT trang_thai, ngay_dat FROM DON_HANG WHERE ma_don_hang = ? AND ma_nguoi_dung = ? FOR UPDATE', [ma_don_hang, ma_nguoi_dung]);
        
        if (donHang.length === 0) {
            await conn.release();
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const dh = donHang[0];
        
        if (dh.trang_thai !== 'cho_duyet') {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Đơn hàng đã được tiếp nhận hoặc đang giao, không thể hủy!' });
        }

        const now = new Date();
        const orderTime = new Date(dh.ngay_dat);
        const diffMs = now - orderTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins > 5) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Đã quá 5 phút kể từ lúc đặt hàng, hệ thống không cho phép hủy tự động.' });
        }

        // Update status
        await conn.query('UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?', ['da_huy', ma_don_hang]);

        // Refund inventory
        const [chiTiet] = await conn.query(`
            SELECT ct.ma_mon_an, ct.so_luong, c.ma_nguyen_lieu, c.so_luong_can 
            FROM CHI_TIET_DON_HANG ct 
            JOIN cong_thuc_mon_an c ON ct.ma_mon_an = c.ma_mon_an 
            WHERE ct.ma_don_hang = ?
        `, [ma_don_hang]);

        const hoanTra = {};
        for (let row of chiTiet) {
            if (!hoanTra[row.ma_nguyen_lieu]) hoanTra[row.ma_nguyen_lieu] = 0;
            hoanTra[row.ma_nguyen_lieu] += row.so_luong * row.so_luong_can;
        }

        for (const [ma_nguyen_lieu, so_luong] of Object.entries(hoanTra)) {
            await conn.query('UPDATE nguyen_lieu SET so_luong_ton = so_luong_ton + ? WHERE ma_nguyen_lieu = ?', [so_luong, ma_nguyen_lieu]);
        }

        await conn.commit();
        res.json({ success: true, message: 'Hủy đơn hàng thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error('Lỗi hủy đơn:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        conn.release();
    }
};

const kiemTraMaGiamGia = async (req, res) => {
    try {
        const { ma_giam_gia, tong_tien } = req.body;
        if (!ma_giam_gia) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });

        const [voucher] = await db.query('SELECT * FROM ma_giam_gia WHERE ma_code = ? AND trang_thai = "hoat_dong" AND ngay_het_han >= NOW() AND so_luong > 0', [ma_giam_gia]);
        
        if (voucher.length === 0) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại, đã hết hạn hoặc hết lượt sử dụng.' });
        }

        const v = voucher[0];
        if (tong_tien < v.don_toi_thieu) {
            return res.status(400).json({ success: false, message: `Mã giảm giá áp dụng cho đơn từ ${Number(v.don_toi_thieu).toLocaleString('vi-VN')}đ trở lên.` });
        }

        const so_tien_giam = Math.min(tong_tien * (v.phan_tram_giam / 100), v.giam_toi_da);
        
        res.json({ 
            success: true, 
            message: 'Áp dụng mã thành công!', 
            data: {
                ma_code: v.ma_code,
                so_tien_giam: so_tien_giam
            }
        });
    } catch (error) {
        console.error('Lỗi kiểm tra mã:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    taoDonHang,
    layLichSuDonHang,
    khachHangHuyDon,
    kiemTraMaGiamGia
};