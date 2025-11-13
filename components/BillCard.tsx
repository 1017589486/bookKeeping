

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bill } from '../types';
import Button from './Button';
import { formatCurrency } from '../utils/helpers';

interface BillCardProps {
  bill: Bill;
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
  borderColor: string;
  onViewDetails: () => void;
  onAddTransaction: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}

const BillCard: React.FC<BillCardProps> = ({ bill, stats, borderColor, onViewDetails, onAddTransaction, onEdit, onDelete, canEdit }) => {
  const { t, i18n } = useTranslation();
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${borderColor}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{bill.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('bills.created_at', { date: bill.createdAt })}</p>
          </div>
          { canEdit && <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-600">
                <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">{t('common.edit')}</button>
                <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white">{t('common.delete')}</button>
              </div>
            )}
          </div>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.total_income')}</p>
            <p className="text-lg font-semibold text-green-500">{formatCurrency(stats.income, i18n.language)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.total_expense')}</p>
            <p className="text-lg font-semibold text-red-500">{formatCurrency(stats.expense, i18n.language)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mx-5"></div>

      <div className="p-5">
         <div className="flex justify-between items-center">
           <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.balance')}</p>
           <p className={`text-xl font-bold ${stats.balance >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-500'}`}>
             {formatCurrency(stats.balance, i18n.language)}
           </p>
         </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end space-x-3 rounded-b-lg">
        <Button variant="ghost" className="border border-gray-300 dark:border-gray-600" onClick={onViewDetails}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('bills.view_details')}
        </Button>
        <Button onClick={onAddTransaction} disabled={!canEdit}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('transactions.add_transaction')}
        </Button>
      </div>
    </div>
  );
};

export default BillCard;
