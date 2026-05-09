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
            kinh_do,
            vi_do,
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

        // 1. Lấy giá và thông tin món ăn
        const dsMaMonAn = san_pham.map(sp => sp.ma_mon_an);
        const placeholders = dsMaMonAn.map(() => '?').join(',');
        const [giaBanList] = await conn.query(`SELECT ma_mon_an, gia_ban, ten_mon FROM MON_AN WHERE ma_mon_an IN (${placeholders})`, dsMaMonAn);
        
        const mapGiaBan = {};
        giaBanList.forEach(m => { mapGiaBan[m.ma_mon_an] = m.gia_ban; });

        const sanPhamTrongGio = san_pham.map(sp => ({
            ...sp,
            gia_ban: mapGiaBan[sp.ma_mon_an] || 0
        }));

        // 2. KIỂM TRA VÀ TRỪ TỒN KHO NGUYÊN LIỆU
        const yeuCauNguyenLieu = {};
        for (let item of sanPhamTrongGio) {
            const [congThuc] = await conn.query('SELECT ma_nguyen_lieu, so_luong_can FROM cong_thuc_mon_an WHERE ma_mon_an = ?', [item.ma_mon_an]);
            for (let ct of congThuc) {
                if (!yeuCauNguyenLieu[ct.ma_nguyen_lieu]) yeuCauNguyenLieu[ct.ma_nguyen_lieu] = 0;
                yeuCauNguyenLieu[ct.ma_nguyen_lieu] += ct.so_luong_can * item.so_luong;
            }
        }

        for (const [ma_nguyen_lieu, tong_can] of Object.entries(yeuCauNguyenLieu)) {
            const [nl] = await conn.query('SELECT ten_nguyen_lieu, so_luong_ton FROM nguyen_lieu WHERE ma_nguyen_lieu = ? FOR UPDATE', [ma_nguyen_lieu]);
            if (nl.length === 0 || nl[0].so_luong_ton < tong_can) {
                await conn.rollback();
                await conn.release();
                return res.status(400).json({ success: false, message: `Hết nguyên liệu "${nl[0] ? nl[0].ten_nguyen_lieu : 'N/A'}"` });
            }
            await conn.query('UPDATE nguyen_lieu SET so_luong_ton = so_luong_ton - ? WHERE ma_nguyen_lieu = ?', [tong_can, ma_nguyen_lieu]);
        }

        // 3. Tính giảm giá
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
                    await conn.query('UPDATE ma_giam_gia SET so_luong = so_luong - 1 WHERE ma_code = ?', [v.ma_code]);
                }
            }
        }

        const tong_tien_thanh_toan = Math.max(tong_tien_ban_dau - so_tien_giam, 0);

        // 4. Lưu đơn hàng
        const sqlDonHang = `
            INSERT INTO DON_HANG (ma_nguoi_dung, tong_tien, ho_ten_nguoi_nhan, dia_chi_giao_hang, kinh_do, vi_do, so_dien_thoai_giao, ghi_chu, phuong_thuc_thanh_toan, ma_giam_gia, so_tien_giam) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [ketQuaDonHang] = await conn.query(sqlDonHang, [
            ma_nguoi_dung, tong_tien_thanh_toan, ho_ten_nguoi_nhan, dia_chi_giao_hang, kinh_do || null, vi_do || null, so_dien_thoai_giao, ghi_chu, phuong_thuc_thanh_toan || 'tien_mat', ma_giam_gia_hop_le, so_tien_giam
        ]);
        
        const ma_don_hang_moi = ketQuaDonHang.insertId;

        // 5. Lưu chi tiết
        for (let item of sanPhamTrongGio) {
            await conn.query('INSERT INTO CHI_TIET_DON_HANG (ma_don_hang, ma_mon_an, so_luong, gia_luc_mua) VALUES (?, ?, ?, ?)', [ma_don_hang_moi, item.ma_mon_an, item.so_luong, item.gia_ban]);
        }

        if (ma_nguoi_dung) {
            await conn.query('DELETE FROM GIO_HANG WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        }

        await conn.commit();
        res.status(200).json({ success: true, message: 'Đặt hàng thành công!', ma_don_hang: ma_don_hang_moi });

    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    } finally {
        conn.release();
    }
};

// XEM LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH HÀNG
const layLichSuDonHang = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const [danhSachDonHang] = await db.query(`SELECT * FROM DON_HANG WHERE ma_nguoi_dung = ? ORDER BY ngay_dat DESC`, [ma_nguoi_dung]);

        for (let i = 0; i < danhSachDonHang.length; i++) {
            const [chiTiet] = await db.query(`
                SELECT ct.*, m.ten_mon, m.hinh_anh, (ct.so_luong * ct.gia_luc_mua) AS thanh_tien
                FROM CHI_TIET_DON_HANG ct
                JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
                WHERE ct.ma_don_hang = ?
            `, [danhSachDonHang[i].ma_don_hang]);
            danhSachDonHang[i].chi_tiet = chiTiet;
        }

        res.json({ success: true, data: danhSachDonHang });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const khachHangHuyDon = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const ma_don_hang = req.params.id;
        const ma_nguoi_dung = req.user.id;

        const [donHang] = await conn.query('SELECT trang_thai, ngay_dat FROM DON_HANG WHERE ma_don_hang = ? AND ma_nguoi_dung = ? FOR UPDATE', [ma_don_hang, ma_nguoi_dung]);
        
        if (donHang.length === 0) {
            await conn.release();
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (donHang[0].trang_thai !== 'cho_duyet') {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Không thể hủy đơn hàng này.' });
        }

        const diffMins = (new Date() - new Date(donHang[0].ngay_dat)) / 60000;
        if (diffMins > 5) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Đã quá 5 phút, không thể tự hủy.' });
        }

        await conn.query('UPDATE DON_HANG SET trang_thai = "da_huy" WHERE ma_don_hang = ?', [ma_don_hang]);

        const [chiTiet] = await conn.query(`
            SELECT ct.so_luong, c.ma_nguyen_lieu, c.so_luong_can 
            FROM CHI_TIET_DON_HANG ct 
            JOIN cong_thuc_mon_an c ON ct.ma_mon_an = c.ma_mon_an 
            WHERE ct.ma_don_hang = ?
        `, [ma_don_hang]);

        for (let row of chiTiet) {
            await conn.query('UPDATE nguyen_lieu SET so_luong_ton = so_luong_ton + ? WHERE ma_nguyen_lieu = ?', [row.so_luong * row.so_luong_can, row.ma_nguyen_lieu]);
        }

        await conn.commit();
        res.json({ success: true, message: 'Hủy đơn thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        conn.release();
    }
};

const kiemTraMaGiamGia = async (req, res) => {
    try {
        const { ma_giam_gia, tong_tien } = req.body;
        const [voucher] = await db.query('SELECT * FROM ma_giam_gia WHERE ma_code = ? AND trang_thai = "hoat_dong" AND ngay_het_han >= NOW() AND so_luong > 0', [ma_giam_gia]);
        
        if (voucher.length === 0) return res.status(404).json({ success: false, message: 'Mã không hợp lệ.' });

        const v = voucher[0];
        if (tong_tien < v.don_toi_thieu) return res.status(400).json({ success: false, message: `Đơn tối thiểu ${v.don_toi_thieu}đ` });

        const so_tien_giam = Math.min(tong_tien * (v.phan_tram_giam / 100), v.giam_toi_da);
        res.json({ success: true, data: { ma_code: v.ma_code, so_tien_giam } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const layTatCaDonHang = async (req, res) => {
    try {
        const { trang_thai } = req.query;
        let sql = `SELECT dh.*, nd.ho_ten AS ten_khach FROM DON_HANG dh LEFT JOIN NGUOI_DUNG nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung`;
        const params = [];
        if (trang_thai && trang_thai !== 'tat_ca') {
            sql += ' WHERE dh.trang_thai = ?';
            params.push(trang_thai);
        }
        sql += ' ORDER BY dh.ngay_dat DESC';

        const [danhSachDonHang] = await db.query(sql, params);
        for (let i = 0; i < danhSachDonHang.length; i++) {
            const [chiTiet] = await db.query(`
                SELECT ct.*, m.ten_mon, m.hinh_anh FROM CHI_TIET_DON_HANG ct
                JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
                WHERE ct.ma_don_hang = ?
            `, [danhSachDonHang[i].ma_don_hang]);
            danhSachDonHang[i].chi_tiet = chiTiet;
        }

        res.json({ success: true, data: danhSachDonHang });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const capNhatTrangThai = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;
        await db.query('UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?', [trang_thai, id]);
        res.json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    taoDonHang,
    layLichSuDonHang,
    khachHangHuyDon,
    kiemTraMaGiamGia,
    layTatCaDonHang,
    capNhatTrangThai
};