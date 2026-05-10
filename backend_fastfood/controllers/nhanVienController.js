const db = require('../config/db');
const nodemailer = require('nodemailer');

// ── Hàm tạo transporter email ──────────────────────────────
const taoTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ── Hàm format tiền ────────────────────────────────────────
const formatTien = (n) => Number(n).toLocaleString('vi-VN') + 'đ';

// ========== THỐNG KÊ CA LÀM (HÔM NAY) ==========
const layThongKeCa = async (req, res) => {
    try {
        const [[{ tongDonHomNay }]] = await db.query(
            `SELECT COUNT(*) AS tongDonHomNay FROM DON_HANG WHERE DATE(ngay_dat) = CURDATE()`
        );
        const [[{ cho_duyet }]] = await db.query(
            `SELECT COUNT(*) AS cho_duyet FROM DON_HANG WHERE trang_thai = 'cho_duyet'`
        );
        const [[{ dang_che_bien }]] = await db.query(
            `SELECT COUNT(*) AS dang_che_bien FROM DON_HANG WHERE trang_thai = 'dang_che_bien'`
        );
        const [[{ dang_giao }]] = await db.query(
            `SELECT COUNT(*) AS dang_giao FROM DON_HANG WHERE trang_thai = 'dang_giao'`
        );
        const [[{ hoan_thanh }]] = await db.query(
            `SELECT COUNT(*) AS hoan_thanh FROM DON_HANG WHERE DATE(ngay_dat) = CURDATE() AND trang_thai = 'hoan_thanh'`
        );
        const [[{ da_huy }]] = await db.query(
            `SELECT COUNT(*) AS da_huy FROM DON_HANG WHERE DATE(ngay_dat) = CURDATE() AND trang_thai = 'da_huy'`
        );
        const [[{ doanhThuCa }]] = await db.query(
            `SELECT COALESCE(SUM(tong_tien), 0) AS doanhThuCa FROM DON_HANG WHERE DATE(ngay_dat) = CURDATE() AND trang_thai = 'hoan_thanh'`
        );
        
        res.json({
            success: true,
            data: { 
                tongDonHomNay, 
                cho_duyet, 
                dang_che_bien, 
                dang_giao, 
                hoan_thanh, 
                da_huy, 
                doanhThuCa 
            }
        });
    } catch (error) {
        console.error('Lỗi layThongKeCa:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== LẤY DANH SÁCH ĐƠN HÀNG (CÓ FILTER + PAGINATION) ==========
const layDanhSachDonHang = async (req, res) => {
    try {
        const { trang_thai, tu_ngay, den_ngay, tim_kiem, page = 1, limit = 12 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = [];
        let params = [];

        if (trang_thai && trang_thai !== 'tat_ca') {
            where.push('dh.trang_thai = ?');
            params.push(trang_thai);
        }
        if (tu_ngay) { where.push('DATE(dh.ngay_dat) >= ?'); params.push(tu_ngay); }
        if (den_ngay) { where.push('DATE(dh.ngay_dat) <= ?'); params.push(den_ngay); }
        if (tim_kiem) {
            where.push('(dh.ho_ten_nguoi_nhan LIKE ? OR dh.so_dien_thoai_giao LIKE ?)');
            params.push(`%${tim_kiem}%`, `%${tim_kiem}%`);
        }

        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM DON_HANG dh ${whereClause}`, params
        );

        const [donHangs] = await db.query(`
            SELECT dh.*, nd.ho_ten AS ten_khach, nd.email AS email_khach, nd.so_dien_thoai
            FROM DON_HANG dh
            LEFT JOIN NGUOI_DUNG nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
            ${whereClause}
            ORDER BY dh.ngay_dat DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        // Lấy chi tiết từng đơn
        for (let dh of donHangs) {
            const [chiTiet] = await db.query(`
                SELECT ct.so_luong, ct.gia_luc_mua, m.ten_mon, m.hinh_anh,
                       (ct.so_luong * ct.gia_luc_mua) AS thanh_tien
                FROM CHI_TIET_DON_HANG ct
                JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
                WHERE ct.ma_don_hang = ?
            `, [dh.ma_don_hang]);
            dh.chi_tiet = chiTiet;
        }

        res.json({
            success: true,
            data: donHangs,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Lỗi layDanhSachDonHang:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== CẬP NHẬT TRẠNG THÁI (CHIỀU THUẬN) ==========
const LUONG_TRANG_THAI = {
    cho_duyet: 'dang_che_bien',
    dang_che_bien: 'dang_giao',
    dang_giao: 'hoan_thanh',
};

const capNhatTrangThai = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;

        const [[donHang]] = await db.query(
            'SELECT trang_thai FROM DON_HANG WHERE ma_don_hang = ?', [id]
        );
        if (!donHang) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }

        // Kiểm tra chiều chuyển hợp lệ
        const trangThaiChoPhep = Object.values(LUONG_TRANG_THAI);
        if (!trangThaiChoPhep.includes(trang_thai) && trang_thai !== 'da_huy') {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
        }

        // Nhân viên chỉ được tiến thuận hoặc hủy khi đang chờ
        if (trang_thai !== 'da_huy') {
            const buocTiepTheo = LUONG_TRANG_THAI[donHang.trang_thai];
            if (buocTiepTheo !== trang_thai) {
                return res.status(400).json({
                    success: false,
                    message: `Không thể chuyển từ "${donHang.trang_thai}" sang "${trang_thai}"!`
                });
            }
        } else {
            if (donHang.trang_thai !== 'cho_duyet') {
                return res.status(400).json({
                    success: false,
                    message: 'Chỉ có thể hủy đơn đang ở trạng thái "Chờ duyệt"!'
                });
            }
        }

        await db.query('UPDATE DON_HANG SET trang_thai = ? WHERE ma_don_hang = ?', [trang_thai, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
        console.error('Lỗi capNhatTrangThai (NV):', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// ========== GỬI HÓA ĐƠN EMAIL ==========
const guiHoaDonEmail = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin đơn hàng + email khách
        const [[donHang]] = await db.query(`
            SELECT dh.*, nd.email AS email_khach, nd.ho_ten AS ten_khach_nd
            FROM DON_HANG dh
            LEFT JOIN NGUOI_DUNG nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
            WHERE dh.ma_don_hang = ?
        `, [id]);

        if (!donHang) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
        }

        // Lấy email từ body (nếu gửi tay) hoặc từ tài khoản khách
        const emailGui = req.body.email || donHang.email_khach;
        if (!emailGui) {
            return res.status(400).json({
                success: false,
                message: 'Khách hàng này không có email. Vui lòng nhập email thủ công!'
            });
        }

        // Lấy chi tiết đơn hàng
        const [chiTiet] = await db.query(`
            SELECT ct.so_luong, ct.gia_luc_mua, m.ten_mon,
                   (ct.so_luong * ct.gia_luc_mua) AS thanh_tien
            FROM CHI_TIET_DON_HANG ct
            JOIN MON_AN m ON ct.ma_mon_an = m.ma_mon_an
            WHERE ct.ma_don_hang = ?
        `, [id]);

        const tongGoc = chiTiet.reduce((t, i) => t + Number(i.thanh_tien), 0);
        const soTienGiam = Number(donHang.so_tien_giam) || 0;

        // Tạo bảng món HTML
        const bangMon = chiTiet.map(item => `
            <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;">${item.ten_mon}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:center;">${item.so_luong}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:right;">${formatTien(item.gia_luc_mua)}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0e6d3;text-align:right;font-weight:600;">${formatTien(item.thanh_tien)}</td>
            </tr>
        `).join('');

        const htmlEmail = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fef9f0;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#ff6b35,#f7931e);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🍔</div>
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">FAST FOOD</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Hóa đơn điện tử</p>
    </div>
    <!-- Body -->
    <div style="padding:28px 28px 16px;">
      <p style="margin:0 0 20px;color:#555;font-size:15px;">
        Xin chào <strong style="color:#ff6b35;">${donHang.ho_ten_nguoi_nhan || donHang.ten_khach_nd || 'Quý khách'}</strong>,<br>
        Cảm ơn bạn đã đặt hàng tại <strong>FAST FOOD</strong>! Đây là hóa đơn của bạn:
      </p>

      <!-- Order Info -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fef9f0;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:10px 14px;color:#888;font-size:13px;">Mã đơn hàng</td><td style="padding:10px 14px;font-weight:700;color:#ff6b35;">#${donHang.ma_don_hang}</td></tr>
        <tr><td style="padding:10px 14px;color:#888;font-size:13px;">Thời gian đặt</td><td style="padding:10px 14px;">${new Date(donHang.ngay_dat).toLocaleString('vi-VN')}</td></tr>
        <tr><td style="padding:10px 14px;color:#888;font-size:13px;">Địa chỉ giao</td><td style="padding:10px 14px;">${donHang.dia_chi_giao_hang}</td></tr>
        <tr><td style="padding:10px 14px;color:#888;font-size:13px;">SĐT nhận hàng</td><td style="padding:10px 14px;">${donHang.so_dien_thoai_giao}</td></tr>
        <tr><td style="padding:10px 14px;color:#888;font-size:13px;">Thanh toán</td><td style="padding:10px 14px;">${donHang.phuong_thuc_thanh_toan === 'tien_mat' ? '💵 Tiền mặt' : donHang.phuong_thuc_thanh_toan}</td></tr>
      </table>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#ff6b35;">
            <th style="padding:10px 12px;color:#fff;text-align:left;font-size:13px;">Món ăn</th>
            <th style="padding:10px 12px;color:#fff;text-align:center;font-size:13px;">SL</th>
            <th style="padding:10px 12px;color:#fff;text-align:right;font-size:13px;">Đơn giá</th>
            <th style="padding:10px 12px;color:#fff;text-align:right;font-size:13px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${bangMon}</tbody>
      </table>

      <!-- Totals -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${soTienGiam > 0 ? `
        <tr>
          <td style="padding:6px 12px;color:#666;text-align:right;">Tổng gốc:</td>
          <td style="padding:6px 12px;text-align:right;width:140px;">${formatTien(tongGoc)}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#10b981;text-align:right;">Giảm giá (${donHang.ma_giam_gia}):</td>
          <td style="padding:6px 12px;text-align:right;color:#10b981;">- ${formatTien(soTienGiam)}</td>
        </tr>` : ''}
        <tr style="background:#fff8f0;border-top:2px solid #ff6b35;">
          <td style="padding:12px;font-size:16px;font-weight:700;color:#ff6b35;text-align:right;">TỔNG THANH TOÁN:</td>
          <td style="padding:12px;font-size:18px;font-weight:800;color:#ff6b35;text-align:right;">${formatTien(donHang.tong_tien)}</td>
        </tr>
      </table>

      ${donHang.ghi_chu ? `<p style="color:#888;font-size:13px;background:#f9f9f9;padding:10px 14px;border-radius:8px;">📝 Ghi chú: ${donHang.ghi_chu}</p>` : ''}
    </div>

    <!-- Footer -->
    <div style="background:#fef0e0;padding:20px 28px;text-align:center;border-top:1px solid #fde4c0;">
      <p style="margin:0;color:#ff6b35;font-size:15px;font-weight:700;">⭐ Cảm ơn bạn đã ghé thăm! ⭐</p>
      <p style="margin:6px 0 0;color:#888;font-size:13px;">Hẹn gặp lại lần sau tại FAST FOOD 🍟</p>
      <p style="margin:4px 0 0;color:#bbb;font-size:12px;">ĐT: 0909 123 456</p>
    </div>
  </div>
</body>
</html>`;

        const transporter = taoTransporter();
        await transporter.sendMail({
            from: `"🍔 FAST FOOD" <${process.env.EMAIL_USER}>`,
            to: emailGui,
            subject: `🧾 Hóa đơn đơn hàng #${id} - FAST FOOD`,
            html: htmlEmail,
        });

        res.json({ success: true, message: `Hóa đơn đã được gửi đến ${emailGui}!` });
    } catch (error) {
        console.error('Lỗi guiHoaDonEmail:', error);
        if (error.code === 'EAUTH') {
            return res.status(500).json({ success: false, message: 'Lỗi xác thực email server. Kiểm tra EMAIL_USER và EMAIL_PASS trong .env!' });
        }
        res.status(500).json({ success: false, message: 'Lỗi gửi email: ' + error.message });
    }
};

module.exports = {
    layThongKeCa,
    layDanhSachDonHang,
    capNhatTrangThai,
    guiHoaDonEmail,
};
