const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({host: 'localhost', user: 'root', database: 'fast_food'});
    await conn.execute(`ALTER TABLE don_hang ADD COLUMN ma_giam_gia VARCHAR(50) DEFAULT NULL, ADD COLUMN so_tien_giam DECIMAL(10,2) DEFAULT 0;`);
    console.log('ALTER don_hang SUCCESS');
    await conn.end();
  } catch(e) {
    console.error(e);
  }
}

run();
