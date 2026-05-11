const db = require('../config/db');

// ========== DASHBOARD ==========
const getDashboardStats = async (req, res) => {
    try {
        const { kieu = 'tat_ca', nam, quy } = req.query;
        let whereClause = "WHERE 1=1";
        let params = [];

        const currentYear = new Date().getFullYear();
        const targetYear = nam ? parseInt(nam) : currentYear;

        if (kieu === '7ngay') {
            whereClause = "WHERE ngay_dat >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
        } else if (kieu === 'quy') {
            const targetQuarter = quy ? parseInt(quy) : Math.floor((new Date().getMonth() + 3) / 3);
            whereClause = "WHERE QUARTER(ngay_dat) = ? AND YEAR(ngay_dat) = ?";
            params.push(targetQuarter, targetYear);
        } else if (kieu === 'nam') {
            whereClause = "WHERE YEAR(ngay_dat) = ?";
            params.push(targetYear);
        }

        const [[{ doanhThu }]] = await db.query(`SELECT COALESCE(SUM(tong_tien),0) AS doanhThu FROM DON_HANG ${whereClause} AND trang_thai='hoan_thanh'`, params);
        const [[{ donHoanThanh }]] = await db.query(`SELECT COUNT(*) AS donHoanThanh FROM DON_HANG ${whereClause} AND trang_thai='hoan_thanh'`, params);
        const [[{ donDaHuy }]] = await db.query(`SELECT COUNT(*) AS donDaHuy FROM DON_HANG ${whereClause} AND trang_thai='da_huy'`, params);
        const [[{ tongKhachHang }]] = await db.query(`SELECT COUNT(DISTINCT ma_nguoi_dung) AS tongKhachHang FROM DON_HANG ${whereClause}`, params);
        const [[{ tongDonHang }]] = await db.query(`SELECT COUNT(*) AS tongDonHang FROM DON_HANG ${whereClause}`, params);

        // Top món bán chạy trong kỳ
        const [topMon] = await db.query(`
            SELECT m.ten_mon, m.hinh_anh, SUM(ct.so_luong) AS tong_ban
            FROM CHI_TIET_DON_HANG ct 
            JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
            JOIN DON_HANG dh ON ct.ma_don_hang = dh.ma_don_hang
            ${whereClause}
            GROUP BY ct.ma_mon_an ORDER BY tong_ban DESC LIMIT 5
        `, params);

        // Top 3 khách hàng mua nhiều nhất
        const [topKhachHang] = await db.query(`
            SELECT nd.ho_ten, nd.email, SUM(dh.tong_tien) AS tong_chi, COUNT(dh.ma_don_hang) AS so_don
            FROM DON_HANG dh
            JOIN NGUOI_DUNG nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
            ${whereClause} AND dh.trang_thai = 'hoan_thanh'
            GROUP BY dh.ma_nguoi_dung
            ORDER BY tong_chi DESC
            LIMIT 3
        `, params);

        res.json({ 
            success: true, 
            data: { 
                doanhThu, 
                donHoanThanh, 
                donDaHuy, 
                tongKhachHang, 
                tongDonHang, 
                topMon,
                topKhachHang
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const getDoanhThuChart = async (req, res) => {
    try {
        const { kieu = '7ngay', nam, quy } = req.query;
        let query = '';
        let params = [];

        const currentYear = new Date().getFullYear();
        const targetYear = nam ? parseInt(nam) : currentYear;

        if (kieu === '7ngay') {
            query = `
                SELECT
                    DATE(ngay_dat) AS ngay,
                    COALESCE(SUM(tong_tien),0) AS doanh_thu,
                    COUNT(*) AS so_don
                FROM DON_HANG
                WHERE ngay_dat >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(ngay_dat) ORDER BY ngay ASC
            `;
        } else if (kieu === 'quy') {
            const targetQuarter = quy ? parseInt(quy) : Math.floor((new Date().getMonth() + 3) / 3);
            query = `
                SELECT
                    DATE(ngay_dat - INTERVAL WEEKDAY(ngay_dat) DAY) AS ngay,
                    COALESCE(SUM(tong_tien),0) AS doanh_thu,
                    COUNT(*) AS so_don
                FROM DON_HANG
                WHERE QUARTER(ngay_dat) = ? AND YEAR(ngay_dat) = ?
                GROUP BY DATE(ngay_dat - INTERVAL WEEKDAY(ngay_dat) DAY)
                ORDER BY ngay ASC
            `;
            params.push(targetQuarter, targetYear);
        } else if (kieu === 'nam') {
            query = `
                SELECT
                    DATE_FORMAT(ngay_dat, '%Y-%m-01') AS ngay,
                    COALESCE(SUM(tong_tien),0) AS doanh_thu,
                    COUNT(*) AS so_don
                FROM DON_HANG
                WHERE YEAR(ngay_dat) = ?
                GROUP BY DATE_FORMAT(ngay_dat, '%Y-%m-01')
                ORDER BY ngay ASC
            `;
            params.push(targetYear);
        } else {
            return res.status(400).json({ success: false, message: 'Kiểu không hợp lệ' });
        }

        const [data] = await db.query(query, params);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== QUẢN LÝ ĐƠN HÀNG ==========
const getAllDonHang = async (req, res) => {
    try {
        const { trang_thai, tu_ngay, den_ngay, search, page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;
        let where = [];
        let params = [];

        if (trang_thai) { where.push('dh.trang_thai = ?'); params.push(trang_thai); }
        if (tu_ngay) { where.push('DATE(dh.ngay_dat) >= ?'); params.push(tu_ngay); }
        if (den_ngay) { where.push('DATE(dh.ngay_dat) <= ?'); params.push(den_ngay); }
        if (search) {
            where.push('(dh.ma_don_hang LIKE ? OR dh.ho_ten_nguoi_nhan LIKE ? OR dh.so_dien_thoai_giao LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

        const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM DON_HANG dh ${whereClause}`, params);

        const [donHangs] = await db.query(`
            SELECT dh.*, nd.ho_ten AS ten_khach, nd.email, nd.so_dien_thoai
            FROM DON_HANG dh
            LEFT JOIN NGUOI_DUNG nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
            ${whereClause}
            ORDER BY dh.ngay_dat DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);

        // Lấy chi tiết từng đơn
        for (let dh of donHangs) {
            const [chiTiet] = await db.query(`
                SELECT ct.so_luong, ct.gia_luc_mua, m.ten_mon, m.hinh_anh
                FROM CHI_TIET_DON_HANG ct JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
                WHERE ct.ma_don_hang = ?
            `, [dh.ma_don_hang]);
            dh.chi_tiet = chiTiet;
        }

        res.json({ success: true, data: donHangs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const capNhatTrangThaiDonHang = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params;
        const { trang_thai } = req.body;
        const validStatuses = ['cho_duyet', 'dang_giao', 'hoan_thanh', 'da_huy'];
        if (!validStatuses.includes(trang_thai)) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
        }

        // Kiểm tra trạng thái hiện tại
        const [donHang] = await conn.query('SELECT trang_thai FROM DON_HANG WHERE ma_don_hang = ? FOR UPDATE', [id]);
        if (donHang.length === 0) {
            await conn.release();
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const currentStatus = donHang[0].trang_thai;

        // Nếu admin hủy đơn hàng đang ở trạng thái 'cho_duyet', hoàn trả nguyên liệu
        if (trang_thai === 'da_huy' && currentStatus === 'cho_duyet') {
            const [chiTiet] = await conn.query(`
                SELECT ct.ma_mon_an, ct.so_luong, c.ma_nguyen_lieu, c.so_luong_can 
                FROM CHI_TIET_DON_HANG ct 
                JOIN cong_thuc_mon_an c ON ct.ma_mon_an = c.ma_mon_an 
                WHERE ct.ma_don_hang = ?
            `, [id]);

            const hoanTra = {};
            for (let row of chiTiet) {
                if (!hoanTra[row.ma_nguyen_lieu]) hoanTra[row.ma_nguyen_lieu] = 0;
                hoanTra[row.ma_nguyen_lieu] += row.so_luong * row.so_luong_can;
            }

            for (const [ma_nguyen_lieu, so_luong] of Object.entries(hoanTra)) {
                await conn.query('UPDATE nguyen_lieu SET so_luong_ton = so_luong_ton + ? WHERE ma_nguyen_lieu = ?', [so_luong, ma_nguyen_lieu]);
            }
        }

        await conn.query('UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?', [trang_thai, id]);
        await conn.commit();
        res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        conn.release();
    }
};

// ========== QUẢN LÝ MÓN ĂN ==========
const getAllMonAn = async (req, res) => {
    try {
        const [monAns] = await db.query(`
            SELECT m.*, d.ten_danh_muc
            FROM MON_AN m LEFT JOIN DANH_MUC d ON m.ma_danh_muc = d.ma_danh_muc
            ORDER BY m.ma_mon_an DESC
        `);

        for (let mon of monAns) {
            const [congThuc] = await db.query(`
                SELECT c.ma_nguyen_lieu, c.so_luong_can, n.ten_nguyen_lieu, n.don_vi_tinh 
                FROM cong_thuc_mon_an c 
                JOIN nguyen_lieu n ON c.ma_nguyen_lieu = n.ma_nguyen_lieu 
                WHERE c.ma_mon_an = ?
            `, [mon.ma_mon_an]);
            mon.cong_thuc = congThuc;
        }

        res.json({ success: true, data: monAns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const themMonAn = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai, cong_thuc } = req.body;
        if (!ten_mon || !gia_ban) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Tên món và giá không được để trống!' });
        }
        if (!cong_thuc || cong_thuc.length === 0) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Món ăn bắt buộc phải có ít nhất 1 nguyên liệu cấu thành!' });
        }

        const [result] = await conn.query(
            'INSERT INTO MON_AN (ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai) VALUES (?,?,?,?,?,?)',
            [ten_mon, mo_ta || null, gia_ban, hinh_anh || null, ma_danh_muc || null, trang_thai || 'con_hang']
        );
        const ma_mon_an = result.insertId;

        for (let ct of cong_thuc) {
            await conn.query(
                'INSERT INTO cong_thuc_mon_an (ma_mon_an, ma_nguyen_lieu, so_luong_can) VALUES (?, ?, ?)',
                [ma_mon_an, ct.ma_nguyen_lieu, ct.so_luong_can]
            );
        }

        await conn.commit();
        res.status(201).json({ success: true, message: 'Thêm món ăn thành công!', id: ma_mon_an });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        conn.release();
    }
};

const suaMonAn = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params;
        const { ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai, cong_thuc } = req.body;
        
        if (!ten_mon || !gia_ban) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Tên món và giá không được để trống!' });
        }
        if (!cong_thuc || cong_thuc.length === 0) {
            await conn.release();
            return res.status(400).json({ success: false, message: 'Món ăn bắt buộc phải có ít nhất 1 nguyên liệu cấu thành!' });
        }

        await conn.query(
            'UPDATE MON_AN SET ten_mon=?, mo_ta=?, gia_ban=?, hinh_anh=?, ma_danh_muc=?, trang_thai=? WHERE ma_mon_an=?',
            [ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai, id]
        );

        // Delete old recipe and insert new recipe
        await conn.query('DELETE FROM cong_thuc_mon_an WHERE ma_mon_an = ?', [id]);
        
        for (let ct of cong_thuc) {
            await conn.query(
                'INSERT INTO cong_thuc_mon_an (ma_mon_an, ma_nguyen_lieu, so_luong_can) VALUES (?, ?, ?)',
                [id, ct.ma_nguyen_lieu, ct.so_luong_can]
            );
        }

        await conn.commit();
        res.json({ success: true, message: 'Cập nhật món ăn thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
        conn.release();
    }
};

const xoaMonAn = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM MON_AN WHERE ma_mon_an = ?', [id]);
        res.json({ success: true, message: 'Xóa món ăn thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server - Có thể món này đang trong đơn hàng' });
    }
};

// ========== QUẢN LÝ DANH MỤC ==========
const getAllDanhMuc = async (req, res) => {
    try {
        const [danhMucs] = await db.query(`
            SELECT d.*, COUNT(m.ma_mon_an) AS so_mon
            FROM DANH_MUC d LEFT JOIN MON_AN m ON d.ma_danh_muc = m.ma_danh_muc
            GROUP BY d.ma_danh_muc ORDER BY d.ma_danh_muc
        `);
        res.json({ success: true, data: danhMucs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const themDanhMuc = async (req, res) => {
    try {
        const { ten_danh_muc, mo_ta, hinh_anh } = req.body;
        if (!ten_danh_muc) return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống!' });
        const [result] = await db.query('INSERT INTO DANH_MUC (ten_danh_muc, mo_ta, hinh_anh) VALUES (?,?,?)', [ten_danh_muc, mo_ta || null, hinh_anh || null]);
        res.status(201).json({ success: true, message: 'Thêm danh mục thành công!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const suaDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_danh_muc, mo_ta, hinh_anh } = req.body;
        await db.query('UPDATE DANH_MUC SET ten_danh_muc=?, mo_ta=?, hinh_anh=? WHERE ma_danh_muc=?', [ten_danh_muc, mo_ta, hinh_anh, id]);
        res.json({ success: true, message: 'Cập nhật danh mục thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const xoaDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM DANH_MUC WHERE ma_danh_muc = ?', [id]);
        res.json({ success: true, message: 'Xóa danh mục thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== QUẢN LÝ NGƯỜI DÙNG ==========
const getAllNguoiDung = async (req, res) => {
    try {
        const [users] = await db.query(`SELECT ma_nguoi_dung, ho_ten, email, so_dien_thoai, dia_chi, vai_tro, trang_thai, ngay_tao FROM NGUOI_DUNG ORDER BY ngay_tao DESC`);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const khoaTaiKhoan = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai, so_ngay } = req.body; // trang_thai: 'hoat_dong' | 'bi_khoa', so_ngay: 1, 3, 7, 30, -1 (vĩnh viễn), 0 (mở khóa)
        
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'Không thể thay đổi trạng thái tài khoản của chính mình!' });
        }

        let khoa_den_ngay = null;
        let set_trang_thai = 'hoat_dong';

        if (trang_thai === 'bi_khoa' || trang_thai === 'bi_cam') {
            set_trang_thai = 'bi_khoa';
            if (so_ngay === -1) {
                khoa_den_ngay = '9999-12-31 23:59:59'; // Vĩnh viễn
            } else if (so_ngay > 0) {
                const date = new Date();
                date.setDate(date.getDate() + so_ngay);
                khoa_den_ngay = date;
            }
        }

        await db.query('UPDATE NGUOI_DUNG SET trang_thai = ?, khoa_den_ngay = ? WHERE ma_nguoi_dung = ?', [set_trang_thai, khoa_den_ngay, id]);
        
        let msg = 'Đã mở khóa tài khoản!';
        if (set_trang_thai === 'bi_khoa') {
            msg = so_ngay === -1 ? 'Đã khóa tài khoản vĩnh viễn!' : `Đã khóa tài khoản ${so_ngay} ngày!`;
        }
        
        res.json({ success: true, message: msg });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const capNhatVaiTro = async (req, res) => {
    try {
        const { id } = req.params;
        const { vai_tro } = req.body;
        const validRoles = ['khach_hang', 'nhan_vien', 'quan_tri'];
        if (!validRoles.includes(vai_tro)) return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ!' });
        if (parseInt(id) === req.user.id) return res.status(400).json({ success: false, message: 'Không thể tự thay đổi vai trò của mình!' });
        await db.query('UPDATE NGUOI_DUNG SET vai_tro = ? WHERE ma_nguoi_dung = ?', [vai_tro, id]);
        res.json({ success: true, message: 'Cập nhật vai trò thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const xoaNguoiDung = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình!' });
        await db.query('DELETE FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?', [id]);
        res.json({ success: true, message: 'Xóa người dùng thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== QUẢN LÝ MÃ GIẢM GIÁ ==========
const getAllVouchers = async (req, res) => {
    try {
        const [vouchers] = await db.query('SELECT * FROM MA_GIAM_GIA ORDER BY ngay_het_han DESC');
        res.json({ success: true, data: vouchers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const themVoucher = async (req, res) => {
    try {
        const { ma_code, phan_tram_giam, giam_toi_da, don_toi_thieu, ngay_het_han, so_luong, trang_thai } = req.body;
        if (!ma_code || !phan_tram_giam) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã và % giảm!' });
        
        await db.query(
            'INSERT INTO MA_GIAM_GIA (ma_code, phan_tram_giam, giam_toi_da, don_toi_thieu, ngay_het_han, so_luong, trang_thai) VALUES (?,?,?,?,?,?,?)',
            [ma_code, phan_tram_giam, giam_toi_da || 0, don_toi_thieu || 0, ngay_het_han, so_luong || 1, trang_thai || 'hoat_dong']
        );
        res.status(201).json({ success: true, message: 'Thêm mã giảm giá thành công!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Mã này đã tồn tại!' });
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const suaVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const { phan_tram_giam, giam_toi_da, don_toi_thieu, ngay_het_han, so_luong, trang_thai } = req.body;
        await db.query(
            'UPDATE MA_GIAM_GIA SET phan_tram_giam=?, giam_toi_da=?, don_toi_thieu=?, ngay_het_han=?, so_luong=?, trang_thai=? WHERE ma_code=?',
            [phan_tram_giam, giam_toi_da, don_toi_thieu, ngay_het_han, so_luong, trang_thai, code]
        );
        res.json({ success: true, message: 'Cập nhật mã giảm giá thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const xoaVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        await db.query('DELETE FROM MA_GIAM_GIA WHERE ma_code = ?', [code]);
        res.json({ success: true, message: 'Xóa mã giảm giá thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getDashboardStats, getDoanhThuChart,
    getAllDonHang, capNhatTrangThaiDonHang,
    getAllMonAn, themMonAn, suaMonAn, xoaMonAn,
    getAllDanhMuc, themDanhMuc, suaDanhMuc, xoaDanhMuc,
    getAllNguoiDung, capNhatVaiTro, xoaNguoiDung, khoaTaiKhoan,
    getAllVouchers, themVoucher, suaVoucher, xoaVoucher
};
