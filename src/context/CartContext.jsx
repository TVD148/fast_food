import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  // Kiểm tra có token JWT không (user đăng nhập email/password mới có)
  const hasToken = () => !!localStorage.getItem('token');

  // Load cart from backend when logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoggedIn) {
        setCartItems([]);
        return;
      }
      // Nếu là user Google/Apple (Firebase) thì không có JWT token -> dùng local
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const data = await cartService.getCart(token);
        if (data.success) {
          // Map DB response to expected FE format
          const formattedCart = data.data.map(item => ({
            id: item.ma_mon_an,
            name: item.ten_mon,
            price: Number(item.gia_ban),
            img: item.hinh_anh,
            quantity: item.so_luong
          }));
          setCartItems(formattedCart);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };
    fetchCart();
  }, [isLoggedIn]);

  const addToCart = async (product, quantity = 1) => {
    // Nếu chưa đăng nhập hoặc là user Firebase (không có JWT) -> dùng local state
    if (!isLoggedIn || !hasToken()) {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [...prevItems, { ...product, quantity: quantity }];
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = await cartService.addToCart(product.id, quantity, token);
      if (data.success) {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (existingItem) {
            return prevItems.map(item => 
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          }
          return [...prevItems, { ...product, quantity: quantity }];
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn || !hasToken()) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const data = await cartService.removeFromCart(productId, token);
      if (data.success) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      }
    } catch (err) {
       console.error(err);
    }
  };

  const updateQuantity = async (productId, amount) => {
    const item = cartItems.find(i => i.id === productId);
    if (!item) return;
    const newQuantity = item.quantity + amount;
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (!isLoggedIn || !hasToken()) {
      setCartItems(prevItems => 
        prevItems.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = await cartService.updateQuantity(productId, newQuantity, token);
      if (data.success) {
        setCartItems(prevItems => 
          prevItems.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeCart = () => setIsCartOpen(false);

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartCount,
      getCartTotal,
      toggleCart,
      closeCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
