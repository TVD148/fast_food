// Script fix encoding tiếng Việt trong DB
const mysql = require('mysql2/promise');
require('dotenv').config();

const MON_AN = [
  [1,  'Burger Bò Phô Mai',                 'Bò nướng lửa hồng kèm phô mai'],
  [2,  'Burger Gà Giòn',                     'Gà chiên giòn rụm'],
  [3,  'Trà Chanh Lạnh',                     'Giải nhiệt mùa hè'],
  [4,  'Gà Rán Giòn Cay (2 Miếng)',          null],
  [5,  'Gà Rán Truyền Thống (3 Miếng)',      null],
  [6,  'Cánh Gà Sốt Chua Ngọt',             null],
  [7,  'Gà Giòn Không Xương',               null],
  [8,  'Mì Ý Sốt Bò Bằm Jollibee',         null],
  [9,  'Mì Ý Hải Sản Đút Lò',              null],
  [10, 'Combo Bữa Tiệc (6 Gà + 2 Khoai + 3 Nước)', null],
  [11, 'Combo Siêu Gà (4 Gà + 2 Mì Ý)',    null],
  [12, 'Combo Đôi Bạn (2 Gà + 1 Burger + 1 Khoai + 2 Nước)', null],
  [13, 'Burger Gà Zinger Cay',              null],
  [14, 'Burger Bò Phô Mát',                 null],
  [15, 'Sandwich Kẹp Thịt Nướng',           null],
  [16, 'Khoai Tây Chiên (Lớn)',             null],
  [17, 'Khoai Tây Lắc Phô Mai',            null],
  [18, 'Súp Gà Ngô Non',                   null],
  [19, 'Bắp Cải Trộn (Coleslaw)',           null],
  [20, 'Pepsi / Coca Cola (Cốc Lớn)',       null],
  [21, 'Trà Sữa Thái Xanh',               null],
  [22, 'Lipton Đá Chanh',                   null],
];

const DANH_MUC = [
  [1, 'Burger',       'Các loại burger thơm ngon'],
  [2, 'Đồ Uống',     'Nước giải khát, trà, cà phê'],
  [3, 'Gà Rán',      null],
  [4, 'Combo',        null],
  [5, 'Mì Ý',        null],
  [7, 'Bánh Mì Kẹp', null],
  [8, 'Ăn Vặt',      null],
];

async function fixEncoding() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'UTF8MB4_UNICODE_CI',
  });

  // Fix tên người dùng
  await conn.execute("UPDATE nguoi_dung SET ho_ten = ? WHERE ma_nguoi_dung = 3", ['Trần Văn Đình']);

  // Fix tên người nhận trong đơn hàng
  await conn.execute(
    "UPDATE don_hang SET ho_ten_nguoi_nhan = ? WHERE ma_nguoi_dung = 3 AND ho_ten_nguoi_nhan != ''",
    ['Trần Văn Đình']
  );

  // Fix ghi chú đơn hàng
  await conn.execute("UPDATE don_hang SET ghi_chu = ? WHERE ma_don_hang = 1", ['Cho em thêm xíu tương ớt, không lấy hành nha shop']);
  await conn.execute("UPDATE don_hang SET ghi_chu = ? WHERE ma_don_hang = 2", ['Cho em thêm xíu tương ớt, không lấy hành nha shop']);
  await conn.execute("UPDATE don_hang SET ghi_chu = ? WHERE ma_don_hang = 3", ['cay']);

  // Fix tên + mô tả món ăn
  for (const [id, ten, mo_ta] of MON_AN) {
    if (mo_ta) {
      await conn.execute("UPDATE mon_an SET ten_mon = ?, mo_ta = ? WHERE ma_mon_an = ?", [ten, mo_ta, id]);
    } else {
      await conn.execute("UPDATE mon_an SET ten_mon = ? WHERE ma_mon_an = ?", [ten, id]);
    }
  }

  // Fix tên + mô tả danh mục
  for (const [id, ten, mo_ta] of DANH_MUC) {
    if (mo_ta) {
      await conn.execute("UPDATE danh_muc SET ten_danh_muc = ?, mo_ta = ? WHERE ma_danh_muc = ?", [ten, mo_ta, id]);
    } else {
      await conn.execute("UPDATE danh_muc SET ten_danh_muc = ? WHERE ma_danh_muc = ?", [ten, id]);
    }
  }

  // Kiểm tra kết quả
  const [monAn] = await conn.execute("SELECT ma_mon_an, ten_mon FROM mon_an ORDER BY ma_mon_an");
  console.log('=== MON_AN ===');
  monAn.forEach(m => console.log(`  [${m.ma_mon_an}] ${m.ten_mon}`));

  const [users] = await conn.execute("SELECT ma_nguoi_dung, ho_ten FROM nguoi_dung");
  console.log('=== NGUOI_DUNG ===');
  users.forEach(u => console.log(`  [${u.ma_nguoi_dung}] ${u.ho_ten}`));

  await conn.end();
  console.log('\n✅ Fix encoding hoàn tất!');
}

fixEncoding().catch(console.error);

