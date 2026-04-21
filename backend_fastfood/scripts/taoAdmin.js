// Script tạo tài khoản Admin
// Chạy: node backend_fastfood/scripts/taoAdmin.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function taoAdmin() {
    try {
        console.log('🔧 Đang tạo tài khoản admin...');
        
        // Kiểm tra xem đã có admin chưa
        const [existing] = await db.query("SELECT * FROM NGUOI_DUNG WHERE vai_tro = 'quan_tri'");
        if (existing.length > 0) {
            console.log('✅ Đã tồn tại tài khoản admin:');
            existing.forEach(u => console.log(`   - ${u.ho_ten} | email: ${u.email || u.so_dien_thoai}`));
            process.exit(0);
        }

        // Tạo admin mới
        await db.query(
            "INSERT INTO NGUOI_DUNG (ho_ten, email, mat_khau, vai_tro) VALUES (?, ?, ?, 'quan_tri')",
            ['Admin FastFood', 'admin@fastfood.com', 'admin123']
        );
        
        console.log('✅ Tạo tài khoản admin thành công!');
        console.log('');
        console.log('📋 Thông tin đăng nhập:');
        console.log('   Email   : admin@fastfood.com');
        console.log('   Mật khẩu: admin123');
        console.log('');
        console.log('⚠️  Hãy đổi mật khẩu sau khi đăng nhập!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

taoAdmin();
