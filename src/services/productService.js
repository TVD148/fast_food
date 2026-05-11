import { API_BASE_URL } from '../api/apiConfig';

const productService = {
  /**
   * Lấy danh sách tất cả món ăn
   */
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mon-an`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách danh mục món ăn
   */
  getCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/danh-muc`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách món ăn bán chạy
   */
  getBestSellers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mon-an/ban-chay`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm món ăn (API backend nếu có, hoặc filter ở frontend)
   */
  searchProducts: async (query) => {
    try {
      // Giả sử backend có endpoint search, nếu không sẽ dùng filter ở FE
      const response = await fetch(`${API_BASE_URL}/mon-an/search?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

export default productService;
