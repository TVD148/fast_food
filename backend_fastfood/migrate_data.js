const mysql = require('mysql2/promise');
require('dotenv').config();

const categories = [
  { name: 'Gà Rán', icon: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100&h=100&fit=crop' },
  { name: 'Combo Gia Đình', icon: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&h=100&fit=crop' },
  { name: 'Mì Ý', icon: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100&h=100&fit=crop' },
  { name: 'Hamburger', icon: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop' },
  { name: 'Bánh Mì Kẹp', icon: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop' },
  { name: 'Ăn Vặt Xèo Xèo', icon: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=100&h=100&fit=crop' },
  { name: 'Trà & Giải Khát', icon: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=100&h=100&fit=crop' },
];

const products = [
  { name: 'Gà Rán Giòn Cay (2 Miếng)', price: 75000, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', category: 'Gà Rán' },
  { name: 'Gà Rán Truyền Thống (3 Miếng)', price: 105000, img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=400&fit=crop', category: 'Gà Rán' },
  { name: 'Cánh Gà Sốt Chua Ngọt', price: 85000, img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop', category: 'Gà Rán' },
  { name: 'Gà Giòn Không Xương', price: 65000, img: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&h=400&fit=crop', category: 'Gà Rán' },
  { name: 'Mì Ý Sốt Bò Bằm Jollibee', price: 55000, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop', category: 'Mì Ý' },
  { name: 'Mì Ý Hải Sản Đút Lò', price: 95000, img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop', category: 'Mì Ý' },
  { name: 'Combo Bữa Tiệc (6 Gà + 2 Khoai + 3 Nước)', price: 299000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop', category: 'Combo Gia Đình' },
  { name: 'Combo Siêu Gà (4 Gà + 2 Mì Ý)', price: 225000, img: 'https://plus.unsplash.com/premium_photo-1661608671754-5221b6d17e65?w=400&h=400&fit=crop', category: 'Combo Gia Đình' },
  { name: 'Combo Đôi Bạn (2 Gà + 1 Burger + 1 Khoai + 2 Nước)', price: 165000, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop', category: 'Combo Gia Đình' },
  { name: 'Burger Gà Zinger Cay', price: 65000, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop', category: 'Hamburger' },
  { name: 'Burger Bò Pho Mát Đôi', price: 95000, img: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=400&fit=crop', category: 'Hamburger' },
  { name: 'Sandwich Kẹp Thịt Nướng', price: 75000, img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop', category: 'Bánh Mì Kẹp' },
  { name: 'Khoai Tây Chiên (Lớn)', price: 40000, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop', category: 'Ăn Vặt Xèo Xèo' },
  { name: 'Khoai Tây Lắc Phô Mai', price: 50000, img: 'https://images.unsplash.com/photo-1630431341973-02e1b662ce3b?w=400&h=400&fit=crop', category: 'Ăn Vặt Xèo Xèo' },
  { name: 'Súp Gà Ngô Non', price: 25000, img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop', category: 'Ăn Vặt Xèo Xèo' },
  { name: 'Bắp Cải Trộn (Coleslaw)', price: 20000, img: 'https://images.unsplash.com/photo-1627443810842-7cf216ce70a3?w=400&h=400&fit=crop', category: 'Ăn Vặt Xèo Xèo' },
  { name: 'Pepsi / Coca Cola (Cốc Lớn)', price: 25000, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop', category: 'Trà & Giải Khát' },
  { name: 'Trà Sữa Thái Xanh', price: 35000, img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop', category: 'Trà & Giải Khát' },
  { name: 'Lipton Đá Chanh', price: 25000, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop', category: 'Trà & Giải Khát' },
];

async function migrateData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    for (const cat of categories) {
      // Check if category exists
      const [rows] = await connection.execute('SELECT * FROM DANH_MUC WHERE ten_danh_muc = ?', [cat.name]);
      if (rows.length === 0) {
        await connection.execute('INSERT INTO DANH_MUC (ten_danh_muc, hinh_anh) VALUES (?, ?)', [cat.name, cat.icon]);
        console.log(`Inserted category: ${cat.name}`);
      } else {
        await connection.execute('UPDATE DANH_MUC SET hinh_anh = ? WHERE ma_danh_muc = ?', [cat.icon, rows[0].ma_danh_muc]);
      }
    }

    const [allCategories] = await connection.execute('SELECT ma_danh_muc, ten_danh_muc FROM DANH_MUC');
    const categoryMap = {};
    for (const c of allCategories) {
      categoryMap[c.ten_danh_muc] = c.ma_danh_muc;
    }

    for (const prod of products) {
      const catId = categoryMap[prod.category];
      if (!catId) {
        console.warn(`Category not found for product: ${prod.name}`);
        continue;
      }
      const [rows] = await connection.execute('SELECT * FROM MON_AN WHERE ten_mon = ?', [prod.name]);
      if (rows.length === 0) {
        await connection.execute(
          'INSERT INTO MON_AN (ten_mon, gia_ban, hinh_anh, con_hang, ma_danh_muc) VALUES (?, ?, ?, ?, ?)',
          [prod.name, prod.price, prod.img, 1, catId]
        );
        console.log(`Inserted product: ${prod.name}`);
      }
    }
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

migrateData();
