import { API_BASE_URL } from '../api/apiConfig';

const adminUserService = {
  /**
   * Lấy danh sách người dùng
   */
  getUsers: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  },

  /**
   * Cập nhật vai trò người dùng
   */
  updateUserRole: async (id, role, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}/vai-tro`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ vai_tro: role })
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái người dùng (Khóa/Mở khóa/Cấm)
   */
  updateUserStatus: async (id, statusData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}/trang-thai`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(statusData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  /**
   * Xóa người dùng
   */
  deleteUser: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguoi-dung/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default adminUserService;
