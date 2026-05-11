import { API_BASE_URL } from '../api/apiConfig';

const adminService = {
  /**
   * Lấy dữ liệu tổng quan cho Dashboard
   */
  getDashboardStats: async (type = 'tat_ca', token, nam, quy) => {
    try {
      let url = `${API_BASE_URL}/admin/dashboard?kieu=${type}`;
      if (nam) url += `&nam=${nam}`;
      if (quy) url += `&quy=${quy}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, message: 'Lỗi kết nối server' };
    }
  },

  /**
   * Lấy dữ liệu doanh thu theo thời gian (7 ngày, 4 tuần, 12 tháng)
   */
  getRevenueChartData: async (type = '7ngay', token, nam, quy) => {
    try {
      let url = `${API_BASE_URL}/admin/dashboard/doanh-thu?kieu=${type}`;
      if (nam) url += `&nam=${nam}`;
      if (quy) url += `&quy=${quy}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      throw error;
    }
  },

  /**
   * Quản lý món ăn (Admin)
   */
  getProducts: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  },

  createProduct: async (productData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(productData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(productData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mon-an/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Quản lý đơn hàng (Admin)
   */
  getOrders: async (params, token) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/admin/don-hang?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  },
  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   */
  updateOrderStatus: async (id, status, token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/don-hang/${id}/trang-thai`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ trang_thai: status })
      });
      return await res.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

export default adminService;
