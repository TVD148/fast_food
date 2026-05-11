import { API_BASE_URL } from '../api/apiConfig';

const staffService = {
  /**
   * Lấy thống kê ca làm việc
   */
  getShiftStats: async (token) => {
    try {
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/thong-ke-ca`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await r.json();
    } catch (error) {
      console.error('Error fetching shift stats:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng cho nhân viên (có phân trang, lọc, tìm kiếm)
   */
  getOrders: async (params, token) => {
    try {
      const query = new URLSearchParams(params).toString();
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/don-hang?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await r.json();
    } catch (error) {
      console.error('Error fetching staff orders:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng (nhân viên)
   */
  updateOrderStatus: async (orderId, status, token) => {
    try {
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/${orderId}/trang-thai`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trang_thai: status })
      });
      return await r.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Gửi hóa đơn qua email
   */
  sendInvoiceEmail: async (orderId, email, token) => {
    try {
      const r = await fetch(`${API_BASE_URL}/don-hang/nhan-vien/${orderId}/gui-email`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      return await r.json();
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  },

  /**
   * Lấy toàn bộ món ăn (quản lý tồn kho cho nhân viên)
   */
  getInventory: async (token) => {
    try {
      const r = await fetch(`${API_BASE_URL}/mon-an/nhan-vien/tat-ca`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await r.json();
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  /**
   * Bật/Tắt trạng thái món ăn (Còn hàng/Hết hàng)
   */
  toggleProductStatus: async (productId, token) => {
    try {
      const r = await fetch(`${API_BASE_URL}/mon-an/${productId}/trang-thai`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await r.json();
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  }
};

export default staffService;
