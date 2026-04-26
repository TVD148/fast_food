const db = require('../config/db');

async function migrate() {
    try {
        // Kiểm tra cột đã tồn tại chưa
        const [cols] = await db.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'NGUOI_DUNG' AND COLUMN_NAME = 'trang_thai'
        `);

        if (cols.length > 0) {
            console.log('✅ Cột trang_thai đã tồn tại, bỏ qua.');
        } else {
            await db.query(`
                ALTER TABLE NGUOI_DUNG
                ADD COLUMN trang_thai ENUM('hoat_dong','bi_khoa','bi_cam') NOT NULL DEFAULT 'hoat_dong'
            `);
            console.log('✅ Đã thêm cột trang_thai vào bảng NGUOI_DUNG!');
        }
    } catch (err) {
        console.error('❌ Lỗi migration:', err.message);
    } finally {
        process.exit(0);
    }
}

migrate();
