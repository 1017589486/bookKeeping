
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../hooks/useAppContext';
import { formatCurrency } from '../../utils/helpers';
import CategoryIcon from '../CategoryIcon'; // Reusing for consistent icon style

const AccountSelectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (assetId: string) => void; }> = ({ isOpen, onClose, onSelect }) => {
    const { t, i18n } = useTranslation();
    const { assets } = useAppContext();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full rounded-t-2xl p-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('add_transaction.select_account')}</h3>
                    <button className="text-primary font-semibold">{t('add_transaction.add_account')}</button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                     <div onClick={() => onSelect('')} className="flex flex-col items-center text-center space-y-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                         <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                         </div>
                         <span className="text-sm">不选择账户</span>
                    </div>
                    {assets.map(asset => (
                        <div key={asset.id} onClick={() => onSelect(asset.id)} className="flex flex-col items-center text-center space-y-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                             <CategoryIcon icon="piggy-bank" color="#34C759" size="h-12 w-12" />
                             <span className="text-sm">{asset.name}</span>
                             <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(asset.balance, i18n.language).replace('CN¥', '').replace('$', '')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccountSelectModal;