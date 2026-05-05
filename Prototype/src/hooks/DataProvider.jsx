import { useState, useEffect } from 'react';
import { DataContext } from './DataContext';
import SITES_MACRO from '../data/sites_macro.json';

export const DataProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(SITES_MACRO);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    siteData,
    setSiteData,
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    sitesMacro: SITES_MACRO
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
