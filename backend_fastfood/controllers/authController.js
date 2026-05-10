const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 1. ĐĂNG KÝ
const dangKy = async (req, res) => {
    try {
        // Thay vì nhận riêng email và so_dien_thoai, ta chỉ nhận "tai_khoan" từ Frontend
        const { ho_ten, tai_khoan, mat_khau, xac_nhan_mat_khau } = req.body;

        if (!ho_ten || ho_ten.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên của bạn!' });
        }

        if (!tai_khoan || tai_khoan.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập Email hoặc Số điện thoại!' });
        }

        if (!mat_khau || mat_khau.length < 4 || mat_khau.length > 24) {
            return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 4 đến 24 ký tự!' });
        }

        if (mat_khau !== xac_nhan_mat_khau) {
            return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp!' });
        }

        // BIẾN CHỨA DỮ LIỆU SAU KHI PHÂN LOẠI
        let email = null;
        let so_dien_thoai = null;

        // KIỂM TRA BẰNG REGEX (Biểu thức chính quy)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Kiểm tra SĐT Việt Nam: Bắt đầu bằng 0, theo sau là 9 chữ số (tổng 10 số)
        const phoneRegex = /^(0)[0-9]{9}$/; 

        if (emailRegex.test(tai_khoan)) {
            email = tai_khoan; // Nếu đúng chuẩn email, cất vào biến email
        } else if (phoneRegex.test(tai_khoan)) {
            so_dien_thoai = tai_khoan; // Nếu đúng chuẩn số, cất vào biến SĐT
        } else {
            // Nếu khách nhập tào lao (vd: "abc123")
            return res.status(400).json({ success: false, message: 'Tài khoản phải là Email hoặc Số điện thoại hợp lệ (10 số)!' });
        }

        // Kiểm tra xem Email hoặc SĐT đã tồn tại chưa
        const [users] = await db.query(
            'SELECT * FROM NGUOI_DUNG WHERE email = ? OR so_dien_thoai = ?', 
            [email, so_dien_thoai]
        );
        
        if (users.length > 0) {
            return res.status(400).json({ success: false, message: 'Email hoặc Số điện thoại này đã được sử dụng!' });
        }

        // Lưu vào Database (email hoặc so_dien_thoai sẽ có 1 cái mang giá trị thực, 1 cái mang giá trị null)
        const sqlInsert = 'INSERT INTO NGUOI_DUNG (ho_ten, email, so_dien_thoai, mat_khau) VALUES (?, ?, ?, ?)';
        await db.query(sqlInsert, [ho_ten, email, so_dien_thoai, mat_khau]);

        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
// 2. ĐĂNG NHẬP
const dangNhap = async (req, res) => {
    try {
        const { tai_khoan, mat_khau } = req.body;

        // 1. Kiểm tra xem người dùng có nhập đủ thông tin không
        if (!tai_khoan || tai_khoan.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập Email hoặc Số điện thoại!' });
        }
        if (!mat_khau) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu!' });
        }

        // 2. Tìm kiếm trong Database (Tìm trong cả cột email HOẶC so_dien_thoai)
        const sql = 'SELECT * FROM NGUOI_DUNG WHERE email = ? OR so_dien_thoai = ?';
        // Truyền tai_khoan vào 2 lần để nó thay thế cho 2 dấu chấm hỏi (?) ở trên
        const [users] = await db.query(sql, [tai_khoan, tai_khoan]);

        // Nếu không tìm thấy ai khớp
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
        }

        const user = users[0];
        
        // 2.1 Kiểm tra trạng thái tài khoản
        if (user.trang_thai === 'bi_khoa' || user.trang_thai === 'bi_cam') {
            if (user.khoa_den_ngay) {
                const now = new Date();
                const lockUntil = new Date(user.khoa_den_ngay);
                if (now < lockUntil) {
                    const diffTime = Math.ceil((lockUntil - now) / (1000 * 60 * 60 * 24));
                    const timeStr = lockUntil.getFullYear() > 2099 ? 'vĩnh viễn' : `đến ngày ${lockUntil.toLocaleDateString('vi-VN')}`;
                    return res.status(403).json({ 
                        success: false, 
                        message: `Tài khoản của bạn đang bị khóa ${timeStr}. Vui lòng quay lại sau!` 
                    });
                } else {
                    // Tự động mở khóa nếu hết hạn
                    await db.query('UPDATE NGUOI_DUNG SET trang_thai = "hoat_dong", khoa_den_ngay = NULL WHERE ma_nguoi_dung = ?', [user.ma_nguoi_dung]);
                }
            } else {
                return res.status(403).json({ success: false, message: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên!' });
            }
        }

        // 3. So sánh mật khẩu trực tiếp (ko mã hóa)
        if (mat_khau !== user.mat_khau) {
            return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác!' });
        }

        // 4. Tạo "Thẻ ra vào" JWT (Token) có hạn 1 ngày
        const token = jwt.sign(
            { id: user.ma_nguoi_dung, vai_tro: user.vai_tro },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. Trả kết quả về cho Frontend
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            token: token,
            user: { 
                id: user.ma_nguoi_dung,
                ho_ten: user.ho_ten, 
                name: user.ho_ten,
                email: user.email, 
                so_dien_thoai: user.so_dien_thoai,
                phone: user.so_dien_thoai,
                dia_chi: user.dia_chi,
                address: user.dia_chi,
                vai_tro: user.vai_tro,
                hinh_anh: user.hinh_anh
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 3. QUÊN MẬT KHẨU (Gửi Email)
const quenMatKhau = async (req, res) => {
    try {
        const { email } = req.body;

        // Tìm user
        const [users] = await db.query('SELECT * FROM NGUOI_DUNG WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này!' });
        }

        // Tạo mã token ngẫu nhiên gồm 6 chữ số
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Tạo hạn sử dụng cho token (5 phút kể từ bây giờ)
        const hanToken = new Date(Date.now() + 5 * 60 * 1000);

        // Lưu token và hạn vào DB
        await db.query('UPDATE NGUOI_DUNG SET token_quen_mat_khau = ?, han_token = ? WHERE email = ?', [resetToken, hanToken, email]);

        // Cấu hình Nodemailer gửi mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Nội dung mail
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Khôi phục mật khẩu - Fast Food Store',
            html: `<h3>Xin chào!</h3>
                   <p>Mã khôi phục mật khẩu của bạn là: <b style="font-size: 24px; color: red;">${resetToken}</b></p>
                   <p>Mã này sẽ hết hạn trong vòng <b>5 phút</b>.</p>
                   <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Đã gửi mã khôi phục đến email của bạn!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi gửi email' });
    }
};

// 4. ĐẶT LẠI MẬT KHẨU (Nhập mã + MK mới)
const datLaiMatKhau = async (req, res) => {
    try {
        const { email, ma_xac_nhan, mat_khau_moi } = req.body;

        // Tìm user bằng email, mã xác nhận và đảm bảo mã chưa hết hạn
        const [users] = await db.query(
            'SELECT * FROM NGUOI_DUNG WHERE email = ? AND token_quen_mat_khau = ? AND han_token > NOW()',
            [email, ma_xac_nhan]
        );

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn!' });
        }

        // Cập nhật MK mới (Trực tiếp), đồng thời xóa luôn mã xác nhận đi cho an toàn
        await db.query(
            'UPDATE NGUOI_DUNG SET mat_khau = ?, token_quen_mat_khau = NULL, han_token = NULL WHERE email = ?',
            [mat_khau_moi, email]
        );

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập lại.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
// 5. ĐỔI MẬT KHẨU (Yêu cầu đã đăng nhập)
const doiMatKhau = async (req, res) => {
    try {
        // Lấy ID người dùng từ (middleware) đã xác thực
        const ma_nguoi_dung = req.user.id; 
        
        const { mat_khau_hien_tai, mat_khau_moi, xac_nhan_mat_khau_moi } = req.body;

        // 1. Kiểm tra nhập đủ thông tin
        if (!mat_khau_hien_tai || !mat_khau_moi || !xac_nhan_mat_khau_moi) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        // 2. Kiểm tra độ dài và khớp mật khẩu mới
        if (mat_khau_moi.length < 4 || mat_khau_moi.length > 24) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 4 đến 24 ký tự!' });
        }
        if (mat_khau_moi !== xac_nhan_mat_khau_moi) {
            return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp!' });
        }
        if (mat_khau_hien_tai === mat_khau_moi) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới không được giống mật khẩu hiện tại!' });
        }

        // 3. Lấy mật khẩu cũ từ Database ra để đối chiếu
        const [users] = await db.query('SELECT mat_khau FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
        }

        // 4. Kiểm tra mật khẩu hiện tại khách nhập có khớp với Database không
        if (mat_khau_hien_tai !== users[0].mat_khau) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác!' });
        }

        // 5. Cập nhật mật khẩu mới và lưu vào DB
        await db.query('UPDATE NGUOI_DUNG SET mat_khau = ? WHERE ma_nguoi_dung = ?', [mat_khau_moi, ma_nguoi_dung]);

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
// 6. CẬP NHẬT THÔNG TIN CÁ NHÂN
const capNhatThongTin = async (req, res) => {
    try {
        const ma_nguoi_dung = req.user.id;
        const { ho_ten, email, so_dien_thoai, dia_chi, hinh_anh } = req.body;

        if (!ho_ten || ho_ten.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên!' });
        }

        const cleanEmail = email && email.trim() !== '' ? email.trim() : null;
        const cleanPhone = so_dien_thoai && so_dien_thoai.trim() !== '' ? so_dien_thoai.trim() : null;
        const cleanAddress = dia_chi && dia_chi.trim() !== '' ? dia_chi.trim() : null;
        const cleanAvatar = hinh_anh || null;

        // Kiểm tra xem email / sđt mới có bị trùng với người khác không
        if (cleanEmail) {
            const [users] = await db.query('SELECT * FROM NGUOI_DUNG WHERE email = ? AND ma_nguoi_dung != ?', [cleanEmail, ma_nguoi_dung]);
            if (users.length > 0) return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi tài khoản khác!' });
        }
        if (cleanPhone) {
            const [users] = await db.query('SELECT * FROM NGUOI_DUNG WHERE so_dien_thoai = ? AND ma_nguoi_dung != ?', [cleanPhone, ma_nguoi_dung]);
            if (users.length > 0) return res.status(400).json({ success: false, message: 'Số điện thoại đã được sử dụng bởi tài khoản khác!' });
        }

        await db.query(
            'UPDATE NGUOI_DUNG SET ho_ten = ?, email = ?, so_dien_thoai = ?, dia_chi = ?, hinh_anh = ? WHERE ma_nguoi_dung = ?',
            [ho_ten, cleanEmail, cleanPhone, cleanAddress, cleanAvatar, ma_nguoi_dung]
        );

        // Lấy lại User sau khi cập nhật để có đủ thông tin (vai_tro,...)
        const [updatedUsers] = await db.query('SELECT * FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?', [ma_nguoi_dung]);
        const updatedUser = updatedUsers[0];

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công!',
            user: { 
                id: updatedUser.ma_nguoi_dung,
                ho_ten: updatedUser.ho_ten,
                name: updatedUser.ho_ten, 
                email: updatedUser.email, 
                so_dien_thoai: updatedUser.so_dien_thoai,
                phone: updatedUser.so_dien_thoai, 
                dia_chi: updatedUser.dia_chi,
                address: updatedUser.dia_chi,
                vai_tro: updatedUser.vai_tro,
                hinh_anh: updatedUser.hinh_anh
            }
        });
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        require('fs').appendFileSync('error_debug.log', new Date().toISOString() + ' - capNhatThongTin error: ' + (error.stack || error) + '\n');
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    dangKy,
    dangNhap,
    quenMatKhau,
    datLaiMatKhau,
    doiMatKhau,
    capNhatThongTin
};