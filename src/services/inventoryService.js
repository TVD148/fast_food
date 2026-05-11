import { API_BASE_URL } from '../api/apiConfig';

const inventoryService = {
  /**
   * Quản lý nguyên liệu (CRUD)
   */
  getMaterials: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguyen-lieu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  },

  addMaterial: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguyen-lieu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  },

  updateMaterial: async (id, data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguyen-lieu/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  },

  deleteMaterial: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nguyen-lieu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },

  /**
   * Nhập / Xuất kho
   */
  importStock: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/nhap-kho`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error importing stock:', error);
      throw error;
    }
  },

  exportStock: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/xuat-kho`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error exporting stock:', error);
      throw error;
    }
  },

  /**
   * Lịch sử giao dịch
   */
  getImportHistory: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lich-su-nhap-kho`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching import history:', error);
      throw error;
    }
  },

  getExportHistory: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lich-su-xuat-kho`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching export history:', error);
      throw error;
    }
  }
};

export default inventoryService;
