import { API_BASE_URL } from '../api/apiConfig';

const voucherService = {
  /**
   * Lấy danh sách mã giảm giá
   */
  getVouchers: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ma-giam-gia`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  },

  /**
   * Tạo mã giảm giá mới
   */
  createVoucher: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ma-giam-gia`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  },

  /**
   * Cập nhật mã giảm giá
   */
  updateVoucher: async (code, data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ma-giam-gia/${code}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating voucher:', error);
      throw error;
    }
  },

  /**
   * Xóa mã giảm giá
   */
  deleteVoucher: async (code, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ma-giam-gia/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      throw error;
    }
  }
};

export default voucherService;
