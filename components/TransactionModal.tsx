
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Transaction, TransactionType, Category } from '../types';
import { getCurrentDateString } from '../utils/helpers';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import DateInput from './DateInput';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (txData: Omit<Transaction, 'id' | 'userId'>, isNew: boolean) => void;
    transaction: Transaction | null;
    categories: Category[];
    billId: string | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, categories, billId }) => {
    const { t } = useTranslation();
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(getCurrentDateString());
    const [notes, setNotes] = useState('');

    React.useEffect(() => {
        if (!isOpen) return;
        if (transaction) {
            setType(transaction.type);
            setAmount(String(transaction.amount));
            setCategoryId(transaction.categoryId);
            setDate(transaction.date);
            setNotes(transaction.notes);
        } else {
            setType(TransactionType.EXPENSE);
            setAmount('');
            const firstCategory = categories.find(c => c.type === TransactionType.EXPENSE && c.billId === billId);
            setCategoryId(firstCategory?.id || '');
            setDate(getCurrentDateString());
            setNotes('');
        }
    }, [transaction, isOpen, categories, billId]);

    const handleTypeChange = (newType: TransactionType) => {
      setType(newType);
      const firstCategory = categories.find(c => c.type === newType && c.billId === billId);
      setCategoryId(firstCategory?.id || '');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!billId) {
            console.error("No billId provided to TransactionModal");
            return;
        }
        onSave({ billId, type, amount: parseFloat(amount), categoryId, date, notes }, !transaction);
    };
    
    const getCategoryName = (category: Category) => {
        return category.isSeed ? t(category.name as any) : category.name;
    };

    const availableCategories = categories.filter(c => c.type === type && c.billId === billId);

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

export default TransactionModal;