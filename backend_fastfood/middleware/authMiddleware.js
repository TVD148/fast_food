const jwt = require('jsonwebtoken');

const xacThucToken = (req, res, next) => {
    // Lấy token từ header của request
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Truy cập bị từ chối! Vui lòng đăng nhập.' });
    }

    // Token thường có dạng "Bearer eyJhbG..." nên ta cắt lấy phần mã ở sau
    const token = authHeader.split(' ')[1];

    try {
        // Dùng chìa khóa bí mật để kiểm tra xem thẻ thật hay thẻ giả/hết hạn
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Nếu thẻ chuẩn, ta gắn thông tin người dùng (id, vai_tro) vào req để các hàm sau sử dụng
        req.user = decoded; 
        
        // Cho phép đi qua cổng
        next(); 
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn!' });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; 
        } catch (error) {
            // Token không hợp lệ thì bỏ qua (khách)
        }
    }
    next();
};

module.exports = { xacThucToken, optionalAuth };