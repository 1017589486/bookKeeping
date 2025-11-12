import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../hooks/useAppContext';
import { Bill } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

const BillsPage: React.FC = () => {
  const { bills, addBill, updateBill, deleteBill } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const { t } = useTranslation();

  const openModal = (bill: Bill | null = null) => {
    setCurrentBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBill(null);
  };

  const handleSave = (billData: Omit<Bill, 'id' | 'userId'>) => {
    if (currentBill) {
      updateBill({ ...currentBill, ...billData });
    } else {
      addBill(billData);
    }
    closeModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm(t('bills.delete_confirm'))) {
        deleteBill(id);
    }
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-text-primary">{t('bills.manage_bills')}</h2>
        <Button onClick={() => openModal()}>{t('bills.add_bill')}</Button>
      </div>
      
      <div className="space-y-4">
        {bills.map(bill => {
          const canEdit = bill.permission !== 'view';
          return (
            <div key={bill.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
              <div>
                <p className="font-semibold text-text-primary">{bill.name}</p>
                <p className="text-sm text-text-secondary">{bill.description}</p>
                {bill.permission !== 'owner' && (
                  <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${bill.permission === 'edit' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t('sharing.shared_bill')}
                  </span>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="ghost" onClick={() => openModal(bill)} disabled={!canEdit}>{t('common.edit')}</Button>
                <Button variant="ghost" className="text-danger hover:bg-red-50" onClick={() => handleDelete(bill.id)} disabled={!canEdit}>{t('common.delete')}</Button>
              </div>
            </div>
          )
        })}
        {bills.length === 0 && <p className="text-center text-text-secondary py-8">{t('bills.no_bills')}</p>}
      </div>

      <BillFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} bill={currentBill} />
    </div>
  );
};

// Sub-component for the form modal
interface BillFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (billData: Omit<Bill, 'id' | 'userId'>) => void;
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