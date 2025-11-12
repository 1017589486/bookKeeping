import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, Category } from '../types';
import { formatDate, getCurrentDateString } from '../utils/helpers';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import CategoryIcon from '../components/CategoryIcon';
import Select from '../components/Select';
import DateInput from '../components/DateInput';

const TransactionsPage: React.FC = () => {
    const { transactions, categories, activeBillId, addTransaction, updateTransaction, deleteTransaction, bills } = useAppContext();
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

    const handleSave = (txData: Omit<Transaction, 'id' | 'billId' | 'userId'>, isNew: boolean) => {
      if (!activeBillId) {
          alert(t('transactions.select_bill_first'));
          return;
      }
      const completeTxData = { ...txData, billId: activeBillId };
      if (isNew) {
        addTransaction(completeTxData);
      } else if(currentTx) {
        updateTransaction({ ...currentTx, ...completeTxData });
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
        <div className="bg-card p-6 rounded-lg shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-text-primary">{activeBillName}</h2>
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
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-slate-100">
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
                                <tr key={transaction.id} className="bg-white border-b border-gray-200 hover:bg-slate-50">
                                    <td className="px-6 py-4 flex items-center">
                                        {category && <CategoryIcon icon={category.icon} color={category.color} />}
                                        <span className="ml-3 font-medium text-text-primary">{getCategoryName(category)}</span>
                                    </td>
                                    <td className="px-6 py-4">{formatDate(transaction.date, i18n.language)}</td>
                                    <td className="px-6 py-4">{transaction.notes}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${transaction.type === TransactionType.INCOME ? 'text-secondary' : 'text-danger'}`}>
                                        {transaction.type === TransactionType.INCOME ? '+' : '-'}${transaction.amount.toFixed(2)}
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
                 {filteredTransactions.length === 0 && <p className="text-center text-text-secondary py-8">{t('transactions.no_transactions')}</p>}
            </div>

            <TransactionFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} transaction={currentTx} categories={categories} activeBillId={activeBillId} />
        </div>
    );
};

// Form Modal Component
interface TxFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (txData: Omit<Transaction, 'id'| 'billId' | 'userId'>, isNew: boolean) => void;
    transaction: Transaction | null;
    categories: Category[];
    activeBillId: string | null;
}

const TransactionFormModal: React.FC<TxFormModalProps> = ({ isOpen, onClose, onSave, transaction, categories, activeBillId }) => {
    const { t } = useTranslation();
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(getCurrentDateString());
    const [notes, setNotes] = useState('');

    React.useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setAmount(String(transaction.amount));
            setCategoryId(transaction.categoryId);
            setDate(transaction.date);
            setNotes(transaction.notes);
        } else {
            setType(TransactionType.EXPENSE);
            setAmount('');
            const firstCategory = categories.find(c => c.type === TransactionType.EXPENSE && c.billId === activeBillId);
            setCategoryId(firstCategory?.id || '');
            setDate(getCurrentDateString());
            setNotes('');
        }
    }, [transaction, isOpen, categories, activeBillId]);

    const handleTypeChange = (newType: TransactionType) => {
      setType(newType);
      // auto-select first category of that type
      const firstCategory = categories.find(c => c.type === newType && c.billId === activeBillId);
      setCategoryId(firstCategory?.id || '');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, amount: parseFloat(amount), categoryId, date, notes }, !transaction);
    };
    
    const getCategoryName = (category: Category) => {
        return category.isSeed ? t(category.name as any) : category.name;
    };

    const availableCategories = categories.filter(c => c.type === type && c.billId === activeBillId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? t('transactions.edit_transaction') : t('transactions.add_transaction')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <span className="text-sm font-medium text-text-secondary">{t('transactions.type')}</span>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`px-4 py-2 rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-danger text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{t('transactionTypes.expense')}</button>
                        <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`px-4 py-2 rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-secondary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{t('transactionTypes.income')}</button>
                    </div>
                </div>
                <Input label={t('dashboard.amount')} type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                <Select label={t('transactions.category')} value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                    <option value="" disabled>{t('transactions.select_category')}</option>
                    {availableCategories.map(c => <option key={c.id} value={c.id}>{getCategoryName(c)}</option>)}
                </Select>
                <DateInput label={t('transactions.date')} value={date} onChange={e => setDate(e.target.value)} required />
                <Input label={t('transactions.notes')} value={notes} onChange={e => setNotes(e.target.value)} />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionsPage;