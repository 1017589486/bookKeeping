

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Asset } from '../types';
import Button from './Button';

interface AssetCardProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  formatCurrency: (value: number) => string;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit, onDelete, onViewDetails, formatCurrency }) => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase tracking-wide">{asset.type}</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{asset.name}</h3>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(asset.balance)}</p>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 flex justify-between items-center rounded-b-lg border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" onClick={onViewDetails}>{t('assets.view_details')}</Button>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                      </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-600">
                            <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">{t('common.edit')}</button>
                            <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white">{t('common.delete')}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetCard;
