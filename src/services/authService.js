import { API_BASE_URL } from '../api/apiConfig';

const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  register: async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dang-ky`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ho_ten: name, 
          tai_khoan: email, 
          mat_khau: password, 
          xac_nhan_mat_khau: password 
        })
      });
      return await res.json();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Đăng nhập
   */
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tai_khoan: email, mat_khau: password })
      });
      return await res.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Gửi mã OTP qua email (Quên mật khẩu)
   */
  sendOTP: async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/quen-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  /**
   * Xác nhận mã OTP và đặt lại mật khẩu
   */
  verifyAndResetPassword: async (email, otp, newPassword) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dat-lai-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          ma_xac_nhan: otp, 
          mat_khau_moi: newPassword 
        })
      });
      return await res.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng hiện tại (nếu cần)
   */
  getProfile: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin profile (API backend)
   */
  updateProfile: async (token, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authService;
