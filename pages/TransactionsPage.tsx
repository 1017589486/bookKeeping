

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, Category } from '../types';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import Button from '../components/Button';
import Input from '../components/Input';
import CategoryIcon from '../components/CategoryIcon';
import Select from '../components/Select';
import TransactionModal from '../components/TransactionModal';

const TransactionsPage: React.FC = () => {
    const { transactions, categories, activeBillId, addTransaction, updateTransaction, deleteTransaction, bills, assets } = useAppContext();
    const { t, i18n } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTx, setCurrentTx] = useState<Transaction | null>(null);

    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const activeBill = useMemo(() => bills.find(b => b.id === activeBillId), [bills, activeBillId]);
    const canEdit = activeBill?.permission !== 'view';

    const activeBillTransactions = useMemo(
        () => transactions.filter(t => t.billId === activeBillId), 
        [transactions, activeBillId]
    );

    const filteredTransactions = useMemo(() => {
        return activeBillTransactions
            .filter(t => filterCategory ? t.categoryId === filterCategory : true)
            .filter(t => filterType ? t.type === filterType : true)
            .filter(t => searchQuery ? t.notes.toLowerCase().includes(searchQuery.toLowerCase()) : true)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activeBillTransactions, filterCategory, filterType, searchQuery]);
    
    const activeBillName = activeBill?.name || 'Transactions';

    const openModal = (tx: Transaction | null = null) => {
        setCurrentTx(tx);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setCurrentTx(null);
        setIsModalOpen(false);
    };

    const handleSave = (txData: Omit<Transaction, 'id' | 'userId'>, isNew: boolean) => {
      if (isNew) {
        addTransaction(txData);
      } else if(currentTx) {
        updateTransaction({ ...currentTx, ...txData });
      }
      closeModal();
    };

    const handleDelete = (id: string) => {
        if(window.confirm(t('transactions.delete_confirm'))) {
            deleteTransaction(id);
        }
    };
    
    const getCategoryName = (category: Category | undefined) => {
        if (!category) return t('common.uncategorized');
        return category.isSeed ? t(category.name as any) : category.name;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{activeBillName}</h2>
                <Button onClick={() => openModal()} disabled={!canEdit}>{t('transactions.add_transaction')}</Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                    type="search"
                    placeholder={t('transactions.search_notes')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">{t('transactions.all_types')}</option>
                    <option value={TransactionType.INCOME}>{t('transactionTypes.income')}</option>
                    <option value={TransactionType.EXPENSE}>{t('transactionTypes.expense')}</option>
                </Select>
                <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="">{t('transactions.all_categories')}</option>
                    {categories.filter(c => c.billId === activeBillId).map(c => <option key={c.id} value={c.id}>{getCategoryName(c)}</option>)}
                </Select>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">{t('dashboard.category')}</th>
                            <th scope="col" className="px-6 py-3 font-medium">{t('dashboard.date')}</th>
                            <th scope="col" className="px-6 py-3 font-medium">{t('dashboard.notes')}</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">{t('dashboard.amount')}</th>
                            <th scope="col" className="px-6 py-3 font-medium text-center">{t('transactions.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(transaction => {
                            const category = categories.find(c => c.id === transaction.categoryId);
                            return (
                                <tr key={transaction.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 flex items-center">
                                        {category && <CategoryIcon icon={category.icon} color={category.color} />}
                                        <span className="ml-3 font-medium text-gray-900 dark:text-gray-100">{getCategoryName(category)}</span>
                                    </td>
                                    <td className="px-6 py-4">{formatDateTime(transaction.date, i18n.language)}</td>
                                    <td className="px-6 py-4">{transaction.notes}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-secondary' : 'text-danger'}`}>
                                        {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount, i18n.language)}
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => openModal(transaction)} disabled={!canEdit} className="font-medium text-primary hover:text-indigo-500 disabled:text-gray-400 disabled:no-underline">{t('common.edit')}</button>
                                        <button onClick={() => handleDelete(transaction.id)} disabled={!canEdit} className="font-medium text-danger hover:text-red-500 disabled:text-gray-400 disabled:no-underline">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredTransactions.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('transactions.no_transactions')}</p>}
            </div>

            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onSave={handleSave} 
                transaction={currentTx} 
                categories={categories} 
                billId={activeBillId} 
                assets={assets}
            />
        </div>
    );
};


export default TransactionsPage;