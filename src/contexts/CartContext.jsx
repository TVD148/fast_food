import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../apiConfig';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  // Load cart from backend when logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoggedIn) {
        setCartItems([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/gio-hang`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
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

  const addToCart = async (product) => {
    if (!isLoggedIn) {
      // Guest mode: update local state only
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/gio-hang/them`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ma_mon_an: product.id, so_luong: 1 })
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (existingItem) {
            return prevItems.map(item => 
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prevItems, { ...product, quantity: 1 }];
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/gio-hang/xoa/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
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

    if (!isLoggedIn) {
      setCartItems(prevItems => 
        prevItems.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/gio-hang/cap-nhat`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ma_mon_an: productId, so_luong: newQuantity })
      });
      const data = await res.json();
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
