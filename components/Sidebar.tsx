import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
    const { t } = useTranslation();

    const navItems = [
      { path: '/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: t('nav.dashboard') },
      { path: '/bills', icon: 'M3 10h18M3 14h18M3 6h18M3 18h18', label: t('nav.bills') },
      { path: '/transactions', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', label: t('nav.transactions') },
      { path: '/categories', icon: 'M5 8h14M5 12h14M5 16h14', label: t('nav.categories') },
      { path: '/import-export', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', label: t('nav.import_export') },
      { path: '/sharing', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: t('nav.sharing') },
      { path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', label: t('nav.settings') },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0a3 3 0 00-3 3v1a3 3 0 003 3h1a3 3 0 003-3v-1a3 3 0 00-3-3h-1zm-4 4h12M3 15v-2a3 3 0 013-3h12a3 3 0 013 3v2" />
                </svg>
                <h1 className="text-2xl font-bold ml-3 text-gray-900 dark:text-white">FinTrack</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;