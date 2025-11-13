
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Bill, TransactionType } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import BillCard from '../components/BillCard';
import TransactionModal from '../components/TransactionModal';

const BillsPage: React.FC = () => {
  const { bills, addBill, updateBill, deleteBill, transactions, setActiveBillId, addTransaction, updateTransaction, categories, assets } = useAppContext();
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalBillId, setTxModalBillId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<any>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const openBillModal = (bill: Bill | null = null) => {
    setCurrentBill(bill);
    setIsBillModalOpen(true);
  };

  const closeBillModal = () => {
    setIsBillModalOpen(false);
    setCurrentBill(null);
  };

  const handleBillSave = (billData: Omit<Bill, 'id' | 'userId' | 'createdAt'>) => {
    if (currentBill) {
      updateBill({ ...currentBill, ...billData });
    } else {
      addBill(billData);
    }
    closeBillModal();
  };
  
  const handleBillDelete = (id: string) => {
    if (window.confirm(t('bills.delete_confirm'))) {
        deleteBill(id);
    }
  }

  const billStats = useMemo(() => {
    const statsMap = new Map<string, { income: number; expense: number; balance: number }>();
    bills.forEach(bill => {
        statsMap.set(bill.id, { income: 0, expense: 0, balance: 0 });
    });
    transactions.forEach(tx => {
        if (statsMap.has(tx.billId)) {
            const current = statsMap.get(tx.billId)!;
            if (tx.type === TransactionType.INCOME) {
                current.income += tx.amount;
            } else {
                current.expense += tx.amount;
            }
            current.balance = current.income - current.expense;
        }
    });
    return statsMap;
  }, [bills, transactions]);

  const openTxModal = (billId: string) => {
    setTxModalBillId(billId);
    setIsTxModalOpen(true);
  };

  const closeTxModal = () => {
    setTxModalBillId(null);
    setEditingTx(null);
    setIsTxModalOpen(false);
  };

  const handleTxSave = (txData: Omit<any, 'id' | 'userId'>, isNew: boolean) => {
    if (isNew) {
      addTransaction(txData);
    } else if(editingTx) {
      updateTransaction({ ...editingTx, ...txData });
    }
    closeTxModal();
  };

  const handleViewDetails = (billId: string) => {
    setActiveBillId(billId);
    navigate('/transactions');
  };

  const BORDER_COLORS = ['border-indigo-500', 'border-sky-400', 'border-amber-400', 'border-emerald-500', 'border-rose-500'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('bills.manage_bills')}</h2>
        <Button onClick={() => openBillModal()}>{t('bills.add_bill')}</Button>
      </div>
      
      {bills.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bills.map((bill, index) => {
             const canEdit = bill.permission !== 'view';
            return (
              <BillCard
                key={bill.id}
                bill={bill}
                stats={billStats.get(bill.id) || { income: 0, expense: 0, balance: 0 }}
                borderColor={BORDER_COLORS[index % BORDER_COLORS.length]}
                onViewDetails={() => handleViewDetails(bill.id)}
                onAddTransaction={() => openTxModal(bill.id)}
                onEdit={() => openBillModal(bill)}
                onDelete={() => handleBillDelete(bill.id)}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      ) : (
         <div className="text-center py-16 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
           <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('bills.no_bills')}</h3>
          <div className="mt-6">
            <Button onClick={() => openBillModal()}>
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('bills.add_bill')}
            </Button>
          </div>
        </div>
      )}


      <BillFormModal isOpen={isBillModalOpen} onClose={closeBillModal} onSave={handleBillSave} bill={currentBill} />
      <TransactionModal 
        isOpen={isTxModalOpen}
        onClose={closeTxModal}
        onSave={handleTxSave}
        transaction={editingTx}
        categories={categories}
        billId={txModalBillId}
        assets={assets}
      />
    </div>
  );
};

// Sub-component for the form modal
interface BillFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (billData: Omit<Bill, 'id' | 'userId' | 'createdAt'>) => void;
    bill: Bill | null;
}
const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSave, bill }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        if (bill) {
            setName(bill.name);
            setDescription(bill.description);
        } else {
            setName('');
            setDescription('');
        }
    }, [bill, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bill ? t('bills.edit_bill') : t('bills.add_bill')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={t('bills.bill_name')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                <Input
                    label={t('bills.description')}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('bills.save_bill')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BillsPage;
