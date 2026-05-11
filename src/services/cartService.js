import { API_BASE_URL } from '../api/apiConfig';

const cartService = {
  /**
   * Lấy danh sách giỏ hàng từ server
   */
  getCart: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  /**
   * Thêm món vào giỏ hàng
   */
  addToCart: async (productId, quantity, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/them`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ma_mon_an: productId, so_luong: quantity })
      });
      return await res.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Xóa món khỏi giỏ hàng
   */
  removeFromCart: async (productId, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/xoa/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  /**
   * Cập nhật số lượng món trong giỏ hàng
   */
  updateQuantity: async (productId, quantity, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/gio-hang/cap-nhat`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ma_mon_an: productId, so_luong: quantity })
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  }
};

export default cartService;
