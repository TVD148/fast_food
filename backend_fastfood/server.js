const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const monAnRoutes = require('./routes/monAnRoutes');
const authRoutes = require('./routes/authRoutes');
const gioHangRoutes = require('./routes/gioHangRoutes');
const donHangRoutes = require('./routes/donHangRoutes');
const danhGiaRoutes = require('./routes/danhGiaRoutes');
const danhMucRoutes = require('./routes/danhMucRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Khai báo đường dẫn API gốc
app.use('/api/mon-an', monAnRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gio-hang', gioHangRoutes);
app.use('/api/don-hang', donHangRoutes);
app.use('/api/danh-gia', danhGiaRoutes);
app.use('/api/danh-muc', danhMucRoutes);
app.use('/api/admin', adminRoutes);

// --- PHẦN PHỤC VỤ FRONTEND ---
// Serve folder 'public' (Sau khi bạn copy nội dung folder dist của frontend vào đây)
app.use(express.static(path.join(__dirname, 'public')));

// Tuyến đường catch-all: Nếu không phải API, thì trả về file index.html của Frontend
// Giúp React Router hoạt động bình thường trên link đã deploy
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'Frontend files not found in /public. Please run npm run build and copy dist to public.' 
        });
    }
});


// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server Backend đang chạy tại: http://localhost:${PORT}`);
});