

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, Category } from '../types';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import Button from '../components/Button';
import Input from '../components/Input';
import CategoryIcon from '../components/CategoryIcon';
import Select from '../components/Select';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import CalendarInput from '../components/CalendarInput';

const TransactionsPage: React.FC = () => {
    const { user, categories, activeBillId, addTransaction, updateTransaction, deleteTransaction, bills, assets } = useAppContext();
    const { t, i18n } = useTranslation();

    // Page-specific state
    const [pageTransactions, setPageTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
    const [txToDelete, setTxToDelete] = useState<string | null>(null);

    // Filter states
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const activeBill = useMemo(() => bills.find(b => b.id === activeBillId), [bills, activeBillId]);
    const canEdit = activeBill?.permission !== 'view';
    const activeBillName = activeBill?.name || t('nav.transactions');

    const fetchTransactions = useCallback(async () => {
        if (!activeBillId || !user) {
            setPageTransactions([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const params = new URLSearchParams({ billId: activeBillId });
        if (filterCategory) params.append('categoryId', filterCategory);
        if (filterType) params.append('type', filterType);
        if (searchQuery) params.append('searchQuery', searchQuery);
        if (startDate) params.append('startDate', startDate.split('T')[0]);
        if (endDate) params.append('endDate', endDate.split('T')[0]);

        try {
            const response = await fetch(`http://localhost:3001/api/transactions?${params.toString()}`, {
                headers: { 'X-User-ID': user.id }
            });
            const data = await response.json();
            setPageTransactions(data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            setPageTransactions([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeBillId, filterCategory, filterType, searchQuery, startDate, endDate, user]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);
    
    const openModal = (tx: Transaction | null = null) => {
        setCurrentTx(tx);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setCurrentTx(null);
        setIsModalOpen(false);
    };

    const handleSave = async (txData: Omit<Transaction, 'id' | 'userId'>, isNew: boolean) => {
      if (isNew) {
        await addTransaction(txData);
      } else if(currentTx) {
        await updateTransaction({ ...currentTx, ...txData });
      }
      closeModal();
      fetchTransactions();
    };

    const handleDelete = (id: string) => {
        setTxToDelete(id);
    };

    const confirmDelete = async () => {
        if (txToDelete) {
            await deleteTransaction(txToDelete);
            setTxToDelete(null);
            fetchTransactions();
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
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="md:col-span-2 lg:col-span-4">
                     <Input
                        label={t('transactions.search_notes')}
                        type="search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select label={t('transactions.type')} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">{t('transactions.all_types')}</option>
                    <option value={TransactionType.INCOME}>{t('transactionTypes.income')}</option>
                    <option value={TransactionType.EXPENSE}>{t('transactionTypes.expense')}</option>
                </Select>
                <Select label={t('transactions.category')} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="">{t('transactions.all_categories')}</option>
                    {categories.filter(c => c.billId === activeBillId).map(c => <option key={c.id} value={c.id}>{getCategoryName(c)}</option>)}
                </Select>
                <CalendarInput label={t('import_export.from')} value={startDate} onChange={e => setStartDate(e.target.value)} />
                <CalendarInput label={t('import_export.to')} value={endDate} onChange={e => setEndDate(e.target.value)} />
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
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">{t('common.loading')}</td></tr>
                        ) : pageTransactions.length > 0 ? (
                            pageTransactions.map(transaction => {
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
                            })
                        ) : (
                            <tr><td colSpan={5} className="text-center text-gray-500 dark:text-gray-400 py-8">{t('transactions.no_transactions')}</td></tr>
                        )}
                    </tbody>
                </table>
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
             <ConfirmModal
                isOpen={!!txToDelete}
                onClose={() => setTxToDelete(null)}
                onConfirm={confirmDelete}
                title={t('common.confirm_delete')}
                message={t('transactions.delete_confirm')}
            />
        </div>
    );
};


export default TransactionsPage;
