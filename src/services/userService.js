import { API_BASE_URL } from '../api/apiConfig';

const userService = {
  /**
   * Cập nhật thông tin tài khoản
   */
  updateInfo: async (userData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/cap-nhat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating user info:', error);
      throw error;
    }
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (passwordData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/doi-mat-khau`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Quản lý địa chỉ (CRUD)
   */
  addAddress: async (addressData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dia-chi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  updateAddress: async (id, addressData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dia-chi/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dia-chi/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  setDefaultAddress: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dia-chi/${id}/mac-dinh`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
};

export default userService;
