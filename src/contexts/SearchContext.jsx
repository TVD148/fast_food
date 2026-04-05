import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      closeSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};
