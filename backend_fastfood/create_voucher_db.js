const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({host: 'localhost', user: 'root', database: 'fast_food'});
    
    await conn.execute(`DROP TABLE IF EXISTS ma_giam_gia;`);
    await conn.execute(`
      CREATE TABLE ma_giam_gia (
        ma_code VARCHAR(50) PRIMARY KEY,
        phan_tram_giam INT NOT NULL DEFAULT 0,
        giam_toi_da DECIMAL(10,2) NOT NULL DEFAULT 0,
        don_toi_thieu DECIMAL(10,2) NOT NULL DEFAULT 0,
        ngay_het_han DATETIME NOT NULL,
        so_luong INT NOT NULL DEFAULT 100,
        trang_thai ENUM('hoat_dong', 'ngung_hoat_dong') DEFAULT 'hoat_dong'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Insert some sample data
    await conn.execute(`
      INSERT INTO ma_giam_gia (ma_code, phan_tram_giam, giam_toi_da, don_toi_thieu, ngay_het_han, so_luong)
      VALUES 
      ('GIAM10K', 0, 10000, 50000, DATE_ADD(NOW(), INTERVAL 30 DAY), 100),
      ('SALE20', 20, 50000, 100000, DATE_ADD(NOW(), INTERVAL 30 DAY), 50)
    `);

    console.log('CREATE ma_giam_gia SUCCESS');
    await conn.end();
  } catch(e) {
    console.error(e);
  }
}

run();
