import { API_BASE_URL } from '../api/apiConfig';

const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (orderData, token) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/don-hang/tao-don`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra mã giảm giá
   */
  verifyVoucher: async (code, totalAmount) => {
    try {
      const res = await fetch(`${API_BASE_URL}/don-hang/kiem-tra-ma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ma_giam_gia: code, tong_tien: totalAmount })
      });
      return await res.json();
    } catch (error) {
      console.error('Error verifying voucher:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử đơn hàng của khách hàng
   */
  getOrderHistory: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/don-hang/lich-su`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  },

  /**
   * Khách hàng hủy đơn hàng (trong vòng 5 phút)
   */
  cancelOrder: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/don-hang/khach-hang-huy/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  /**
   * Gửi đánh giá món ăn
   */
  submitReview: async (reviewData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/danh-gia/tao-moi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách địa chỉ đã lưu
   */
  getSavedAddresses: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dia-chi`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      throw error;
    }
  }
};

export default orderService;
