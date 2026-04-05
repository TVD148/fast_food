const db = require('../config/db');

const getDanhSachDanhMuc = async (req, res) => {
    try {
        const sql = 'SELECT * FROM DANH_MUC';
        const [rows] = await db.query(sql);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách danh mục thành công',
            data: rows
        });
    } catch (error) {
        console.error('Lỗi lấy danh mục:', error);
        res.status(500).json({ success: false, message: 'Lỗi server Backend' });
    }
};

module.exports = {
    getDanhSachDanhMuc
};
