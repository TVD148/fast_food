const db = require('../config/db'); 

const taoDanhGia = async (req, res) => {
    try {
        // 1. Lấy thông tin user từ token (do middleware xacThucToken cung cấp)
        // Giả sử trong authMiddleware bạn lưu thông tin giải mã vào req.user.ma_nguoi_dung
        const ma_nguoi_dung = req.user.id; 
        
        // 2. Lấy dữ liệu FE (hoặc Postman) gửi lên
        const { ma_mon_an, so_sao, binh_luan } = req.body;

        // Validate cơ bản
        if (!ma_mon_an || !so_sao) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp mã món ăn và số sao.' 
            });
        }
        if (so_sao < 1 || so_sao > 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Số sao đánh giá phải từ 1 đến 5.' 
            });
        }

        // 3. LOGIC QUAN TRỌNG: Kiểm tra user đã mua món này & đơn hàng đã hoàn thành chưa?
        const checkMuaHangQuery = `
            SELECT 1 
            FROM DON_HANG dh
            JOIN CHI_TIET_DON_HANG ct ON dh.ma_don_hang = ct.ma_don_hang
            WHERE dh.ma_nguoi_dung = ? 
              AND ct.ma_mon_an = ? 
              AND dh.trang_thai = 'hoan_thanh'
            LIMIT 1;
        `;
        const [daMua] = await db.execute(checkMuaHangQuery, [ma_nguoi_dung, ma_mon_an]);

        // Nếu mảng rỗng (không tìm thấy đơn hàng nào thỏa mãn)
        if (daMua.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn chưa mua món ăn này hoặc đơn hàng chưa giao thành công nên không thể đánh giá.' 
            });
        }

        // 4. (Tuỳ chọn thêm) Kiểm tra xem user đã đánh giá món này trước đó chưa để tránh spam
        const checkDaDanhGiaQuery = `SELECT 1 FROM DANH_GIA WHERE ma_nguoi_dung = ? AND ma_mon_an = ? LIMIT 1`;
        const [daDanhGia] = await db.execute(checkDaDanhGiaQuery, [ma_nguoi_dung, ma_mon_an]);
        
        if (daDanhGia.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn đã đánh giá món ăn này rồi.' 
            });
        }

        // 5. Thỏa mãn hết điều kiện -> Lưu đánh giá vào DB
        const insertQuery = `
            INSERT INTO DANH_GIA (ma_nguoi_dung, ma_mon_an, so_sao, binh_luan)
            VALUES (?, ?, ?, ?)
        `;
        await db.execute(insertQuery, [ma_nguoi_dung, ma_mon_an, so_sao, binh_luan || '']);

        res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn! Đánh giá món ăn đã được ghi nhận.'
        });

    } catch (error) {
        console.error("Lỗi taoDanhGia:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi xử lý đánh giá.' 
        });
    }
};

module.exports = {
    taoDanhGia
};

