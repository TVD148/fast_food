import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider, appleProvider } from '../config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Khi khởi động app, kiểm tra xem có ai đang đăng nhập không
  useEffect(() => {
    // Local storage check cho tài khoản thường
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }

    // Firebase listener cho Google/Apple
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = { 
          id: user.uid, 
          name: user.displayName || 'Người dùng hệ thống', 
          email: user.email,
          provider: 'firebase'
        };
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    });

    return () => unsubscribe();
  }, []);

  // Đăng ký tài khoản mới
  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dang-ky`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ho_ten: name, tai_khoan: email, mat_khau: password, xac_nhan_mat_khau: password })
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Lỗi kết nối server' };
    }
  };

  // Đăng nhập
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dang-nhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tai_khoan: email, mat_khau: password })
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
      }
      return { success: data.success, message: data.message };
    } catch (error) {
       console.error(error);
       return { success: false, message: 'Lỗi kết nối server' };
    }
  };

  // Đăng xuất
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    // Đăng xuất từ Firebase (nếu là user Firebase)
    signOut(auth).catch(error => console.error("Firebase signout error:", error));
  };

  // Gửi mã OTP qua email
  const sendOTP = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/quen-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Lỗi kết nối server' };
    }
  };

  // Xác nhận mã OTP và đặt lại mật khẩu
  const verifyAndResetPassword = async (email, otp, newPassword) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/dat-lai-mat-khau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ma_xac_nhan: otp, mat_khau_moi: newPassword })
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Lỗi kết nối server' };
    }
  };

  // Đăng nhập với Google thật qua Firebase
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return { success: true, message: `Đăng nhập Google thành công. Xin chào, ${user.displayName}!` };
    } catch (error) {
      return { success: false, message: `Lỗi đăng nhập Google: ${error.message}` };
    }
  };

  // Đăng nhập với Apple thật qua Firebase
  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      return { success: true, message: `Đăng nhập Apple thành công. Xin chào, ${user.displayName || 'bạn'}!` };
    } catch (error) {
      return { success: false, message: `Lỗi đăng nhập Apple: ${error.message}` };
    }
  };

  // Cập nhật thông tin cục bộ
  const updateUser = (updatedData) => {
    const newUserData = { ...currentUser, ...updatedData };
    setCurrentUser(newUserData);
    localStorage.setItem('currentUser', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      register,
      login,
      logout,
      sendOTP,
      verifyAndResetPassword,
      loginWithGoogle,
      loginWithApple,
      updateUser,
      isLoggedIn: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
