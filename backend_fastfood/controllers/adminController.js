const db = require('../config/db');

// ========== DASHBOARD ==========
const getDashboardStats = async (req, res) => {
    try {
        const [[{ tongDonHom }]] = await db.query(`SELECT COUNT(*) AS tongDonHom FROM DON_HANG WHERE DATE(ngay_dat) = CURDATE()`);
        const [[{ doanhThu }]] = await db.query(`SELECT COALESCE(SUM(tong_tien),0) AS doanhThu FROM DON_HANG WHERE trang_thai='hoan_thanh'`);
        const [[{ choDuyet }]] = await db.query(`SELECT COUNT(*) AS choDuyet FROM DON_HANG WHERE trang_thai='cho_duyet'`);
        const [[{ tongMonAn }]] = await db.query(`SELECT COUNT(*) AS tongMonAn FROM MON_AN`);
        const [[{ tongKhachHang }]] = await db.query(`SELECT COUNT(*) AS tongKhachHang FROM NGUOI_DUNG WHERE vai_tro='khach_hang'`);
        const [[{ tongDonHang }]] = await db.query(`SELECT COUNT(*) AS tongDonHang FROM DON_HANG`);

        // Doanh thu 7 ngày gần nhất
        const [doanhThu7Ngay] = await db.query(`
            SELECT DATE(ngay_dat) AS ngay, COALESCE(SUM(tong_tien),0) AS doanh_thu
            FROM DON_HANG WHERE ngay_dat >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(ngay_dat) ORDER BY ngay ASC
        `);

        // Đơn hàng gần nhất
        const [donHangGanNhat] = await db.query(`
            SELECT dh.ma_don_hang, dh.ho_ten_nguoi_nhan, dh.tong_tien, dh.trang_thai, dh.ngay_dat, dh.phuong_thuc_thanh_toan
            FROM DON_HANG dh ORDER BY dh.ngay_dat DESC LIMIT 8
        `);

        // Top món bán chạy
        const [topMon] = await db.query(`
            SELECT m.ten_mon, m.hinh_anh, SUM(ct.so_luong) AS tong_ban
            FROM CHI_TIET_DON_HANG ct JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
            GROUP BY ct.ma_mon_an ORDER BY tong_ban DESC LIMIT 5
        `);

        res.json({ success: true, data: { tongDonHom, doanhThu, choDuyet, tongMonAn, tongKhachHang, tongDonHang, doanhThu7Ngay, donHangGanNhat, topMon } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== QUẢN LÝ ĐƠN HÀNG ==========
const getAllDonHang = async (req, res) => {
    try {
        const { trang_thai, tu_ngay, den_ngay, page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;
        let where = [];
        let params = [];

        if (trang_thai) { where.push('dh.trang_thai = ?'); params.push(trang_thai); }
        if (tu_ngay) { where.push('DATE(dh.ngay_dat) >= ?'); params.push(tu_ngay); }
        if (den_ngay) { where.push('DATE(dh.ngay_dat) <= ?'); params.push(den_ngay); }

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
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;
        const validStatuses = ['cho_duyet', 'dang_giao', 'hoan_thanh', 'da_huy'];
        if (!validStatuses.includes(trang_thai)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
        }
        await db.query('UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?', [trang_thai, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
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
        res.json({ success: true, data: monAns });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const themMonAn = async (req, res) => {
    try {
        const { ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai } = req.body;
        if (!ten_mon || !gia_ban) return res.status(400).json({ success: false, message: 'Tên món và giá không được để trống!' });
        const [result] = await db.query(
            'INSERT INTO MON_AN (ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai) VALUES (?,?,?,?,?,?)',
            [ten_mon, mo_ta || null, gia_ban, hinh_anh || null, ma_danh_muc || null, trang_thai || 'con_hang']
        );
        res.status(201).json({ success: true, message: 'Thêm món ăn thành công!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const suaMonAn = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai } = req.body;
        await db.query(
            'UPDATE MON_AN SET ten_mon=?, mo_ta=?, gia_ban=?, hinh_anh=?, ma_danh_muc=?, trang_thai=? WHERE ma_mon_an=?',
            [ten_mon, mo_ta, gia_ban, hinh_anh, ma_danh_muc, trang_thai, id]
        );
        res.json({ success: true, message: 'Cập nhật món ăn thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
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
        const [users] = await db.query(`SELECT ma_nguoi_dung, ho_ten, email, so_dien_thoai, dia_chi, vai_tro, ngay_tao FROM NGUOI_DUNG ORDER BY ngay_tao DESC`);
        res.json({ success: true, data: users });
    } catch (error) {
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

module.exports = {
    getDashboardStats,
    getAllDonHang, capNhatTrangThaiDonHang,
    getAllMonAn, themMonAn, suaMonAn, xoaMonAn,
    getAllDanhMuc, themDanhMuc, suaDanhMuc, xoaDanhMuc,
    getAllNguoiDung, capNhatVaiTro, xoaNguoiDung
};
