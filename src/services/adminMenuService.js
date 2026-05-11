import { API_BASE_URL } from '../api/apiConfig';

const adminMenuService = {
  /**
   * Quản lý món ăn
   */
  getMenuItems: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  createMenuItem: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  updateMenuItem: async (id, data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  deleteMenuItem: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  /**
   * Quản lý danh mục
   */
  getCategories: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/danh-muc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  createCategory: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/danh-muc`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, data, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/danh-muc/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/danh-muc/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default adminMenuService;
