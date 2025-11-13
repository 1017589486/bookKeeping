import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import Select from './Select';

const Header: React.FC = () => {
  const { user, logout, bills, activeBillId, setActiveBillId } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return t(`nav.${path.replace('-', '_')}`);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Select
          value={activeBillId || ''}
          onChange={(e) => setActiveBillId(e.target.value)}
          aria-label={t('header.select_bill')}
        >
          {bills.map(bill => (
            <option key={bill.id} value={bill.id}>{bill.name}</option>
          ))}
        </Select>

        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          aria-label={t('header.language')}
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </Select>
        
        <button 
          onClick={toggleTheme} 
          className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-gray-800 dark:text-gray-100 font-medium">{user?.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('header.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;