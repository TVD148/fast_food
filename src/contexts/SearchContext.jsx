import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/mon-an`);
        const d = await r.json();
        if (d.success) setAllProducts(d.data);
      } catch {}
    };
    fetchAll();
  }, []);

  const suggestions = searchQuery.trim().length > 0 
    ? allProducts.filter(p => p.ten_mon.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const closeSearch = () => setIsSearchOpen(false);

  const selectCategory = (category) => {
    setCategoryFilter(category);
    setSearchQuery(''); // Xóa tìm kiếm text khi chọn danh mục
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
      selectCategory,
      clearFilters,
      isSearchOpen,
      toggleSearch,
      closeSearch,
      suggestions
    }}>
      {children}
    </SearchContext.Provider>
  );
};
